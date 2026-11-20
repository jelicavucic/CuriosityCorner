package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.recenzija.AdminRecenzijaResponse;
import com.curiositycorner.app.dto.recenzija.OdgovorNaRecenzijuRequest;
import com.curiositycorner.app.dto.recenzija.OdgovorNaRecenzijuResponse;
import com.curiositycorner.app.service.AdminRecenzijaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/recenzije")
public class AdminRecenzijaController {
    private final AdminRecenzijaService service;

    public AdminRecenzijaController(AdminRecenzijaService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminRecenzijaResponse> pronadjiSve() {
        return service.pronadjiSve();
    }

    @PutMapping("/{id}/odgovor")
    public OdgovorNaRecenzijuResponse sacuvaj(@PathVariable Long id, Principal admin,
                                            @Valid @RequestBody OdgovorNaRecenzijuRequest unos) {
        return service.sacuvaj(id, admin.getName(), unos);
    }

    @DeleteMapping("/{id}/odgovor")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void obrisi(@PathVariable Long id) {
        service.obrisi(id);
    }
}
