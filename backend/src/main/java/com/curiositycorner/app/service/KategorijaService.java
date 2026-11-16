package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.kategorija.KategorijaResponse;
import com.curiositycorner.app.dto.kategorija.KategorijaRequest;
import com.curiositycorner.app.entity.Kategorija;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.KategorijaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.HashSet;
import java.util.Set;

@Service
public class KategorijaService {

    private final KategorijaRepository kategorijaRepository;

    public KategorijaService(KategorijaRepository kategorijaRepository) {
        this.kategorijaRepository = kategorijaRepository;
    }

    @Transactional(readOnly = true)
    public List<KategorijaResponse> pronadjiSve() {
        return kategorijaRepository.findAll(Sort.by("id"))
                .stream()
                .map(this::uResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public KategorijaResponse pronadjiPoId(Long id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public KategorijaResponse kreiraj(KategorijaRequest request) {
        Kategorija nadkategorija = pronadjiNadkategoriju(request.idNadkategorije());
        String naziv = request.naziv().strip();
        provjeriNaziv(naziv, request.idNadkategorije(), null);

        Kategorija kategorija = new Kategorija(naziv, request.opis(), nadkategorija);
        return uResponse(kategorijaRepository.saveAndFlush(kategorija));
    }

    @Transactional
    public KategorijaResponse izmijeni(Long id, KategorijaRequest request) {
        Kategorija kategorija = pronadjiEntitet(id);
        Kategorija nadkategorija = pronadjiNadkategoriju(request.idNadkategorije());
        provjeriHijerarhiju(id, nadkategorija);

        String naziv = request.naziv().strip();
        provjeriNaziv(naziv, request.idNadkategorije(), id);
        kategorija.setNaziv(naziv);
        kategorija.setOpis(request.opis());
        kategorija.setNadkategorija(nadkategorija);
        return uResponse(kategorijaRepository.saveAndFlush(kategorija));
    }

    @Transactional
    public void obrisi(Long id) {
        Kategorija kategorija = pronadjiEntitet(id);
        if (kategorijaRepository.existsByNadkategorija_Id(id)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Kategorija ima potkategorije i ne moze se obrisati.");
        }
        // Strani kljuc baze sprjecava i brisanje kategorije koju koriste igre.
        kategorijaRepository.delete(kategorija);
        kategorijaRepository.flush();
    }

    private Kategorija pronadjiEntitet(Long id) {
        return kategorijaRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Kategorija sa ID-em " + id + " ne postoji."));
    }

    private Kategorija pronadjiNadkategoriju(Long id) {
        return id == null ? null : pronadjiEntitet(id);
    }

    private void provjeriNaziv(String naziv, Long idNadkategorije, Long idIzuzetka) {
        if (kategorijaRepository.postojiIstiNaziv(naziv, idNadkategorije, idIzuzetka)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Kategorija s tim nazivom vec postoji pod istom nadkategorijom.");
        }
    }

    private void provjeriHijerarhiju(Long id, Kategorija nadkategorija) {
        Set<Long> posjecene = new HashSet<>();
        for (Kategorija trenutna = nadkategorija; trenutna != null;
             trenutna = trenutna.getNadkategorija()) {
            if (id.equals(trenutna.getId()) || !posjecene.add(trenutna.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Kategorija ne moze biti nadkategorija sebi ili svom pretku.");
            }
        }
    }

    private KategorijaResponse uResponse(Kategorija kategorija) {
        Long idNadkategorije = kategorija.getNadkategorija() == null
                ? null
                : kategorija.getNadkategorija().getId();

        return new KategorijaResponse(
                kategorija.getId(),
                kategorija.getNaziv(),
                kategorija.getOpis(),
                idNadkategorije
        );
    }
}
