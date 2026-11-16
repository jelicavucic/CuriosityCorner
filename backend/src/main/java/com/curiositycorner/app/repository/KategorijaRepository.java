package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Kategorija;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface KategorijaRepository
        extends JpaRepository<Kategorija, Long> {

    boolean existsByNadkategorija_Id(Long id);

    // Provjera ukljucuje i glavne kategorije, kod kojih je nadkategorija NULL.
    @Query("""
            select count(k) > 0 from Kategorija k
            where lower(k.naziv) = lower(:naziv)
              and ((:idNadkategorije is null and k.nadkategorija is null)
                   or k.nadkategorija.id = :idNadkategorije)
              and (:idIzuzetka is null or k.id <> :idIzuzetka)
            """)
    boolean postojiIstiNaziv(
            @Param("naziv") String naziv,
            @Param("idNadkategorije") Long idNadkategorije,
            @Param("idIzuzetka") Long idIzuzetka
    );
}
