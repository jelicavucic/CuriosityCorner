package com.curiositycorner.app.dto.pitanje;

import java.util.List;

public record PitanjeResponse(Long idAktivnosti, Integer idSadrzaja,
                              String objasnjenje, List<Odgovor> odgovori) {
    public record Odgovor(Long id, Integer idSadrzaja, Integer redniBroj, boolean jeTacan) { }
}
