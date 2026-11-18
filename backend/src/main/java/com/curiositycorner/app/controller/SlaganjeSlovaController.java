package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.slaganjeslova.SlaganjeSlovaRequest;
import com.curiositycorner.app.dto.slaganjeslova.SlaganjeSlovaResponse;
import com.curiositycorner.app.service.SlaganjeSlovaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/slaganje-slova")
public class SlaganjeSlovaController {
    private final SlaganjeSlovaService service;

    public SlaganjeSlovaController(SlaganjeSlovaService service) {
        this.service = service;
    }

    @GetMapping
    public SlaganjeSlovaResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @PutMapping
    public SlaganjeSlovaResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody SlaganjeSlovaRequest request) {
        return service.sacuvaj(id, request);
    }
}
