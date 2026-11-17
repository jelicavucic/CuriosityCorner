package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.avatar.AvatarRequest;
import com.curiositycorner.app.dto.avatar.AvatarResponse;
import com.curiositycorner.app.entity.Avatar;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AvatarRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AvatarService {
    private final AvatarRepository repository;

    public AvatarService(AvatarRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AvatarResponse> pronadjiSve(Boolean aktivan) {
        Sort sort = Sort.by("id");
        List<Avatar> avatari = aktivan == null
                ? repository.findAll(sort) : repository.findByAktivan(aktivan, sort);
        return avatari.stream().map(this::uResponse).toList();
    }

    @Transactional(readOnly = true)
    public AvatarResponse pronadjiPoId(Integer id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public AvatarResponse kreiraj(AvatarRequest request) {
        provjeriPodatke(request, null);
        Avatar avatar = new Avatar(request.naziv().strip(), request.putanjaSlike().strip(), request.aktivan());
        return uResponse(repository.saveAndFlush(avatar));
    }

    @Transactional
    public AvatarResponse izmijeni(Integer id, AvatarRequest request) {
        Avatar avatar = pronadjiEntitet(id);
        provjeriPodatke(request, id);
        avatar.setNaziv(request.naziv().strip());
        avatar.setPutanjaSlike(request.putanjaSlike().strip());
        avatar.setAktivan(request.aktivan());
        return uResponse(repository.saveAndFlush(avatar));
    }

    @Transactional
    public void obrisi(Integer id) {
        Avatar avatar = pronadjiEntitet(id);
        if (repository.koristiSe(id) != 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Avatar koriste igraci i ne moze se obrisati. Umjesto brisanja deaktivirajte avatar.");
        }
        // Strani kljuc stiti i ako igrac odabere avatar tokom ovog zahtjeva.
        repository.delete(avatar);
        repository.flush();
    }

    private Avatar pronadjiEntitet(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Avatar sa ID-em " + id + " ne postoji."));
    }

    private void provjeriPodatke(AvatarRequest request, Integer idIzuzetka) {
        if (request.naziv() == null || request.naziv().isBlank()
                || request.putanjaSlike() == null || request.putanjaSlike().isBlank()
                || request.aktivan() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Naziv, putanja slike i aktivan su obavezni.");
        }
        String putanja = request.putanjaSlike().strip();
        if (!putanja.matches("/api/fajlovi/[A-Za-z0-9][A-Za-z0-9._-]*") || putanja.contains("..")) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Putanja slike mora biti /api/fajlovi/ime-fajla. Lokalna putanja racunara nije dozvoljena.");
        }
        if (repository.postojiIstiNaziv(request.naziv().strip(), idIzuzetka)) {
            throw new ApiException(HttpStatus.CONFLICT, "Avatar s tim nazivom vec postoji.");
        }
    }

    private AvatarResponse uResponse(Avatar avatar) {
        return new AvatarResponse(avatar.getId(), avatar.getNaziv(), avatar.getPutanjaSlike(), avatar.isAktivan());
    }
}
