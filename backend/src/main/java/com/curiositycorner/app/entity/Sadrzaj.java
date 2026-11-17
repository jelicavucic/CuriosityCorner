package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sadrzaj")
public class Sadrzaj {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idSadrzaja")
    private Integer id;

    @Column(name = "Tekst", columnDefinition = "TEXT")
    private String tekst;

    @Column(name = "PutanjaSlike", length = 500)
    private String putanjaSlike;

    @Column(name = "AlternativniTekst", length = 250)
    private String alternativniTekst;

    protected Sadrzaj() {
    }

    public Sadrzaj(String tekst, String putanjaSlike, String alternativniTekst) {
        this.tekst = tekst;
        this.putanjaSlike = putanjaSlike;
        this.alternativniTekst = alternativniTekst;
    }

    public Integer getId() { return id; }
    public String getTekst() { return tekst; }
    public void setTekst(String tekst) { this.tekst = tekst; }
    public String getPutanjaSlike() { return putanjaSlike; }
    public void setPutanjaSlike(String putanjaSlike) { this.putanjaSlike = putanjaSlike; }
    public String getAlternativniTekst() { return alternativniTekst; }
    public void setAlternativniTekst(String alternativniTekst) { this.alternativniTekst = alternativniTekst; }
}
