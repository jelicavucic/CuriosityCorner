package com.curiositycorner.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "slaganje_slova")
public class SlaganjeSlova {
    @Id
    @Column(name = "IdAktivnosti")
    private Long idAktivnosti;

    @Column(name = "CiljniTekst", nullable = false, length = 500)
    private String ciljniTekst;

    @Column(name = "PutanjaSlike", length = 500)
    private String putanjaSlike;

    protected SlaganjeSlova() { }

    public SlaganjeSlova(Long idAktivnosti, String ciljniTekst, String putanjaSlike) {
        this.idAktivnosti = idAktivnosti;
        this.ciljniTekst = ciljniTekst;
        this.putanjaSlike = putanjaSlike;
    }

    public Long getIdAktivnosti() { return idAktivnosti; }
    public String getCiljniTekst() { return ciljniTekst; }
    public String getPutanjaSlike() { return putanjaSlike; }
}
