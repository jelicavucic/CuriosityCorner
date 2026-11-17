package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "nivo")
public class Nivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdNivoa")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdIgrice", nullable = false)
    private Igrica igrica;

    @Column(name = "RedniBroj", nullable = false)
    private Integer redniBroj;

    @Column(name = "Naziv", nullable = false, length = 150)
    private String naziv;

    @Column(name = "BodoviZaOtkljucavanje", nullable = false)
    private Integer bodoviZaOtkljucavanje;

    protected Nivo() {
    }

    public Nivo(Igrica igrica, Integer redniBroj, String naziv,
                Integer bodoviZaOtkljucavanje) {
        this.igrica = igrica;
        this.redniBroj = redniBroj;
        this.naziv = naziv;
        this.bodoviZaOtkljucavanje = bodoviZaOtkljucavanje;
    }

    public Long getId() { return id; }

    public Igrica getIgrica() { return igrica; }

    public void setIgrica(Igrica igrica) { this.igrica = igrica; }

    public Integer getRedniBroj() { return redniBroj; }

    public void setRedniBroj(Integer redniBroj) { this.redniBroj = redniBroj; }

    public String getNaziv() { return naziv; }

    public void setNaziv(String naziv) { this.naziv = naziv; }

    public Integer getBodoviZaOtkljucavanje() { return bodoviZaOtkljucavanje; }

    public void setBodoviZaOtkljucavanje(Integer bodoviZaOtkljucavanje) {
        this.bodoviZaOtkljucavanje = bodoviZaOtkljucavanje;
    }
}
