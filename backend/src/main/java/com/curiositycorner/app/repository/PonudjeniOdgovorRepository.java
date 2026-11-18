package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.PonudjeniOdgovor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PonudjeniOdgovorRepository extends JpaRepository<PonudjeniOdgovor, Long> {
    List<PonudjeniOdgovor> findByIdAktivnostiOrderByRedniBrojAsc(Long idAktivnosti);

    @Modifying
    @Query("delete from PonudjeniOdgovor o where o.idAktivnosti = :id")
    void obrisiZaAktivnost(@Param("id") Long id);
}
