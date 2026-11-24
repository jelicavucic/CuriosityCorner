# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Podjela rada i API primjeri

Prijedlog podjele rada za pet osoba. Imena i rokove dopisujemo zajedno.
Implementirane rute su u [README-u](../README.md).

## Šta radi i od koga zavisi naredni korak

| Ko | Može početi odmah | Za integraciju treba |
| --- | --- | --- |
| Jelica | Admin unos svih sedam tipova aktivnosti već postoji, a u lokalnoj bazi je unesen po jedan primjer svakog tipa. Dovršiti dodavanje i uređivanje avatara te pisanje, izmjenu i brisanje admin odgovora kroz panel. Ekrani za pregled zapisa već su povezani. | Za probu cijelog toka recenzija treba primjer iz baze ili korisnički unos od Osobe 2. Admin ekran se može razvijati uz postojeći admin API. |
| Osoba 2 | Napraviti mobilne ekrane za pitanje, spajanje i razvrstavanje te korisnički ekran za recenzije. Spajanje i razvrstavanje već imaju javni dohvat i provjeru poteza. | Za čuvanje pokušaja i bodova treba ugovor Osobe 5. Za upis korisničkih recenzija treba njena prijava i identitet korisnika. |
| Osoba 3 | Povezati izbor kategorije, igrice i nivoa. Napraviti ekrane za memoriju i osmosmjerku. Memorija već ima javni dohvat. Za osmosmjerku se ekran može razvijati s probnom mrežom. | Za poteze memorije i osmosmjerke koji čuvaju stanje treba ugovor Osobe 5. Osoba 3 definiše koje podatke ekrani dobijaju i šalju. |
| Osoba 4 | Napraviti mobilne ekrane za slaganje slova i čitanje ili slušanje bajke s probnim podacima. Dogovoriti javne podatke za igranje. | Za upis napretka i završetka treba ugovor Osobe 5. |
| Osoba 5 | Korisnička prijava, vlasništvo nad dječijim profilom, izbor avatara i zajednički servis pokušaja i napretka. Prvo podijeliti putanje, primjere JSON-a i način identifikacije korisnika i pokušaja s Osobama 2, 3 i 4. | Za provjeru ugovora povezati jedan kompletan tok s osobom koja radi tu igru, pa isti obrazac primijeniti na ostale. |

Na Osobu 5 se čeka za integraciju prijave, profila i trajnog čuvanja pokušaja. Ekrani, navigacija, priprema test podataka i provjera postojećih javnih ruta mogu ići paralelno. Detalji prikaza su u [uputstvu za mobilni tim](MOBILNA-API.md), uključujući obojene pločice osmosmjerke i bajku koja se lista kao slikovnica.

### Rad na zajedničkoj bazi i API-ju

- Za novu ili postojeću lokalnu bazu pokrenite [schema.sql](../database/schema.sql) pa [seed.sql](../database/seed.sql). Šema uključuje usklađivanje postojećih tabela za avatare, razvrstavanje i recenzije. Lokalno usklađivanje važi samo za bazu na kojoj je pokrenuto.
- Ako zadatak traži novu kolonu ili vezu, osoba koja radi taj dio priprema migraciju i usklađuje `schema.sql` s Jelicom. Dogovorite primjenu prije testiranja na zajedničkoj bazi.
- Mobilni dio koristi javne rute za igranje. Admin rute mogu sadržati rješenja. Postojeće javne provjere spajanja i razvrstavanja ne upisuju pokušaje ni bodove.
- Za postojeće javne rute koristite konfigurisanu igricu sa statusom `AKTIVNA` u testnoj bazi. Za nove rute prije spajanja provjerite tačan i pogrešan potez, ponavljanje istog `idZahtjeva` i nastavak nakon ponovnog otvaranja ekrana ako se stanje čuva.

## Podjela rada

| Osoba | Zaduženje |
| --- | --- |
| Jelica | Zajednička osnova backenda; CRUD kategorija, igara, nivoa, aktivnosti, sadržaja i avatara; unos posebnih podataka zadataka; prijava administratora i jednostavan admin GUI. |
| Osoba 2 | Pitanja, spajanje i razvrstavanje: mobilni ekrani, API za odgovore/poteze, provjera i čuvanje rezultata. |
| Osoba 3 | Memorija i osmosmjerka: mobilni ekrani, API za poteze, provjera i čuvanje rezultata. |
| Osoba 4 | Slaganje slova i bajke: mobilni ekrani, API za igranje i čuvanje rezultata. |
| Osoba 5 | Korisnička prijava i profili djece; zajednički servis pokušaja i napretka. |

Za svaku igru odgovorna osoba radi i bodovanje, povezivanje s API-jem i testove.
Sve igre koriste isti servis pokušaja koji priprema osoba 5.
Osoba 2 dodatno radi korisničke recenzije, a Jelica admin odgovor.
Osoba 3 dodatno povezuje mobilni izbor kategorija, igara i nivoa.
Ovo je početna podjela: poslije prve funkcionalne igre provjeravamo obim i
preraspoređujemo zadatke ako je neko preopterećen.

