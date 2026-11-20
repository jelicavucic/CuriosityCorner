package com.curiositycorner.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recenzija")
public class Recenzija {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRecenzije")
    private Long id;

    @Column(name = "IdIgrice", nullable = false)
    private Long idIgrice;

    @Column(name = "korisnik_idKorisnika", nullable = false)
    private Long idKorisnika;

    @Column(name = "Ocjena", nullable = false)
    private int ocjena;

    @Column(name = "Komentar", nullable = false, length = 3000)
    private String komentar;

    @Column(name = "DatumKreiranja", nullable = false)
    private LocalDateTime datumKreiranja;

    @Column(name = "DatumIzmjene")
    private LocalDateTime datumIzmjene;

    protected Recenzija() { }

    public Long getId() { return id; }
    public Long getIdIgrice() { return idIgrice; }
    public Long getIdKorisnika() { return idKorisnika; }
    public int getOcjena() { return ocjena; }
    public String getKomentar() { return komentar; }
    public LocalDateTime getDatumKreiranja() { return datumKreiranja; }
    public LocalDateTime getDatumIzmjene() { return datumIzmjene; }
}
