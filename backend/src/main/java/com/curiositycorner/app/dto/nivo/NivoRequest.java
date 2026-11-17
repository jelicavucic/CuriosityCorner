package com.curiositycorner.app.dto.nivo;

import jakarta.validation.constraints.*;

public record NivoRequest(
        @NotNull(message = "Igrica je obavezna.")
        @Positive(message = "ID igrice mora biti pozitivan.")
        Long idIgrice,

        @NotNull(message = "Redni broj je obavezan.")
        @Positive(message = "Redni broj mora biti pozitivan.")
        Integer redniBroj,

        @NotBlank(message = "Naziv je obavezan.")
        @Size(max = 150, message = "Naziv smije imati najvise 150 znakova.")
        String naziv,

        @NotNull(message = "Bodovi za otkljucavanje su obavezni.")
        @PositiveOrZero(message = "Bodovi ne smiju biti negativni.")
        Integer bodoviZaOtkljucavanje
) {
}
