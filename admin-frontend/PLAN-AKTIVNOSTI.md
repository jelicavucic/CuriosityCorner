# CuriosityCorner — plan za upravljanje aktivnostima

## Gdje smo stali

- Dugme **Dodaj aktivnost** u detaljima nivoa otvara kartice za sedam tipova. Tipovi se učitavaju iz API-ja, a kartice imaju naziv, ikonu i opis.
- Nakon izbora prikazuju se zajednička polja. Povratak na izbor tipa čuva unose, a zatvaranje s izmjenama traži potvrdu.
- Zajednička polja su u `src/osnovni-podaci-aktivnosti.tsx`. Redni broj se predlaže automatski i provjerava na nivou. Pri uređivanju se zadržava postojeći tip. Težine su `LAKO`, `SREDNJE` i `TESKO`.
- Trenutni dijalog može čuvati osnovni zapis aktivnosti. Forme i transakcijsko čuvanje podataka pojedinačnih tipova slijede. Frontend build prolazi, a tok u prijavljenom pregledniku još treba provjeriti.
- Korisnica želi da Codex piše kod i objašnjava izmjene korak po korak.

## Sutra prvo — Pitanje

1. Provjeriti DTO-e i pravila u `PitanjeService`. Oblik forme obuhvata sadržaj pitanja, najmanje dva ponuđena odgovora, redoslijed odgovora, tačno jedan tačan odgovor i opcionalno objašnjenje. Za tačnost koristiti radio dugmad.
2. Ponovno koristiti `IzaberiSadrzaj` iz `src/sadrzaji.tsx` i `FormaSadrzaja` iz `src/forma-sadrzaja.tsx`. Novi sadržaj treba automatski postaviti u polje iz kojeg je pokrenuto kreiranje, uz očuvanje ostalih unosa.
3. Napraviti pregled pitanja i omogućiti učitavanje postojeće konfiguracije pri uređivanju. U trenutnom mobilnom kodu nema odgovarajućeg ekrana za poređenje, pa pregled uskladiti s prototipom i stvarnim backend podacima.
4. Zajednički zapis i konfiguraciju sačuvati u jednoj backend transakciji. Trenutno su upisi razdvojeni između `/api/aktivnosti` i `/api/admin/aktivnosti/{id}/pitanje`. Ponovno koristiti postojeće servise i validaciju. Pri grešci očuvati obrazac i provjeriti rollback.

## Redoslijed poslije Pitanja

1. **Spajanje** — lijevi i desni sadržaj iz biblioteke, uređivanje i redoslijed parova, nasumičan raspored i pregled.
2. **Memorija** — parovi, pregled mreže, 2–10 kolona i opcionalno vrijeme u sekundama. Trenutni API od jednog sadržaja sa slikom pravi dvije kartice. Za dva različita sadržaja proširiti backend ugovor uz kompatibilnost sa starim zapisima. Šema već povezuje kartice preko `BrojPara`.
3. **Slaganje slova** — ciljni tekst, opcionalna slika kroz postojeći upload i pregled ponuđenih slova uz očuvanje ponovljenih slova.
4. **Razvrstavanje** — imenovane grupe, stavke iz biblioteke, odabir tačne grupe i potvrda ili premještanje stavki prije brisanja grupe.
5. **Osmosmjerka** — dimenzije, riječi, generisanje i pregled mreže u osam smjerova. Pratiti postojeći JSON format i koordinate od nule. Potvrditi prije regenerisanja.
6. **Bajka** — naslov, tekst, opcionalna naslovna slika i audio, čitanje i preslušavanje u pregledu. Za audio je potrebna backend podrška za upload.
7. **Lista aktivnosti** — pregled, uređivanje, brisanje s potvrdom, promjena redoslijeda, naslov ili umanjena slika gdje je dostupna i akcija **Dodaj prvu aktivnost** u praznom stanju.

## Pravila i završna provjera

- Zadržati postojeći dizajn admin panela, API obrasce i strukturu baze. Igrice u nacrtu ostaju u nacrtu.
- Pri brisanju i izmjeni konfiguracije poštovati zaštitu postojećih pokušaja igranja i vezanih zapisa.
- Zadržati odabrani nivo nakon čuvanja, osvježiti aktivnosti i broj aktivnosti te prikazati uspjeh ili konkretnu grešku.
- Provjeriti frontend build, odgovarajuće backend testove i cijeli tok u pregledniku s pravim backendom. Posebno provjeriti rollback, uređivanje starijih zapisa, odustajanje, tastaturu i validaciju.
