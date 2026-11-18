package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.osmosmjerka.OsmosmjerkaRequest;
import com.curiositycorner.app.dto.osmosmjerka.OsmosmjerkaResponse;
import com.curiositycorner.app.entity.Aktivnost;
import com.curiositycorner.app.entity.Osmosmjerka;
import com.curiositycorner.app.entity.SkrivenaRijec;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AktivnostRepository;
import com.curiositycorner.app.repository.OsmosmjerkaRepository;
import com.curiositycorner.app.repository.SkrivenaRijecRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class OsmosmjerkaService {
    private final AktivnostRepository aktivnosti;
    private final OsmosmjerkaRepository osmosmjerke;
    private final SkrivenaRijecRepository rijeci;

    public OsmosmjerkaService(AktivnostRepository aktivnosti, OsmosmjerkaRepository osmosmjerke,
                              SkrivenaRijecRepository rijeci) {
        this.aktivnosti = aktivnosti;
        this.osmosmjerke = osmosmjerke;
        this.rijeci = rijeci;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public OsmosmjerkaResponse pronadji(Long id) {
        provjeriTip(aktivnosti.findById(id).orElseThrow(() -> nemaAktivnosti(id)));
        Osmosmjerka osmosmjerka = osmosmjerke.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Konfiguracija osmosmjerke jos nije unesena."));
        return uResponse(osmosmjerka, rijeci.findByIdAktivnostiOrderByIdAsc(id));
    }

    @Transactional
    public OsmosmjerkaResponse sacuvaj(Long id, OsmosmjerkaRequest request) {
        provjeriTip(aktivnosti.pronadjiZaIzmjenu(id).orElseThrow(() -> nemaAktivnosti(id)));
        if (aktivnosti.brojPokusaja(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Osmosmjerka ima pokusaje igranja. Za novu konfiguraciju napravite novu aktivnost.");
        }

        List<List<String>> mreza = pripremiMrezu(request);
        Set<Putanja> putanje = new HashSet<>();
        List<SkrivenaRijec> noveRijeci = request.rijeci().stream()
                .map(rijec -> pripremiRijec(id, rijec, mreza, putanje))
                .toList();

        Osmosmjerka osmosmjerka = osmosmjerke.saveAndFlush(
                new Osmosmjerka(id, request.brojRedova(), request.brojKolona(), mreza));
        rijeci.obrisiZaAktivnost(id);
        return uResponse(osmosmjerka, rijeci.saveAllAndFlush(noveRijeci));
    }

    private List<List<String>> pripremiMrezu(OsmosmjerkaRequest request) {
        if (request.mreza().size() != request.brojRedova()
                || request.mreza().stream().anyMatch(red -> red.size() != request.brojKolona())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dimenzije mreze moraju odgovarati broju redova i kolona.");
        }
        return request.mreza().stream()
                .map(red -> red.stream().map(this::pripremiPolje).toList())
                .toList();
    }

    private String pripremiPolje(String vrijednost) {
        String polje = normalizuj(vrijednost);
        if (!polje.equals("LJ") && !polje.equals("NJ") && !polje.equals("DŽ")
                && (polje.codePointCount(0, polje.length()) != 1
                    || !Character.isLetter(polje.codePointAt(0)))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Polje mreze mora sadrzati jedno slovo, LJ, NJ ili DŽ.");
        }
        return polje;
    }

    private SkrivenaRijec pripremiRijec(Long id, OsmosmjerkaRequest.Rijec unos,
                                      List<List<String>> mreza, Set<Putanja> putanje) {
        int red = unos.pocetniRed();
        int kolona = unos.pocetnaKolona();
        int krajRed = unos.krajnjiRed();
        int krajKolona = unos.krajnjaKolona();
        if (red >= mreza.size() || krajRed >= mreza.size()
                || kolona >= mreza.getFirst().size() || krajKolona >= mreza.getFirst().size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Koordinate rijeci moraju biti unutar mreze.");
        }

        int razlikaReda = krajRed - red;
        int razlikaKolone = krajKolona - kolona;
        if (razlikaReda != 0 && razlikaKolone != 0 && Math.abs(razlikaReda) != Math.abs(razlikaKolone)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rijec mora ici vodoravno, uspravno ili dijagonalno.");
        }

        int korakReda = Integer.signum(razlikaReda);
        int korakKolone = Integer.signum(razlikaKolone);
        int koraci = Math.max(Math.abs(razlikaReda), Math.abs(razlikaKolone));
        StringBuilder tekstPutanje = new StringBuilder();
        for (int korak = 0; korak <= koraci; korak++) {
            tekstPutanje.append(mreza.get(red + korak * korakReda).get(kolona + korak * korakKolone));
        }
        String rijec = normalizuj(unos.rijec());
        if (rijec.length() > 250 || !rijec.contentEquals(tekstPutanje)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Rijec mora imati do 250 znakova i odgovarati slovima na zadatoj putanji.");
        }

        Putanja putanja = new Putanja(red, kolona, krajRed, krajKolona);
        Putanja obrnuta = new Putanja(krajRed, krajKolona, red, kolona);
        if (putanje.contains(obrnuta) || !putanje.add(putanja)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dvije rijeci ne mogu koristiti istu putanju.");
        }
        return new SkrivenaRijec(id, rijec, red, kolona, krajRed, krajKolona);
    }

    private String normalizuj(String tekst) {
        return Normalizer.normalize(tekst.strip().toUpperCase(Locale.ROOT), Normalizer.Form.NFC);
    }

    private void provjeriTip(Aktivnost aktivnost) {
        if (!"osmosmjerka".equalsIgnoreCase(aktivnost.getTip().getOznaka())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aktivnost nije tipa osmosmjerka.");
        }
    }

    private ApiException nemaAktivnosti(Long id) {
        return new ApiException(HttpStatus.NOT_FOUND, "Aktivnost " + id + " ne postoji.");
    }

    private OsmosmjerkaResponse uResponse(Osmosmjerka osmosmjerka, List<SkrivenaRijec> zapisi) {
        List<OsmosmjerkaResponse.Rijec> rezultat = zapisi.stream()
                .map(r -> new OsmosmjerkaResponse.Rijec(r.getId(), r.getRijec(),
                        r.getPocetniRed(), r.getPocetnaKolona(), r.getKrajnjiRed(), r.getKrajnjaKolona()))
                .toList();
        return new OsmosmjerkaResponse(osmosmjerka.getIdAktivnosti(), osmosmjerka.getBrojRedova(),
                osmosmjerka.getBrojKolona(), osmosmjerka.getMreza(), rezultat);
    }

    private record Putanja(int pocetniRed, int pocetnaKolona, int krajnjiRed, int krajnjaKolona) { }
}
