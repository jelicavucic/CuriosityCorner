package com.curiositycorner.app.controller;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.dto.pitanje.PitanjeRequest;
import com.curiositycorner.app.dto.sadrzaj.SadrzajRequest;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.service.AktivnostService;
import com.curiositycorner.app.service.PitanjeService;
import com.curiositycorner.app.service.SadrzajService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/aktivnosti/pitanja")
public class AdminAktivnostPitanjeController {
    private final AktivnostService aktivnosti;
    private final PitanjeService pitanja;
    private final SadrzajService sadrzaji;

    public AdminAktivnostPitanjeController(AktivnostService aktivnosti, PitanjeService pitanja,
                                           SadrzajService sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.pitanja = pitanja;
        this.sadrzaji = sadrzaji;
    }

    public record Zahtjev(@NotNull @Valid AktivnostRequest aktivnost,
                          @NotNull @Valid PitanjeZahtjev pitanje) { }

    public record PitanjeZahtjev(@Positive Integer idSadrzaja, @Size(max = 10000) String tekst,
                                 @Size(max = 2000) String objasnjenje,
                                 @NotNull @Size(min = 2) List<@NotNull @Valid Odgovor> odgovori) { }

    public record Odgovor(@Positive Integer idSadrzaja, @Size(max = 10000) String tekst,
                          @NotNull @Positive Integer redniBroj, @NotNull Boolean jeTacan) { }

    @PostMapping
    @Transactional
    public ResponseEntity<AktivnostResponse> kreiraj(@Valid @RequestBody Zahtjev zahtjev) {
        AktivnostResponse rezultat = aktivnosti.kreiraj(zahtjev.aktivnost());
        pitanja.sacuvaj(rezultat.id(), pripremiPitanje(zahtjev.pitanje()));
        return ResponseEntity.created(URI.create("/api/aktivnosti/" + rezultat.id())).body(rezultat);
    }

    @PutMapping("/{id}")
    @Transactional
    public AktivnostResponse izmijeni(@PathVariable Long id, @Valid @RequestBody Zahtjev zahtjev) {
        AktivnostResponse rezultat = aktivnosti.izmijeni(id, zahtjev.aktivnost());
        pitanja.sacuvaj(id, pripremiPitanje(zahtjev.pitanje()));
        return rezultat;
    }

    private PitanjeRequest pripremiPitanje(PitanjeZahtjev pitanje) {
        Integer idPitanja = pitanje.idSadrzaja() != null && pitanje.tekst() != null
                ? dodajTekstUzSliku(pitanje.idSadrzaja(), pitanje.tekst())
                : pripremiSadrzaj(pitanje.idSadrzaja(), pitanje.tekst());
        var odgovori = pitanje.odgovori().stream()
                .map(odgovor -> new PitanjeRequest.Odgovor(
                        pripremiSadrzaj(odgovor.idSadrzaja(), odgovor.tekst()),
                        odgovor.redniBroj(), odgovor.jeTacan()))
                .toList();
        return new PitanjeRequest(idPitanja, pitanje.objasnjenje(), odgovori);
    }

    private Integer pripremiSadrzaj(Integer id, String tekst) {
        boolean imaTekst = tekst != null && !tekst.isBlank();
        if ((id != null) == imaTekst) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unesite tekst ili izaberite sadržaj iz biblioteke.");
        }
        return id != null ? id : sadrzaji.kreiraj(new SadrzajRequest(tekst, null, null)).id();
    }

    private Integer dodajTekstUzSliku(Integer id, String tekst) {
        var odabrani = sadrzaji.pronadjiPoId(id);
        if (odabrani.putanjaSlike() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Odabrani sadržaj nema sliku.");
        }
        return sadrzaji.kreiraj(new SadrzajRequest(tekst, odabrani.putanjaSlike(),
                odabrani.alternativniTekst())).id();
    }
}
