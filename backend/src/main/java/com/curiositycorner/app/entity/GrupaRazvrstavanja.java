package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "grupa_razvrstavanja")
public class GrupaRazvrstavanja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdGrupe")
    private Long id;

    @Column(name = "IdAktivnosti", nullable = false)
    private Long idAktivnosti;

    @Column(name = "Naziv", nullable = false, length = 150)
    private String naziv;

    protected GrupaRazvrstavanja() { }

    public GrupaRazvrstavanja(Long idAktivnosti, String naziv) {
        this.idAktivnosti = idAktivnosti;
        this.naziv = naziv;
    }

    public Long getId() { return id; }
    public String getNaziv() { return naziv; }
}
