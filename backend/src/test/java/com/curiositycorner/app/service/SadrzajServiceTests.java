package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.sadrzaj.SadrzajRequest;
import com.curiositycorner.app.entity.Sadrzaj;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.SadrzajRepository;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SadrzajServiceTests {
    private final SadrzajRepository repository = mock(SadrzajRepository.class);
    private final SadrzajService service = new SadrzajService(repository);

    @Test
    void odbijaPrazanSadrzajCakIKadaImaAlternativniTekst() {
        ApiException greska = assertThrows(ApiException.class,
                () -> service.kreiraj(new SadrzajRequest(" \n", " ", "Opis")));
        assertEquals(HttpStatus.BAD_REQUEST, greska.getStatus());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void dozvoljavaSamoTekstISamoSliku() {
        when(repository.saveAndFlush(any())).thenAnswer(poziv -> poziv.getArgument(0));
        var tekst = service.kreiraj(new SadrzajRequest(" Pas ", null, null));
        assertEquals("Pas", tekst.tekst());
        var slika = service.kreiraj(new SadrzajRequest(null, "/api/fajlovi/pas.png", " Pas "));
        assertEquals("/api/fajlovi/pas.png", slika.putanjaSlike());
        assertEquals("Pas", slika.alternativniTekst());
    }

    @Test
    void odbijaLokalneINeispravnePutanje() {
        for (String putanja : new String[]{"C:\\slike\\pas.png", "/api/fajlovi/../pas.png",
                "file:///pas.png", "/api/fajlovi/", "/api/fajlovi/pas.png?x=1"}) {
            assertThrows(ApiException.class,
                    () -> service.kreiraj(new SadrzajRequest(null, putanja, null)), putanja);
        }
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void putZamjenjujeSvaPolja() {
        Sadrzaj postojeci = new Sadrzaj("Stari tekst", "/api/fajlovi/pas.png", "Pas");
        when(repository.pronadjiZaIzmjenu(List.of(1))).thenReturn(List.of(postojeci));
        when(repository.saveAndFlush(any())).thenAnswer(poziv -> poziv.getArgument(0));
        var rezultat = service.izmijeni(1, new SadrzajRequest("Novi tekst", null, null));
        assertEquals("Novi tekst", rezultat.tekst());
        assertNull(rezultat.putanjaSlike());
        assertNull(rezultat.alternativniTekst());
    }

    @Test
    void neispravnaIzmjenaNeMijenjaEntitet() {
        Sadrzaj postojeci = new Sadrzaj("Pas", null, null);
        when(repository.pronadjiZaIzmjenu(List.of(1))).thenReturn(List.of(postojeci));
        assertThrows(ApiException.class,
                () -> service.izmijeni(1, new SadrzajRequest(null, null, null)));
        assertEquals("Pas", postojeci.getTekst());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void nepostojeciSadrzajVraca404() {
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class,
                () -> service.pronadjiPoId(99)).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class,
                () -> service.obrisi(99)).getStatus());
    }

    @Test
    void odbijaZamjenuIliUklanjanjeSlikeKojuMemorijaKoristi() {
        when(repository.koristiSeUMemoriji(1)).thenReturn(1);
        for (String putanja : new String[]{null, "/api/fajlovi/macka.png"}) {
            var postojeci = new Sadrzaj("Pas", "/api/fajlovi/pas.png", "Pas");
            when(repository.pronadjiZaIzmjenu(List.of(1))).thenReturn(List.of(postojeci));
            assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class,
                    () -> service.izmijeni(1, new SadrzajRequest("Pas", putanja, "Pas"))).getStatus());
        }
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void odbijaBrisanjeKoristenogSadrzaja() {
        when(repository.findById(1)).thenReturn(Optional.of(new Sadrzaj("Pas", null, null)));
        when(repository.koristiSe(1)).thenReturn(1);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class,
                () -> service.obrisi(1)).getStatus());
        verify(repository, never()).delete(any());
    }

    @Test
    void briseNepovezanSadrzaj() {
        Sadrzaj sadrzaj = new Sadrzaj("Pas", null, null);
        when(repository.findById(1)).thenReturn(Optional.of(sadrzaj));
        service.obrisi(1);
        verify(repository).delete(sadrzaj);
        verify(repository).flush();
    }

    @Test
    void ogranicavaDuzinePoljaPrijeUpisaUBazu() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertEquals(3, validator.validate(new SadrzajRequest(
                    "a".repeat(10001), "a".repeat(501), "a".repeat(251))).size());
            assertTrue(validator.validate(new SadrzajRequest("Pas", null, null)).isEmpty());
        }
    }
}
