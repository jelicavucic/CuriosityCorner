package com.curiositycorner.app.dto.osmosmjerka;

import java.util.List;

public record OsmosmjerkaResponse(Long idAktivnosti, int brojRedova, int brojKolona,
                                  List<List<String>> mreza, List<Rijec> rijeci) {
    public record Rijec(Long id, String rijec, int pocetniRed, int pocetnaKolona,
                        int krajnjiRed, int krajnjaKolona) { }
}
