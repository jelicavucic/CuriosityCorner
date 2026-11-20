package com.curiositycorner.app.service;

import com.curiositycorner.app.dto.recenzija.AdminRecenzijaResponse;
import com.curiositycorner.app.dto.recenzija.OdgovorNaRecenzijuRequest;
import com.curiositycorner.app.dto.recenzija.OdgovorNaRecenzijuResponse;
import com.curiositycorner.app.entity.Administrator;
import com.curiositycorner.app.entity.OdgovorNaRecenziju;
import com.curiositycorner.app.exception.ApiException;
import com.curiositycorner.app.repository.AdministratorRepository;
import com.curiositycorner.app.repository.OdgovorNaRecenzijuRepository;
import com.curiositycorner.app.repository.RecenzijaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminRecenzijaService {
    private final RecenzijaRepository recenzije;
    private final OdgovorNaRecenzijuRepository odgovori;
    private final AdministratorRepository administratori;

    public AdminRecenzijaService(RecenzijaRepository recenzije, OdgovorNaRecenzijuRepository odgovori,
                                 AdministratorRepository administratori) {
        this.recenzije = recenzije;
        this.odgovori = odgovori;
        this.administratori = administratori;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public List<AdminRecenzijaResponse> pronadjiSve() {
        var odgovorPoRecenziji = odgovori.findAll().stream().collect(Collectors.toMap(
                OdgovorNaRecenziju::getIdRecenzije, this::uResponse));
        return recenzije.findAll(Sort.by(Sort.Direction.DESC, "datumKreiranja", "id")).stream()
                .map(r -> new AdminRecenzijaResponse(r.getId(), r.getIdIgrice(), r.getIdKorisnika(),
                        r.getOcjena(), r.getKomentar(), r.getDatumKreiranja(), r.getDatumIzmjene(),
                        odgovorPoRecenziji.get(r.getId())))
                .toList();
    }

    @Transactional
    public OdgovorNaRecenzijuResponse sacuvaj(Long id, String korisnickoIme, OdgovorNaRecenzijuRequest unos) {
        zakljucajRecenziju(id);
        Long idAdmina = administratori.findByKorisnickoIme(korisnickoIme).map(Administrator::getId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Administrator ne postoji."));

        String tekst = unos.tekstOdgovora().strip();
        LocalDateTime sada = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS);
        var postojeci = odgovori.findByIdRecenzije(id);
        OdgovorNaRecenziju odgovor = postojeci.orElseGet(() -> new OdgovorNaRecenziju(id, idAdmina, tekst, sada));
        if (postojeci.isPresent() && (!tekst.equals(odgovor.getTekstOdgovora())
                || !idAdmina.equals(odgovor.getIdAdministratora()))) {
            odgovor.izmijeni(idAdmina, tekst, sada);
        }
        return uResponse(odgovori.saveAndFlush(odgovor));
    }

    @Transactional
    public void obrisi(Long id) {
        zakljucajRecenziju(id);
        var odgovor = odgovori.findByIdRecenzije(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Recenzija nema odgovor."));
        odgovori.delete(odgovor);
    }

    private void zakljucajRecenziju(Long id) {
        recenzije.pronadjiZaIzmjenu(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "Recenzija " + id + " ne postoji."));
    }

    private OdgovorNaRecenzijuResponse uResponse(OdgovorNaRecenziju odgovor) {
        return new OdgovorNaRecenzijuResponse(odgovor.getId(), odgovor.getIdRecenzije(),
                odgovor.getIdAdministratora(), odgovor.getTekstOdgovora(),
                odgovor.getDatumKreiranja(), odgovor.getDatumIzmjene());
    }
}
