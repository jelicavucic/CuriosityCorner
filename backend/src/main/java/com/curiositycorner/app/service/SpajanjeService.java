package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.spajanje.SpajanjeRequest;
import com.curiositycorner.app.dto.spajanje.SpajanjeResponse;
import com.curiositycorner.app.dto.spajanje.SpajanjeRaspored;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.ParZaSpajanje;
import com.curiositycorner.app.entity.Sadrzaj;
import com.curiositycorner.app.entity.Spajanje;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AktivnostRepository;
import com.curiositycorner.app.repository.ParZaSpajanjeRepository;
import com.curiositycorner.app.repository.SadrzajRepository;
import com.curiositycorner.app.repository.SpajanjeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SpajanjeService {
    private final AktivnostRepository aktivnosti;
    private final SpajanjeRepository spajanja;
    private final ParZaSpajanjeRepository parovi;
    private final SadrzajRepository sadrzaji;

    public SpajanjeService(AktivnostRepository aktivnosti, SpajanjeRepository spajanja,
                          ParZaSpajanjeRepository parovi, SadrzajRepository sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.spajanja = spajanja;
        this.parovi = parovi;
        this.sadrzaji = sadrzaji;
    }

    @Transactional(readOnly = true)
    public SpajanjeResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        return ucitajKonfiguraciju(id);
    }

    private SpajanjeResponse ucitajKonfiguraciju(Long id) {
        Spajanje konfiguracija = spajanja.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Konfiguracija spajanja jos nije unesena."));
        return uResponse(id, konfiguracija, parovi.findByIdAktivnostiOrderByRedniBrojAsc(id));
    }

    @Transactional(readOnly = true)
    public SpajanjeRaspored pregled(Long id) {
        return napraviRaspored(pronadji(id));
    }

    @Transactional(readOnly = true)
    public SpajanjeRaspored rasporedZaIgru(Long id) {
        return napraviRaspored(pronadjiZaIgru(id));
    }

    @Transactional(readOnly = true)
    public boolean provjeriPar(Long id, Integer lijevo, Integer desno) {
        return pronadjiZaIgru(id).parovi().stream().anyMatch(par ->
                par.idLijevogSadrzaja().equals(lijevo) && par.idDesnogSadrzaja().equals(desno));
    }

    private SpajanjeResponse pronadjiZaIgru(Long id) {
        Aktivnost aktivnost = aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id));
        if (!"AKTIVNA".equalsIgnoreCase(aktivnost.getNivo().getIgrica().getStatus())) {
            throw nemaAktivnosti(id);
        }
        provjeriTip(aktivnost);
        return ucitajKonfiguraciju(id);
    }

    private SpajanjeRaspored napraviRaspored(SpajanjeResponse konfiguracija) {
        var lijevo = konfiguracija.parovi().stream().map(SpajanjeResponse.Par::idLijevogSadrzaja).toList();
        var desno = new ArrayList<>(konfiguracija.parovi().stream()
                .map(SpajanjeResponse.Par::idDesnogSadrzaja).toList());
        if (konfiguracija.nasumicanRaspored()) {
            Collections.shuffle(desno);
        }
        return new SpajanjeRaspored(lijevo, List.copyOf(desno));
    }

    @Transactional
    public SpajanjeResponse sacuvaj(Long id, SpajanjeRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Spajanje ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }

        provjeriParove(request.parovi());
        Spajanje konfiguracija = spajanja.saveAndFlush(new Spajanje(id, request.nasumicanRaspored()));
        parovi.obrisiZaAktivnost(id);
        var noviParovi = request.parovi().stream()
                .sorted(Comparator.comparing(SpajanjeRequest.Par::redniBroj))
                .map(par -> new ParZaSpajanje(id, par.redniBroj(),
                        par.idLijevogSadrzaja(), par.idDesnogSadrzaja()))
                .toList();
        return uResponse(id, konfiguracija, parovi.saveAllAndFlush(noviParovi));
    }

    private void provjeriParove(List<SpajanjeRequest.Par> uneseniParovi) {
        Set<Integer> redniBrojevi = new HashSet<>();
        Set<Integer> trazeniSadrzaji = new HashSet<>();
        for (var par : uneseniParovi) {
            if (!redniBrojevi.add(par.redniBroj())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Parovi moraju imati razlicite redne brojeve.");
            }
            trazeniSadrzaji.add(par.idLijevogSadrzaja());
            trazeniSadrzaji.add(par.idDesnogSadrzaja());
        }
        Set<Integer> postojeci = sadrzaji.findAllById(trazeniSadrzaji).stream()
                .map(Sadrzaj::getId)
                .collect(Collectors.toSet());
        for (Integer id : trazeniSadrzaji) {
            if (!postojeci.contains(id)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Sadrzaj " + id + " ne postoji.");
            }
        }
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"spajanje".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa spajanje.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private SpajanjeResponse uResponse(Long id, Spajanje konfiguracija, List<ParZaSpajanje> zapisi) {
        var rezultat = zapisi.stream()
                .map(par -> new SpajanjeResponse.Par(par.getId(), par.getRedniBroj(),
                        par.getIdLijevogSadrzaja(), par.getIdDesnogSadrzaja()))
                .toList();
        return new SpajanjeResponse(id, konfiguracija.isNasumicanRaspored(), rezultat);
    }
}
