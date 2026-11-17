package com.curiositycorner.app.dto.aktivnost;

import com.curiositycorner.app.entity.Tezina;

public record AktivnostResponse(Long id, Long idNivoa, Long idTipa,
                               Integer redniBroj, String uputstvo,
                               Tezina tezina, Integer brojBodova) {
}
