# Kako mobilna aplikacija komunicira s backendom

Kad dijete otvori ekran kategorija, mobilna aplikacija pošalje HTTP zahtjev Spring Bootu. Spring pročita podatke iz MySQL-a i vrati JSON. Ekran od tog JSON-a napravi kartice. Kad dijete dodirne karticu, ekran koristi njen `id` da izabere podatke za sljedeći ekran.

Primjer toka: **telefon → HTTP zahtjev → Spring Boot → MySQL → JSON odgovor → prikaz na telefonu**.

## Prvi zahtjev

Pokrenite MySQL i Spring Boot prema [README-u](../README.md). Na fizičkom telefonu i računaru koristite istu lokalnu mrežu. U CMD-u na računaru pokrenite `ipconfig` i pronađite IPv4 adresu mrežnog adaptera koji koristite. U `mobile/.env.local` upišite tu adresu, na primjer:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080
```

Ponovo učitajte Expo aplikaciju nakon promjene. `localhost` na telefonu označava sam telefon. Za web na računaru na kojem je pokrenut Spring Boot adresa backenda može biti `http://localhost:8080`. Ako web konzola prijavi CORS grešku, provjerite s osobom zaduženom za backend treba li dozvoliti adresu s koje se otvara Expo web. Vrijednosti `EXPO_PUBLIC_*` ulaze u klijentski kod, zato u njih ne stavljajte lozinke i tokene. [Expo dokumentacija za varijable okruženja](https://docs.expo.dev/guides/environment-variables/)

Za početak otvorite `http://192.168.1.20:8080/api/kategorije` u pregledniku telefona, uz svoju IP adresu. Ako dobijete JSON, telefon može doći do backenda. Ako dobijete `[]`, zahtjev je prošao i lista je prazna.

```http
GET /api/kategorije
Accept: application/json
```

Primjer odgovora `200 OK`:

```json
[
  {
    "id": 3,
    "naziv": "Životinje",
    "opis": "Igre o životinjama",
    "idNadkategorije": null
  }
]
```

## Primjer u TypeScriptu

Ovaj primjer se može pozvati iz ekrana kategorija. Dok zahtjev traje, prikažite indikator učitavanja. Kad uspije, prikažite listu ili poruku da je lista prazna. Ako ne uspije, prikažite poruku i omogućite ponovni pokušaj.

```ts
type Kategorija = {
  id: number
  naziv: string
  opis: string | null
  idNadkategorije: number | null
}

async function ucitajKategorije(): Promise<Kategorija[]> {
  const adresa = process.env.EXPO_PUBLIC_API_URL
  if (!adresa) {
    throw new Error('Nedostaje adresa backenda.')
  }

  const odgovor = await fetch(`${adresa}/api/kategorije`, {
    headers: { Accept: 'application/json' },
  })

  if (!odgovor.ok) {
    throw new Error(`Učitavanje kategorija nije uspjelo (HTTP ${odgovor.status}).`)
  }

  return odgovor.json()
}
```

## Rute za izbor igre koje već rade

| Zahtjev | Šta ekran radi s odgovorom |
| --- | --- |
| `GET /api/kategorije` | Prikaže kategorije i zapamti `id` izabrane kartice. |
| `GET /api/igrice` | Prikaže igrice čiji je `idKategorije` jednak izabranom ID-u kategorije. |
| `GET /api/nivoi` | Prikaže nivoe čiji je `idIgrice` jednak izabranom ID-u igrice. |
| `GET /api/aktivnosti` | Filtrira po `idNivoa` i poreda aktivnosti po `redniBroj`. |
| `GET /api/tipovi-aktivnosti` | Poveže `aktivnost.idTipa` s tipom i prema njegovoj `oznaka` odabere ekran, npr. `pitanje` ili `osmosmjerka`. |

Ove rute trenutno vraćaju liste za filtriranje u aplikaciji. Na primjer, ako je ID kategorije `3`, iz odgovora na `GET /api/igrice` uzmite `igrice.filter(igrica => igrica.idKategorije === 3)`. U aplikaciji koristite ID dobijen iz odgovora za odabranu karticu. Slike koje su već uz ekran mogu se i dalje učitavati iz lokalnih fajlova.

