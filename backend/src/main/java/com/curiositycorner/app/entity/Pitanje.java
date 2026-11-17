package com.curiositycorner.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pitanje")
public class Pitanje {
    @Id
    @Column(name = "IdAktivnosti")
    private Long idAktivnosti;

    @Column(name = "idSadrzaja", nullable = false)
    private Integer idSadrzaja;

    @Column(name = "Objasnjenje", length = 2000)
    private String objasnjenje;

    protected Pitanje() { }

    public Pitanje(Long idAktivnosti, Integer idSadrzaja, String objasnjenje) {
        this.idAktivnosti = idAktivnosti;
        this.idSadrzaja = idSadrzaja;
        this.objasnjenje = objasnjenje;
    }

    public Long getIdAktivnosti() { return idAktivnosti; }
    public Integer getIdSadrzaja() { return idSadrzaja; }
    public String getObjasnjenje() { return objasnjenje; }
}
