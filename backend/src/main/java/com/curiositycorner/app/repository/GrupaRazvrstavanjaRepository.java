package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.GrupaRazvrstavanja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GrupaRazvrstavanjaRepository extends JpaRepository<GrupaRazvrstavanja, Long> {
    List<GrupaRazvrstavanja> findByIdAktivnostiOrderByIdAsc(Long idAktivnosti);

    @Modifying
    @Query("delete from GrupaRazvrstavanja g where g.idAktivnosti = :id")
    void obrisiZaAktivnost(@Param("id") Long id);
}
