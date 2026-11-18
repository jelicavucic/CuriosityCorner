package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.bajka.BajkaRequest;
import com.curiositycorner.app.dto.bajka.BajkaResponse;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.Bajka;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AktivnostRepository;
import com.curiositycorner.app.repository.BajkaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

@Service
public class BajkaService {
    private final AktivnostRepository aktivnosti;
    private final BajkaRepository bajke;

    public BajkaService(AktivnostRepository aktivnosti, BajkaRepository bajke) {
        this.aktivnosti = aktivnosti;
        this.bajke = bajke;
    }

    @Transactional(readOnly = true)
    public BajkaResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        Bajka bajka = bajke.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Konfiguracija bajke jos nije unesena."));
        return uResponse(bajka);
    }

    @Transactional
    public BajkaResponse sacuvaj(Long id, BajkaRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Bajka ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }

        if (request.tekst().getBytes(StandardCharsets.UTF_8).length > 65_535) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tekst bajke smije imati najvise 65535 bajtova.");
        }
        Bajka bajka = new Bajka(id, request.naslov().strip(), request.tekst(),
                provjeriPutanju(request.putanjaAudioZapisa(), "Putanja audio zapisa"),
                provjeriPutanju(request.putanjaNaslovneSlike(), "Putanja naslovne slike"));
        return uResponse(bajke.saveAndFlush(bajka));
    }

    private String provjeriPutanju(String vrijednost, String polje) {
        if (vrijednost == null || vrijednost.isBlank()) {
            return null;
        }
        String putanja = vrijednost.strip();
        if (!putanja.matches("/api/fajlovi/[A-Za-z0-9][A-Za-z0-9._-]*") || putanja.contains("..")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, polje + " mora biti /api/fajlovi/ime-fajla.");
        }
        return putanja;
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"bajka".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa bajka.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private BajkaResponse uResponse(Bajka bajka) {
        return new BajkaResponse(bajka.getIdAktivnosti(), bajka.getNaslov(), bajka.getTekst(),
                bajka.getPutanjaAudioZapisa(), bajka.getPutanjaNaslovneSlike());
    }
}
