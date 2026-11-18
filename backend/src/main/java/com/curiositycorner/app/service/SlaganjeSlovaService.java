package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.slaganjeslova.SlaganjeSlovaRequest;
import com.curiositycorner.app.dto.slaganjeslova.SlaganjeSlovaResponse;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.SlaganjeSlova;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AktivnostRepository;
import com.curiositycorner.app.repository.SlaganjeSlovaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SlaganjeSlovaService {
    private final AktivnostRepository aktivnosti;
    private final SlaganjeSlovaRepository slaganja;

    public SlaganjeSlovaService(AktivnostRepository aktivnosti, SlaganjeSlovaRepository slaganja) {
        this.aktivnosti = aktivnosti;
        this.slaganja = slaganja;
    }

    @Transactional(readOnly = true)
    public SlaganjeSlovaResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        SlaganjeSlova konfiguracija = slaganja.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Konfiguracija slaganja slova jos nije unesena."));
        return uResponse(konfiguracija);
    }

    @Transactional
    public SlaganjeSlovaResponse sacuvaj(Long id, SlaganjeSlovaRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Slaganje slova ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }

        String putanja = request.putanjaSlike();
        if (putanja != null) {
            putanja = putanja.strip();
            if (putanja.isEmpty()) {
                putanja = null;
            } else if (!putanja.matches("/api/fajlovi/[A-Za-z0-9][A-Za-z0-9._-]*") || putanja.contains("..")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Putanja slike mora biti /api/fajlovi/ime-fajla.");
            }
        }

        SlaganjeSlova konfiguracija = new SlaganjeSlova(id, request.ciljniTekst().strip(), putanja);
        return uResponse(slaganja.saveAndFlush(konfiguracija));
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"slaganje-slova".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa slaganje-slova.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private SlaganjeSlovaResponse uResponse(SlaganjeSlova konfiguracija) {
        return new SlaganjeSlovaResponse(konfiguracija.getIdAktivnosti(), konfiguracija.getCiljniTekst(),
                konfiguracija.getPutanjaSlike());
    }
}
