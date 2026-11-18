package com.curiositycorner.app.dto.memorija;

import jakarta.validation.constraints.*;
import java.util.List;

public record MemorijaRequest(
        @NotNull @Min(2) @Max(10) Integer brojKolona,
        @Positive Integer vrijemeZaRjesavanje,
        @NotNull @Size(min = 2, max = 50)
        List<@NotNull @Positive Integer> idSadrzajaParova
) {
}
