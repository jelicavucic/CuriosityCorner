package com.curiositycorner.app.repository;

import com.curiositycorner.app.entity.Avatar;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvatarRepository extends JpaRepository<Avatar, Integer> {
    List<Avatar> findByAktivan(boolean aktivan, Sort sort);

    @Query("""
            select count(a) > 0 from Avatar a
            where lower(a.naziv) = lower(:naziv)
              and (:idIzuzetka is null or a.id <> :idIzuzetka)
            """)
    boolean postojiIstiNaziv(@Param("naziv") String naziv,
                            @Param("idIzuzetka") Integer idIzuzetka);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM igrac WHERE idAvatara = :id)", nativeQuery = true)
    int koristiSe(@Param("id") Integer id);
}
