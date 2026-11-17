package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Sadrzaj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SadrzajRepository extends JpaRepository<Sadrzaj, Integer> {
    @Query(value = """
            SELECT (EXISTS (SELECT 1 FROM pitanje WHERE idSadrzaja = :id)
                 OR EXISTS (SELECT 1 FROM ponudjeni_odgovor WHERE idSadrzaja = :id)
                 OR EXISTS (SELECT 1 FROM kartica_memorije WHERE idSadrzaja = :id)
                 OR EXISTS (SELECT 1 FROM par_za_spajanje
                            WHERE idLijevogSadrzaja = :id OR idDesnogSadrzaja = :id)
                 OR EXISTS (SELECT 1 FROM stavka_razvrstavanja WHERE idSadrzaja = :id))
            """, nativeQuery = true)
    int koristiSe(@Param("id") Integer id);
}
