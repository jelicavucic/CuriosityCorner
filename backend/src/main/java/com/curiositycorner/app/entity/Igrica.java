package com.curiositycorner.app.entity;

import jakarta.persistence.*;
import org.springframework.resilience.annotation.EnableResilientMethods;

@Entity
@Table(name = "igrica")
public class Igrica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdIgrice")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdKategorije", nullable = false)
    private Kategorija kategorija;

    @Column(name = "Naziv", nullable = false, length = 200)
    private String naziv;

    @Column(name = "Opis", length = 2000)
    private String opis;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "Uzrast", nullable = false)
    private Integer uzrast;

    protected Igrica() {

    }

    public Igrica(Kategorija kategorija, String naziv, String opis,
                  String status, Integer uzrast) {
        this.kategorija = kategorija;
        this.naziv = naziv;
        this.opis = opis;
        this.status = status;
        this.uzrast = uzrast;
    }

    public Long getId() {
        return id;
    }

    public Kategorija getKategorija() {
        return kategorija;
    }

    public void setKategorija(Kategorija kategorija) {
        this.kategorija = kategorija;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        this.opis = opis;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getUzrast() {
        return uzrast;
    }

    public void setUzrast(Integer uzrast) {
        this.uzrast = uzrast;
    }
}
