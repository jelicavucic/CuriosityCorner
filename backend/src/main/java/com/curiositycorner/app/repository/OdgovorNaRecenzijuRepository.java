package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.OdgovorNaRecenziju;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OdgovorNaRecenzijuRepository extends JpaRepository<OdgovorNaRecenziju, Long> {
    Optional<OdgovorNaRecenziju> findByIdRecenzije(Long idRecenzije);
}
