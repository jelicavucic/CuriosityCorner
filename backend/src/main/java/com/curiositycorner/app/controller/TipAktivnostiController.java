package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.TipAktivnostiResponse;
import com.curiositycorner.app.service.TipAktivnostiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipovi-aktivnosti")
public class TipAktivnostiController {
    private final TipAktivnostiService service;

    public TipAktivnostiController(TipAktivnostiService service) { this.service = service; }

    @GetMapping
    public List<TipAktivnostiResponse> pronadjiSve() { return service.pronadjiSve(); }
}
