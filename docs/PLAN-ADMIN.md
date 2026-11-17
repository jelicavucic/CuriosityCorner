# Plan administratorskog dijela

Procjena od 17.11.2026. Vrijeme je okvirno, za studentski projekat i jednostavan admin interfejs. Ukljucuje povezivanje i provjere; nije obecani rok.

## Trenutno stanje

- Postoje CRUD klase za kategorije, igrice i nivoe. Pokretanje i GET provjereni su kroz razgovor; izmjene i brisanje jos nisu kompletno provjereni.
- Dodati su CRUD aktivnosti i GET tipova aktivnosti. Kompajliranje, testovi i stvarni API jos nisu potvrdjeni.
- Dodati su testovi pravila aktivnosti; uspjesno izvrsavanje jos nije potvrdjeno.
- Admin prijava i admin interfejs jos nisu implementirani.

## Preostali posao i procjena sati

| Cjelina | Backend | Admin ekran i povezivanje |
| --- | --- | --- |
| Provjera postojeceg koda, baze i pocetnih tipova | 2–4 | — |
| Sadrzaji i avatari: CRUD | 2–4 | 3–5 |
| Slike i audio: upload i dohvat | 3–5 | 1–2 |
| Admin prijava, odjava, trenutni admin i zastita ruta | 4–7 | 2–3 |
| Osnovni admin raspored; kategorije, igrice, nivoi i aktivnosti | — | 7–12 |
| Pitanja, ponudjeni odgovori, oznacavanje tacnih | 2–4 | 2–3 |
| Memorija: konfiguracija, kartice i parovi | 2–4 | 2–3 |
| Spajanje: uredjivanje parova | 2–3 | 1–2 |
| Razvrstavanje: grupe i stavke | 3–4 | 2–3 |
| Slaganje slova: ciljni tekst i slika | 1–2 | 1–2 |
| Osmosmjerka: mreza, rijeci i koordinate | 3–5 | 3–5 |
| Bajka: naslov, tekst, audio i naslovna slika | 1–2 | 1–2 |
| Pregled recenzija i admin odgovor | 2–3 | 1–2 |
| Integracija, popravke, dokumentacija i demonstracioni podaci | 5–8 | — |

Zbir stavki: 58–99 sati; za planiranje zaokruziti na 60–100 sati, odnosno 12–20 termina po pet sati. Dodatno ostaviti rezervu za promjene dogovora i integraciju s timom. Jednostavni formulari i ponovno koristenje komponenti priblizavaju donjoj granici.

## Preporuceni redoslijed

1. Potvrditi aktivnosti i tipove; implementirati sadrzaje i avatare.
2. Implementirati admin autentifikaciju i zajednicki admin raspored.
3. Povezati kategorije, igrice, nivoe i aktivnosti s formularima; provjeriti kompletan CRUD.
4. Implementirati upload i jednu kompletnu vrstu zadatka, od forme do baze.
5. Nastaviti sa svim vrstama zadataka, pa recenzijama.
6. Integrisati, provjeriti greske i zavrsiti dokumentaciju.

## Pravila za posebne zadatke

- Aktivnost cuva zajednicke podatke, a posebna tabela konfiguraciju. Admin treba da ima jedan razumljiv tok unosa.
- Zajednicke i posebne podatke pri zajednickom cuvanju upisivati u jednoj transakciji.
- Tip aktivnosti mora odgovarati konfiguraciji. Baza sama ne garantuje tu uskladjenost.
- PUT konfiguracije moze kreirati ili zamijeniti konfiguraciju. Dogovoriti sta se smije mijenjati kada postoje pokusaji; ne brisati i ponovo kreirati podredjene zapise koje istorija koristi.
- Brisanje provjeriti prema stranim kljucevima; za objavljen ili koristen zadatak razmotriti deaktivaciju uz dogovor s timom.
- Tacne odgovore i rjesenja izlagati samo adminu, ne kroz javni API za igranje.
- Lozinke cuvati kao hash; provjeravati admin ovlastenja na serveru.
- Provjeriti broj kartica u paru, grupe/stavke, tekst i koordinate rijeci. Pravila bodovanja i izvrsavanja pripadaju kolegicama.
- Za osmosmjerku i slaganje slova dogovoriti sa timom tretman slova, dijakritika i LJ/NJ/DZ.

## Granica zadatka

Administrator uredjuje sadrzaj i konfiguracije. Kolegice implementiraju igranje, poteze, provjeru rjesenja i bodovanje prema podjeli rada. Format podataka i pravila izmjene konfiguracije uskladiti prije njihove integracije.
