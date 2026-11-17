package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.nivo.NivoRequest;
import com.curiositycorner.app.dto.nivo.NivoResponse;
import com.curiositycorner.app.entity.Igrica;
import com.curiositycorner.app.entity.Nivo;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.IgricaRepository;
import com.curiositycorner.app.repository.NivoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NivoService {

    private final NivoRepository nivoRepository;
    private final IgricaRepository igricaRepository;

    public NivoService(NivoRepository nivoRepository, IgricaRepository igricaRepository) {
        this.nivoRepository = nivoRepository;
        this.igricaRepository = igricaRepository;
    }

    @Transactional(readOnly = true)
    public List<NivoResponse> pronadjiSve() {
        return nivoRepository.findAll(Sort.by("igrica.id", "redniBroj", "id"))
                .stream().map(this::uResponse).toList();
    }

    @Transactional(readOnly = true)
    public NivoResponse pronadjiPoId(Long id) {
        return uResponse(pronadjiEntitet(id));
    }

    @Transactional
    public NivoResponse kreiraj(NivoRequest request) {
        Igrica igrica = pronadjiIgricu(request.idIgrice());
        provjeriRedniBroj(request, null);
        Nivo nivo = new Nivo(igrica, request.redniBroj(), request.naziv().strip(),
                request.bodoviZaOtkljucavanje());
        return uResponse(nivoRepository.saveAndFlush(nivo));
    }

    @Transactional
    public NivoResponse izmijeni(Long id, NivoRequest request) {
        Nivo nivo = pronadjiEntitet(id);
        Igrica igrica = pronadjiIgricu(request.idIgrice());
        provjeriRedniBroj(request, id);
        nivo.setIgrica(igrica);
        nivo.setRedniBroj(request.redniBroj());
        nivo.setNaziv(request.naziv().strip());
        nivo.setBodoviZaOtkljucavanje(request.bodoviZaOtkljucavanje());
        return uResponse(nivoRepository.saveAndFlush(nivo));
    }

    @Transactional
    public void obrisi(Long id) {
        Nivo nivo = pronadjiEntitet(id);
        // Strani kljucevi baze sprecavaju brisanje nivoa koji se koristi.
        nivoRepository.delete(nivo);
        nivoRepository.flush();
    }

    private Nivo pronadjiEntitet(Long id) {
        return nivoRepository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Nivo sa ID-em " + id + " ne postoji."));
    }

    private Igrica pronadjiIgricu(Long id) {
        return igricaRepository.findById(id).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "Igrica sa ID-em " + id + " ne postoji."));
    }

    private void provjeriRedniBroj(NivoRequest request, Long idIzuzetka) {
        if (nivoRepository.postojiRedniBroj(request.idIgrice(), request.redniBroj(), idIzuzetka)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Nivo s tim rednim brojem vec postoji u istoj igrici.");
        }
    }

    private NivoResponse uResponse(Nivo nivo) {
        return new NivoResponse(nivo.getId(), nivo.getIgrica().getId(),
                nivo.getRedniBroj(), nivo.getNaziv(), nivo.getBodoviZaOtkljucavanje());
    }
}
