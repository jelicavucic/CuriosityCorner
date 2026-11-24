package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeRequest;
import com.curiositycorner.app.dto.razvrstavanje.RazvrstavanjeResponse;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.GrupaRazvrstavanja;
import com.curiositycorner.app.entity.Razvrstavanje;
import com.curiositycorner.app.entity.Sadrzaj;
import com.curiositycorner.app.entity.StavkaRazvrstavanja;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RazvrstavanjeService {
    private final AktivnostRepository aktivnosti;
    private final RazvrstavanjeRepository razvrstavanja;
    private final GrupaRazvrstavanjaRepository grupe;
    private final StavkaRazvrstavanjaRepository stavke;
    private final SadrzajRepository sadrzaji;

    public RazvrstavanjeService(AktivnostRepository aktivnosti, RazvrstavanjeRepository razvrstavanja,
                                GrupaRazvrstavanjaRepository grupe, StavkaRazvrstavanjaRepository stavke,
                                SadrzajRepository sadrzaji) {
        this.aktivnosti = aktivnosti;
        this.razvrstavanja = razvrstavanja;
        this.grupe = grupe;
        this.stavke = stavke;
        this.sadrzaji = sadrzaji;
    }

    @Transactional(readOnly = true)
    public RazvrstavanjeResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (!razvrstavanja.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Konfiguracija razvrstavanja jos nije unesena.");
        }
        return uResponse(id);
    }

    @Transactional
    public RazvrstavanjeResponse sacuvaj(Long id, RazvrstavanjeRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Razvrstavanje ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }
        provjeriGrupe(request.grupe());

        razvrstavanja.saveAndFlush(new Razvrstavanje(id));
        // Strani kljuc zahtijeva brisanje stavki prije njihovih grupa.
        aktivnosti.obrisiStavkeRazvrstavanja(id);
        grupe.obrisiZaAktivnost(id);

        List<StavkaRazvrstavanja> noveStavke = new ArrayList<>();
        for (var unos : request.grupe()) {
            var grupa = grupe.save(new GrupaRazvrstavanja(id, unos.naziv().strip(), unos.idSadrzaja()));
            for (var stavka : unos.stavke()) {
                noveStavke.add(new StavkaRazvrstavanja(grupa.getId(), stavka.idSadrzaja()));
            }
        }
        stavke.saveAllAndFlush(noveStavke);
        return uResponse(id);
    }

    private void provjeriGrupe(List<RazvrstavanjeRequest.Grupa> uneseneGrupe) {
        Set<String> nazivi = new HashSet<>();
        Set<Integer> trazeniSadrzaji = new LinkedHashSet<>();
        for (var grupa : uneseneGrupe) {
            if (!nazivi.add(grupa.naziv().strip().toLowerCase(Locale.ROOT))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Grupe moraju imati razlicite nazive.");
            }
            for (var stavka : grupa.stavke()) {
                if (!trazeniSadrzaji.add(stavka.idSadrzaja())) {
                    throw new ApiException(HttpStatus.BAD_REQUEST,
                            "Sadrzaj " + stavka.idSadrzaja() + " moze se koristiti samo jednom u aktivnosti.");
                }
            }
        }
        uneseneGrupe.stream().map(RazvrstavanjeRequest.Grupa::idSadrzaja)
                .filter(java.util.Objects::nonNull).forEach(trazeniSadrzaji::add);
        Set<Integer> postojeci = sadrzaji.findAllById(trazeniSadrzaji).stream()
                .map(Sadrzaj::getId)
                .collect(Collectors.toSet());
        for (Integer id : trazeniSadrzaji) {
            if (!postojeci.contains(id)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Sadrzaj " + id + " ne postoji.");
            }
        }
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"razvrstavanje".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa razvrstavanje.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private RazvrstavanjeResponse uResponse(Long id) {
        var sveGrupe = grupe.findByIdAktivnostiOrderByIdAsc(id);
        var stavkePoGrupi = stavke.pronadjiZaAktivnost(id).stream()
                .collect(Collectors.groupingBy(StavkaRazvrstavanja::getIdTacneGrupe,
                        Collectors.mapping(stavka -> new RazvrstavanjeResponse.Stavka(
                                stavka.getId(), stavka.getIdSadrzaja()), Collectors.toList())));
        var rezultat = sveGrupe.stream()
                .map(grupa -> new RazvrstavanjeResponse.Grupa(grupa.getId(), grupa.getNaziv(), grupa.getIdSadrzaja(),
                        stavkePoGrupi.getOrDefault(grupa.getId(), List.of())))
                .toList();
        return new RazvrstavanjeResponse(id, rezultat);
    }
}
