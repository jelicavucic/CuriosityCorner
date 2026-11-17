package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "aktivnost")
public class Aktivnost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAktivnosti")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdNivoa", nullable = false)
    private Nivo nivo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "IdTipa", nullable = false)
    private TipAktivnosti tip;

    @Column(name = "RedniBroj", nullable = false)
    private Integer redniBroj;

    @Column(name = "Uputstvo", length = 1000)
    private String uputstvo;

    @Enumerated(EnumType.STRING)
    @Column(name = "Tezina", nullable = false)
    private Tezina tezina;

    @Column(name = "BrojBodova", nullable = false)
    private Integer brojBodova;

    protected Aktivnost() {
    }

    public Aktivnost(Nivo nivo, TipAktivnosti tip, Integer redniBroj,
                     String uputstvo, Tezina tezina, Integer brojBodova) {
        this.nivo = nivo;
        this.tip = tip;
        this.redniBroj = redniBroj;
        this.uputstvo = uputstvo;
        this.tezina = tezina;
        this.brojBodova = brojBodova;
    }

    public Long getId() { return id; }
    public Nivo getNivo() { return nivo; }
    public void setNivo(Nivo nivo) { this.nivo = nivo; }
    public TipAktivnosti getTip() { return tip; }
    public void setTip(TipAktivnosti tip) { this.tip = tip; }
    public Integer getRedniBroj() { return redniBroj; }
    public void setRedniBroj(Integer redniBroj) { this.redniBroj = redniBroj; }
    public String getUputstvo() { return uputstvo; }
    public void setUputstvo(String uputstvo) { this.uputstvo = uputstvo; }
    public Tezina getTezina() { return tezina; }
    public void setTezina(Tezina tezina) { this.tezina = tezina; }
    public Integer getBrojBodova() { return brojBodova; }
    public void setBrojBodova(Integer brojBodova) { this.brojBodova = brojBodova; }
}
