package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Sadrzaj;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SadrzajRepository extends JpaRepository<Sadrzaj, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Sadrzaj s where s.id in :ids order by s.id")
    List<Sadrzaj> pronadjiZaIzmjenu(@Param("ids") Collection<Integer> ids);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM kartica_memorije WHERE idSadrzaja = :id)",
            nativeQuery = true)
    int koristiSeUMemoriji(@Param("id") Integer id);

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
