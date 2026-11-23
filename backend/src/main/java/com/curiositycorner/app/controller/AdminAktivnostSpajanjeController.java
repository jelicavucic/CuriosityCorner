package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.sadrzaj.SadrzajRequest;
import com.curiositycorner.app.dto.spajanje.SpajanjeRequest;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.SadrzajService;
import com.curiositycorner.app.service.SpajanjeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/aktivnosti/spajanja")
public class AdminAktivnostSpajanjeController {
    private final AktivnostService aktivnosti;
    private final SpajanjeService spajanja;
    private final SadrzajService sadrzaji;

    public AdminAktivnostSpajanjeController(AktivnostService aktivnosti, SpajanjeService spajanja,
                                           SadrzajService sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.spajanja = spajanja;
        this.sadrzaji = sadrzaji;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid Konfiguracija spajanje) { }

    public record Konfiguracija(@NotNull Boolean nasumicanRaspored,
                                @NotEmpty List<@NotNull @Valid Par> parovi) { }

    public record Par(@NotNull @Positive Integer redniBroj, @NotNull @Valid Strana lijevo,
                      @NotNull @Valid Strana desno) { }

    public record Strana(@Positive Integer idSadrzaja, @Size(max = 10000) String tekst) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.kreiraj(zahtjev.aktivnost());
        sacuvajParove(aktivnost.id(), zahtjev.spajanje());
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + aktivnost.id())).body(aktivnost);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        sacuvajParove(id, zahtjev.spajanje());
        return aktivnost;
    }

    private void sacuvajParove(Long id, Konfiguracija konfiguracija) {
        var parovi = konfiguracija.parovi().stream()
                .map(par -> new SpajanjeRequest.Par(par.redniBroj(), idSadrzaja(par.lijevo()), idSadrzaja(par.desno())))
                .toList();
        spajanja.sacuvaj(id, new SpajanjeRequest(konfiguracija.nasumicanRaspored(), parovi));
    }

    private Integer idSadrzaja(Strana strana) {
        boolean imaTekst = strana.tekst() != null && !strana.tekst().isBlank();
        if ((strana.idSadrzaja() != null) == imaTekst) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Za svaku stranu upišite tekst ili izaberite sadržaj.");
        }
        return strana.idSadrzaja() != null ? strana.idSadrzaja()
                : sadrzaji.kreiraj(new SadrzajRequest(strana.tekst(), null, null)).id();
    }
}
