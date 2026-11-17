package com.curiositycorner.app.dto.spajanje;

import java.util.List;

public record SpajanjeResponse(Long idAktivnosti, boolean nasumicanRaspored, List<Par> parovi) {
    public record Par(Long id, Integer redniBroj, Integer idLijevogSadrzaja,
                      Integer idDesnogSadrzaja) { }
}
