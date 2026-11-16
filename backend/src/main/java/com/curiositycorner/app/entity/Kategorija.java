package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "kategorija")
public class Kategorija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdKategorije")
    private Long id;

    @Column(name = "Naziv", nullable = false, length = 150)
    private String naziv;

    @Column(name = "Opis", length = 1000)
    private String opis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdNadkategorije")
    private Kategorija nadkategorija;

    protected Kategorija() {
    }

    public Kategorija(String naziv, String opis, Kategorija nadkategorija) {
        this.naziv = naziv;
        this.opis = opis;
        this.nadkategorija = nadkategorija;
    }

    public Long getId() {
        return id;
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

    public Kategorija getNadkategorija() {
        return nadkategorija;
    }

    public void setNadkategorija(Kategorija nadkategorija) {
        this.nadkategorija = nadkategorija;
    }
}
