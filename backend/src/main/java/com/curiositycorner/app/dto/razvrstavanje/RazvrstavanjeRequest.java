package com.curiositycorner.app.dto.razvrstavanje;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record RazvrstavanjeRequest(@NotEmpty List<@NotNull @Valid Grupa> grupe) {
    public record Grupa(@NotBlank @Size(max = 150) String naziv,
                        @NotEmpty List<@NotNull @Valid Stavka> stavke) { }

    public record Stavka(@NotNull @Positive Integer idSadrzaja) { }
}
