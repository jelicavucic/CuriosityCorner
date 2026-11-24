import { useState, type RefObject } from 'react';
import { ArrowRight, ChevronRight, Gamepad2, House, Layers, ListChecks, Plus, Search } from 'lucide-react';
import { izgledZaIgricu, oznakaStatusa, OpcijeZapisa, type Igrica } from './igrice';
import type { Kategorija } from './kategorije';
import type { Nivo } from './nivoi';

type Stanje = 'ucitavanje' | 'ucitano' | 'greska';

type PregledIgricaProps = {
  naslovPrikaza: RefObject<HTMLHeadingElement | null>;
  igrice: Igrica[];
  kategorije: Kategorija[] | null;
  nivoi: Nivo[] | null;
  aktivnosti: { idNivoa: number }[] | null;
  stanje: Stanje;
  filterKategorije: number;
  filterPotkategorije: number | null;
  porukaIgrice: string;
  porukaNivoa: string;
  onNovaIgrica: () => void;
  onUredi: (igrica: Igrica) => void;
  onObrisi: (igrica: Igrica) => void;
};

function tekstPretrage(tekst: string) {
  return tekst.trim().toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function PregledIgrica({
  naslovPrikaza, igrice, kategorije, nivoi, aktivnosti, stanje, filterKategorije, filterPotkategorije,
  porukaIgrice, porukaNivoa, onNovaIgrica, onUredi, onObrisi,
}: PregledIgricaProps) {
  const [pretraga, setPretraga] = useState('');
  const kategorijePoId = new Map(kategorije?.map((kategorija) => [kategorija.id, kategorija]));
  const potkategorija = filterPotkategorije === null ? undefined : kategorijePoId.get(filterPotkategorije);
  const idGlavne = potkategorija?.idNadkategorije ?? filterKategorije;
  const glavnaKategorija = kategorijePoId.get(idGlavne);
  const glavne = kategorije?.filter(({ idNadkategorije }) => idNadkategorije === null) ?? [];
  const potkategorije = kategorije?.filter(({ idNadkategorije }) =>
    idNadkategorije !== null && (!idGlavne || idNadkategorije === idGlavne),
  ) ?? [];

  function postaviFilter(kategorija: number, podkategorija: number | null) {
    const parametri = new URLSearchParams();
    if (kategorija) parametri.set('kategorija', String(kategorija));
    if (podkategorija) parametri.set('potkategorija', String(podkategorija));
    window.location.hash = parametri.size ? `igrice?${parametri}` : 'igrice';
  }

  const trazeno = tekstPretrage(pretraga);
  const igriceUOdabiru = igrice.filter((igrica) => {
    const kategorija = kategorijePoId.get(igrica.idKategorije);
    const glavnaId = kategorija?.idNadkategorije ?? igrica.idKategorije;
    return (!idGlavne || idGlavne === glavnaId)
      && (filterPotkategorije === null || igrica.idKategorije === filterPotkategorije);
  });
  const prikazane = igriceUOdabiru.filter(({ naziv }) => tekstPretrage(naziv).includes(trazeno));
  const praznaPotkategorija = Boolean(potkategorija && !igriceUOdabiru.length);
  const praznaLista = !igrice.length && !trazeno && !idGlavne && filterPotkategorije === null;
  const mozeDodatiPrvu = praznaPotkategorija || praznaLista;

  const brojNivoa = new Map<number, number>();
  const igricaPoNivou = new Map<number, number>();
  const brojAktivnosti = new Map<number, number>();
  for (const { id, idIgrice } of nivoi ?? []) {
    igricaPoNivou.set(id, idIgrice);
    brojNivoa.set(idIgrice, (brojNivoa.get(idIgrice) ?? 0) + 1);
  }
  for (const { idNivoa } of aktivnosti ?? []) {
    const idIgrice = igricaPoNivou.get(idNivoa);
    if (idIgrice !== undefined) brojAktivnosti.set(idIgrice, (brojAktivnosti.get(idIgrice) ?? 0) + 1);
  }

  return <section className="igrice-stranica" aria-labelledby="igrice">
    {(glavnaKategorija || potkategorija) && <nav className="putanja-kategorije" aria-label="Putanja kategorije">
      <a href="#kategorije"><House size={16} aria-hidden="true" /> Kategorije</a>
      {glavnaKategorija && <>
        <ChevronRight size={15} aria-hidden="true" />
        {potkategorija
          ? <a href={`#kategorije?kategorija=${glavnaKategorija.id}`}>{glavnaKategorija.naziv}</a>
          : <strong aria-current="page">{glavnaKategorija.naziv}</strong>}
      </>}
      {potkategorija && <>
        <ChevronRight size={15} aria-hidden="true" />
        <strong aria-current="page">{potkategorija.naziv}</strong>
      </>}
    </nav>}
    <div className="igrice-zaglavlje">
      <div>
        <h1 id="igrice" ref={naslovPrikaza} tabIndex={-1}>Igrice</h1>
        <p>Pregled i upravljanje igricama.</p>
      </div>
      <button type="button" className="primary" aria-haspopup="dialog" onClick={onNovaIgrica}>
        <Plus size={18} aria-hidden="true" /> Nova igrica
      </button>
    </div>

    <div className="igrice-filter-panel">
    <div className="igrice-filteri">
      <label className="igrice-filter">
        <span>Kategorija</span>
        <select value={idGlavne || ''} disabled={!kategorije}
          onChange={(event) => postaviFilter(Number(event.currentTarget.value), null)}>
          <option value="">Sve</option>
          {glavne.map(({ id, naziv }) => <option key={id} value={id}>{naziv}</option>)}
        </select>
      </label>
      <label className="igrice-filter">
        <span>Potkategorija</span>
        <select value={filterPotkategorije ?? ''} disabled={!potkategorije.length}
          onChange={(event) => postaviFilter(idGlavne, Number(event.currentTarget.value) || null)}>
          <option value="">Sve</option>
          {potkategorije.map(({ id, naziv }) => <option key={id} value={id}>{naziv}</option>)}
        </select>
      </label>
      <label className="igrice-pretraga">
        <Search size={17} aria-hidden="true" />
        <input type="search" aria-label="Pretraži igrice" placeholder="Pretraži igrice…"
          value={pretraga} onChange={(event) => setPretraga(event.currentTarget.value)} />
      </label>
    </div>
    {(glavnaKategorija || potkategorija) && <div className="igrice-aktivni-filteri">
      Aktivni filteri
      {glavnaKategorija && <span>{glavnaKategorija.naziv}</span>}
      {potkategorija && <span>{potkategorija.naziv}</span>}
    </div>}
    </div>

    <div role="status">{porukaIgrice && <p>Igrica „{porukaIgrice}” sačuvana je kao nacrt.</p>}</div>
    <div role="status">{porukaNivoa && <p>{porukaNivoa}</p>}</div>
    {stanje === 'ucitavanje' && <p role="status">Učitavanje igrica…</p>}
    {stanje === 'greska' && <p className="error" role="alert">Učitavanje liste igrica nije uspjelo.</p>}
    {stanje === 'ucitano' && prikazane.length === 0 && <div className="igrice-prazno">
      <div className="igrice-prazno-ikona"><Gamepad2 size={32} aria-hidden="true" /></div>
      <div role="status">
        <h2>{mozeDodatiPrvu ? 'Još nema igrica' : 'Nema rezultata'}</h2>
        <p>{praznaPotkategorija ? 'U ovoj potkategoriji još nije kreirana nijedna igrica.'
          : praznaLista ? 'Kreirajte prvu igricu za aplikaciju.'
          : 'Pokušajte promijeniti pretragu ili odabrane filtere.'}</p>
      </div>
      {mozeDodatiPrvu ? <button type="button" className="primary" aria-haspopup="dialog" onClick={onNovaIgrica}>
        <Plus size={18} aria-hidden="true" /> Dodaj prvu igricu
      </button> : <button type="button" className="secondary" onClick={() => {
        setPretraga('');
        postaviFilter(0, null);
        naslovPrikaza.current?.focus();
      }}>Očisti filtere</button>}
    </div>}
    {prikazane.length > 0 && <ul className="igrice-mreza">
      {prikazane.map((igrica) => {
        const kategorija = kategorijePoId.get(igrica.idKategorije);
        const nadkategorija = kategorija?.idNadkategorije == null
          ? undefined : kategorijePoId.get(kategorija.idNadkategorije);
        const { Ikona, boja } = izgledZaIgricu(igrica.naziv);
        const detalji = new URLSearchParams(window.location.hash.split('?')[1]);
        detalji.set('igrica', String(igrica.id));

        return <li className={`igrica-kartica igrica-kartica--${boja}`} key={igrica.id}>
          <OpcijeZapisa oznaka={`Opcije za igricu ${igrica.naziv}`}
            onUredi={() => onUredi(igrica)} onObrisi={() => onObrisi(igrica)} />
          <div className="igrica-ilustracija"><Ikona size={38} aria-hidden="true" /></div>
          <h2>{igrica.naziv}</h2>
          <div className="igrica-oznake">
            {nadkategorija && <span>{nadkategorija.naziv}</span>}
            {kategorija && <span className={nadkategorija ? 'igrica-oznaka-potkategorije' : undefined}>{kategorija.naziv}</span>}
            <span className="igrica-status" data-status={igrica.status}>{oznakaStatusa(igrica.status)}</span>
          </div>
          <div className="igrica-brojaci">
            <span><Layers size={15} aria-hidden="true" /> Nivoi <strong>{nivoi ? (brojNivoa.get(igrica.id) ?? 0) : '—'}</strong></span>
            <span><ListChecks size={15} aria-hidden="true" /> Aktivnosti <strong>{nivoi && aktivnosti ? (brojAktivnosti.get(igrica.id) ?? 0) : '—'}</strong></span>
          </div>
          <a className="igrica-detalji-link" href={`#igrice?${detalji}`} aria-label={`Otvori igricu ${igrica.naziv}`}>
            Otvori igricu <ArrowRight size={16} aria-hidden="true" />
          </a>
        </li>;
      })}
    </ul>}
  </section>;
}
