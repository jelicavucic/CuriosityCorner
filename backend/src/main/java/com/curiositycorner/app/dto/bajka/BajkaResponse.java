package com.curiositycorner.app.dto.bajka;

public record BajkaResponse(Long idAktivnosti, String naslov, String tekst,
                            String putanjaAudioZapisa, String putanjaNaslovneSlike) { }
