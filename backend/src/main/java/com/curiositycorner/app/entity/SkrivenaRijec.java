package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skrivena_rijec")
public class SkrivenaRijec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdSkriveneRijeci")
    private Long id;

    @Column(name = "IdAktivnosti", nullable = false)
    private Long idAktivnosti;

    @Column(name = "Rijec", nullable = false, length = 250)
    private String rijec;

    @Column(name = "PocetniRed", nullable = false)
    private int pocetniRed;

    @Column(name = "PocetnaKolona", nullable = false)
    private int pocetnaKolona;

    @Column(name = "KrajnjiRed", nullable = false)
    private int krajnjiRed;

    @Column(name = "KrajnjaKolona", nullable = false)
    private int krajnjaKolona;

    protected SkrivenaRijec() { }

    public SkrivenaRijec(Long idAktivnosti, String rijec, int pocetniRed, int pocetnaKolona,
                        int krajnjiRed, int krajnjaKolona) {
        this.idAktivnosti = idAktivnosti;
        this.rijec = rijec;
        this.pocetniRed = pocetniRed;
        this.pocetnaKolona = pocetnaKolona;
        this.krajnjiRed = krajnjiRed;
        this.krajnjaKolona = krajnjaKolona;
    }

    public Long getId() { return id; }
    public String getRijec() { return rijec; }
    public int getPocetniRed() { return pocetniRed; }
    public int getPocetnaKolona() { return pocetnaKolona; }
    public int getKrajnjiRed() { return krajnjiRed; }
    public int getKrajnjaKolona() { return krajnjaKolona; }
}
