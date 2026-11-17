package com.curiositycorner.app.dto.sadrzaj;

import jakarta.validation.constraints.Size;

public record SadrzajRequest(
        @Size(max = 10000, message = "Tekst smije imati najvise 10000 znakova.")
        String tekst,
        @Size(max = 500, message = "Putanja slike smije imati najvise 500 znakova.")
        String putanjaSlike,
        @Size(max = 250, message = "Alternativni tekst smije imati najvise 250 znakova.")
        String alternativniTekst
) {
}
