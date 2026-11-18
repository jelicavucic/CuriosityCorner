package com.curiositycorner.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bajka")
public class Bajka {
    @Id
    @Column(name = "IdAktivnosti")
    private Long idAktivnosti;

    @Column(name = "Naslov", nullable = false, length = 250)
    private String naslov;

    @Column(name = "Tekst", nullable = false, columnDefinition = "TEXT")
    private String tekst;

    @Column(name = "PutanjaAudioZapisa", length = 500)
    private String putanjaAudioZapisa;

    @Column(name = "PutanjaNaslovneSlike", length = 500)
    private String putanjaNaslovneSlike;

    protected Bajka() { }

    public Bajka(Long idAktivnosti, String naslov, String tekst,
                 String putanjaAudioZapisa, String putanjaNaslovneSlike) {
        this.idAktivnosti = idAktivnosti;
        this.naslov = naslov;
        this.tekst = tekst;
        this.putanjaAudioZapisa = putanjaAudioZapisa;
        this.putanjaNaslovneSlike = putanjaNaslovneSlike;
    }

    public Long getIdAktivnosti() { return idAktivnosti; }
    public String getNaslov() { return naslov; }
    public String getTekst() { return tekst; }
    public String getPutanjaAudioZapisa() { return putanjaAudioZapisa; }
    public String getPutanjaNaslovneSlike() { return putanjaNaslovneSlike; }
}
