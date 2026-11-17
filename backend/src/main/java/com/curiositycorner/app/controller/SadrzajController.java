package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.sadrzaj.SadrzajRequest;
import com.curiositycorner.app.dto.sadrzaj.SadrzajResponse;
import com.curiositycorner.app.service.SadrzajService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/sadrzaji")
public class SadrzajController {
    private final SadrzajService service;

    public SadrzajController(SadrzajService service) {
        this.service = service;
    }

    @GetMapping
    public List<SadrzajResponse> pronadjiSve() {
        return service.pronadjiSve();
    }

    @GetMapping("/{id}")
    public SadrzajResponse pronadjiPoId(@PathVariable Integer id) {
        return service.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<SadrzajResponse> kreiraj(@Valid @RequestBody SadrzajRequest request) {
        SadrzajResponse response = service.kreiraj(request);
        return ResponseEntity.created(URI.create("/api/sadrzaji/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public SadrzajResponse izmijeni(@PathVariable Integer id,
                                  @Valid @RequestBody SadrzajRequest request) {
        return service.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Integer id) {
        service.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
