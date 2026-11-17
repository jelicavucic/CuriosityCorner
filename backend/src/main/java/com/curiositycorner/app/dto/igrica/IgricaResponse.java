package com.curiositycorner.app.dto.igrica;

public record IgricaResponse (
        Long id,
        Long idKategorije,
        String naziv,
        String opis,
        String status,
        Integer uzrast
){
}
