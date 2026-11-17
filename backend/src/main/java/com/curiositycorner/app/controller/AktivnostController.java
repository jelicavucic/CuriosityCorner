package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.service.AktivnostService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/aktivnosti")
public class AktivnostController {
    private final AktivnostService service;

    public AktivnostController(AktivnostService service) { this.service = service; }

    @GetMapping
    public List<AktivnostResponse> pronadjiSve() { return service.pronadjiSve(); }

    @GetMapping("/{id}")
    public AktivnostResponse pronadjiPoId(@PathVariable Long id) {
        return service.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody AktivnostRequest request) {
        AktivnostResponse response = service.kreiraj(request);
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public AktivnostResponse izmijeni(@PathVariable Long id,
                                      @Valid @RequestBody AktivnostRequest request) {
        return service.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Long id) {
        service.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
