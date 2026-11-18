package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeRequest;
import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeResponse;
import com.curiositycorner.app.service.RazvrstavanjeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/aktivnosti/{id}/razvrstavanje")
public class RazvrstavanjeController {
    private final RazvrstavanjeService service;

    public RazvrstavanjeController(RazvrstavanjeService service) {
        this.service = service;
    }

    @GetMapping
    public RazvrstavanjeResponse pronadji(@PathVariable Long id) {
        return service.pronadji(id);
    }

    @PutMapping
    public RazvrstavanjeResponse sacuvaj(@PathVariable Long id,
                                        @Valid @RequestBody RazvrstavanjeRequest request) {
        return service.sacuvaj(id, request);
    }
}
