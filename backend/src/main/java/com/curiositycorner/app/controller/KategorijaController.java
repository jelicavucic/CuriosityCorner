package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.kategorija.KategorijaResponse;
import com.curiositycorner.app.dto.kategorija.KategorijaRequest;
import com.curiositycorner.app.service.KategorijaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.net.URI;

@RestController
@RequestMapping("/api/kategorije")
public class KategorijaController {

    private final KategorijaService kategorijaService;

    public KategorijaController(KategorijaService kategorijaService) {
        this.kategorijaService = kategorijaService;
    }

    @GetMapping
    public List<KategorijaResponse> pronadjiSve() {
        return kategorijaService.pronadjiSve();
    }

    @GetMapping("/{id}")
    public KategorijaResponse pronadjiPoId(@PathVariable Long id) {
        return kategorijaService.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<KategorijaResponse> kreiraj(@Valid @RequestBody KategorijaRequest request) {
        KategorijaResponse response = kategorijaService.kreiraj(request);
        return ResponseEntity.created(URI.create("/api/kategorije/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public KategorijaResponse izmijeni(@PathVariable Long id,
                                     @Valid @RequestBody KategorijaRequest request) {
        return kategorijaService.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Long id) {
        kategorijaService.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
