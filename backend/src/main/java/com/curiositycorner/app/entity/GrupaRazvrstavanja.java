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

    @Column(name = "IdSadrzaja")
    private Integer idSadrzaja;

    protected GrupaRazvrstavanja() { }

    public GrupaRazvrstavanja(Long idAktivnosti, String naziv, Integer idSadrzaja) {
        this.idAktivnosti = idAktivnosti;
        this.naziv = naziv;
        this.idSadrzaja = idSadrzaja;
    }

    public Long getId() { return id; }
    public String getNaziv() { return naziv; }
    public Integer getIdSadrzaja() { return idSadrzaja; }
}
