package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.sadrzaj.SadrzajRequest;
import com.curiositycorner.app.dto.sadrzaj.SadrzajResponse;
import com.curiositycorner.app.entity.Sadrzaj;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.SadrzajRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class SadrzajService {
    private final SadrzajRepository repository;

    public SadrzajService(SadrzajRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SadrzajResponse> pronadjiSve() {
        return repository.findAll(Sort.by("id")).stream().map(this::uResponse).toList();
    }

    @Transactional(readOnly = true)
    public SadrzajResponse pronadjiPoId(Integer id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public SadrzajResponse kreiraj(SadrzajRequest request) {
        Sadrzaj sadrzaj = new Sadrzaj(null, null, null);
        postaviPodatke(sadrzaj, request);
        return uResponse(repository.saveAndFlush(sadrzaj));
    }

    @Transactional
    public SadrzajResponse izmijeni(Integer id, SadrzajRequest request) {
        Sadrzaj sadrzaj = repository.pronadjiZaIzmjenu(List.of(id)).stream().findFirst()
                .orElseThrow(() -> nePostoji(id));
        if (!Objects.equals(sadrzaj.getPutanjaSlike(), praznoUNull(request.putanjaSlike()))
                && repository.koristiSeUMemoriji(id) != 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Slika se koristi u memoriji. Za drugu sliku napravite novi sadrzaj.");
        }
        postaviPodatke(sadrzaj, request);
        return uResponse(repository.saveAndFlush(sadrzaj));
    }

    @Transactional
    public void obrisi(Integer id) {
        Sadrzaj sadrzaj = pronadjiEntitet(id);
        if (repository.koristiSe(id) != 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Sadrzaj se koristi u aktivnosti i ne moze se obrisati.");
        }
        // Strani kljucevi stite i od povezivanja sadrzaja tokom ovog zahtjeva.
        repository.delete(sadrzaj);
        repository.flush();
    }

    private Sadrzaj pronadjiEntitet(Integer id) {
        return repository.findById(id).orElseThrow(() -> nePostoji(id));
    }

    private ApiException nePostoji(Integer id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Sadrzaj sa ID-em " + id + " ne postoji.");
    }

    private void postaviPodatke(Sadrzaj sadrzaj, SadrzajRequest request) {
        String tekst = praznoUNull(request.tekst());
        String putanja = praznoUNull(request.putanjaSlike());
        String alternativniTekst = praznoUNull(request.alternativniTekst());
        if (tekst == null && putanja == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Unesite tekst ili putanju slike.");
        }
        if (putanja != null && !ispravnaPutanja(putanja)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Putanja slike mora biti /api/fajlovi/ime-fajla. Lokalna putanja racunara nije dozvoljena.");
        }
        sadrzaj.setTekst(tekst);
        sadrzaj.setPutanjaSlike(putanja);
        sadrzaj.setAlternativniTekst(alternativniTekst);
    }

    private boolean ispravnaPutanja(String putanja) {
        return putanja.matches("/api/fajlovi/[A-Za-z0-9][A-Za-z0-9._-]*")
                && !putanja.contains("..");
    }

    private String praznoUNull(String vrijednost) {
        return vrijednost == null || vrijednost.isBlank() ? null : vrijednost.strip();
    }

    private SadrzajResponse uResponse(Sadrzaj sadrzaj) {
        return new SadrzajResponse(sadrzaj.getId(), sadrzaj.getTekst(),
                sadrzaj.getPutanjaSlike(), sadrzaj.getAlternativniTekst());
    }
}
