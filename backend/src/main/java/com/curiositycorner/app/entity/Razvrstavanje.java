package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "razvrstavanje")
public class Razvrstavanje {
    @Id
    @Column(name = "IdAktivnosti")
    private Long id;

    protected Razvrstavanje() { }

    public Razvrstavanje(Long id) {
        this.id = id;
    }
}
