package com.curiositycorner.app.dto.igrica;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record IgricaRequest(
        @NotNull(message = "Kategorija je obavezna.")
        @Positive(message = "ID kategorije mora biti pozitivan.")
        Long idKategorije,

        @NotBlank(message = "Naziv je obavezan.")
        @Size(max = 200, message = "Naziv smije imati najvise 200 znakova.")
        String naziv,

        @Size(max = 2000, message = "Opis smije imati najvise 2000 znakova.")
        String opis,

        @NotBlank(message = "Status je obavezan.")
        @Size(max = 30, message = "Status smije imati najvise 30 znakova.")
        String status,

        @NotNull(message = "Minimalni uzrast je obavezan.")
        @PositiveOrZero(message = "Uzrast ne smije biti negativan.")
        Integer minimalniUzrast,

        @NotNull(message = "Maksimalni uzrast je obavezan.")
        @PositiveOrZero(message = "Uzrast ne smije biti negativan.")
        Integer maksimalniUzrast
) {
}
