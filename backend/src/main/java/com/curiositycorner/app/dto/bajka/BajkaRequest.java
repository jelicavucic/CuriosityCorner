package com.curiositycorner.app.dto.bajka;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BajkaRequest(
        @NotBlank @Size(max = 250) String naslov,
        @NotBlank String tekst,
        @Size(max = 500) String putanjaAudioZapisa,
        @Size(max = 500) String putanjaNaslovneSlike) { }
