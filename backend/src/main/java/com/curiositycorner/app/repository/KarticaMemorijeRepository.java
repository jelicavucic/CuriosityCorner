package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.KarticaMemorije;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface KarticaMemorijeRepository extends JpaRepository<KarticaMemorije, Long> {
    List<KarticaMemorije> findByIdAktivnostiOrderByBrojParaAscIdAsc(Long idAktivnosti);

    @Modifying
    @Query("delete from KarticaMemorije k where k.idAktivnosti = :id")
    void obrisiZaAktivnost(@Param("id") Long id);
}