## Zajednički API

Sve putanje počinju sa `/api`. GET čita, POST dodaje, PUT mijenja cijeli zapis,
PATCH mijenja dio zapisa, DELETE briše. Operacije unosa sadržaja su za admina.

| Resurs | Planirane rute |
| --- | --- |
| Kategorije, igre, nivoi, aktivnosti, sadržaj, avatari | GET i POST `/{resurs}`; GET, PUT i DELETE `/{resurs}/{id}` |
| Nazivi resursa | `kategorije`, `igrice`, `nivoi`, `aktivnosti`, `sadrzaji`, `avatari` |
| Tipovi aktivnosti | GET `/tipovi-aktivnosti` |
| Prijava administratora | GET `/admin/auth/csrf`, POST `/admin/auth/login`, POST `/admin/auth/logout`, GET `/admin/auth/me` |
| Korisnički nalog | POST `/auth/register`, POST `/auth/login`, POST `/auth/logout`, GET `/auth/me` |
| Profili djece | GET i POST `/igraci`; GET, PUT i DELETE `/igraci/{id}` |
| Izbor avatara | PATCH `/igraci/{id}/avatar` |
| Fajlovi | POST `/admin/fajlovi` za sliku; POST `/admin/fajlovi/audio` za WAV; GET `/fajlovi/{naziv}` za dohvat |
| Početak nivoa | POST `/pokusaji-igre` |
| Početak aktivnosti | POST `/pokusaji-igre/{id}/pokusaji-aktivnosti` |
| Stanje pokušaja | GET `/pokusaji-igre/{id}`, GET `/pokusaji-aktivnosti/{id}` |
| Kraj ili prekid nivoa | POST `/pokusaji-igre/{id}/zavrsetak`, POST `/pokusaji-igre/{id}/prekid` |
| Napredak i historija | GET `/igraci/{id}/napredak`, GET `/igraci/{id}/pokusaji-igre` |
| Recenzije | GET i POST `/igrice/{id}/recenzije`; PUT i DELETE `/recenzije/{id}` |
| Admin recenzije | GET `/admin/recenzije`; PUT i DELETE `/admin/recenzije/{id}/odgovor` |

Primjer POST `/api/aktivnosti`:

```json
{
  "idNivoa": 1,
  "idTipa": 1,
  "redniBroj": 1,
  "uputstvo": "Izaberi tačan odgovor.",
  "tezina": "LAKO",
  "brojBodova": 10
}
```

ID-evi su primjeri: koriste se stvarni ID-evi iz baze.

### Avatari na profilima djece

- Tri slike već pripremljene u mobilnoj aplikaciji unose se kao početni avatari. Jelica u admin panelu upravlja listom avatara.
- Mobilni dio zadržava postojeći ekran za izbor. Učitava `GET /api/avatari?aktivan=true` i koristi `putanjaSlike` za prikaz slike.
- Kad profil ima ID iz baze, mobilni dio šalje `PATCH /api/igraci/{id}/avatar` s tijelom `{"idAvatara": 2}`. Backend provjerava da je profil dostupan prijavljenom korisniku i da je odabrani avatar aktivan. Izbor sprema u postojeće polje `igrac.idAvatara`.
- API za profil treba vratiti `idAvatara` kako bi aplikacija prikazala isti avatar pri sljedećem otvaranju profila. Spremanje izbora dogovara se s osobom zaduženom za korisničke profile.

## Admin unos po tipu aktivnosti

Za svaku konfiguraciju koristimo GET i PUT
`/api/admin/aktivnosti/{id}/{tip}`. PUT šalje cijelu konfiguraciju.
Tekstovi i slike prvo se unose kao `sadrzaji`, pa se ovdje šalju njihovi ID-evi.
Ovo su admin podaci: mobilni API ne smije otkrivati rješenja.

Za memoriju se šalje jedan sadržaj po paru. Backend od njega pravi dvije kartice
s istom slikom. Dok memorija koristi sadržaj, promjena ili uklanjanje njegove
slike kroz API za sadržaje vraća 409. Prije prvog pokušaja admin može odabrati
novi sadržaj u konfiguraciji memorije. Nakon prvog pokušaja za izmjene se pravi
nova aktivnost.

Za spajanje admin GET vraća konfiguraciju po rednom broju para. GET
`/api/admin/aktivnosti/{id}/spajanje/pregled` vraća dvije liste ID-eva sadržaja.
Kad je uključen nasumičan raspored, pregled promiješa desnu listu pri svakom
dohvatu. Sačuvani parovi i njihov redoslijed ostaju isti.

Za razvrstavanje svaka grupa ima naziv, opcionalnu oznaku `idSadrzaja` i najmanje jednu stavku. Isti sadržaj
može se koristiti jednom po aktivnosti. PUT prije prvog pokušaja zamjenjuje
grupe i stavke u jednoj transakciji. GET vraća ID-eve grupa, stavki i sadržaja.
Nakon prvog pokušaja PUT vraća 409.

