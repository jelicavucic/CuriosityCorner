-- Local test fixture. Run after schema.sql and seed.sql.
SET NAMES utf8mb4;
USE curiosity_corner;

DROP PROCEDURE IF EXISTS seed_test_aktivnosti_curiosity_corner;
DELIMITER $$
CREATE PROCEDURE seed_test_aktivnosti_curiosity_corner()
fixture: BEGIN
    DECLARE kategorija_id, igrica_id, nivo_1, nivo_2, nivo_3 BIGINT UNSIGNED;
    DECLARE pitanje_id, memorija_id, spajanje_id, razvrstavanje_id BIGINT UNSIGNED;
    DECLARE slova_id, osmosmjerka_id, bajka_id BIGINT UNSIGNED;
    DECLARE domace_id, divlje_id BIGINT UNSIGNED;
    DECLARE tekst_pitanja, pas, vuk, macka, sova, lavez, huk, kartica_logo, kartica_ikona INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT MIN(k.IdKategorije) INTO kategorija_id
    FROM kategorija k
    JOIN kategorija roditelj ON roditelj.IdKategorije = k.IdNadkategorije
    WHERE k.Naziv = 'Životinje' AND roditelj.Naziv = 'Svijet oko nas'
      AND roditelj.IdNadkategorije IS NULL;

    IF kategorija_id IS NULL OR (
        SELECT COUNT(*) FROM tip_aktivnosti
        WHERE Oznaka IN ('pitanje', 'memorija', 'spajanje', 'razvrstavanje',
                         'slaganje-slova', 'osmosmjerka', 'bajka')
    ) <> 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Prvo izvršite database/seed.sql.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM igrica
        WHERE IdKategorije = kategorija_id AND Naziv = '[TEST] Svijet životinja'
    ) THEN
        ROLLBACK;
        LEAVE fixture;
    END IF;

    INSERT INTO igrica (IdKategorije, Naziv, Opis, Status, MinimalniUzrast, MaksimalniUzrast)
    VALUES (kategorija_id, '[TEST] Svijet životinja', 'Probna igrica sa svih sedam tipova aktivnosti.', 'NACRT', 5, 10);
    SET igrica_id = LAST_INSERT_ID();

    INSERT INTO nivo (IdIgrice, RedniBroj, Naziv, BodoviZaOtkljucavanje)
    VALUES (igrica_id, 1, 'Upoznaj životinje', 0);
    SET nivo_1 = LAST_INSERT_ID();
    INSERT INTO nivo (IdIgrice, RedniBroj, Naziv, BodoviZaOtkljucavanje)
    VALUES (igrica_id, 2, 'Poveži i razvrstaj', 10);
    SET nivo_2 = LAST_INSERT_ID();
    INSERT INTO nivo (IdIgrice, RedniBroj, Naziv, BodoviZaOtkljucavanje)
    VALUES (igrica_id, 3, 'Riječi i priče', 25);
    SET nivo_3 = LAST_INSERT_ID();

    INSERT INTO aktivnost (IdNivoa, IdTipa, RedniBroj, Uputstvo, Tezina, BrojBodova)
    SELECT podaci.nivo_id, tip.IdTipa, podaci.redni_broj, podaci.uputstvo, podaci.tezina, podaci.bodovi
    FROM (
        SELECT nivo_1 AS nivo_id, 'pitanje' AS oznaka, 1 AS redni_broj,
               'Odaberi tačan odgovor.' AS uputstvo, 'LAKO' AS tezina, 10 AS bodovi
        UNION ALL SELECT nivo_1, 'memorija', 2, 'Pronađi dva para kartica.', 'LAKO', 10
        UNION ALL SELECT nivo_2, 'spajanje', 1, 'Spoji životinju i njen zvuk.', 'SREDNJE', 15
        UNION ALL SELECT nivo_2, 'razvrstavanje', 2, 'Razvrstaj domaće i divlje životinje.', 'SREDNJE', 15
        UNION ALL SELECT nivo_3, 'slaganje-slova', 1, 'Složi naziv životinje od ponuđenih slova.', 'LAKO', 10
        UNION ALL SELECT nivo_3, 'osmosmjerka', 2, 'Pronađi riječi PAS i SOVA.', 'SREDNJE', 20
        UNION ALL SELECT nivo_3, 'bajka', 3, 'Pročitaj priču o sovi.', 'LAKO', 5
    ) podaci
    JOIN tip_aktivnosti tip ON tip.Oznaka = podaci.oznaka;

    SELECT IdAktivnosti INTO pitanje_id FROM aktivnost WHERE IdNivoa = nivo_1 AND RedniBroj = 1;
    SELECT IdAktivnosti INTO memorija_id FROM aktivnost WHERE IdNivoa = nivo_1 AND RedniBroj = 2;
    SELECT IdAktivnosti INTO spajanje_id FROM aktivnost WHERE IdNivoa = nivo_2 AND RedniBroj = 1;
    SELECT IdAktivnosti INTO razvrstavanje_id FROM aktivnost WHERE IdNivoa = nivo_2 AND RedniBroj = 2;
    SELECT IdAktivnosti INTO slova_id FROM aktivnost WHERE IdNivoa = nivo_3 AND RedniBroj = 1;
    SELECT IdAktivnosti INTO osmosmjerka_id FROM aktivnost WHERE IdNivoa = nivo_3 AND RedniBroj = 2;
    SELECT IdAktivnosti INTO bajka_id FROM aktivnost WHERE IdNivoa = nivo_3 AND RedniBroj = 3;

    INSERT INTO sadrzaj (Tekst) VALUES ('Koja od ovih životinja je domaća?');
    SET tekst_pitanja = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Pas');
    SET pas = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Vuk');
    SET vuk = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Mačka');
    SET macka = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Sova');
    SET sova = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Lavež');
    SET lavez = LAST_INSERT_ID();
    INSERT INTO sadrzaj (Tekst) VALUES ('Hukanje');
    SET huk = LAST_INSERT_ID();

    INSERT INTO pitanje (IdAktivnosti, Objasnjenje, idSadrzaja)
    VALUES (pitanje_id, 'Pas je domaća životinja.', tekst_pitanja);
    INSERT INTO ponudjeni_odgovor (IdAktivnosti, JeTacan, RedniBroj, idSadrzaja)
    VALUES (pitanje_id, 1, 1, pas), (pitanje_id, 0, 2, vuk), (pitanje_id, 0, 3, sova);

    -- Dvije postojeće slike služe kao različiti motivi za probne parove.
    INSERT INTO sadrzaj (PutanjaSlike, AlternativniTekst) VALUES ('/logo-mark.png', 'CuriosityCorner logo');
    SET kartica_logo = LAST_INSERT_ID();
    INSERT INTO sadrzaj (PutanjaSlike, AlternativniTekst) VALUES ('/login-user-badge.png', 'Ikonica korisnika');
    SET kartica_ikona = LAST_INSERT_ID();
    INSERT INTO memorija (IdAktivnosti, BrojKolona, VrijemeZaRjesavanje) VALUES (memorija_id, 2, 60);
    INSERT INTO kartica_memorije (IdAktivnosti, BrojPara, idSadrzaja)
    VALUES (memorija_id, 1, kartica_logo), (memorija_id, 1, kartica_logo),
           (memorija_id, 2, kartica_ikona), (memorija_id, 2, kartica_ikona);

    INSERT INTO spajanje (IdAktivnosti, NasumicanRaspored) VALUES (spajanje_id, 1);
    INSERT INTO par_za_spajanje (IdAktivnosti, RedniBroj, idLijevogSadrzaja, idDesnogSadrzaja)
    VALUES (spajanje_id, 1, pas, lavez), (spajanje_id, 2, sova, huk);

    INSERT INTO razvrstavanje (IdAktivnosti) VALUES (razvrstavanje_id);
    INSERT INTO grupa_razvrstavanja (IdAktivnosti, Naziv) VALUES (razvrstavanje_id, 'Domaće');
    SET domace_id = LAST_INSERT_ID();
    INSERT INTO grupa_razvrstavanja (IdAktivnosti, Naziv) VALUES (razvrstavanje_id, 'Divlje');
    SET divlje_id = LAST_INSERT_ID();
    INSERT INTO stavka_razvrstavanja (IdTacneGrupe, idSadrzaja)
    VALUES (domace_id, pas), (domace_id, macka), (divlje_id, vuk), (divlje_id, sova);

    INSERT INTO slaganje_slova (IdAktivnosti, CiljniTekst) VALUES (slova_id, 'SOVA');

    INSERT INTO osmosmjerka (IdAktivnosti, BrojRedova, BrojKolona, Mreza)
    VALUES (osmosmjerka_id, 4, 4, JSON_ARRAY(
        JSON_ARRAY('P', 'A', 'S', 'K'), JSON_ARRAY('R', 'M', 'O', 'L'),
        JSON_ARRAY('S', 'O', 'V', 'A'), JSON_ARRAY('T', 'I', 'B', 'U')
    ));
    INSERT INTO skrivena_rijec (IdAktivnosti, Rijec, PocetniRed, PocetnaKolona, KrajnjiRed, KrajnjaKolona)
    VALUES (osmosmjerka_id, 'PAS', 0, 0, 0, 2), (osmosmjerka_id, 'SOVA', 2, 0, 2, 3);

    INSERT INTO bajka (IdAktivnosti, Naslov, Tekst)
    VALUES (bajka_id, 'Sova i izgubljeno pero',
            'Jedne večeri sova je na stazi pronašla malo pero. Pitala je životinje čije je, a vjetar ju je odveo do gnijezda. Tamo ju je čekao ptić koji se obradovao svom peru.');

    COMMIT;
END$$
DELIMITER ;

CALL seed_test_aktivnosti_curiosity_corner();
DROP PROCEDURE seed_test_aktivnosti_curiosity_corner;

SELECT i.Naziv AS Igrica, n.RedniBroj AS Nivo, a.RedniBroj AS Aktivnost, t.Oznaka AS Tip, a.BrojBodova
FROM igrica i
JOIN nivo n ON n.IdIgrice = i.IdIgrice
JOIN aktivnost a ON a.IdNivoa = n.IdNivoa
JOIN tip_aktivnosti t ON t.IdTipa = a.IdTipa
WHERE i.Naziv = '[TEST] Svijet životinja'
ORDER BY n.RedniBroj, a.RedniBroj;
