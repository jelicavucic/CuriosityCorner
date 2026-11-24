package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.bajka.BajkaRequest;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.BajkaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/admin/aktivnosti/bajke")
public class AdminAktivnostBajkaController {
    private final AktivnostService aktivnosti;
    private final BajkaService konfiguracije;

    public AdminAktivnostBajkaController(AktivnostService aktivnosti, BajkaService konfiguracije) {
        this.aktivnosti = aktivnosti;
        this.konfiguracije = konfiguracije;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid BajkaRequest bajka) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.kreiraj(zahtjev.aktivnost());
        konfiguracije.sacuvaj(aktivnost.id(), zahtjev.bajka());
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + aktivnost.id())).body(aktivnost);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        konfiguracije.sacuvaj(id, zahtjev.bajka());
        return aktivnost;
    }
}
