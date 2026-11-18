package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "memorija")
public class Memorija {
    @Id
    @Column(name = "IdAktivnosti")
    private Long id;
    @Column(name = "BrojKolona", nullable = false)
    private Integer brojKolona;
    @Column(name = "VrijemeZaRjesavanje")
    private Integer vrijemeZaRjesavanje;

    protected Memorija() { }

    public Memorija(Long id, Integer brojKolona, Integer vrijemeZaRjesavanje) {
        this.id = id;
        this.brojKolona = brojKolona;
        this.vrijemeZaRjesavanje = vrijemeZaRjesavanje;
    }

    public Long getId() { return id; }
    public Integer getBrojKolona() { return brojKolona; }
    public Integer getVrijemeZaRjesavanje() { return vrijemeZaRjesavanje; }
}
