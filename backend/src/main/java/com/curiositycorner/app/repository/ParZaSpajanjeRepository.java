package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.ParZaSpajanje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParZaSpajanjeRepository extends JpaRepository<ParZaSpajanje, Long> {
    List<ParZaSpajanje> findByIdAktivnostiOrderByRedniBrojAsc(Long idAktivnosti);

    @Modifying
    @Query("delete from ParZaSpajanje p where p.idAktivnosti = :id")
    void obrisiZaAktivnost(@Param("id") Long id);
}
