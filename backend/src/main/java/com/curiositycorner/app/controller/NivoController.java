package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.nivo.NivoRequest;
import com.curiositycorner.app.dto.nivo.NivoResponse;
import com.curiositycorner.app.service.NivoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/nivoi")
public class NivoController {

    private final NivoService nivoService;

    public NivoController(NivoService nivoService) {
        this.nivoService = nivoService;
    }

    @CrossOrigin(origins = "http://localhost:8081")
    @GetMapping
    public List<NivoResponse> pronadjiSve() {
        return nivoService.pronadjiSve();
    }

    @GetMapping("/{id}")
    public NivoResponse pronadjiPoId(@PathVariable Long id) {
        return nivoService.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<NivoResponse> kreiraj(@Valid @RequestBody NivoRequest request) {
        NivoResponse response = nivoService.kreiraj(request);
        return ResponseEntity.created(URI.create("/api/nivoi/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public NivoResponse izmijeni(@PathVariable Long id, @Valid @RequestBody NivoRequest request) {
        return nivoService.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Long id) {
        nivoService.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
