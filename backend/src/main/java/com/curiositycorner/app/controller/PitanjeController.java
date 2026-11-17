package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.pitanje.PitanjeRequest;
import com.curiositycorner.app.dto.pitanje.PitanjeResponse;
import com.curiositycorner.app.service.PitanjeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/pitanje")
public class PitanjeController {
    private final PitanjeService service;

    public PitanjeController(PitanjeService service) {
        this.service = service;
    }

    @GetMapping
    public PitanjeResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @PutMapping
    public PitanjeResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody PitanjeRequest request) {
        return service.sacuvaj(id, request);
    }
}
