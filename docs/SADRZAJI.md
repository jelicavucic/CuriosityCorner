# API za sadržaje

Implementiran je CRUD `/api/sadrzaji` nad postojećom tabelom `sadrzaj`.
Promjena SQL šeme nije potrebna. ID je MySQL INT, a u Java API-ju Integer.

| Metoda | Putanja | Odgovor |
| --- | --- | --- |
| GET | `/api/sadrzaji` | 200, lista sortirana po ID-u |
| GET | `/api/sadrzaji/{id}` | 200, sadržaj; 404 ako ne postoji |
| POST | `/api/sadrzaji` | 201, sadržaj i Location zaglavlje |
| PUT | `/api/sadrzaji/{id}` | 200, potpuno zamijenjen sadržaj |
| DELETE | `/api/sadrzaji/{id}` | 204; 409 ako se koristi; 404 ako ne postoji |

Primjer tijela POST/PUT zahtjeva:

```json
{
  "tekst": "Pas",
  "putanjaSlike": null,
  "alternativniTekst": null
}
```

Potrebni su tekst ili putanja slike, a dozvoljeno je i oboje. Alternativni tekst
sam nije dovoljan. Prazna polja i razmaci postaju null; uklanjaju se rubni razmaci.
API ograničava tekst na 10000 znakova, putanju na 500, alternativni tekst na 250.
PUT zamjenjuje sva tri polja: izostavljeno polje postaje null.

Putanja slike mora imati oblik `/api/fajlovi/ime-fajla`, gdje naziv sadrži samo
ASCII slova, brojeve, tačku, crticu i donju crtu, počinje slovom ili brojem i nema
`..`. Windows putanje i file URL-ovi se odbijaju. Ovo je dogovor za budući upload:
upload i GET `/api/fajlovi/{ime}` još nisu implementirani, a CRUD ne provjerava
postojanje fajla. Za sada testirati tekstualne sadržaje.

Brisanje se odbija ako sadržaj koristi pitanje, ponuđeni odgovor, kartica memorije,
bilo koja strana para za spajanje ili stavka razvrstavanja. Baza dodatno štiti
stranim ključevima. Izmjena zajedničkog sadržaja utiče na sva mjesta gdje se koristi;
za drugačiju varijantu napraviti novi sadržaj. DELETE ne briše fajl s diska.

Greške imaju polje `detail`, a greške dužine polja i mapu `greske`.
API još nema administratorsku autentifikaciju i namijenjen je lokalnom razvoju.
Operacije upisa moraju biti zaštićene prije objavljivanja.

Primjeri zahtjeva su u `backend/sadrzaji.http`. Za provjeru s MySQL-om pokrenuti
backend prema glavnom README-u, poslati POST, preuzeti ID iz odgovora pa izvršiti
GET, PUT i DELETE za taj ID. Poslije brisanja GET treba da vrati 404.

Iz foldera `backend` pokrenuti poslovne i validacione testove bez MySQL-a:

```cmd
mvnw.cmd -Dtest=SadrzajServiceTests,AktivnostServiceTests test
```
