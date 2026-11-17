package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stavka_razvrstavanja")
public class StavkaRazvrstavanja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdStavke")
    private Long id;

    @Column(name = "IdTacneGrupe", nullable = false)
    private Long idTacneGrupe;

    @Column(name = "idSadrzaja", nullable = false)
    private Integer idSadrzaja;

    protected StavkaRazvrstavanja() { }

    public StavkaRazvrstavanja(Long idTacneGrupe, Integer idSadrzaja) {
        this.idTacneGrupe = idTacneGrupe;
        this.idSadrzaja = idSadrzaja;
    }

    public Long getId() { return id; }
    public Long getIdTacneGrupe() { return idTacneGrupe; }
    public Integer getIdSadrzaja() { return idSadrzaja; }
}
