import { useState, type RefObject } from 'react';
import { Layers, ListChecks, Plus, Search } from 'lucide-react';
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
  const prikazane = igrice.filter((igrica) => {
    const kategorija = kategorijePoId.get(igrica.idKategorije);
    const glavnaId = kategorija?.idNadkategorije ?? igrica.idKategorije;
    return (!idGlavne || idGlavne === glavnaId)
      && (filterPotkategorije === null || igrica.idKategorije === filterPotkategorije)
      && tekstPretrage(igrica.naziv).includes(trazeno);
  });

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
    <div className="igrice-zaglavlje">
      <div>
        <h1 id="igrice" ref={naslovPrikaza} tabIndex={-1}>Igrice</h1>
        <p>Pregled i upravljanje igricama.</p>
      </div>
      <button type="button" className="primary" aria-haspopup="dialog" onClick={onNovaIgrica}>
        <Plus size={18} aria-hidden="true" /> Nova igrica
      </button>
    </div>

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

    {potkategorija?.idNadkategorije != null && <a className="igrice-povratak"
      href={`#kategorije?kategorija=${potkategorija.idNadkategorije}`}>Nazad na potkategorije</a>}
    <div role="status">{porukaIgrice && <p>Igrica „{porukaIgrice}” sačuvana je kao nacrt.</p>}</div>
    <div role="status">{porukaNivoa && <p>{porukaNivoa}</p>}</div>
    {stanje === 'ucitavanje' && <p role="status">Učitavanje igrica…</p>}
    {stanje === 'greska' && <p className="error" role="alert">Učitavanje liste igrica nije uspjelo.</p>}
    {stanje === 'ucitano' && prikazane.length === 0 &&
      <p role="status">{trazeno || idGlavne || filterPotkategorije ? 'Nema igrica koje odgovaraju filterima.' : 'Još nema igrica.'}</p>}
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
          <h2><a className="igrica-detalji-link" href={`#igrice?${detalji}`}>{igrica.naziv}</a></h2>
          <div className="igrica-oznake">
            {nadkategorija && <span>{nadkategorija.naziv}</span>}
            {kategorija && <span className={nadkategorija ? 'igrica-oznaka-potkategorije' : undefined}>{kategorija.naziv}</span>}
            <span className="igrica-status">{oznakaStatusa(igrica.status)}</span>
          </div>
          <div className="igrica-brojaci">
            <span><Layers size={15} aria-hidden="true" /> Nivoi <strong>{nivoi ? (brojNivoa.get(igrica.id) ?? 0) : '—'}</strong></span>
            <span><ListChecks size={15} aria-hidden="true" /> Aktivnosti <strong>{nivoi && aktivnosti ? (brojAktivnosti.get(igrica.id) ?? 0) : '—'}</strong></span>
          </div>
        </li>;
      })}
    </ul>}
  </section>;
}
