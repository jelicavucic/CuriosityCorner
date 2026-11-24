package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.slaganjeslova.SlaganjeSlovaRequest;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.SlaganjeSlovaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/admin/aktivnosti/slaganja-slova")
public class AdminAktivnostSlaganjeSlovaController {
    private final AktivnostService aktivnosti;
    private final SlaganjeSlovaService konfiguracije;

    public AdminAktivnostSlaganjeSlovaController(AktivnostService aktivnosti, SlaganjeSlovaService konfiguracije) {
        this.aktivnosti = aktivnosti;
        this.konfiguracije = konfiguracije;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid SlaganjeSlovaRequest slaganjeSlova) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.kreiraj(zahtjev.aktivnost());
        konfiguracije.sacuvaj(aktivnost.id(), zahtjev.slaganjeSlova());
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + aktivnost.id())).body(aktivnost);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        konfiguracije.sacuvaj(id, zahtjev.slaganjeSlova());
        return aktivnost;
    }
}
