package com.curiositycorner.app.dto.avatar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvatarRequest(
        @NotBlank(message = "Naziv avatara je obavezan.")
        @Size(max = 255, message = "Naziv smije imati najvise 255 znakova.")
        String naziv,
        @NotBlank(message = "Putanja slike je obavezna.")
        @Size(max = 255, message = "Putanja slike smije imati najvise 255 znakova.")
        String putanjaSlike,
        @NotNull(message = "Navedite da li je avatar aktivan.")
        Boolean aktivan
) {
}
