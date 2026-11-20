package com.curiositycorner.app.dto.recenzija;

import java.time.LocalDateTime;

public record AdminRecenzijaResponse(Long id, Long idIgrice, Long idKorisnika, int ocjena, String komentar,
                                    LocalDateTime datumKreiranja, LocalDateTime datumIzmjene,
                                    OdgovorNaRecenzijuResponse odgovor) { }
