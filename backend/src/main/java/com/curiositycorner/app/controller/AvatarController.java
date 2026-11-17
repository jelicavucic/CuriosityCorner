package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.avatar.AvatarRequest;
import com.curiositycorner.app.dto.avatar.AvatarResponse;
import com.curiositycorner.app.service.AvatarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/avatari")
public class AvatarController {
    private final AvatarService service;

    public AvatarController(AvatarService service) {
        this.service = service;
    }

    @GetMapping
    public List<AvatarResponse> pronadjiSve(@RequestParam(required = false) Boolean aktivan) {
        return service.pronadjiSve(aktivan);
    }

    @GetMapping("/{id}")
    public AvatarResponse pronadjiPoId(@PathVariable Integer id) {
        return service.pronadjiPoId(id);
    }

    @PostMapping
    public ResponseEntity<AvatarResponse> kreiraj(@Valid @RequestBody AvatarRequest request) {
        AvatarResponse response = service.kreiraj(request);
        return ResponseEntity.created(URI.create("/api/avatari/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public AvatarResponse izmijeni(@PathVariable Integer id, @Valid @RequestBody AvatarRequest request) {
        return service.izmijeni(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisi(@PathVariable Integer id) {
        service.obrisi(id);
        return ResponseEntity.noContent().build();
    }
}
