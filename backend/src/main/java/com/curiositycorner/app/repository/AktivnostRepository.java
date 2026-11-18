package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Aktivnost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AktivnostRepository extends JpaRepository<Aktivnost, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Aktivnost a where a.id = :id")
    java.util.Optional<Aktivnost> pronadjiZaIzmjenu(@Param("id") Long id);

    @Query("""
            select count(a) > 0 from Aktivnost a
            where a.nivo.id = :idNivoa and a.redniBroj = :redniBroj
              and (:idIzuzetka is null or a.id <> :idIzuzetka)
            """)
    boolean postojiRedniBroj(@Param("idNivoa") Long idNivoa,
                            @Param("redniBroj") Integer redniBroj,
                            @Param("idIzuzetka") Long idIzuzetka);

    @Query(value = """
            SELECT (EXISTS (SELECT 1 FROM pitanje WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM memorija WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM spajanje WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM razvrstavanje WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM slaganje_slova WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM osmosmjerka WHERE IdAktivnosti = :id)
                 OR EXISTS (SELECT 1 FROM bajka WHERE IdAktivnosti = :id))
            """, nativeQuery = true)
    int imaKonfiguraciju(@Param("id") Long id);

    @Query(value = "SELECT COUNT(*) FROM pokusaj_aktivnosti WHERE IdAktivnosti = :id",
            nativeQuery = true)
    long brojPokusaja(@Param("id") Long id);

    @Modifying
    @Query("""
            delete from StavkaRazvrstavanja s
            where s.idTacneGrupe in (select g.id from GrupaRazvrstavanja g where g.idAktivnosti = :id)
            """)
    void obrisiStavkeRazvrstavanja(@Param("id") Long id);
}
