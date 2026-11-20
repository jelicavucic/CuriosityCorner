package com.curiositycorner.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "odgovor_na_recenziju")
public class OdgovorNaRecenziju {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdOdgovora")
    private Long id;

    @Column(name = "IdRecenzije", nullable = false)
    private Long idRecenzije;

    @Column(name = "IdAdministratora", nullable = false)
    private Long idAdministratora;

    @Column(name = "TekstOdgovora", nullable = false, length = 3000)
    private String tekstOdgovora;

    @Column(name = "DatumKreiranja", nullable = false)
    private LocalDateTime datumKreiranja;

    @Column(name = "DatumIzmjene")
    private LocalDateTime datumIzmjene;

    protected OdgovorNaRecenziju() { }

    public OdgovorNaRecenziju(Long idRecenzije, Long idAdministratora, String tekstOdgovora, LocalDateTime sada) {
        this.idRecenzije = idRecenzije;
        this.idAdministratora = idAdministratora;
        this.tekstOdgovora = tekstOdgovora;
        this.datumKreiranja = sada;
    }

    public void izmijeni(Long idAdministratora, String tekstOdgovora, LocalDateTime sada) {
        this.idAdministratora = idAdministratora;
        this.tekstOdgovora = tekstOdgovora;
        this.datumIzmjene = sada;
    }

    public Long getId() { return id; }
    public Long getIdRecenzije() { return idRecenzije; }
    public Long getIdAdministratora() { return idAdministratora; }
    public String getTekstOdgovora() { return tekstOdgovora; }
    public LocalDateTime getDatumKreiranja() { return datumKreiranja; }
    public LocalDateTime getDatumIzmjene() { return datumIzmjene; }
}
