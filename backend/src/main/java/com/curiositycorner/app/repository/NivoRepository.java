package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Nivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NivoRepository extends JpaRepository<Nivo, Long> {

    @Query("""
            select count(n) > 0 from Nivo n
            where n.igrica.id = :idIgrice
              and n.redniBroj = :redniBroj
              and (:idIzuzetka is null or n.id <> :idIzuzetka)
            """)
    boolean postojiRedniBroj(
            @Param("idIgrice") Long idIgrice,
            @Param("redniBroj") Integer redniBroj,
            @Param("idIzuzetka") Long idIzuzetka
    );
}
