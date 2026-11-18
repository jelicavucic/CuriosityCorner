package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "kartica_memorije")
public class KarticaMemorije {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdKartice")
    private Long id;
    @Column(name = "IdAktivnosti", nullable = false)
    private Long idAktivnosti;
    @Column(name = "BrojPara", nullable = false)
    private Integer brojPara;
    @Column(name = "idSadrzaja", nullable = false)
    private Integer idSadrzaja;

    protected KarticaMemorije() { }

    public KarticaMemorije(Long idAktivnosti, Integer brojPara, Integer idSadrzaja) {
        this.idAktivnosti = idAktivnosti;
        this.brojPara = brojPara;
        this.idSadrzaja = idSadrzaja;
    }

    public Long getId() { return id; }
    public Integer getBrojPara() { return brojPara; }
    public Integer getIdSadrzaja() { return idSadrzaja; }
}
