package com.curiositycorner.app.dto.recenzija;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OdgovorNaRecenzijuRequest(@NotBlank @Size(max = 3000) String tekstOdgovora) { }
