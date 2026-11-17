package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Igrica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IgricaRepository extends JpaRepository<Igrica, Long>{

    @Query("""
            select count(i) > 0 from Igrica i
            where lower(i.naziv) = lower(:naziv)
              and i.kategorija.id = :idKategorije
              and (:idIzuzetka is null or i.id <> :idIzuzetka)
            """)
    boolean postojiIstiNaziv(
            @Param("naziv") String naziv,
            @Param("idKategorije") Long idKategorije,
            @Param("idIzuzetka") Long idIzuzetka
    );
}
