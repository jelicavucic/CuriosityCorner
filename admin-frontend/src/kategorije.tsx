import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  BookOpen, Calculator, CaseSensitive, ChevronRight, Ellipsis, Folder, Globe, Headphones,
  Leaf, Map as IkonaMape, PawPrint, Pencil, Plus, Puzzle, Shapes, Sparkles, Trash2, Type,
} from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';
import type { Igrica } from './igrice';

export type Kategorija = {
  id: number;
  naziv: string;
  opis: string | null;
  idNadkategorije: number | null;
};

const izgledKategorije = new Map([
  ['matematika', { Ikona: Calculator, boja: 'zuta' }],
  ['priroda', { Ikona: Leaf, boja: 'mint' }],
  ['bajke', { Ikona: BookOpen, boja: 'lavanda' }],
  ['abc', { Ikona: CaseSensitive, boja: 'lavanda' }],
  ['svijet oko nas', { Ikona: Globe, boja: 'mint' }],
  ['logika', { Ikona: Puzzle, boja: 'zuta' }],
  ['brojevi i računanje', { Ikona: Calculator, boja: 'zuta' }],
  ['geometrija', { Ikona: Shapes, boja: 'mint' }],
  ['životinje', { Ikona: PawPrint, boja: 'zuta' }],
  ['geografija', { Ikona: IkonaMape, boja: 'lavanda' }],
  ['mozgalice', { Ikona: Puzzle, boja: 'lavanda' }],
  ['audio bajke', { Ikona: Headphones, boja: 'mint' }],
  ['čitanje bajki', { Ikona: BookOpen, boja: 'zuta' }],
  ['slovo po slovo', { Ikona: Type, boja: 'zuta' }],
  ['jezička avantura', { Ikona: CaseSensitive, boja: 'mint' }],
  ['galaksija gramatike', { Ikona: Sparkles, boja: 'lavanda' }],
]);

const bojeKartica = ['mint', 'lavanda', 'zuta'];

type AkcijaKategorije =
  | { vrsta: 'nova' }
  | { vrsta: 'uredi' | 'obrisi'; kategorija: Kategorija };

type KategorijeProps = {
  naslovPrikaza: RefObject<HTMLHeadingElement | null>;
  idOtvoreneKategorije: number;
  kategorije: Kategorija[] | null;
  igrice: Igrica[] | null;
  greskaUcitavanja: boolean;
  onSacuvana: (kategorija: Kategorija) => void;
  onObrisana: (id: number) => void;
};

