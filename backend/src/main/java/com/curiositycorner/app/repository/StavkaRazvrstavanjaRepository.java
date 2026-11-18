package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.StavkaRazvrstavanja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StavkaRazvrstavanjaRepository extends JpaRepository<StavkaRazvrstavanja, Long> {
    @Query("""
            select s from StavkaRazvrstavanja s
            where s.idTacneGrupe in (select g.id from GrupaRazvrstavanja g where g.idAktivnosti = :id)
            order by s.id
            """)
    List<StavkaRazvrstavanja> pronadjiZaAktivnost(@Param("id") Long id);
}
