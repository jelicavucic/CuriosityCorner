package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.memorija.MemorijaRequest;
import com.curiositycorner.app.dto.memorija.MemorijaResponse;
import com.curiositycorner.app.service.MemorijaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/memorija")
public class MemorijaController {
    private final MemorijaService service;

    public MemorijaController(MemorijaService service) { this.service = service; }

    @GetMapping
    public MemorijaResponse pronadji(@PathVariable Long id) { return service.pronadji(id); }

    @PutMapping
    public MemorijaResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody MemorijaRequest request) {
        return service.sacuvaj(id, request);
    }
}
