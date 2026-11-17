package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.igrica.IgricaRequest;
import com.curiositycorner.app.dto.igrica.IgricaResponse;
import com.curiositycorner.app.service.IgricaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/igrice")
public class IgricaController {

    private final IgricaService igricaService;

    public IgricaController(IgricaService igricaService) {
        this.igricaService = igricaService;
    }

    @GetMapping
    public List<IgricaResponse> pronadjiSve() {
        return igricaService.pronadjiSve();
    }

    @GetMapping("/{id}")
    public IgricaResponse pronadjiPoId(@PathVariable Long id) {
        return igricaService.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<IgricaResponse> kreiraj(
            @Valid @RequestBody IgricaRequest request) {
        IgricaResponse response = igricaService.kreiraj(request);

        return ResponseEntity
                .created(URI.create("/api/igrice/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public IgricaResponse izmijeni(
            @PathVariable Long id,
            @Valid @RequestBody IgricaRequest request) {
        return igricaService.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Long id) {
        igricaService.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