## Planirani zahtjevi tokom igranja

Rute za korisničku prijavu, profile djece, pokušaje i poteze dio su [Dogovora](DOGOVOR.md). Primjeri ispod pokazuju planirani tok. Tačan JSON odgovora za igranje dogovara se s osobom koja radi zajednički servis pokušaja.

1. Kad dijete započne nivo, aplikacija pošalje `POST /api/pokusaji-igre` i sačuva ID pokušaja igre.
2. Kad započne aktivnost, pošalje `POST /api/pokusaji-igre/{id}/pokusaji-aktivnosti`. U toj putanji `{id}` je ID pokušaja igre. Za naredne poteze koristi ID novog pokušaja **aktivnosti**.
3. Za pitanje ekran prikaže tekst i ponuđene odgovore koje dobije u podacima za igranje. Kad dijete izabere odgovor, ekran pošalje ID izbora:

   ```http
   POST /api/pokusaji-aktivnosti/24/odgovori
   Content-Type: application/json

   {
     "idZahtjeva": "a273050e-4b3a-47a4-941e-825242198a2a",
     "idIzabranogOdgovora": 7
   }
   ```

   Kod `fetch` poziva za ovaj primjer koristite `method: 'POST'`, zaglavlje `Content-Type: application/json` i `body: JSON.stringify(potez)`. ID `24` označava pokušaj aktivnosti, a `7` jedan ponuđeni odgovor. Ako isti potez morate ponovo poslati zbog prekida veze, zadržite njegov `idZahtjeva` kako backend ne bi dvaput dodijelio bodove.

4. Backend provjerava potez i čuva rezultat. Ekran iz odgovora prikaže ishod. Za završetak nivoa planiran je `POST /api/pokusaji-igre/{id}/zavrsetak`.

### Spajanje

Za konfigurirano Spajanje u igrici sa statusom `AKTIVNA` već se mogu koristiti ove rute. `{id}` je ID aktivnosti.

- `GET /api/aktivnosti/{id}/spajanje` vraća dvije liste ID-jeva sadržaja, npr. `{"lijevo":[12,14],"desno":[25,21]}`. Učitaj raspored jednom pri ulasku na ekran. Desna lista se nasumično raspoređuje na serveru ako je administrator uključio tu opciju.
- Učitaj pojedinačne stavke preko `GET /api/sadrzaji/{id}` i prikaži `tekst` i/ili sliku s adrese `putanjaSlike` na backendu.
- Za potez pošalji `POST /api/aktivnosti/{id}/spajanje/provjera` sa JSON tijelom `{"idLijevogSadrzaja":12,"idDesnogSadrzaja":21}`. Odgovor je `{"tacan":true}` ili `{"tacan":false}`. Mobilni ekran pamti potvrđene spojeve dok je otvoren. Provjera para trenutno ne upisuje pokušaje ni bodove.

Za ekrane za igranje koristite podatke iz API-ja za igranje. Rute pod `/api/admin/` služe admin panelu i mogu sadržati rješenja, uključujući tačne odgovore i koordinate skrivenih riječi. Primjeri javnih GET zahtjeva iz ovog vodiča rade bez admin sesije i CSRF tokena.

## Kad zahtjev zapne

| Šta se desi | Šta prvo provjeriti |
| --- | --- |
| Nema HTTP odgovora | Spring Boot radi, IP adresa je tačna i telefon može otvoriti istu rutu u pregledniku. |
| `400` | Provjerite nazive, tipove i obavezna JSON polja. API može vratiti objašnjenje u `detail` ili greške polja u `greske`. |
| `401` ili `403` | Provjerite da li ekran koristi odgovarajuću rutu i da li ona traži prijavu ili dodatno zaglavlje. |
| `404` | Provjerite putanju, ID i da li je ruta već implementirana. |

Kad prijavljujete problem, navedite HTTP metodu, putanju, status i tijelo odgovora. Izostavite lozinke, kolačiće i tokene.
