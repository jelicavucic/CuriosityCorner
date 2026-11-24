package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.memorija.MemorijaRequest;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.MemorijaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/admin/aktivnosti/memorije")
public class AdminAktivnostMemorijaController {
    private final AktivnostService aktivnosti;
    private final MemorijaService memorije;

    public AdminAktivnostMemorijaController(AktivnostService aktivnosti, MemorijaService memorije) {
        this.aktivnosti = aktivnosti;
        this.memorije = memorije;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid MemorijaRequest memorija) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.kreiraj(zahtjev.aktivnost());
        memorije.sacuvaj(aktivnost.id(), zahtjev.memorija());
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + aktivnost.id())).body(aktivnost);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        memorije.sacuvaj(id, zahtjev.memorija());
        return aktivnost;
    }
}
