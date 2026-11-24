-- Pokrenuti cijeli fajl uz uključeno zaustavljanje izvršavanja na grešci.
SET NAMES utf8mb4;
USE curiosity_corner;

SET @prethodni_safe_updates = @@SESSION.sql_safe_updates;
SET SESSION sql_safe_updates = 0;

START TRANSACTION;


INSERT INTO kategorija (IdNadkategorije, Naziv, Opis)
SELECT NULL, podaci.Naziv, NULL
FROM (
    SELECT 'Matematika' AS Naziv
    UNION ALL SELECT 'Svijet oko nas'
    UNION ALL SELECT 'Logika'
    UNION ALL SELECT 'Bajke'
    UNION ALL SELECT 'ABC'
) AS podaci
WHERE NOT EXISTS (
    SELECT 1 FROM kategorija AS postojeca
    WHERE postojeca.IdNadkategorije IS NULL
      AND postojeca.Naziv = podaci.Naziv
);

INSERT INTO kategorija (IdNadkategorije, Naziv, Opis)
SELECT roditelj.IdKategorije, podaci.Naziv, NULL
FROM (
    SELECT 'Matematika' AS Nadkategorija, 'Brojevi i računanje' AS Naziv
    UNION ALL SELECT 'Matematika', 'Geometrija'
    UNION ALL SELECT 'Svijet oko nas', 'Životinje'
    UNION ALL SELECT 'Svijet oko nas', 'Geografija'
    UNION ALL SELECT 'Svijet oko nas', 'Priroda'
    UNION ALL SELECT 'Logika', 'Mozgalice'
    UNION ALL SELECT 'Bajke', 'Audio bajke'
    UNION ALL SELECT 'Bajke', 'Čitanje bajki'
    UNION ALL SELECT 'ABC', 'Slovo po slovo'
    UNION ALL SELECT 'ABC', 'Jezička avantura'
    UNION ALL SELECT 'ABC', 'Galaksija gramatike'
) AS podaci
JOIN (
    SELECT Naziv, MIN(IdKategorije) AS IdKategorije
    FROM kategorija
    WHERE IdNadkategorije IS NULL
    GROUP BY Naziv
) AS roditelj ON roditelj.Naziv = podaci.Nadkategorija
WHERE NOT EXISTS (
    SELECT 1 FROM kategorija AS postojeca
    WHERE postojeca.IdNadkategorije = roditelj.IdKategorije
      AND postojeca.Naziv = podaci.Naziv
);

-- Sačuvaj ID postojećih igrica kako bi nivoi i napredak ostali povezani.
UPDATE igrica AS i
JOIN kategorija AS stara ON stara.IdKategorije = i.IdKategorije
JOIN kategorija AS m ON m.IdKategorije = stara.IdNadkategorije
JOIN kategorija AS nova ON nova.IdNadkategorije = m.IdKategorije
    AND nova.Naziv = CASE
        WHEN stara.Naziv = 'Geometrijski svemir' THEN 'Geometrija'
        ELSE 'Brojevi i računanje'
    END
SET i.IdKategorije = nova.IdKategorije
WHERE m.Naziv = 'Matematika' AND m.IdNadkategorije IS NULL
  AND stara.Naziv IN ('Avantura brojeva', 'Brojčana misija', 'Geometrijski svemir');

DELETE stara FROM kategorija AS stara
JOIN kategorija AS m ON m.IdKategorije = stara.IdNadkategorije
WHERE m.Naziv = 'Matematika' AND m.IdNadkategorije IS NULL
  AND stara.Naziv IN ('Avantura brojeva', 'Brojčana misija', 'Geometrijski svemir');

INSERT INTO igrica (IdKategorije, Naziv, Status, MinimalniUzrast, MaksimalniUzrast)
SELECT k.IdKategorije, podaci.Naziv, 'NACRT', 4, 7
FROM (
    SELECT 'Brojevi i računanje' AS Potkategorija, 'Avantura brojeva' AS Naziv
    UNION ALL SELECT 'Brojevi i računanje', 'Brojčana misija'
    UNION ALL SELECT 'Geometrija', 'Geometrijski svemir'
) AS podaci
JOIN kategorija AS k ON k.Naziv = podaci.Potkategorija
JOIN kategorija AS m ON m.IdKategorije = k.IdNadkategorije
    AND m.Naziv = 'Matematika' AND m.IdNadkategorije IS NULL
WHERE NOT EXISTS (
    SELECT 1 FROM igrica AS i
    WHERE i.IdKategorije = k.IdKategorije AND i.Naziv = podaci.Naziv
);

