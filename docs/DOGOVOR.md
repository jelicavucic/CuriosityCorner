# Podjela rada i API primjeri

Prijedlog podjele rada za pet osoba. Imena i rokove dopisujemo zajedno.
Implementirane rute su u [README-u](../README.md).

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
| Fajlovi | POST `/admin/fajlovi` za sliku/audio; GET `/fajlovi/{id}` za dohvat |
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

Za razvrstavanje svaka grupa ima naziv i najmanje jednu stavku. Isti sadržaj
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
| `osmosmjerka` | `{"brojRedova":3,"brojKolona":3,"mreza":[["P","A","S"],["M","A","Š"],["K","O","S"]],"rijeci":[{"rijec":"PAS","pocetniRed":0,"pocetnaKolona":0,"krajnjiRed":2,"krajnjaKolona":2}]}` |
| `bajka` | `{"naslov":"Mali medo","tekst":"Jednom davno…","putanjaAudioZapisa":null,"putanjaNaslovneSlike":null}` |

Koordinate osmosmjerke počinju od nule. Riječi mogu ići vodoravno, uspravno ili
dijagonalno u oba smjera. Jedno polje može sadržati slovo ili dvoslov LJ, NJ ili DŽ.
PUT zamjenjuje mrežu i riječi u istoj transakciji. Nakon prvog pokušaja vraća 409.

## API za igranje

Osoba zadužena za igru implementira sljedeće rute. `{id}` je ID pokušaja aktivnosti.

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

1. Osposobiti kategorije s bazom, zatim dodati igre, nivoe, aktivnosti i sadržaj.
2. Potvrditi JSON primjere, pa napraviti CRUD i jednostavne admin formulare.
3. Podijeliti imena i rokove; svaka osoba demonstrira jedan kompletan tok.

Prije implementacije dopuniti bazu: veza igrača i avatara, jedinstveni ključevi
za ponovljene zahtjeve i trajno stanje memorije. Detalje uskladiti s nositeljicom modula.
