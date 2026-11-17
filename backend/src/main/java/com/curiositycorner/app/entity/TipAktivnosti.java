package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tip_aktivnosti")
public class TipAktivnosti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTipa")
    private Long id;

    @Column(name = "Oznaka", nullable = false, unique = true, length = 50)
    private String oznaka;

    @Column(name = "Naziv", nullable = false, unique = true, length = 150)
    private String naziv;

    protected TipAktivnosti() {
    }

    public Long getId() { return id; }
    public String getOznaka() { return oznaka; }
    public String getNaziv() { return naziv; }
}
