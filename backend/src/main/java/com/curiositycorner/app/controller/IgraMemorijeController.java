package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.memorija.MemorijaResponse;
import com.curiositycorner.app.service.MemorijaService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;

@RestController
@RequestMapping("/api/aktivnosti/{id}/memorija")
public class IgraMemorijeController {
    private final MemorijaService memorije;

    public IgraMemorijeController(MemorijaService memorije) {
        this.memorije = memorije;
    }

    @GetMapping
    public ResponseEntity<MemorijaResponse> raspored(@PathVariable Long id) {
        var memorija = memorije.pronadji(id);
        var kartice = new ArrayList<>(memorija.kartice());
        Collections.shuffle(kartice);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new MemorijaResponse(
                memorija.idAktivnosti(), memorija.brojKolona(), memorija.vrijemeZaRjesavanje(),
                memorija.parovi(), kartice));
    }
}
