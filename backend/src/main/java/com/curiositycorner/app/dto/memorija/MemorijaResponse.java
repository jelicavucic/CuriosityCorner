package com.curiositycorner.app.dto.memorija;

import java.util.List;

public record MemorijaResponse(Long idAktivnosti, Integer brojKolona,
                               Integer vrijemeZaRjesavanje, List<ParMemorijeResponse> parovi,
                               List<Kartica> kartice) {
    public record ParMemorijeResponse(Integer brojPara, Integer idSadrzaja, String putanjaSlike,
                      String alternativniTekst) { }
    public record Kartica(Long id, Integer brojPara, Integer idSadrzaja) { }
}
