package com.curiositycorner.app.dto.kategorija;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record KategorijaRequest(
        @NotBlank(message = "Naziv je obavezan.")
        @Size(max = 150, message = "Naziv smije imati najvise 150 znakova.")
        String naziv,

        @Size(max = 1000, message = "Opis smije imati najvise 1000 znakova.")
        String opis,

        @Positive(message = "ID nadkategorije mora biti pozitivan.")
        Long idNadkategorije
) {
}
