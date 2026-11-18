package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.SkrivenaRijec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkrivenaRijecRepository extends JpaRepository<SkrivenaRijec, Long> {
    List<SkrivenaRijec> findByIdAktivnostiOrderByIdAsc(Long idAktivnosti);

    @Modifying
    @Query("delete from SkrivenaRijec r where r.idAktivnosti = :id")
    void obrisiZaAktivnost(@Param("id") Long id);
}
