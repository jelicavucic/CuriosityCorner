package com.curiositycorner.app.dto.nivo;

public record NivoResponse(
        Long id,
        Long idIgrice,
        Integer redniBroj,
        String naziv,
        Integer bodoviZaOtkljucavanje
) {
}