INSERT INTO tip_aktivnosti (Oznaka, Naziv)
SELECT podaci.Oznaka, podaci.Naziv
FROM (
    SELECT 'pitanje' AS Oznaka, 'Pitanje' AS Naziv
    UNION ALL SELECT 'memorija', 'Memorija'
    UNION ALL SELECT 'spajanje', 'Spajanje'
    UNION ALL SELECT 'razvrstavanje', 'Razvrstavanje'
    UNION ALL SELECT 'slaganje-slova', 'Slaganje slova'
    UNION ALL SELECT 'osmosmjerka', 'Osmosmjerka'
    UNION ALL SELECT 'bajka', 'Bajka'
) AS podaci
WHERE NOT EXISTS (
    SELECT 1 FROM tip_aktivnosti AS postojeci
    WHERE postojeci.Oznaka = podaci.Oznaka OR postojeci.Naziv = podaci.Naziv
);

-- Primjer igrice s dva nivoa osmosmjerke

SET @cc_kategorija = (
    SELECT MIN(dijete.IdKategorije)
    FROM kategorija AS dijete
    JOIN kategorija AS roditelj ON roditelj.IdKategorije = dijete.IdNadkategorije
    WHERE dijete.Naziv = 'Životinje' AND roditelj.Naziv = 'Svijet oko nas'
      AND roditelj.IdNadkategorije IS NULL
);
SET @cc_tip = (SELECT IdTipa FROM tip_aktivnosti WHERE Oznaka = 'osmosmjerka');
SET @cc_postojeca = (
    SELECT IdIgrice FROM igrica
    WHERE IdKategorije = @cc_kategorija AND Naziv = 'Skrivene riječi – osmosmjerka'
);

INSERT INTO igrica (IdKategorije, Naziv, Opis, Status, MinimalniUzrast, MaksimalniUzrast)
SELECT @cc_kategorija, 'Skrivene riječi – osmosmjerka', 'Pronađi životinje i voće u mreži slova.', 'NACRT', 6, 9
WHERE @cc_kategorija IS NOT NULL AND @cc_tip IS NOT NULL AND @cc_postojeca IS NULL;
SET @cc_igrica = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), NULL);

-- Životinje
INSERT INTO nivo (IdIgrice, RedniBroj, Naziv, BodoviZaOtkljucavanje)
SELECT @cc_igrica, 1, 'Životinje', 0
WHERE @cc_igrica IS NOT NULL;
SET @cc_nivo = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), NULL);

INSERT INTO aktivnost (IdNivoa, IdTipa, RedniBroj, Uputstvo, Tezina, BrojBodova)
SELECT @cc_nivo, @cc_tip, 1, 'Pronađi skrivene riječi u mreži slova.', 'LAKO', 10
WHERE @cc_nivo IS NOT NULL;
SET @cc_aktivnost = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), NULL);

INSERT INTO osmosmjerka (IdAktivnosti, BrojRedova, BrojKolona, Mreza)
SELECT @cc_aktivnost, 8, 8, JSON_ARRAY(
    JSON_ARRAY('M', 'A', 'Č', 'K', 'A', 'B', 'V', 'O'),
    JSON_ARRAY('E', 'G', 'P', 'Z', 'I', 'T', 'U', 'R'),
    JSON_ARRAY('D', 'C', 'F', 'A', 'S', 'L', 'A', 'V'),
    JSON_ARRAY('V', 'U', 'R', 'K', 'S', 'Č', 'E', 'D'),
    JSON_ARRAY('J', 'O', 'N', 'V', 'I', 'S', 'L', 'A'),
    JSON_ARRAY('E', 'R', 'B', 'I', 'S', 'A', 'O', 'N'),
    JSON_ARRAY('D', 'J', 'U', 'M', 'I', 'L', 'K', 'E'),
    JSON_ARRAY('K', 'O', 'NJ', 'I', 'P', 'R', 'U', 'S')
)
WHERE @cc_aktivnost IS NOT NULL;

INSERT INTO skrivena_rijec (IdAktivnosti, Rijec, PocetniRed, PocetnaKolona, KrajnjiRed, KrajnjaKolona)
SELECT @cc_aktivnost, rijeci.Rijec, rijeci.PocetniRed, rijeci.PocetnaKolona,
       rijeci.KrajnjiRed, rijeci.KrajnjaKolona
FROM (
    SELECT 'MAČKA' AS Rijec, 0 AS PocetniRed, 0 AS PocetnaKolona, 0 AS KrajnjiRed, 4 AS KrajnjaKolona
    UNION ALL SELECT 'MEDVJED', 0, 0, 6, 0
    UNION ALL SELECT 'LAV', 2, 5, 2, 7
    UNION ALL SELECT 'KONJ', 7, 0, 7, 2
) AS rijeci
WHERE @cc_aktivnost IS NOT NULL;

-- Voće
INSERT INTO nivo (IdIgrice, RedniBroj, Naziv, BodoviZaOtkljucavanje)
SELECT @cc_igrica, 2, 'Voće', 10
WHERE @cc_igrica IS NOT NULL;
SET @cc_nivo = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), NULL);