export function Kategorije({
  naslovPrikaza, idOtvoreneKategorije, kategorije, igrice, greskaUcitavanja, onSacuvana, onObrisana,
}: KategorijeProps) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const okidacDijaloga = useRef<HTMLButtonElement | null>(null);
  const [meni, setMeni] = useState<number | null>(null);
  const [akcija, setAkcija] = useState<AkcijaKategorije | null>(null);
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState('');
  const [poruka, setPoruka] = useState('');

  const lista = kategorije ?? [];
  const odabrana = lista.find(
    ({ id, idNadkategorije }) => id === idOtvoreneKategorije && idNadkategorije === null,
  );
  const prikazane = lista.filter(({ idNadkategorije }) => idNadkategorije === (odabrana?.id ?? null));
  const nazivAkcije = odabrana ? 'Nova potkategorija' : 'Nova kategorija';
  const cilj = akcija && akcija.vrsta !== 'nova' ? akcija.kategorija : null;
  const nazivCilja = cilj?.idNadkategorije != null ? 'potkategoriju' : 'kategoriju';
  const naslovDijaloga = akcija?.vrsta === 'uredi' ? `Uredi ${nazivCilja}`
    : akcija?.vrsta === 'obrisi' ? `Obriši ${nazivCilja}` : nazivAkcije;

  useEffect(() => {
    if (akcija && !dijalog.current?.open) dijalog.current?.showModal();
  }, [akcija]);

  function otvoriDijalog(novaAkcija: AkcijaKategorije, okidac: HTMLButtonElement | null) {
    okidacDijaloga.current = okidac;
    setMeni(null);
    setPoruka('');
    setGreska('');
    setAkcija(novaAkcija);
  }

  function brojIgrica(idKategorije: number) {
    if (igrice === null) return '—';
    const ids = new Set([idKategorije]);
    for (const id of ids) {
      for (const kategorija of lista) {
        if (kategorija.idNadkategorije === id) ids.add(kategorija.id);
      }
    }
    return igrice.filter((igrica) => ids.has(igrica.idKategorije)).length;
  }

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje || !akcija) return;
    const podaci = new FormData(event.currentTarget);
    const naziv = String(podaci.get('naziv') ?? '').trim();
    if (akcija.vrsta !== 'obrisi' && !naziv) {
      setGreska('Unesite naziv.');
      return;
    }

    setGreska('');
    setSalje(true);
    try {
      const unos = {
        naziv,
        opis: String(podaci.get('opis') ?? '').trim() || null,
        idNadkategorije: cilj ? cilj.idNadkategorije : (odabrana?.id ?? null),
      };
      const putanja = cilj ? `/api/kategorije/${cilj.id}` : '/api/kategorije';
      const odgovor = akcija.vrsta === 'obrisi'
        ? await posaljiAdminZahtjev('DELETE', putanja)
        : await posaljiAdminZahtjev(cilj ? 'PUT' : 'POST', putanja, unos);
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (akcija.vrsta === 'obrisi' && odgovor.status === 409) {
        throw new Error('Kategoriju nije moguće obrisati dok je koriste igrice ili potkategorije.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        const greskePolja = Object.values(problem?.greske ?? {}).join(' ');
        const porukaGreske = akcija.vrsta === 'obrisi' ? 'Brisanje kategorije nije uspjelo.' : 'Čuvanje kategorije nije uspjelo.';
        throw new Error(greskePolja || problem?.detail || porukaGreske);
      }
      if (akcija.vrsta === 'obrisi') {
        onObrisana(akcija.kategorija.id);
        setPoruka(`„${akcija.kategorija.naziv}” je obrisana.`);
      } else {
        const kategorija: Kategorija = await odgovor.json();
        onSacuvana(kategorija);
        setPoruka(`„${kategorija.naziv}” je sačuvana.`);
      }
      dijalog.current?.close();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Zahtjev nije uspio.');
    } finally {
      setSalje(false);
    }
  }

  return <section className="kategorije-stranica" aria-labelledby="kategorije">
    {odabrana && <nav className="kategorije-putanja" aria-label="Putanja kategorije">
      <a className="kategorije-nazad" href="#kategorije">Kategorije</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{odabrana.naziv}</span>
    </nav>}
    <div className="kategorije-zaglavlje">
      <div>
        <h1 id="kategorije" ref={naslovPrikaza} tabIndex={-1}>{odabrana?.naziv ?? 'Kategorije'}</h1>
        {odabrana ? <>
          <p>Potkategorije: {prikazane.length} · Igrice: {brojIgrica(odabrana.id)}</p>
          {odabrana.opis && <p>{odabrana.opis}</p>}
        </> : <p>Upravljajte kategorijama i potkategorijama.</p>}
      </div>
      <button type="button" className="primary" aria-haspopup="dialog" disabled={kategorije === null}
        onClick={(event) => otvoriDijalog({ vrsta: 'nova' }, event.currentTarget)}>
        <Plus size={18} aria-hidden="true" /> {nazivAkcije}
      </button>
    </div>

    <div role="status">{poruka && <p>{poruka}</p>}</div>
    {greskaUcitavanja ? <p className="error" role="alert">Kategorije se nisu učitale.</p>
      : kategorije === null ? <p role="status">Učitavanje kategorija…</p>
      : !prikazane.length && <p>{odabrana ? 'Još nema potkategorija.' : 'Još nema kategorija.'}</p>}
      <ul className={odabrana ? 'kategorije-mreza potkategorije-mreza' : 'kategorije-mreza'}>
        {prikazane.map((kategorija, indeks) => {
          const { Ikona, boja } = izgledKategorije.get(kategorija.naziv.toLowerCase())
            ?? { Ikona: Folder, boja: bojeKartica[indeks % bojeKartica.length] };
          const brojPotkategorija = lista.filter((stavka) => stavka.idNadkategorije === kategorija.id).length;
          const meniOtvoren = meni === kategorija.id;
          const idOkidaca = `kategorija-opcije-${kategorija.id}`;

          return <li key={kategorija.id} className="kategorija-stavka">
            <a
              href={odabrana ? `#igrice?potkategorija=${kategorija.id}` : `#kategorije?kategorija=${kategorija.id}`}
              className={`kategorija-kartica kategorija-kartica--${boja}`}
            >
              <span className="kategorija-ikona"><Ikona size={26} aria-hidden="true" /></span>
              <span className="kategorija-tekst">
                <strong>{kategorija.naziv}</strong>
                <span className="kategorija-brojaci">
                  {!odabrana && <span>Potkategorije <b>{brojPotkategorija}</b></span>}
                  <span>Igrice <b>{brojIgrica(kategorija.id)}</b></span>
                </span>
              </span>
              {odabrana ? <span className="potkategorija-akcija">
                Prikaži igrice <ChevronRight size={17} aria-hidden="true" />
              </span> : null}
            </a>
            <div
              className="kategorija-opcije"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMeni(null);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Escape' || !meniOtvoren) return;
                event.preventDefault();
                setMeni(null);
                document.getElementById(idOkidaca)?.focus();
              }}
            >
              <button
                type="button"
                id={idOkidaca}
                className="kategorija-opcije-dugme"
                aria-label={`Opcije za ${kategorija.naziv}`}
                aria-expanded={meniOtvoren}
                onClick={(event) => {
                  event.currentTarget.focus();
                  setMeni(meniOtvoren ? null : kategorija.id);
                }}
              >
                <Ellipsis size={20} aria-hidden="true" />
              </button>
              {meniOtvoren && <div className="kategorija-opcije-panel">
                <button type="button" onClick={() => otvoriDijalog(
                  { vrsta: 'uredi', kategorija },
                  document.querySelector<HTMLButtonElement>(`#${idOkidaca}`),
                )}>
                  <Pencil size={16} aria-hidden="true" /> Uredi
                </button>
                <button type="button" className="kategorija-opcije-obrisi" onClick={() => otvoriDijalog(
                  { vrsta: 'obrisi', kategorija },
                  document.querySelector<HTMLButtonElement>(`#${idOkidaca}`),
                )}>
                  <Trash2 size={16} aria-hidden="true" /> Obriši
                </button>
              </div>}
            </div>
          </li>;
        })}
      </ul>

    <dialog ref={dijalog} className="admin-dijalog" aria-labelledby="nova-kategorija-naslov"
      onCancel={(event) => { if (salje) event.preventDefault(); }}
      onClose={() => {
        setAkcija(null);
        setGreska('');
        if (okidacDijaloga.current?.isConnected) okidacDijaloga.current.focus();
        else naslovPrikaza.current?.focus();
      }}>
      <h2 id="nova-kategorija-naslov">{naslovDijaloga}</h2>
      {akcija && <form onSubmit={sacuvaj}>
        {akcija.vrsta === 'obrisi' ? <p>Želiš li obrisati „{akcija.kategorija.naziv}”?</p> : <>
          {odabrana && <p>Nadkategorija: <strong>{odabrana.naziv}</strong></p>}
          <label htmlFor="nova-kategorija-naziv">Naziv</label>
          <input id="nova-kategorija-naziv" name="naziv" defaultValue={cilj?.naziv ?? ''} required maxLength={150} />
          <label htmlFor="nova-kategorija-opis">Opis (opcionalno)</label>
          <textarea id="nova-kategorija-opis" name="opis" defaultValue={cilj?.opis ?? ''} rows={3} maxLength={1000} />
        </>}
        {greska && <p className="error" role="alert">{greska}</p>}
        <div className="nova-igrica-akcije">
          <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
          {akcija.vrsta === 'obrisi'
            ? <button type="submit" className="primary opasna-akcija" disabled={salje}>{salje ? 'Brisanje…' : 'Obriši'}</button>
            : <button type="submit" className="primary" disabled={salje}>{salje ? 'Čuvanje…' : 'Sačuvaj'}</button>}
        </div>
      </form>}
    </dialog>
  </section>;
}