| Tip u putanji | Primjer tijela PUT zahtjeva |
| --- | --- |
| `pitanje` | `{"idSadrzaja":1,"objasnjenje":"Pas je životinja.","odgovori":[{"idSadrzaja":2,"redniBroj":1,"jeTacan":true},{"idSadrzaja":3,"redniBroj":2,"jeTacan":false}]}` |
| `memorija` | `{"brojKolona":2,"vrijemeZaRjesavanje":60,"idSadrzajaParova":[2,3]}` |
| `spajanje` | `{"nasumicanRaspored":true,"parovi":[{"redniBroj":1,"idLijevogSadrzaja":2,"idDesnogSadrzaja":3}]}` |
| `razvrstavanje` | `{"grupe":[{"naziv":"Voće","stavke":[{"idSadrzaja":2}]},{"naziv":"Povrće","stavke":[{"idSadrzaja":3}]}]}` |
| `slaganje-slova` | `{"ciljniTekst":"PAS","putanjaSlike":"/api/fajlovi/1"}` |
| `osmosmjerka` | `{"brojRedova":3,"brojKolona":3,"mreza":[["P","A","S"],["M","A","Š"],["K","O","S"]],"rijeci":[{"rijec":"PAS","pocetniRed":0,"pocetnaKolona":0,"krajnjiRed":0,"krajnjaKolona":2}]}` |
| `bajka` | `{"naslov":"Mali medo","tekst":"Jednom davno…","putanjaAudioZapisa":null,"putanjaNaslovneSlike":null}` |

Koordinate osmosmjerke počinju od nule. Riječi mogu ići vodoravno, uspravno ili
dijagonalno u oba smjera. Jedno polje može sadržati slovo ili dvoslov LJ, NJ ili DŽ.
PUT zamjenjuje mrežu i riječi u istoj transakciji. Nakon prvog pokušaja vraća 409.

## API za igranje

Sljedeće rute su plan za igranje s trajnim pokušajima. Osoba zadužena za igru ih povezuje sa zajedničkim servisom Osobe 5. `{id}` je ID pokušaja aktivnosti, dok postojeće javne rute pod `/api/aktivnosti/{id}/…` koriste ID same aktivnosti.

| Metoda i završetak putanje `/api/pokusaji-aktivnosti/{id}/…` | Primjer podataka koje šalje mobilna aplikacija |
| --- | --- |
| POST `odgovori` | `{"idZahtjeva":"jedinstveni-uuid","idIzabranogOdgovora":2}` |
| POST `otkrivanja` (memorija) | `{"idZahtjeva":"jedinstveni-uuid","idKartice":1}` |
| POST `potezi-memorije` | `{"idZahtjeva":"jedinstveni-uuid","idPrveKartice":1,"idDrugeKartice":2}` |
| POST `spajanja` | `{"idZahtjeva":"jedinstveni-uuid","idLijevogPara":1,"idIzabranogDesnogPara":2}` |
| POST `razvrstavanja` | `{"idZahtjeva":"jedinstveni-uuid","idStavke":1,"idIzabraneGrupe":2}` |
| POST `slova` | `{"idZahtjeva":"jedinstveni-uuid","pozicija":0,"izabraniZnak":"P"}` |
| POST `pronadjene-rijeci` | `{"idZahtjeva":"jedinstveni-uuid","izabraniPocetniRed":0,"izabranaPocetnaKolona":0,"izabraniKrajnjiRed":0,"izabranaKrajnjaKolona":2}` |
| PUT `pregled-bajke` | `{"posljednjaPozicijaSekunde":30}` |
| POST `zavrsetak-bajke` | `{"idZahtjeva":"jedinstveni-uuid"}` |

Server provjerava vlasnika profila, pripadnost aktivnosti i poteza, određuje bodove
i čuva rezultat. Ponovljen idZahtjeva ne smije ponovo dodijeliti bodove.
Mobilni DTO-i i detaljni odgovori ovih ruta dogovaraju se prije rada na ekranima.

## Prvo sljedeće

1. Dopisati imena uz Osobe 2–5 i potvrditi ko demonstrira prvi tok s trajnim pokušajem.
2. Osoba 5 podijeli ugovor za prijavu, profil, početak pokušaja i čuvanje rezultata. U međuvremenu ostali mogu raditi na ekranima i postojećim javnim rutama.
3. Jelica dovršava upravljanje avatarima i odgovorima na recenzije, a za punjenje baze tim koristi potvrđene konfiguracije i stvarne ID-eve sadržaja.
4. Nakon prve integracije svaka osoba demonstrira jedan kompletan tok svog modula.

Prije implementacije provjeriti da postojeća baza ima vezu igrača i avatara te dopuniti jedinstvene ključeve
za ponovljene zahtjeve i trajno stanje memorije. Detalje uskladiti s nositeljicom modula.
