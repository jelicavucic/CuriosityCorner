package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeRequest;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.RazvrstavanjeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/admin/aktivnosti/razvrstavanja")
public class AdminAktivnostRazvrstavanjeController {
    private final AktivnostService aktivnosti;
    private final RazvrstavanjeService razvrstavanja;

    public AdminAktivnostRazvrstavanjeController(AktivnostService aktivnosti, RazvrstavanjeService razvrstavanja) {
        this.aktivnosti = aktivnosti;
        this.razvrstavanja = razvrstavanja;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid RazvrstavanjeRequest razvrstavanje) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.kreiraj(zahtjev.aktivnost());
        razvrstavanja.sacuvaj(aktivnost.id(), zahtjev.razvrstavanje());
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + aktivnost.id())).body(aktivnost);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        var aktivnost = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        razvrstavanja.sacuvaj(id, zahtjev.razvrstavanje());
        return aktivnost;
    }
}
