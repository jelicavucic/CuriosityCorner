package com.curiositycorner.app.dto.razvrstavanje;

import java.util.List;

public record RazvrstavanjeResponse(Long idAktivnosti, List<Grupa> grupe) {
    public record Grupa(Long id, String naziv, List<Stavka> stavke) { }

    public record Stavka(Long id, Integer idSadrzaja) { }
}
