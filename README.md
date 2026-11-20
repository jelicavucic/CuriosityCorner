# CuriosityCorner

## Tehnologije

- Mobilna aplikacija: React Native, Expo i TypeScript
- Backend: Java i Spring Boot
- Baza podataka: MySQL

## Uputstvo za pokretanje

Potrebni su Node.js i npm, JDK 21 i MySQL na `localhost:3306`.

U MySQL Workbenchu za novu bazu redom izvršiti:
1. `database/schema.sql`
2. `database/seed.sql`


Backend pokrenuti iz glavnog foldera projekta u Windows CMD terminalu. Unijeti vlastite podatke za MySQL:
```cmd
cd backend
set "DB_USERNAME=root"
set "DB_PASSWORD=ovdje_upisati_mysql_lozinku"
mvnw.cmd spring-boot:run
```
Backend: `http://localhost:8080`. U novom CMD prozoru ponovo postaviti podatke za bazu.

Mobilnu aplikaciju pokrenuti u drugom terminalu iz glavnog foldera projekta:
```cmd
cd mobile
npm install
npm start
```
Za web verziju: `npm run web`. Zaustavljanje: `Ctrl + C`.

## Postojeća lokalna MySQL baza

Ako već imaš bazu, `git pull` ažurira fajlove projekta. Postojeće tabele
treba posebno uskladiti jer `CREATE TABLE IF NOT EXISTS` kreira samo one koje
nedostaju. Nova baza napravljena iz trenutnog `database/schema.sql` već ima
kolone navedene ispod.

U MySQL Workbenchu provjeri strukturu i broj zapisa:

```sql
SHOW COLUMNS FROM curiosity_corner.administrator;
SHOW COLUMNS FROM curiosity_corner.recenzija;
SELECT COUNT(*) AS broj_admina FROM curiosity_corner.administrator;
SELECT COUNT(*) AS broj_recenzija FROM curiosity_corner.recenzija;
```

Ako je tabela `administrator` prazna i nedostaje joj `LozinkaHash`, pokreni:

```sql
ALTER TABLE curiosity_corner.administrator
ADD COLUMN LozinkaHash VARCHAR(255) NOT NULL;
```

Ako tabela `recenzija` ima kolonu `korisnik_idKorisnika`, a nema
`idKorisnika`, preimenuj kolonu:

```sql
ALTER TABLE curiosity_corner.recenzija
RENAME COLUMN korisnik_idKorisnika TO idKorisnika;
```

Ako je `recenzija` prazna i ima samo staru vezu `IdIgraca`, za admin pregled dodaj:

```sql
ALTER TABLE curiosity_corner.recenzija
ADD COLUMN idKorisnika INT UNSIGNED NOT NULL;
```

U staroj bazi s obaveznim `IdIgraca` prije korisničkog upisa recenzija treba
uskladiti tu vezu i strani ključ prema `korisnik.idKorisnika`. Ako tabela
već ima recenzije vezane za igrače, prvo treba utvrditi koji korisnički
nalog pripada svakom igraču. Ako postoje admin nalozi bez kolone za hash,
potrebno je dogovoriti postavljanje novih lozinki za te naloge.

## API

Osnovna adresa: `http://localhost:8080`. Trenutno implementirane rute:

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
| GET | `/api/avatari?aktivan=true` |
| GET | `/api/avatari?aktivan=false` |
| GET | `/api/avatari/{id}` |
| POST | `/api/avatari` |
| PUT | `/api/avatari/{id}` |
| DELETE | `/api/avatari/{id}` |
| GET | `/api/admin/aktivnosti/{id}/memorija` |
| PUT | `/api/admin/aktivnosti/{id}/memorija` |
| GET | `/api/admin/aktivnosti/{id}/spajanje` |
| GET | `/api/admin/aktivnosti/{id}/spajanje/pregled` |
| PUT | `/api/admin/aktivnosti/{id}/spajanje` |
| GET | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| PUT | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| GET | `/api/admin/aktivnosti/{id}/pitanje` |
| PUT | `/api/admin/aktivnosti/{id}/pitanje` |
| GET | `/api/admin/aktivnosti/{id}/slaganje-slova` |
| PUT | `/api/admin/aktivnosti/{id}/slaganje-slova` |
| GET | `/api/admin/aktivnosti/{id}/bajka` |
| PUT | `/api/admin/aktivnosti/{id}/bajka` |
| GET | `/api/admin/aktivnosti/{id}/osmosmjerka` |
| PUT | `/api/admin/aktivnosti/{id}/osmosmjerka` |
| GET | `/api/admin/auth/csrf` |
| POST | `/api/admin/auth/login` |
| GET | `/api/admin/auth/me` |
| POST | `/api/admin/auth/logout` |
| GET | `/api/admin/recenzije` |
| PUT | `/api/admin/recenzije/{id}/odgovor` |
| DELETE | `/api/admin/recenzije/{id}/odgovor` |

`GET /api/admin/aktivnosti/{id}/spajanje/pregled` vraća lijevu i desnu listu ID-eva sadržaja za pregled. Kad je uključen nasumičan raspored, desna lista se promiješa pri svakom pozivu.

## Admin prijava

Za kreiranje admin naloga, u CMD-u prije pokretanja backenda postavi ove
varijable i zamijeni primjere svojim podacima. Lozinka treba imati najmanje
12 znakova i stati u 72 UTF-8 bajta.

```cmd
set "ADMIN_BOOTSTRAP_USERNAME=admin"
set "ADMIN_BOOTSTRAP_NAME=Administrator"
set "ADMIN_BOOTSTRAP_EMAIL=admin@example.com"
set "ADMIN_BOOTSTRAP_PASSWORD=upisi_svoju_lozinku"
mvnw.cmd spring-boot:run
```

Pri pokretanju se za novo korisničko ime u bazi sačuva BCrypt hash. Ako ime
već postoji, koristi se postojeća lozinka. Za sljedeće pokretanje možeš
ukloniti varijable `ADMIN_BOOTSTRAP_*` iz terminala.

1. Pozovi `GET /api/admin/auth/csrf` i sačuvaj kolačić sesije. Odgovor sadrži
   `headerName` i `token`.
2. Pozovi `POST /api/admin/auth/login` s tim zaglavljem i JSON podacima
   `{"korisnickoIme":"admin","lozinka":"tvoja_lozinka"}`.
3. Zadrži novi kolačić sesije i ponovo pozovi `GET /api/admin/auth/csrf`.
   Koristi novi token za izmjene i odjavu. `GET /api/admin/auth/me` vraća
   podatke prijavljenog admina.

Admin sesija je obavezna za čitanje konfiguracija aktivnosti i za upis,
izmjenu ili brisanje kroz postojeće CRUD rute. GET liste i pojedinačni
zapisi na osnovnim rutama dostupni su mobilnoj aplikaciji.

Admin pregled recenzija vraća ocjenu, komentar i postojeći odgovor ili
`null`. Za upis ili izmjenu odgovora pošalji
`{"tekstOdgovora":"Hvala na povratnoj informaciji!"}`. ID u putanji je ID
recenzije. PUT i DELETE traže CSRF token.

Za provjeru lokalnog backenda, nakon prijave pozovi
`GET /api/admin/recenzije` s istim kolačićem sesije. Status `200` i
odgovor `[]` očekivani su kad u bazi još nema recenzija. Bez prijave ta
ruta vraća `401`.

## Podjela rada

[Zaduženja za pet osoba i API primjeri](docs/DOGOVOR.md)

## Autori

- Stanislava Duvnjak
- Jelica Vučić
- Milica Moravac
- Milica Travar
- Tamara Pekez
