package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Recenzija;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RecenzijaRepository extends JpaRepository<Recenzija, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Recenzija r where r.id = :id")
    Optional<Recenzija> pronadjiZaIzmjenu(@Param("id") Long id);
}
