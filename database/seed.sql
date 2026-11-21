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

COMMIT;
SET SESSION sql_safe_updates = @prethodni_safe_updates;


SELECT k.IdKategorije, k.Naziv, k.IdNadkategorije, n.Naziv AS Nadkategorija
FROM kategorija AS k
LEFT JOIN kategorija AS n ON n.IdKategorije = k.IdNadkategorije
ORDER BY COALESCE(n.Naziv, k.Naziv), k.IdNadkategorije IS NOT NULL, k.Naziv;

SELECT IdTipa, Oznaka, Naziv FROM tip_aktivnosti ORDER BY IdTipa;
