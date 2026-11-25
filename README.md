# CuriosityCorner

## Tehnologije

- Mobilna aplikacija: React Native, Expo i TypeScript
- Backend: Java i Spring Boot
- Admin frontend: Vite
- Baza podataka: MySQL

## Uputstvo za pokretanje

Potrebni su Node.js i npm, JDK 21 i MySQL na `localhost:3306`.

### Baza podataka

U MySQL Workbenchu za novu bazu redom izvršiti:

1. `database/schema.sql`
2. `database/seed.sql`

Za postojeću lokalnu bazu pokrenuti isti redoslijed. `schema.sql` dodaje nedostajuće veze za avatare i grupe razvrstavanja te čini staro polje `recenzija.IdIgraca` opcionalnim ako postoji. `seed.sql` usklađuje potkategorije Matematike i upisuje probnu osmosmjerku, sadržaje, avatare i recenziju bez dupliranja pri ponovnom pokretanju. Slike probnih avatara dolaze uz backend.

Za prijenos postojećeg lokalnog administratora postavi sljedeće vrijednosti u istoj MySQL konekciji prije izvršavanja `seed.sql`. Vrijednosti uzmi iz svog reda u tabeli `administrator`. SQL s popunjenim vrijednostima čuvaj lokalno. Seed dodaje i probni odgovor na recenziju pod tim nalogom.

```sql
SET @cc_admin_korisnicko_ime = 'korisnicko_ime';
SET @cc_admin_ime = 'Ime administratora';
SET @cc_admin_email = 'admin@example.invalid';
SET @cc_admin_bcrypt = '<postojeći BCrypt iz LozinkaHash>';
```

Za prijenos postojećih sadržaja, avatara, recenzija i odgovora na drugi računar koristi **Server → Data Export** u MySQL Workbenchu. Izvezi razvojnu bazu `curiosity_corner` kao **Dump Structure and Data**, pa je uvezi na drugom računaru kroz **Server → Data Import**. Uz izvoz kopiraj i fajlove iz `%USERPROFILE%\.curiositycorner\fajlovi` u isti folder ispod korisničkog profila na drugom računaru. Ako je postavljen `curiositycorner.fajlovi.direktorijum`, koristi taj folder. Zadrži izvorne nazive fajlova jer ih baza koristi u URL-ovima.

U MySQL Workbenchu uključiti **Query → Stop Script Execution On Errors** prije pokretanja. Ako unos podataka prijavi grešku, izvršiti `ROLLBACK;` u istoj konekciji i prekinuti pokušaj.

### Backend

Backend pokrenuti iz glavnog foldera projekta u Windows CMD terminalu. Unijeti vlastite podatke za MySQL:

```cmd
cd backend
set "DB_USERNAME=root"
set "DB_PASSWORD=ovdje_upisati_mysql_lozinku"
mvnw.cmd spring-boot:run
```
Backend je dostupan na `http://localhost:8080`. Ako ga ponovo pokrećeš u novom CMD prozoru, ponovo postavi podatke za bazu.

### Admin frontend

Dok backend radi, otvori drugi terminal u glavnom folderu projekta:

```cmd
cd admin-frontend
npm.cmd install
npm.cmd run dev
```

`npm.cmd install` je potrebno pri prvom pokretanju ili nakon izmjene zavisnosti.
Otvori adresu koju Vite ispiše pod **Local**, obično `http://localhost:5173`.
Zaustavljanje: `Ctrl + C`.

### Mobilna aplikacija

Mobilnu aplikaciju pokrenuti u drugom terminalu iz glavnog foldera projekta:

```cmd
cd mobile
npm install
npm start
```
Za web verziju: `npm run web`. Zaustavljanje: `Ctrl + C`.

## Opcionalne postavke razvojnih alata

Foldere `.claude` i `.vscode` možeš obrisati. Pokretanje projekta ne zavisi od njih.

- `.claude` uključuje Expo plugin za Claude Code.
- `.vscode` sadrži preporučene ekstenzije i postavke za automatske ispravke, organiziranje importa i sortiranje članova pri spremanju.

Git prati oba foldera. Ako commitaš i pošalješ brisanje u zajednički repozitorij, uklonit ćeš te postavke i za ostale saradnike koji preuzmu promjenu.

## API

Osnovna adresa API-ja je `http://localhost:8080`.

### Katalog i sadržaji

| Metoda | Putanja |
| --- | --- |
| GET | `/api/kategorije` |
| GET | `/api/kategorije/{id}` |
| POST | `/api/kategorije` |
| PUT | `/api/kategorije/{id}` |
| DELETE | `/api/kategorije/{id}` |
| GET | `/api/igrice` |
| GET | `/api/igrice/{id}` |
| POST | `/api/igrice` |
| PUT | `/api/igrice/{id}` |
| DELETE | `/api/igrice/{id}` |
| GET | `/api/nivoi` |
| GET | `/api/nivoi/{id}` |
| POST | `/api/nivoi` |
| PUT | `/api/nivoi/{id}` |
| DELETE | `/api/nivoi/{id}` |
| GET | `/api/aktivnosti` |
| GET | `/api/aktivnosti/{id}` |
| POST | `/api/aktivnosti` |
| PUT | `/api/aktivnosti/{id}` |
| DELETE | `/api/aktivnosti/{id}` |
| GET | `/api/tipovi-aktivnosti` |
| GET | `/api/sadrzaji` |
| GET | `/api/sadrzaji/{id}` |
| POST | `/api/sadrzaji` |
| PUT | `/api/sadrzaji/{id}` |
| DELETE | `/api/sadrzaji/{id}` |
| GET | `/api/avatari` |
| GET | `/api/avatari/{id}` |
| POST | `/api/avatari` |
| PUT | `/api/avatari/{id}` |
| DELETE | `/api/avatari/{id}` |

