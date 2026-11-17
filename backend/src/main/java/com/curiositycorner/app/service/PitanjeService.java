package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.pitanje.PitanjeRequest;
import com.curiositycorner.app.dto.pitanje.PitanjeResponse;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.Pitanje;
import com.curiositycorner.app.entity.PonudjeniOdgovor;
import com.curiositycorner.app.entity.Sadrzaj;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AktivnostRepository;
import com.curiositycorner.app.repository.PitanjeRepository;
import com.curiositycorner.app.repository.PonudjeniOdgovorRepository;
import com.curiositycorner.app.repository.SadrzajRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PitanjeService {
    private final AktivnostRepository aktivnosti;
    private final PitanjeRepository pitanja;
    private final PonudjeniOdgovorRepository odgovori;
    private final SadrzajRepository sadrzaji;

    public PitanjeService(AktivnostRepository aktivnosti, PitanjeRepository pitanja,
                          PonudjeniOdgovorRepository odgovori, SadrzajRepository sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.pitanja = pitanja;
        this.odgovori = odgovori;
        this.sadrzaji = sadrzaji;
    }

    @Transactional(readOnly = true)
    public PitanjeResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        Pitanje pitanje = pitanja.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Konfiguracija pitanja jos nije unesena."));
        return uResponse(pitanje, odgovori.findByIdAktivnostiOrderByRedniBrojAsc(id));
    }

    @Transactional
    public PitanjeResponse sacuvaj(Long id, PitanjeRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Pitanje ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }
        provjeriOdgovoreISadrzaje(request);

        Pitanje pitanje = pitanja.saveAndFlush(new Pitanje(id, request.idSadrzaja(), request.objasnjenje()));
        odgovori.obrisiZaAktivnost(id);
        var noviOdgovori = request.odgovori().stream()
                .map(o -> new PonudjeniOdgovor(id, o.idSadrzaja(), o.redniBroj(), o.jeTacan()))
                .toList();
        odgovori.saveAllAndFlush(noviOdgovori);
        return uResponse(pitanje, odgovori.findByIdAktivnostiOrderByRedniBrojAsc(id));
    }

    private void provjeriOdgovoreISadrzaje(PitanjeRequest request) {
        if (request.odgovori().stream().filter(PitanjeRequest.Odgovor::jeTacan).count() != 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pitanje mora imati tacno jedan tacan odgovor.");
        }
        Set<Integer> redniBrojevi = new HashSet<>();
        Set<Integer> trazeniSadrzaji = new LinkedHashSet<>();
        trazeniSadrzaji.add(request.idSadrzaja());
        for (var odgovor : request.odgovori()) {
            if (!redniBrojevi.add(odgovor.redniBroj())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Odgovori moraju imati razlicite redne brojeve.");
            }
            trazeniSadrzaji.add(odgovor.idSadrzaja());
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
        if (!"pitanje".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa pitanje.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private PitanjeResponse uResponse(Pitanje pitanje, List<PonudjeniOdgovor> ponudjeniOdgovori) {
        var rezultat = ponudjeniOdgovori.stream()
                .map(o -> new PitanjeResponse.Odgovor(o.getId(), o.getIdSadrzaja(), o.getRedniBroj(), o.isTacan()))
                .toList();
        return new PitanjeResponse(pitanje.getIdAktivnosti(), pitanje.getIdSadrzaja(),
                pitanje.getObjasnjenje(), rezultat);
    }
}
