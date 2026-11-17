package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.memorija.MemorijaRequest;
import com.curiositycorner.app.entity.*;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.*;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemorijaServiceTests {
    private final AktivnostRepository aktivnosti = mock(AktivnostRepository.class);
    private final MemorijaRepository memorije = mock(MemorijaRepository.class);
    private final KarticaMemorijeRepository kartice = mock(KarticaMemorijeRepository.class);
    private final SadrzajRepository sadrzaji = mock(SadrzajRepository.class);
    private final MemorijaService service = new MemorijaService(aktivnosti, memorije, kartice, sadrzaji);
    private final TipAktivnosti tip = mock(TipAktivnosti.class);
    private final Aktivnost aktivnost = mock(Aktivnost.class);

    @BeforeEach
    void pripremi() {
        when(tip.getOznaka()).thenReturn("memorija");
        when(aktivnost.getTip()).thenReturn(tip);
        when(aktivnosti.pronadjiZaIzmjenu(5L)).thenReturn(Optional.of(aktivnost));
        when(aktivnosti.findById(5L)).thenReturn(Optional.of(aktivnost));
    }

    private MemorijaRequest zahtjev() { return new MemorijaRequest(2, 60, List.of(10, 20)); }

    private Sadrzaj slika(int id, String putanja) {
        Sadrzaj sadrzaj = mock(Sadrzaj.class);
        when(sadrzaj.getId()).thenReturn(id);
        when(sadrzaj.getPutanjaSlike()).thenReturn(putanja);
        return sadrzaj;
    }

    private List<Sadrzaj> slike() {
        return List.of(slika(10, "/api/fajlovi/pas.png"), slika(20, "/api/fajlovi/macka.png"));
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void odJedneSlikePraviDvijeKarticeIZamjenjujeStaruKonfiguraciju() {
        var podaci = slike();
        when(sadrzaji.pronadjiZaIzmjenu(any())).thenReturn(podaci);
        when(memorije.saveAndFlush(any())).thenAnswer(p -> p.getArgument(0));
        when(kartice.saveAllAndFlush(any())).thenAnswer(p -> p.getArgument(0));
        var rezultat = service.sacuvaj(5L, zahtjev());
        assertEquals(2, rezultat.parovi().size());
        assertEquals(4, rezultat.kartice().size());
        assertEquals(List.of(10, 10, 20, 20), rezultat.kartice().stream()
                .map(k -> k.idSadrzaja()).toList());
        assertEquals(List.of(1, 1, 2, 2), rezultat.kartice().stream()
                .map(k -> k.brojPara()).toList());
        var redoslijed = inOrder(memorije, kartice);
        redoslijed.verify(memorije).saveAndFlush(any());
        redoslijed.verify(kartice).obrisiZaAktivnost(5L);
        ArgumentCaptor<List<KarticaMemorije>> unesene = ArgumentCaptor.forClass(List.class);
        redoslijed.verify(kartice).saveAllAndFlush(unesene.capture());
        assertEquals(4, unesene.getValue().size());
    }

    @Test
    void odbijaDupliranSadrzaj() {
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.sacuvaj(5L, new MemorijaRequest(2, null, List.of(10, 10)))).getStatus());
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaIstuSlikuPodDvaIda() {
        var podaci = List.of(slika(10, "/api/fajlovi/pas.png"), slika(20, "/api/fajlovi/pas.png"));
        when(sadrzaji.pronadjiZaIzmjenu(any())).thenReturn(podaci);
        assertThrows(ApiException.class, () -> service.sacuvaj(5L, zahtjev()));
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaTekstBezSlike() {
        var podaci = List.of(slika(10, null), slika(20, "/api/fajlovi/a.png"));
        when(sadrzaji.pronadjiZaIzmjenu(any())).thenReturn(podaci);
        assertThrows(ApiException.class, () -> service.sacuvaj(5L, zahtjev()));
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaNepostojeciSadrzaj() {
        var podaci = List.of(slika(10, "/api/fajlovi/a.png"));
        when(sadrzaji.pronadjiZaIzmjenu(any())).thenReturn(podaci);
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class,
                () -> service.sacuvaj(5L, zahtjev())).getStatus());
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaNeispravanRaspored() {
        assertThrows(ApiException.class,
                () -> service.sacuvaj(5L, new MemorijaRequest(3, null, List.of(10, 20))));
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaIzmjenuNakonPokusajaIgranja() {
        when(aktivnosti.brojPokusaja(5L)).thenReturn(1L);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class,
                () -> service.sacuvaj(5L, zahtjev())).getStatus());
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void odbijaDrugiTipAktivnosti() {
        when(tip.getOznaka()).thenReturn("pitanje");
        assertThrows(ApiException.class, () -> service.sacuvaj(5L, zahtjev()));
        assertThrows(ApiException.class, () -> service.pronadji(5L));
        verifyNoInteractions(memorije, kartice);
    }

    @Test
    void vraca404ZaNepostojecuAktivnostIKonfiguraciju() {
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class,
                () -> service.sacuvaj(99L, zahtjev())).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class,
                () -> service.pronadji(5L)).getStatus());
    }

    @Test
    void citaKonfiguracijuSaJednomSlikomPoParu() {
        var podaci = slike();
        when(sadrzaji.findAllById(any())).thenReturn(podaci);
        when(memorije.findById(5L)).thenReturn(Optional.of(new Memorija(5L, 2, null)));
        when(kartice.findByIdAktivnostiOrderByBrojParaAscIdAsc(5L)).thenReturn(List.of(
                new KarticaMemorije(5L, 1, 10), new KarticaMemorije(5L, 1, 10),
                new KarticaMemorije(5L, 2, 20), new KarticaMemorije(5L, 2, 20)));
        var rezultat = service.pronadji(5L);
        assertEquals(2, rezultat.parovi().size());
        assertEquals(4, rezultat.kartice().size());
        assertNull(rezultat.vrijemeZaRjesavanje());
    }

    @Test
    void provjeravaGraniceINullVrijednosti() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertTrue(validator.validate(zahtjev()).isEmpty());
            assertFalse(validator.validate(new MemorijaRequest(1, 0, List.of(10))).isEmpty());
            assertFalse(validator.validate(new MemorijaRequest(null, null, null)).isEmpty());
            assertFalse(validator.validate(new MemorijaRequest(2, null, Arrays.asList(10, null))).isEmpty());
        }
    }
}
