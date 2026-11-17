-- Pocetni podaci prema prototipu, bez stavki "Test" i bez slika.
-- Prvo izvrsiti schema.sql, zatim cijeli ovaj fajl u MySQL Workbenchu.
-- Pokretati iz jedne sesije, bez paralelnog izvrsavanja ove skripte.
-- Postojece zapise ne mijenja niti brise. Ponovno pokretanje ne dodaje duplikate.
SET NAMES utf8mb4;
USE curiosity_corner;

START TRANSACTION;

-- Glavne kategorije imaju IdNadkategorije = NULL.
-- NOT EXISTS je potreban jer UNIQUE indeks dozvoljava vise NULL vrijednosti.
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

-- Ako vec postoje duplirane glavne kategorije, koristi onu s najmanjim ID-em.
-- ID-evi se pronalaze po nazivu; ne pretpostavlja se da je baza prazna.
INSERT INTO kategorija (IdNadkategorije, Naziv, Opis)
SELECT roditelj.IdKategorije, podaci.Naziv, NULL
FROM (
    SELECT 'Matematika' AS Nadkategorija, 'Avantura brojeva' AS Naziv
    UNION ALL SELECT 'Matematika', 'Brojčana misija'
    UNION ALL SELECT 'Matematika', 'Geometrijski svemir'
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

-- Sifarnik tipova aktivnosti. Oznake su stabilni kljucevi za aplikaciju.
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

COMMIT;

-- Pregled stvarno sacuvane hijerarhije i tipova aktivnosti.
SELECT k.IdKategorije, k.Naziv, k.IdNadkategorije, n.Naziv AS Nadkategorija
FROM kategorija AS k
LEFT JOIN kategorija AS n ON n.IdKategorije = k.IdNadkategorije
ORDER BY COALESCE(n.Naziv, k.Naziv), k.IdNadkategorije IS NOT NULL, k.Naziv;

SELECT IdTipa, Oznaka, Naziv FROM tip_aktivnosti ORDER BY IdTipa;
