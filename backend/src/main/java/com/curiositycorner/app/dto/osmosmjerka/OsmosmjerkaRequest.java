package com.curiositycorner.app.dto.osmosmjerka;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OsmosmjerkaRequest(
        @NotNull @Positive Integer brojRedova,
        @NotNull @Positive Integer brojKolona,
        @NotEmpty List<@NotEmpty List<@NotBlank String>> mreza,
        @NotEmpty List<@NotNull @Valid Rijec> rijeci) {
    public record Rijec(
            @NotBlank @Size(max = 250) String rijec,
            @NotNull @PositiveOrZero Integer pocetniRed,
            @NotNull @PositiveOrZero Integer pocetnaKolona,
            @NotNull @PositiveOrZero Integer krajnjiRed,
            @NotNull @PositiveOrZero Integer krajnjaKolona) { }
}
