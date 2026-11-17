package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.dto.aktivnost.AktivnostResponse;
import com.curiositycorner.app.entity.*;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AktivnostService {
    private final AktivnostRepository repository;
    private final NivoRepository nivoRepository;
    private final TipAktivnostiRepository tipRepository;

    public AktivnostService(AktivnostRepository repository, NivoRepository nivoRepository,
                            TipAktivnostiRepository tipRepository) {
        this.repository = repository;
        this.nivoRepository = nivoRepository;
        this.tipRepository = tipRepository;
    }

    @Transactional(readOnly = true)
    public List<AktivnostResponse> pronadjiSve() {
        return repository.findAll(Sort.by("nivo.id", "redniBroj", "id"))
                .stream().map(this::uResponse).toList();
    }

    @Transactional(readOnly = true)
    public AktivnostResponse pronadjiPoId(Long id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public AktivnostResponse kreiraj(AktivnostRequest request) {
        Nivo nivo = pronadjiNivo(request.idNivoa());
        TipAktivnosti tip = pronadjiTip(request.idTipa());
        provjeriRedniBroj(request, null);
        Aktivnost aktivnost = new Aktivnost(nivo, tip, request.redniBroj(),
                request.uputstvo(), request.tezina(), request.brojBodova());
        return uResponse(repository.saveAndFlush(aktivnost));
    }

    @Transactional
    public AktivnostResponse izmijeni(Long id, AktivnostRequest request) {
        Aktivnost aktivnost = pronadjiEntitet(id);
        Nivo nivo = pronadjiNivo(request.idNivoa());
        TipAktivnosti tip = pronadjiTip(request.idTipa());
        boolean mijenjaTip = !aktivnost.getTip().getId().equals(request.idTipa());
        boolean mijenjaNivo = !aktivnost.getNivo().getId().equals(request.idNivoa());

        if (mijenjaTip && repository.imaKonfiguraciju(id) != 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Tip se ne moze promijeniti dok aktivnost ima posebnu konfiguraciju.");
        }
        if ((mijenjaTip || mijenjaNivo) && repository.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Nivo i tip se ne mogu promijeniti jer aktivnost ima pokusaje rjesavanja.");
        }
        provjeriRedniBroj(request, id);
        aktivnost.setNivo(nivo);
        aktivnost.setTip(tip);
        aktivnost.setRedniBroj(request.redniBroj());
        aktivnost.setUputstvo(request.uputstvo());
        aktivnost.setTezina(request.tezina());
        aktivnost.setBrojBodova(request.brojBodova());
        return uResponse(repository.saveAndFlush(aktivnost));
    }

    @Transactional
    public void obrisi(Long id) {
        Aktivnost aktivnost = pronadjiEntitet(id);
        if (repository.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Aktivnost ima pokusaje rjesavanja i ne moze se obrisati.");
        }

        repository.delete(aktivnost);
        repository.flush();
    }

    private Aktivnost pronadjiEntitet(Long id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Aktivnost sa ID-em " + id + " ne postoji."));
    }

    private Nivo pronadjiNivo(Long id) {
        return nivoRepository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Nivo sa ID-em " + id + " ne postoji."));
    }

    private TipAktivnosti pronadjiTip(Long id) {
        return tipRepository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Tip aktivnosti sa ID-em " + id + " ne postoji."));
    }

    private void provjeriRedniBroj(AktivnostRequest request, Long idIzuzetka) {
        if (repository.postojiRedniBroj(request.idNivoa(), request.redniBroj(), idIzuzetka)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Aktivnost s tim rednim brojem vec postoji u istom nivou.");
        }
    }

    private AktivnostResponse uResponse(Aktivnost aktivnost) {
        return new AktivnostResponse(aktivnost.getId(), aktivnost.getNivo().getId(),
                aktivnost.getTip().getId(), aktivnost.getRedniBroj(),
                aktivnost.getUputstvo(), aktivnost.getTezina(), aktivnost.getBrojBodova());
    }
}
