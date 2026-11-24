package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeResponse;
import com.curiositycorner.app.service.RazvrstavanjeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/aktivnosti/{id}/razvrstavanje")
public class IgraRazvrstavanjaController {
    private final RazvrstavanjeService razvrstavanja;

    public IgraRazvrstavanjaController(RazvrstavanjeService razvrstavanja) {
        this.razvrstavanja = razvrstavanja;
    }

    @GetMapping
    public ResponseEntity<Raspored> raspored(@PathVariable Long id) {
        var konfiguracija = razvrstavanja.pronadji(id);
        var grupe = konfiguracija.grupe().stream()
                .map(grupa -> new Grupa(grupa.id(), grupa.naziv(), grupa.idSadrzaja())).toList();
        var stavke = new ArrayList<>(konfiguracija.grupe().stream()
                .flatMap(grupa -> grupa.stavke().stream()).toList());
        Collections.shuffle(stavke);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new Raspored(id, grupe, stavke));
    }

    @PostMapping("/provjera")
    public Rezultat provjeri(@PathVariable Long id, @Valid @RequestBody Potez potez) {
        var konfiguracija = razvrstavanja.pronadji(id);
        boolean tacan = konfiguracija.grupe().stream()
                .filter(grupa -> grupa.id().equals(potez.idGrupe()))
                .flatMap(grupa -> grupa.stavke().stream())
                .anyMatch(stavka -> stavka.id().equals(potez.idStavke()));
        return new Rezultat(tacan);
    }

    public record Grupa(Long id, String naziv, Integer idSadrzaja) { }
    public record Raspored(Long idAktivnosti, List<Grupa> grupe, List<RazvrstavanjeResponse.Stavka> stavke) { }
    public record Potez(@NotNull @Positive Long idStavke, @NotNull @Positive Long idGrupe) { }
    public record Rezultat(boolean tacan) { }
}
