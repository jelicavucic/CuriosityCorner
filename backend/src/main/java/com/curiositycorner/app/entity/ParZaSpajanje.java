package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "par_za_spajanje")
public class ParZaSpajanje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPara")
    private Long id;

    @Column(name = "IdAktivnosti", nullable = false)
    private Long idAktivnosti;

    @Column(name = "RedniBroj", nullable = false)
    private Integer redniBroj;

    @Column(name = "idLijevogSadrzaja", nullable = false)
    private Integer idLijevogSadrzaja;

    @Column(name = "idDesnogSadrzaja", nullable = false)
    private Integer idDesnogSadrzaja;

    protected ParZaSpajanje() { }

    public ParZaSpajanje(Long idAktivnosti, Integer redniBroj,
                         Integer idLijevogSadrzaja, Integer idDesnogSadrzaja) {
        this.idAktivnosti = idAktivnosti;
        this.redniBroj = redniBroj;
        this.idLijevogSadrzaja = idLijevogSadrzaja;
        this.idDesnogSadrzaja = idDesnogSadrzaja;
    }

    public Long getId() { return id; }
    public Integer getRedniBroj() { return redniBroj; }
    public Integer getIdLijevogSadrzaja() { return idLijevogSadrzaja; }
    public Integer getIdDesnogSadrzaja() { return idDesnogSadrzaja; }
}
