package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.aktivnost.AktivnostRequest;
import com.curiositycorner.app.entity.*;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AktivnostServiceTests {
    private final AktivnostRepository repository = mock(AktivnostRepository.class);
    private final NivoRepository nivoi = mock(NivoRepository.class);
    private final TipAktivnostiRepository tipovi = mock(TipAktivnostiRepository.class);
    private final AktivnostService service = new AktivnostService(repository, nivoi, tipovi);
    private final Nivo nivo = mock(Nivo.class);
    private final TipAktivnosti tip = mock(TipAktivnosti.class);

    @BeforeEach
    void pripremi() {
        when(nivo.getId()).thenReturn(1L);
        when(tip.getId()).thenReturn(1L);
        when(nivoi.findById(1L)).thenReturn(Optional.of(nivo));
        when(tipovi.findById(1L)).thenReturn(Optional.of(tip));
    }

    private AktivnostRequest zahtjev(Long idNivoa, Long idTipa) {
        return new AktivnostRequest(idNivoa, idTipa, 1, null, Tezina.LAKO, 0);
    }

    private void postojecaAktivnost() {
        when(repository.findById(5L)).thenReturn(Optional.of(
                new Aktivnost(nivo, tip, 1, null, Tezina.LAKO, 0)));
    }

    @Test
    void odbijaDupliRedniBroj() {
        when(repository.postojiRedniBroj(1L, 1, null)).thenReturn(true);
        ApiException greska = assertThrows(ApiException.class,
                () -> service.kreiraj(zahtjev(1L, 1L)));
        assertEquals(HttpStatus.CONFLICT, greska.getStatus());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void odbijaNepostojeciNivo() {
        ApiException greska = assertThrows(ApiException.class,
                () -> service.kreiraj(zahtjev(99L, 1L)));
        assertEquals(HttpStatus.NOT_FOUND, greska.getStatus());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void odbijaPromjenuTipaSaKonfiguracijom() {
        postojecaAktivnost();
        TipAktivnosti drugiTip = mock(TipAktivnosti.class);
        when(tipovi.findById(2L)).thenReturn(Optional.of(drugiTip));
        when(repository.imaKonfiguraciju(5L)).thenReturn(1);
        ApiException greska = assertThrows(ApiException.class,
                () -> service.izmijeni(5L, zahtjev(1L, 2L)));
        assertEquals(HttpStatus.CONFLICT, greska.getStatus());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void odbijaPremjestanjeAktivnostiSaPokusajima() {
        postojecaAktivnost();
        when(nivoi.findById(2L)).thenReturn(Optional.of(mock(Nivo.class)));
        when(repository.brojPokusaja(5L)).thenReturn(1L);
        ApiException greska = assertThrows(ApiException.class,
                () -> service.izmijeni(5L, zahtjev(2L, 1L)));
        assertEquals(HttpStatus.CONFLICT, greska.getStatus());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void odbijaBrisanjeAktivnostiSaPokusajima() {
        postojecaAktivnost();
        when(repository.brojPokusaja(5L)).thenReturn(1L);
        ApiException greska = assertThrows(ApiException.class, () -> service.obrisi(5L));
        assertEquals(HttpStatus.CONFLICT, greska.getStatus());
        verify(repository, never()).delete(any());
    }

    @Test
    void dozvoljavaIzmjenuBezPromjeneTipaINivoa() {
        postojecaAktivnost();
        when(repository.saveAndFlush(any())).thenAnswer(poziv -> poziv.getArgument(0));
        var rezultat = service.izmijeni(5L, zahtjev(1L, 1L));
        assertEquals(1L, rezultat.idNivoa());
        assertEquals(Tezina.LAKO, rezultat.tezina());
        verify(repository).postojiRedniBroj(1L, 1, 5L);
        verify(repository, never()).imaKonfiguraciju(any());
    }
}
