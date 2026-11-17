package com.curiositycorner.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ponudjeni_odgovor")
public class PonudjeniOdgovor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPonudjenogOdgovora")
    private Long id;

    @Column(name = "IdAktivnosti", nullable = false)
    private Long idAktivnosti;

    @Column(name = "idSadrzaja", nullable = false)
    private Integer idSadrzaja;

    @Column(name = "RedniBroj", nullable = false)
    private Integer redniBroj;

    @Column(name = "JeTacan", nullable = false)
    private boolean tacan;

    protected PonudjeniOdgovor() { }

    public PonudjeniOdgovor(Long idAktivnosti, Integer idSadrzaja, Integer redniBroj, boolean tacan) {
        this.idAktivnosti = idAktivnosti;
        this.idSadrzaja = idSadrzaja;
        this.redniBroj = redniBroj;
        this.tacan = tacan;
    }

    public Long getId() { return id; }
    public Integer getIdSadrzaja() { return idSadrzaja; }
    public Integer getRedniBroj() { return redniBroj; }
    public boolean isTacan() { return tacan; }
}
