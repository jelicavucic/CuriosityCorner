package com.curiositycorner.app.dto.recenzija;

import java.time.LocalDateTime;

public record OdgovorNaRecenzijuResponse(Long id, Long idRecenzije, Long idAdministratora,
                                        String tekstOdgovora, LocalDateTime datumKreiranja,
                                        LocalDateTime datumIzmjene) { }
