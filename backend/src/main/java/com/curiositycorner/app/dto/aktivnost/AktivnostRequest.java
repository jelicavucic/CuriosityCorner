package com.curiositycorner.app.dto.aktivnost;

import com.curiositycorner.app.entity.Tezina;
import jakarta.validation.constraints.*;

public record AktivnostRequest(
        @NotNull(message = "Nivo je obavezan.")
        @Positive(message = "ID nivoa mora biti pozitivan.")
        Long idNivoa,

        @NotNull(message = "Tip aktivnosti je obavezan.")
        @Positive(message = "ID tipa mora biti pozitivan.")
        Long idTipa,

        @NotNull(message = "Redni broj je obavezan.")
        @Positive(message = "Redni broj mora biti pozitivan.")
        Integer redniBroj,

        @Size(max = 1000, message = "Uputstvo smije imati najvise 1000 znakova.")
        String uputstvo,

        @NotNull(message = "Tezina je obavezna.")
        Tezina tezina,

        @NotNull(message = "Broj bodova je obavezan.")
        @PositiveOrZero(message = "Broj bodova ne smije biti negativan.")
        Integer brojBodova
) {
}
