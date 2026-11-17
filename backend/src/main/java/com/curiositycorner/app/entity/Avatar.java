package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "avatar")
public class Avatar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idAvatara")
    private Integer id;

    @Column(name = "Naziv", nullable = false, length = 255)
    private String naziv;

    @Column(name = "PutanjaSlike", nullable = false, length = 255)
    private String putanjaSlike;

    @Column(name = "Aktivan", nullable = false)
    private boolean aktivan;

    protected Avatar() {
    }

    public Avatar(String naziv, String putanjaSlike, boolean aktivan) {
        this.naziv = naziv;
        this.putanjaSlike = putanjaSlike;
        this.aktivan = aktivan;
    }

    public Integer getId() { return id; }
    public String getNaziv() { return naziv; }
    public void setNaziv(String naziv) { this.naziv = naziv; }
    public String getPutanjaSlike() { return putanjaSlike; }
    public void setPutanjaSlike(String putanjaSlike) { this.putanjaSlike = putanjaSlike; }
    public boolean isAktivan() { return aktivan; }
    public void setAktivan(boolean aktivan) { this.aktivan = aktivan; }
}
