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

Za postojeću bazu pokrenuti samo cijeli `database/seed.sql`. Fajl usklađuje stare potkategorije Matematike i zadržava postojeće igrice i nivoe. U MySQL Workbenchu uključiti **Query → Stop Script Execution On Errors** prije pokretanja. Ako skript prijavi grešku, izvršiti `ROLLBACK;` u istoj konekciji i prekinuti pokušaj.


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
| GET | `/api/aktivnosti/{id}/spajanje` |
| POST | `/api/aktivnosti/{id}/spajanje/provjera` |
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
| POST | `/api/admin/aktivnosti/spajanja` |
| PUT | `/api/admin/aktivnosti/spajanja/{id}` |
| GET | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| PUT | `/api/admin/aktivnosti/{id}/razvrstavanje` |
| GET | `/api/admin/aktivnosti/{id}/pitanje` |
| PUT | `/api/admin/aktivnosti/{id}/pitanje` |
| POST | `/api/admin/aktivnosti/pitanja` |
| PUT | `/api/admin/aktivnosti/pitanja/{id}` |
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

Administratorske rute `/api/admin/aktivnosti/spajanja` i `/api/admin/aktivnosti/pitanja` služe za dodavanje i uređivanje. Osnovni podaci aktivnosti, konfiguracija i direktno uneseni tekst čuvaju se u jednoj transakciji.

Za igre sa statusom `AKTIVNA`, mobilna aplikacija poziva `GET /api/aktivnosti/{id}/spajanje` pri otvaranju aktivnosti. Odgovor sadrži liste ID-eva `lijevo` i `desno`. Za provjeru odabranog para šalje `idLijevogSadrzaja` i `idDesnogSadrzaja` na `POST /api/aktivnosti/{id}/spajanje/provjera` i dobija polje `tacan`. Provjera trenutno ne bilježi pokušaje ni bodove. [Primjeri za mobilnu aplikaciju](docs/MOBILNA-API.md#spajanje)

## Podjela rada

[Zaduženja za pet osoba i API primjeri](docs/DOGOVOR.md)

## Autori

- Stanislava Duvnjak
- Jelica Vučić
- Milica Moravac
- Milica Travar
- Tamara Pekez
