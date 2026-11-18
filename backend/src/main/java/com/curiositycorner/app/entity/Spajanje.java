package com.curiositycorner.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "spajanje")
public class Spajanje {
    @Id
    @Column(name = "IdAktivnosti")
    private Long id;

    @Column(name = "NasumicanRaspored", nullable = false)
    private boolean nasumicanRaspored;

    protected Spajanje() { }

    public Spajanje(Long id, boolean nasumicanRaspored) {
        this.id = id;
        this.nasumicanRaspored = nasumicanRaspored;
    }

    public boolean isNasumicanRaspored() {
        return nasumicanRaspored;
    }
}
