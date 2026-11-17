package com.curiositycorner.app.dto.spajanje;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record SpajanjeRequest(
        @NotNull Boolean nasumicanRaspored,
        @NotEmpty List<@NotNull @Valid Par> parovi
) {
    public record Par(@NotNull @Positive Integer redniBroj,
                      @NotNull @Positive Integer idLijevogSadrzaja,
                      @NotNull @Positive Integer idDesnogSadrzaja) { }
}
