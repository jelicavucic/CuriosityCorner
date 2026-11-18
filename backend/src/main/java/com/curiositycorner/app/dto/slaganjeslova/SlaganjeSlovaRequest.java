package com.curiositycorner.app.dto.slaganjeslova;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SlaganjeSlovaRequest(
        @NotBlank @Size(max = 500) String ciljniTekst,
        @Size(max = 500) String putanjaSlike) { }