INSERT INTO aktivnost (IdNivoa, IdTipa, RedniBroj, Uputstvo, Tezina, BrojBodova)
SELECT @cc_nivo, @cc_tip, 1, 'Pronađi skrivene riječi u mreži slova.', 'LAKO', 10
WHERE @cc_nivo IS NOT NULL;
SET @cc_aktivnost = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), NULL);

INSERT INTO osmosmjerka (IdAktivnosti, BrojRedova, BrojKolona, Mreza)
SELECT @cc_aktivnost, 6, 6, JSON_ARRAY(
    JSON_ARRAY('J', 'A', 'B', 'U', 'K', 'A'),
    JSON_ARRAY('A', 'N', 'A', 'N', 'A', 'B'),
    JSON_ARRAY('G', 'P', 'R', 'U', 'Z', 'N'),
    JSON_ARRAY('O', 'U', 'Š', 'K', 'R', 'A'),
    JSON_ARRAY('D', 'M', 'E', 'Š', 'E', 'N'),
    JSON_ARRAY('A', 'T', 'L', 'A', 'N', 'A')
)
WHERE @cc_aktivnost IS NOT NULL;

INSERT INTO skrivena_rijec (IdAktivnosti, Rijec, PocetniRed, PocetnaKolona, KrajnjiRed, KrajnjaKolona)
SELECT @cc_aktivnost, rijeci.Rijec, rijeci.PocetniRed, rijeci.PocetnaKolona,
       rijeci.KrajnjiRed, rijeci.KrajnjaKolona
FROM (
    SELECT 'JABUKA' AS Rijec, 0 AS PocetniRed, 0 AS PocetnaKolona, 0 AS KrajnjiRed, 5 AS KrajnjaKolona
    UNION ALL SELECT 'JAGODA', 0, 0, 5, 0
    UNION ALL SELECT 'BANANA', 1, 5, 1, 0
) AS rijeci
WHERE @cc_aktivnost IS NOT NULL;

SET @cc_nova_osmosmjerka = @cc_igrica;

-- Probna recenzija lokalne testne baze

SET @cc_igrica = (
    SELECT IdIgrice FROM `curiosity_corner`.`igrica`
    ORDER BY (Naziv = 'Slovna avantura') DESC, IdIgrice
    LIMIT 1
);
SET @cc_komentar = 'Djetetu se posebno svidjela igra. Voljeli bismo još zadataka na sljedećem nivou.';

-- Probni autor ima vrijednost koja nije valjan hash lozinke.
INSERT INTO `curiosity_corner`.`korisnik` (KorisnickoIme, Email, LozinkaHash, Ime, DatumKreiranja)
VALUES ('cc_test_recenzija', 'curiositycorner.recenzija@example.invalid',
        '!TESTNI_NALOG_BEZ_PRIJAVE!', 'Probni korisnik', NOW(3))
ON DUPLICATE KEY UPDATE idKorisnika = idKorisnika;

SET @cc_korisnik = (
    SELECT idKorisnika FROM `curiosity_corner`.`korisnik`
    WHERE Email = 'curiositycorner.recenzija@example.invalid'
);
SET @cc_recenzija = (
    SELECT MIN(IdRecenzije) FROM `curiosity_corner`.`recenzija`
    WHERE IdIgrice = @cc_igrica AND idKorisnika = @cc_korisnik
);

INSERT INTO curiosity_corner.recenzija (IdIgrice, Ocjena, Komentar, idKorisnika)
SELECT @cc_igrica, 5, @cc_komentar, @cc_korisnik
WHERE @cc_igrica IS NOT NULL AND @cc_korisnik IS NOT NULL AND @cc_recenzija IS NULL;

SET @cc_recenzija = (
    SELECT MIN(IdRecenzije) FROM curiosity_corner.recenzija
    WHERE IdIgrice = @cc_igrica AND idKorisnika = @cc_korisnik
);

COMMIT;
SET SESSION sql_safe_updates = @prethodni_safe_updates;


SELECT k.IdKategorije, k.Naziv, k.IdNadkategorije, n.Naziv AS Nadkategorija
FROM kategorija AS k
LEFT JOIN kategorija AS n ON n.IdKategorije = k.IdNadkategorije
ORDER BY COALESCE(n.Naziv, k.Naziv), k.IdNadkategorije IS NOT NULL, k.Naziv;

SELECT IdTipa, Oznaka, Naziv FROM tip_aktivnosti ORDER BY IdTipa;

SELECT @cc_nova_osmosmjerka AS IdNoveOsmosmjerke;

SELECT r.IdRecenzije, i.Naziv AS Igrica, r.Ocjena, r.Komentar
FROM `curiosity_corner`.`recenzija` AS r
JOIN `curiosity_corner`.`igrica` AS i ON i.IdIgrice = r.IdIgrice
WHERE r.IdRecenzije = @cc_recenzija;
