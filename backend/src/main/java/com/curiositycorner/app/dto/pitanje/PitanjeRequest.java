package com.curiositycorner.app.dto.pitanje;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PitanjeRequest(@NotNull @Positive Integer idSadrzaja,
                             @Size(max = 2000) String objasnjenje,
                             @NotNull @Size(min = 2) List<@NotNull @Valid Odgovor> odgovori) {
    public record Odgovor(@NotNull @Positive Integer idSadrzaja,
                          @NotNull @Positive Integer redniBroj,
                          @NotNull Boolean jeTacan) { }
}
