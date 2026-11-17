package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.spajanje.SpajanjeRequest;
import com.curiositycorner.app.dto.spajanje.SpajanjeResponse;
import com.curiositycorner.app.dto.spajanje.SpajanjeRaspored;
import com.curiositycorner.app.service.SpajanjeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/spajanje")
public class SpajanjeController {
    private final SpajanjeService service;

    public SpajanjeController(SpajanjeService service) {
        this.service = service;
    }

    @GetMapping
    public SpajanjeResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @GetMapping("/pregled")
    public SpajanjeRaspored pregled(@PathVariable Long id) {
        return service.pregled(id);
    }

    @PutMapping
    public SpajanjeResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody SpajanjeRequest request) {
        return service.sacuvaj(id, request);
    }
}
