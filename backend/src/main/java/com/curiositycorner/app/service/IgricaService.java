package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.igrica.IgricaRequest;
import com.curiositycorner.app.dto.igrica.IgricaResponse;
import com.curiositycorner.app.entity.Igrica;
import com.curiositycorner.app.entity.Kategorija;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.IgricaRepository;
import com.curiositycorner.app.repository.KategorijaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IgricaService {

    private final IgricaRepository igricaRepository;
    private final KategorijaRepository kategorijaRepository;

    public IgricaService(IgricaRepository igricaRepository,
                         KategorijaRepository kategorijaRepository) {
        this.igricaRepository = igricaRepository;
        this.kategorijaRepository = kategorijaRepository;
    }

    @Transactional(readOnly = true)
    public List<IgricaResponse> pronadjiSve() {
        return igricaRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::uResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IgricaResponse pronadjiPoId(Long id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public IgricaResponse kreiraj(IgricaRequest request) {
        provjeriUzrast(request);
        Kategorija kategorija = pronadjiKategoriju(request.idKategorije());
        String naziv = request.naziv().strip();

        provjeriNaziv(naziv, request.idKategorije(), null);

        Igrica igrica = new Igrica(
                kategorija,
                naziv,
                request.opis(),
                request.status().strip(),
                request.minimalniUzrast(),
                request.maksimalniUzrast()
        );

        return uResponse(igricaRepository.saveAndFlush(igrica));
    }

    @Transactional
    public IgricaResponse izmijeni(Long id, IgricaRequest request) {
        provjeriUzrast(request);
        Igrica igrica = pronadjiEntitet(id);
        Kategorija kategorija = pronadjiKategoriju(request.idKategorije());
        String naziv = request.naziv().strip();

        provjeriNaziv(naziv, request.idKategorije(), id);

        igrica.setKategorija(kategorija);
        igrica.setNaziv(naziv);
        igrica.setOpis(request.opis());
        igrica.setStatus(request.status().strip());
        igrica.setMinimalniUzrast(request.minimalniUzrast());
        igrica.setMaksimalniUzrast(request.maksimalniUzrast());

        return uResponse(igricaRepository.saveAndFlush(igrica));
    }

    @Transactional
    public void obrisi(Long id) {
        Igrica igrica = pronadjiEntitet(id);
        igricaRepository.delete(igrica);
        igricaRepository.flush();
    }

    private void provjeriUzrast(IgricaRequest request) {
        if (request.minimalniUzrast() == null || request.maksimalniUzrast() == null
                || request.minimalniUzrast() < 0
                || request.maksimalniUzrast() < request.minimalniUzrast()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Uzrasti su obavezni i nenegativni; maksimalni ne smije biti manji od minimalnog.");
        }
    }

    private Igrica pronadjiEntitet(Long id) {
        return igricaRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Igrica sa ID-em " + id + " ne postoji."
                ));
    }

    private Kategorija pronadjiKategoriju(Long id) {
        return kategorijaRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Kategorija sa ID-em " + id + " ne postoji."
                ));
    }

    private void provjeriNaziv(String naziv, Long idKategorije,
                               Long idIzuzetka) {
        if (igricaRepository.postojiIstiNaziv(
                naziv, idKategorije, idIzuzetka)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Igrica s tim nazivom vec postoji u istoj kategoriji."
            );
        }
    }

    private IgricaResponse uResponse(Igrica igrica) {
        return new IgricaResponse(
                igrica.getId(),
                igrica.getKategorija().getId(),
                igrica.getNaziv(),
                igrica.getOpis(),
                igrica.getStatus(),
                igrica.getMinimalniUzrast(),
                igrica.getMaksimalniUzrast()
        );
    }
}
