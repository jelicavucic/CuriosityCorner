package com.curiositycorner.app.dto.kategorija;

public record KategorijaResponse (
    Long id,
    String naziv,
    String opis,
    Long idNadkategorije
){}
