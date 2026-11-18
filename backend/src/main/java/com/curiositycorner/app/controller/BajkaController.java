package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.bajka.BajkaRequest;
import com.curiositycorner.app.dto.bajka.BajkaResponse;
import com.curiositycorner.app.service.BajkaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/bajka")
public class BajkaController {
    private final BajkaService service;

    public BajkaController(BajkaService service) {
        this.service = service;
    }

    @GetMapping
    public BajkaResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @PutMapping
    public BajkaResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody BajkaRequest request) {
        return service.sacuvaj(id, request);
    }
}

