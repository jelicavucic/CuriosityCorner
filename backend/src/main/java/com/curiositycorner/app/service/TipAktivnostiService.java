package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.aktivnost.TipAktivnostiResponse;
import com.curiositycorner.app.repository.TipAktivnostiRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TipAktivnostiService {
    private final TipAktivnostiRepository repository;

    public TipAktivnostiService(TipAktivnostiRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TipAktivnostiResponse> pronadjiSve() {
        return repository.findAll(Sort.by("id")).stream()
                .map(t -> new TipAktivnostiResponse(t.getId(), t.getOznaka(), t.getNaziv()))
                .toList();
    }
}
