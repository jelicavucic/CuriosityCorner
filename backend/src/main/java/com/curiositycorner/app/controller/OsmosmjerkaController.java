package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.osmosmjerka.OsmosmjerkaRequest;
import com.curiositycorner.app.dto.osmosmjerka.OsmosmjerkaResponse;
import com.curiositycorner.app.service.OsmosmjerkaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/osmosmjerka")
public class OsmosmjerkaController {
    private final OsmosmjerkaService service;

    public OsmosmjerkaController(OsmosmjerkaService service) {
        this.service = service;
    }

    @GetMapping
    public OsmosmjerkaResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @PutMapping
    public OsmosmjerkaResponse sacuvaj(@PathVariable Long id, @Valid @RequestBody OsmosmjerkaRequest request) {
        return service.sacuvaj(id, request);
    }
}
