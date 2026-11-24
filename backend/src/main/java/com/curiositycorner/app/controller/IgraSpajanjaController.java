package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.spajanje.SpajanjeRaspored;
import com.curiositycorner.app.service.SpajanjeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aktivnosti/{id}/spajanje")
public class IgraSpajanjaController {
    private final SpajanjeService spajanja;

    public IgraSpajanjaController(SpajanjeService spajanja) {
        this.spajanja = spajanja;
    }

    @GetMapping
    public ResponseEntity<SpajanjeRaspored> raspored(@PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(spajanja.rasporedZaIgru(id));
    }

    @PostMapping("/provjera")
    public Rezultat provjeri(@PathVariable Long id, @Valid @RequestBody Potez potez) {
        return new Rezultat(spajanja.provjeriPar(id, potez.idLijevogSadrzaja(), potez.idDesnogSadrzaja()));
    }

    public record Potez(@NotNull @Positive Integer idLijevogSadrzaja,
                        @NotNull @Positive Integer idDesnogSadrzaja) { }

    public record Rezultat(boolean tacan) { }
}
