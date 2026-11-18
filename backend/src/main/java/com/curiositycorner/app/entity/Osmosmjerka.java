package com.curiositycorner.app.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "osmosmjerka")
public class Osmosmjerka {
    @Id
    @Column(name = "IdAktivnosti")
    private Long idAktivnosti;

    @Column(name = "BrojRedova", nullable = false)
    private int brojRedova;

    @Column(name = "BrojKolona", nullable = false)
    private int brojKolona;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "Mreza", nullable = false)
    private List<List<String>> mreza;

    protected Osmosmjerka() { }

    public Osmosmjerka(Long idAktivnosti, int brojRedova, int brojKolona, List<List<String>> mreza) {
        this.idAktivnosti = idAktivnosti;
        this.brojRedova = brojRedova;
        this.brojKolona = brojKolona;
        this.mreza = mreza;
    }

    public Long getIdAktivnosti() { return idAktivnosti; }
    public int getBrojRedova() { return brojRedova; }
    public int getBrojKolona() { return brojKolona; }
    public List<List<String>> getMreza() { return mreza; }
}
