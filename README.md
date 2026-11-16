
# CuriosityCorner 🐻

Edukativna aplikacija za djecu koja kroz igre i interaktivne
aktivnosti podstiče učenje i radoznalost.

Projekat se razvija u okviru predmeta Projektovanje softvera.

## Funkcionalnosti

- Kreiranje i izbor profila igrača
- Izbor avatara

Planirane funkcionalnosti:
- Edukativne igre i aktivnosti
- Praćenje napretka igrača

## Tehnologije

- Mobilna aplikacija: React Native, Expo i TypeScript
- Backend: Java i Spring Boot
- Baza podataka: MySQL

## Struktura projekta

- `mobile/` — mobilna aplikacija
- `backend/` — serverski dio aplikacije
- `database/` — SQL šema i model baze podataka
- `docs/` — plan rada, podjela zadataka i API dogovor

## Dogovor za tim

[Kratka podjela rada na četiri osobe i API/JSON primjeri](docs/DOGOVOR.md).

Trenutno je napisan samo API za kategorije; provjera s MySQL-om je još otvorena.
Ostale rute u planu predstavljaju dogovor za buduću implementaciju.

## Pokretanje

### Mobilna aplikacija

Iz foldera `mobile` pokrenuti:

npm install
npm start

### Backend

Potrebni su JDK 21 i pokrenut MySQL server na `localhost:3306`.
Prije prvog pokretanja izvršiti `database/schema.sql` u MySQL Workbenchu.

U Windows CMD terminalu, iz glavnog foldera projekta, pokrenuti:

```cmd
cd backend
set "DB_USERNAME=root"
set "DB_PASSWORD=ovdje_upisati_mysql_lozinku"
mvnw.cmd spring-boot:run
```

Unijeti vlastito MySQL korisničko ime i lozinku. Stvarne podatke ne upisivati
u ovaj fajl. Prvo pokretanje može potrajati zbog preuzimanja Mavena i paketa.

Varijable ostaju postavljene dok je isti CMD prozor otvoren.
Zaustavljanje: `Ctrl + C`, pa `Y` i Enter ako terminal traži potvrdu.
Za ponovno pokretanje u istom prozoru dovoljno je:

```cmd
mvnw.cmd spring-boot:run
```

U novom CMD prozoru ponovo postaviti `DB_USERNAME` i `DB_PASSWORD`.

Nakon poruke `Started AppApplication` otvoriti:
<http://localhost:8080/api/kategorije>.
Očekuje se JSON lista kategorija ili `[]` ako je tabela prazna.
Početna adresa `/` nema definisanu rutu i može vratiti 404.
Ako API vrati 500, uzrok potražiti u terminalu u kojem radi backend,
posebno u porukama `ERROR` i `Caused by`.

### Baza podataka

SQL šema nalazi se u fajlu `database/schema.sql`.
Backend koristi ovu bazu preko konfiguracije u
`backend/src/main/resources/application.properties`.

## API za kategorije

| Metoda | Putanja | Namjena |
| --- | --- | --- |
| GET | `/api/kategorije` | Sve kategorije |
| GET | `/api/kategorije/{id}` | Jedna kategorija |
| POST | `/api/kategorije` | Kreiranje kategorije |
| PUT | `/api/kategorije/{id}` | Potpuna izmjena kategorije |
| DELETE | `/api/kategorije/{id}` | Brisanje kategorije |

POST i PUT primaju JSON sa poljima `naziv`, `opis` i `idNadkategorije`.
Naziv je obavezan (najviše 150 znakova), opis je opcionalan (najviše 1000).
`idNadkategorije: null` označava glavnu kategoriju. PUT zamjenjuje sva tri polja;
izostavljen opis ili nadkategorija postaje `null`.
Dupli nazivi pod istom nadkategorijom i kružne veze nisu dozvoljeni.
Kategorija koja ima potkategorije ili igre ne može se obrisati.

Primjeri zahtjeva nalaze se u [backend/kategorije.http](backend/kategorije.http).
Uspješno kreiranje vraća 201, brisanje 204, neispravni podaci 400,
nepostojeća kategorija 404, a konflikt 409. Greške vraćaju JSON sa poljem `detail`;
greške validacije sadrže i mapu `greske`.

API trenutno nema autentifikaciju i namijenjen je lokalnom razvoju.
Prije objavljivanja potrebno je zaštititi operacije izmjene administratorskom prijavom.

Ako Hibernate traži `id_kategorije`, a baza koristi `IdKategorije`, u
`application.properties` dodati sljedeću postavku i restartovati backend:

```properties
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
```

Testovi poslovnih pravila kategorija mogu se pokrenuti iz foldera `backend`
bez MySQL konekcije:

```cmd
mvnw.cmd -Dtest=KategorijaServiceTests test
```

## Autori

- Stanislava Duvnjak
- Jelica Vučić
- Milica Moravac
- Milica Travar
- Tamara Pekez
