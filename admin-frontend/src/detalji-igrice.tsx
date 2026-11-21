import { useEffect, useState, type RefObject } from 'react';
import { ChevronRight, Home, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react';
import { AktivnostDijalog, type Aktivnost, type TipAktivnosti } from './aktivnosti';
import { izgledZaIgricu, OpcijeZapisa, type Igrica } from './igrice';
import type { Kategorija } from './kategorije';
import type { AkcijaNivoa, Nivo } from './nivoi';

type DetaljiIgriceProps = {
  igrica: Igrica;
  naslov: RefObject<HTMLHeadingElement | null>;
  povratak: string;
  kategorije: Kategorija[] | null;
  nivoi: Nivo[];
  stanjeNivoa: 'ucitavanje' | 'ucitano' | 'greska';
  aktivnosti: Aktivnost[] | null;
  greskaAktivnosti: boolean;
  porukaNivoa: string;
  onUredi: () => void;
  onObrisi: () => void;
  onAkcijaNivoa: (akcija: AkcijaNivoa) => void;
  onSacuvanaAktivnost: (aktivnost: Aktivnost) => void;
  onObrisanaAktivnost: (id: number) => void;
};

export function DetaljiIgrice({
  igrica, naslov, povratak, kategorije, nivoi, stanjeNivoa, aktivnosti, greskaAktivnosti,
  porukaNivoa, onUredi, onObrisi, onAkcijaNivoa, onSacuvanaAktivnost, onObrisanaAktivnost,
}: DetaljiIgriceProps) {
  const [idNivoa, setIdNivoa] = useState<number | null>(null);
  const [tipovi, setTipovi] = useState<TipAktivnosti[] | null>(null);
  const [greskaTipova, setGreskaTipova] = useState(false);
  const [akcija, setAkcija] = useState<
    { vrsta: 'dodaj' } | { vrsta: 'uredi' | 'obrisi'; aktivnost: Aktivnost } | null
  >(null);

  useEffect(() => {
    const zahtjev = new AbortController();
    fetch('/api/tipovi-aktivnosti', { signal: zahtjev.signal })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error();
        return odgovor.json();
      })
      .then((podaci: TipAktivnosti[]) => {
        if (!zahtjev.signal.aborted) setTipovi(podaci);
      })
      .catch(() => {
        if (!zahtjev.signal.aborted) setGreskaTipova(true);
      });
    return () => zahtjev.abort();
  }, []);

  const kategorija = kategorije?.find(({ id }) => id === igrica.idKategorije);
  const nadkategorija = kategorije?.find(({ id }) => id === kategorija?.idNadkategorije);
  const { Ikona, boja } = izgledZaIgricu(igrica.naziv);
  const nivoiIgrice = nivoi.filter(({ idIgrice }) => idIgrice === igrica.id)
    .sort((prvi, drugi) => prvi.redniBroj - drugi.redniBroj);
  const nivo = nivoiIgrice.find(({ id }) => id === idNivoa) ?? nivoiIgrice[0];
  const aktivnostiNivoa = aktivnosti?.filter((aktivnost) => aktivnost.idNivoa === nivo?.id)
    .sort((prva, druga) => prva.redniBroj - druga.redniBroj) ?? [];

  return <section className="detalji-igrice" aria-labelledby="naslov-igrice">
    <nav className="detalji-putanja" aria-label="Putanja">
      <a href="#pregled" aria-label="Pregled"><Home size={17} aria-hidden="true" /></a>
      <ChevronRight size={15} aria-hidden="true" />
      <a href={povratak}>Igrice</a>
      <ChevronRight size={15} aria-hidden="true" />
      <span aria-current="page">{igrica.naziv}</span>
    </nav>
    <header className="detalji-zaglavlje">
      <div className={`detalji-ilustracija igrica-kartica--${boja}`}><Ikona size={46} aria-hidden="true" /></div>
      <div className="detalji-naslov">
        <h1 ref={naslov} tabIndex={-1} id="naslov-igrice">{igrica.naziv}</h1>
        <div className="igrica-oznake">
          {nadkategorija && <span>{nadkategorija.naziv}</span>}
          {kategorija && <span className={nadkategorija ? 'igrica-oznaka-potkategorije' : undefined}>{kategorija.naziv}</span>}
        </div>
        {igrica.opis && <p>{igrica.opis}</p>}
      </div>
      <div className="detalji-akcije">
        <button className="secondary" type="button" aria-haspopup="dialog" onClick={onUredi}>
          <Pencil size={16} aria-hidden="true" /> Uredi igricu
        </button>
        <OpcijeZapisa oznaka={`Opcije za igricu ${igrica.naziv}`} onUredi={onUredi} onObrisi={onObrisi} />
      </div>
    </header>
    {porukaNivoa && <p role="status">{porukaNivoa}</p>}
    <div className="detalji-paneli">
      <section className="detalji-panel" aria-labelledby="naslov-nivoa">
        <header>
          <h2 id="naslov-nivoa">Nivoi</h2>
          <button className="primary" type="button" aria-haspopup="dialog" onClick={() => onAkcijaNivoa({ vrsta: 'dodaj' })}>
            <Plus size={16} aria-hidden="true" /> Dodaj nivo
          </button>
        </header>
        {stanjeNivoa === 'ucitavanje' && <p role="status">Učitavanje nivoa…</p>}
        {stanjeNivoa === 'greska' && <p className="error" role="alert">Učitavanje nivoa nije uspjelo.</p>}
        {stanjeNivoa === 'ucitano' && !nivoiIgrice.length && <p>Ova igrica još nema nivoa.</p>}
        <ul className="detalji-nivoi">
          {nivoiIgrice.map((stavka) => {
            const brojAktivnosti = aktivnosti?.filter(({ idNivoa }) => idNivoa === stavka.id).length;
            return <li key={stavka.id}>
              <button className="detalji-odabir-nivoa" type="button" aria-pressed={stavka.id === nivo?.id} aria-controls="panel-aktivnosti"
                onClick={() => setIdNivoa(stavka.id)}>
                <span className="detalji-redni-broj">{stavka.redniBroj}</span>
                <span><strong>{stavka.naziv}</strong>
                  {brojAktivnosti !== undefined && <small>Aktivnosti: {brojAktivnosti}</small>}
                </span>
                {stavka.bodoviZaOtkljucavanje > 0 ? <small className="detalji-prag">
                  <LockKeyhole size={13} aria-hidden="true" /> {stavka.bodoviZaOtkljucavanje} bod.
                </small> : <small className="detalji-prag detalji-prag--otkljucan">Otključan</small>}
              </button>
              <OpcijeZapisa oznaka={`Opcije za nivo ${stavka.naziv}`}
                onUredi={() => onAkcijaNivoa({ vrsta: 'uredi', nivo: stavka })}
                onObrisi={() => onAkcijaNivoa({ vrsta: 'obrisi', nivo: stavka })} />
            </li>;
          })}
        </ul>
      </section>
      <section className="detalji-panel" id="panel-aktivnosti" aria-labelledby="naslov-aktivnosti">
        <header>
          <h2 id="naslov-aktivnosti">Aktivnosti{nivo && ` – Nivo ${nivo.redniBroj}: ${nivo.naziv}`}</h2>
          {nivo && <button className="primary" type="button" aria-haspopup="dialog" disabled={!tipovi?.length || !aktivnosti}
            onClick={() => setAkcija({ vrsta: 'dodaj' })}><Plus size={16} aria-hidden="true" /> Dodaj aktivnost</button>}
        </header>
        {!nivo && <p>Aktivnosti će se prikazati kada odabereš nivo.</p>}
        {nivo && greskaTipova && <p className="error" role="alert">Učitavanje tipova aktivnosti nije uspjelo.</p>}
        {nivo && greskaAktivnosti && <p className="error" role="alert">Učitavanje aktivnosti nije uspjelo.</p>}
        {nivo && !aktivnosti && !greskaAktivnosti && <p role="status">Učitavanje aktivnosti…</p>}
        {nivo && aktivnosti && !aktivnostiNivoa.length && <p>Ovaj nivo još nema aktivnosti.</p>}
        {aktivnostiNivoa.length > 0 && <div className="detalji-tabela-okvir"><table className="detalji-tabela">
          <thead><tr><th scope="col">#</th><th scope="col">Tip aktivnosti</th>
            <th scope="col">Uputstvo</th><th scope="col">Bodovi</th><th scope="col">Akcije</th></tr></thead>
          <tbody>{aktivnostiNivoa.map((aktivnost) => <tr key={aktivnost.id}>
            <td>{aktivnost.redniBroj}</td>
            <td>{tipovi?.find(({ id }) => id === aktivnost.idTipa)?.naziv ?? '—'}</td>
            <td>{aktivnost.uputstvo || '—'}</td>
            <td>{aktivnost.brojBodova}</td>
            <td><div className="detalji-tabela-akcije">
              <button type="button" disabled={!tipovi?.length} aria-haspopup="dialog"
                aria-label={`Uredi aktivnost ${aktivnost.redniBroj}`}
                onClick={() => setAkcija({ vrsta: 'uredi', aktivnost })}><Pencil size={16} aria-hidden="true" /></button>
              <button type="button" aria-haspopup="dialog" aria-label={`Obriši aktivnost ${aktivnost.redniBroj}`}
                onClick={() => setAkcija({ vrsta: 'obrisi', aktivnost })}><Trash2 size={16} aria-hidden="true" /></button>
            </div></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </div>
    {nivo && akcija && <AktivnostDijalog akcija={akcija} idNivoa={nivo.id} nazivNivoa={nivo.naziv}
      sljedeciBroj={(aktivnostiNivoa.at(-1)?.redniBroj ?? 0) + 1} tipovi={tipovi}
      onSacuvana={onSacuvanaAktivnost} onObrisana={onObrisanaAktivnost} onZatvori={() => setAkcija(null)} />}
  </section>;
}
