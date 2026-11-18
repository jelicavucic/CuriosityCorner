package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.memorija.MemorijaRequest;
import com.curiositycorner.app.dto.memorija.MemorijaResponse;
import com.curiositycorner.app.entity.*;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class MemorijaService {
    private final AktivnostRepository aktivnosti;
    private final MemorijaRepository memorije;
    private final KarticaMemorijeRepository kartice;
    private final SadrzajRepository sadrzaji;

    public MemorijaService(AktivnostRepository aktivnosti, MemorijaRepository memorije,
                           KarticaMemorijeRepository kartice, SadrzajRepository sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.memorije = memorije;
        this.kartice = kartice;
        this.sadrzaji = sadrzaji;
    }

    @Transactional(readOnly = true)
    public MemorijaResponse pronadji(Long id) {
        Aktivnost aktivnost = aktivnosti.findById(id).orElseThrow(() -> nePostojiAktivnost(id));
        provjeriTip(aktivnost);
        Memorija memorija = memorije.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Konfiguracija memorije jos nije unesena."));
        List<KarticaMemorije> sveKartice = kartice.findByIdAktivnostiOrderByBrojParaAscIdAsc(id);
        var sadrzajPoId = indeksirajSadrzaje(sadrzaji.findAllById(
                sveKartice.stream().map(KarticaMemorije::getIdSadrzaja).distinct().toList()));
        return uResponse(memorija, sveKartice, sadrzajPoId);
    }

    @Transactional
    public MemorijaResponse sacuvaj(Long id, MemorijaRequest request) {
        Aktivnost aktivnost = aktivnosti.pronadjiZaIzmjenu(id)
                .orElseThrow(() -> nePostojiAktivnost(id));
        provjeriTip(aktivnost);
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Memorija ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }
        List<Integer> ids = request.idSadrzajaParova();
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Svaki sadrzaj odaberite samo jednom.");
        }
        int brojKartica = ids.size() * 2;
        if (brojKartica % request.brojKolona() != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Broj kartica mora biti djeljiv brojem kolona.");
        }
        Map<Integer, Sadrzaj> odabrani = indeksirajSadrzaje(sadrzaji.pronadjiZaIzmjenu(ids));
        Set<String> slike = new HashSet<>();
        for (Integer idSadrzaja : ids) {
            Sadrzaj sadrzaj = odabrani.get(idSadrzaja);
            if (sadrzaj == null) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Sadrzaj " + idSadrzaja + " ne postoji.");
            }
            String slika = sadrzaj.getPutanjaSlike();
            if (slika == null || slika.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Sadrzaj " + idSadrzaja + " mora imati sliku za memoriju.");
            }
            if (!slike.add(slika)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Razliciti parovi moraju imati razlicite slike.");
            }
        }
        Memorija memorija = memorije.saveAndFlush(
                new Memorija(id, request.brojKolona(), request.vrijemeZaRjesavanje()));
        kartice.obrisiZaAktivnost(id);
        List<KarticaMemorije> noveKartice = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            noveKartice.add(new KarticaMemorije(id, i + 1, ids.get(i)));
            noveKartice.add(new KarticaMemorije(id, i + 1, ids.get(i)));
        }
        return uResponse(memorija, kartice.saveAllAndFlush(noveKartice), odabrani);
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"memorija".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa memorija.");
        }
    }

    private ApiException nePostojiAktivnost(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private Map<Integer, Sadrzaj> indeksirajSadrzaje(List<Sadrzaj> sadrzaji) {
        Map<Integer, Sadrzaj> rezultat = new HashMap<>();
        for (Sadrzaj sadrzaj : sadrzaji) {
            rezultat.put(sadrzaj.getId(), sadrzaj);
        }
        return rezultat;
    }

    private MemorijaResponse uResponse(Memorija memorija, List<KarticaMemorije> sveKartice,
                                       Map<Integer, Sadrzaj> sadrzajPoId) {
        Map<Integer, MemorijaResponse.ParMemorijeResponse> parovi = new TreeMap<>();
        for (KarticaMemorije kartica : sveKartice) {
            Sadrzaj sadrzaj = sadrzajPoId.get(kartica.getIdSadrzaja());
            parovi.putIfAbsent(kartica.getBrojPara(), new MemorijaResponse.ParMemorijeResponse(
                    kartica.getBrojPara(), kartica.getIdSadrzaja(),
                    sadrzaj.getPutanjaSlike(), sadrzaj.getAlternativniTekst()));
        }
        return new MemorijaResponse(memorija.getId(), memorija.getBrojKolona(),
                memorija.getVrijemeZaRjesavanje(), List.copyOf(parovi.values()),
                sveKartice.stream().map(k -> new MemorijaResponse.Kartica(
                        k.getId(), k.getBrojPara(), k.getIdSadrzaja())).toList());
    }
}
