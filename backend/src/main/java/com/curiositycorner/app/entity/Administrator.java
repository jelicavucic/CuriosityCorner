package com.curiositycorner.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "administrator")
public class Administrator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAdministratora")
    private Long id;

    @Column(name = "KorisnickoIme", nullable = false, length = 100)
    private String korisnickoIme;

    @Column(name = "Ime", nullable = false, length = 150)
    private String ime;

    @Column(name = "Email", nullable = false, length = 254)
    private String email;

    @Column(name = "LozinkaHash", nullable = false, length = 255)
    private String lozinkaHash;

    protected Administrator() { }

    public Administrator(String korisnickoIme, String ime, String email, String lozinkaHash) {
        this.korisnickoIme = korisnickoIme;
        this.ime = ime;
        this.email = email;
        this.lozinkaHash = lozinkaHash;
    }

    public Long getId() { return id; }
    public String getKorisnickoIme() { return korisnickoIme; }
    public String getIme() { return ime; }
    public String getEmail() { return email; }
    public String getLozinkaHash() { return lozinkaHash; }
}
