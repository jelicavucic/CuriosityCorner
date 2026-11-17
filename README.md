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

## Autori

- Stanislava Duvnjak
- Jelica Vučić
- Milica Moravac
- Milica Travar
- Tamara Pekez