`GET /api/avatari` prihvata opcionalni parametar `aktivan=true` ili `aktivan=false`.

### Igranje aktivnosti

| Metoda | Putanja |
| --- | --- |
| GET | `/api/aktivnosti/{id}/memorija` |
| GET | `/api/aktivnosti/{id}/spajanje` |
| POST | `/api/aktivnosti/{id}/spajanje/provjera` |
| GET | `/api/aktivnosti/{id}/razvrstavanje` |
| POST | `/api/aktivnosti/{id}/razvrstavanje/provjera` |

Za igre sa statusom `AKTIVNA`, mobilna aplikacija poziva `GET /api/aktivnosti/{id}/spajanje` pri otvaranju aktivnosti. Odgovor sadrži liste ID-eva `lijevo` i `desno`. Za provjeru odabranog para šalje `idLijevogSadrzaja` i `idDesnogSadrzaja` na `POST /api/aktivnosti/{id}/spajanje/provjera` i dobija polje `tacan`. Provjera trenutno ne bilježi pokušaje ni bodove. [Primjeri za mobilnu aplikaciju](docs/MOBILNA-API.md#spajanje)

### Administracija aktivnosti

| Metoda | Putanja |
| --- | --- |
| GET | `/api/admin/aktivnosti/{id}/memorija` |
| PUT | `/api/admin/aktivnosti/{id}/memorija` |
| POST | `/api/admin/aktivnosti/memorije` |
| PUT | `/api/admin/aktivnosti/memorije/{id}` |
| GET | `/api/admin/aktivnosti/{id}/spajanje` |
| GET | `/api/admin/aktivnosti/{id}/spajanje/pregled` |
| PUT | `/api/admin/aktivnosti/{id}/spajanje` |
| POST | `/api/admin/aktivnosti/spajanja` |
| PUT | `/api/admin/aktivnosti/spajanja/{id}` |
| GET | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| PUT | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| POST | `/api/admin/aktivnosti/razvrstavanja` |
| PUT | `/api/admin/aktivnosti/razvrstavanja/{id}` |
| GET | `/api/admin/aktivnosti/{id}/pitanje` |
| PUT | `/api/admin/aktivnosti/{id}/pitanje` |
| POST | `/api/admin/aktivnosti/pitanja` |
| PUT | `/api/admin/aktivnosti/pitanja/{id}` |
| GET | `/api/admin/aktivnosti/{id}/slaganje-slova` |
| PUT | `/api/admin/aktivnosti/{id}/slaganje-slova` |
| POST | `/api/admin/aktivnosti/slaganja-slova` |
| PUT | `/api/admin/aktivnosti/slaganja-slova/{id}` |
| GET | `/api/admin/aktivnosti/{id}/bajka` |
| PUT | `/api/admin/aktivnosti/{id}/bajka` |
| POST | `/api/admin/aktivnosti/bajke` |
| PUT | `/api/admin/aktivnosti/bajke/{id}` |
| GET | `/api/admin/aktivnosti/{id}/osmosmjerka` |
| PUT | `/api/admin/aktivnosti/{id}/osmosmjerka` |
| POST | `/api/admin/aktivnosti/osmosmjerke` |
| PUT | `/api/admin/aktivnosti/osmosmjerke/{id}` |

`GET /api/admin/aktivnosti/{id}/spajanje/pregled` vraća lijevu i desnu listu ID-eva sadržaja za pregled. Kad je uključen nasumičan raspored, desna lista se promiješa pri svakom pozivu.

Administratorske rute `/api/admin/aktivnosti/spajanja` i `/api/admin/aktivnosti/pitanja` služe za dodavanje i uređivanje. Osnovni podaci aktivnosti, konfiguracija i direktno uneseni tekst čuvaju se u jednoj transakciji.

### Administratorska prijava i recenzije

Rute pod `/api/admin/` i izmjene kataloga traže administratorsku sesiju. `GET /api/admin/auth/csrf` i `POST /api/admin/auth/login` dostupni su prije prijave. Za prijavu i zaštićene zahtjeve koji mijenjaju podatke potreban je CSRF token.

| Metoda | Putanja |
| --- | --- |
| GET | `/api/admin/auth/csrf` |
| POST | `/api/admin/auth/login` |
| GET | `/api/admin/auth/me` |
| POST | `/api/admin/auth/logout` |
| GET | `/api/admin/recenzije` |
| PUT | `/api/admin/recenzije/{id}/odgovor` |
| DELETE | `/api/admin/recenzije/{id}/odgovor` |

### Fajlovi

| Metoda | Putanja | Namjena |
| --- | --- | --- |
| POST | `/api/admin/fajlovi` | Slanje slike kao `multipart/form-data` u polju `slika` |
| POST | `/api/admin/fajlovi/audio` | Slanje audiozapisa kao `multipart/form-data` u polju `audio` |
| GET | `/api/fajlovi/{naziv}` | Preuzimanje fajla po nazivu |

## Podjela rada

[Zaduženja za pet osoba i API primjeri](docs/DOGOVOR.md)

## Autori

- Stanislava Duvnjak
- Jelica Vučić
- Milica Moravac
- Milica Travar
- Tamara Pekez
