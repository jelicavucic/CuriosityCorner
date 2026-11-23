import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Ellipsis, Eye, Grid3X3, Image, Images, List, Pencil, Plus, Search, Trash2, Type } from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';
import { FormaSadrzaja } from './forma-sadrzaja';
import { Modal, PrikazSadrzaja, naslovSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';

type Vrsta = 'tekst' | 'slika' | 'oboje';
type Akcija = { vrsta: 'dodaj' } | { vrsta: 'pregled' | 'uredi' | 'obrisi'; stavka: Sadrzaj };
const oznake = { tekst: 'Tekst', slika: 'Slika', oboje: 'Tekst + slika' };
const izgledKartice = {
  tekst: { Ikona: Type, opis: 'Samo tekst' },
  slika: { Ikona: Image, opis: 'Samo slika' },
  oboje: { Ikona: Images, opis: 'Tekst i slika' },
};

function vrstaSadrzaja(stavka: Sadrzaj): Vrsta {
  if (!stavka.putanjaSlike) return 'tekst';
  return stavka.tekst?.trim() ? 'oboje' : 'slika';
}

function normalizuj(tekst: string) {
  return tekst.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim();
}

function useSadrzaji() {
  const [lista, setLista] = useState<Sadrzaj[] | null>(null);
  const [greska, setGreska] = useState(false);
  const [pokusaj, setPokusaj] = useState(0);
  const obrisani = useRef(new Set<number>());

  useEffect(() => {
    const zahtjev = new AbortController();
    fetch('/api/sadrzaji', { signal: zahtjev.signal, cache: 'no-store' })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error();
        return odgovor.json();
      })
      .then((podaci: Sadrzaj[]) => {
        if (!zahtjev.signal.aborted) setLista((trenutni) => {
          const postojeci = new Set(trenutni?.map(({ id }) => id));
          return [...(trenutni ?? []), ...podaci.filter(({ id }) => !postojeci.has(id) && !obrisani.current.has(id))];
        });
      })
      .catch(() => { if (!zahtjev.signal.aborted) setGreska(true); });
    return () => zahtjev.abort();
  }, [pokusaj]);

  return {
    lista, greska,
    ponovi: () => {
      setGreska(false);
      setPokusaj((broj) => broj + 1);
    },
    sacuvaj: (stavka: Sadrzaj) => setLista((trenutni) => trenutni?.some(({ id }) => id === stavka.id)
      ? trenutni.map((zapis) => zapis.id === stavka.id ? stavka : zapis)
      : [stavka, ...(trenutni ?? [])]),
    obrisi: (id: number) => {
      obrisani.current.add(id);
      setLista((trenutni) => trenutni?.filter((stavka) => stavka.id !== id) ?? null);
    },
  };
}

function MeniSadrzaja({ stavka, onAkcija }: { stavka: Sadrzaj; onAkcija: (akcija: Akcija) => void }) {
  const [otvoren, setOtvoren] = useState(false);
  const dugme = useRef<HTMLButtonElement>(null);
  return <div className="sadrzaj-meni" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOtvoren(false);
  }} onKeyDown={(event) => {
    if (event.key === 'Escape' && otvoren) {
      event.stopPropagation();
      dugme.current?.focus();
      setOtvoren(false);
    }
  }}>
    <button ref={dugme} type="button" className="sadrzaj-ikona" aria-label={`Opcije za sadržaj #${stavka.id}`}
      aria-expanded={otvoren} onClick={() => setOtvoren(!otvoren)}><Ellipsis size={20} aria-hidden="true" /></button>
    {otvoren && <div className="kategorija-opcije-panel sadrzaj-meni-panel">
      {([
        ['pregled', 'Pregledaj', Eye], ['uredi', 'Uredi', Pencil], ['obrisi', 'Obriši', Trash2],
      ] as const).map(([vrsta, oznaka, Ikona]) => <button key={vrsta} type="button" aria-haspopup="dialog"
        className={vrsta === 'obrisi' ? 'kategorija-opcije-obrisi' : undefined}
        onClick={() => {
          dugme.current?.focus();
          setOtvoren(false);
          onAkcija({ vrsta, stavka });
        }}><Ikona size={16} aria-hidden="true" /> {oznaka}</button>)}
    </div>}
  </div>;
}

function Biblioteka({ podaci, onOdabir, odabraniId, onAkcija }: {
  podaci: ReturnType<typeof useSadrzaji>;
  onOdabir: (stavka: Sadrzaj) => void;
  odabraniId?: number;
  onAkcija?: (akcija: Akcija) => void;
}) {
  const [upit, setUpit] = useState('');
  const [filter, setFilter] = useState<Vrsta | 'svi'>('svi');
  const [prikaz, setPrikaz] = useState<'kartice' | 'tabela'>('kartice');
  const trazeno = normalizuj(upit);
  const rezultati = (podaci.lista ?? []).filter((stavka) =>
    (filter === 'svi' || filter === vrstaSadrzaja(stavka))
    && [stavka.tekst, stavka.alternativniTekst, stavka.putanjaSlike, `#${stavka.id}`]
      .some((vrijednost) => normalizuj(vrijednost ?? '').includes(trazeno)));

  return <>
    <div className="sadrzaj-kontrole">
      <label className="sadrzaj-pretraga"><Search size={18} aria-hidden="true" />
        <input type="search" aria-label="Pretraži sadržaje" placeholder="Pretraži sadržaje…"
          value={upit} onChange={(event) => setUpit(event.currentTarget.value)} />
      </label>
      <div className="sadrzaj-filteri" role="group" aria-label="Vrsta sadržaja">
        {([['svi', 'Svi'], ['tekst', 'Samo tekst'], ['slika', 'Samo slika'], ['oboje', 'Tekst i slika']] as const)
          .map(([vrijednost, oznaka]) => <button key={vrijednost} type="button" aria-pressed={filter === vrijednost}
            onClick={() => setFilter(vrijednost)}>{oznaka}</button>)}
      </div>
      {onAkcija && <div className="sadrzaj-filteri sadrzaj-prikaz" role="group" aria-label="Prikaz sadržaja">
        <button type="button" aria-label="Kartice" title="Kartice" aria-pressed={prikaz === 'kartice'}
          onClick={() => setPrikaz('kartice')}><Grid3X3 size={18} aria-hidden="true" /></button>
        <button type="button" aria-label="Tabela" title="Tabela" aria-pressed={prikaz === 'tabela'}
          onClick={() => setPrikaz('tabela')}><List size={19} aria-hidden="true" /></button>
      </div>}
    </div>
    {podaci.greska && <div className="sadrzaj-prazno">
      <p role="alert">Učitavanje sadržaja nije uspjelo.</p>
      <button className="secondary" type="button" onClick={podaci.ponovi}>Pokušaj ponovo</button>
    </div>}
    {!podaci.greska && podaci.lista === null && <p className="sadrzaj-prazno" role="status">Učitavanje sadržaja…</p>}
    {podaci.lista && !podaci.greska && rezultati.length === 0 && <p className="sadrzaj-prazno" role="status">
      {trazeno || filter !== 'svi' ? 'Nema sadržaja koji odgovara pretrazi i filteru.' : 'Još nema sadržaja.'}
    </p>}
    {rezultati.length > 0 && (prikaz === 'tabela' && onAkcija ? <div className="sadrzaj-tabela-okvir">
      <table className="sadrzaj-tabela">
        <caption className="sadrzaj-samo-citaci">Biblioteka sadržaja</caption>
        <thead><tr><th scope="col">Sadržaj</th><th scope="col">Vrsta</th><th scope="col">ID</th><th scope="col">Akcije</th></tr></thead>
        <tbody>{rezultati.map((stavka) => <tr key={stavka.id}>
          <td><button type="button" className="sadrzaj-red" aria-haspopup="dialog" onClick={() => onOdabir(stavka)}>
            <PrikazSadrzaja stavka={stavka} sazetak />
          </button></td>
          <td><span className={`sadrzaj-oznaka sadrzaj--${vrstaSadrzaja(stavka)}`}>{oznake[vrstaSadrzaja(stavka)]}</span></td>
          <td>#{stavka.id}</td>
          <td><MeniSadrzaja stavka={stavka} onAkcija={onAkcija} /></td>
        </tr>)}</tbody>
      </table>
    </div> : <ul className="sadrzaj-mreza">{rezultati.map((stavka) => {
      const vrsta = vrstaSadrzaja(stavka);
      const { Ikona, opis } = izgledKartice[vrsta];
      return <li key={stavka.id} className={`sadrzaj-kartica sadrzaj--${vrsta}`}>
        <button className="sadrzaj-otvori" type="button" aria-haspopup={onAkcija ? 'dialog' : undefined}
          aria-label={`${onAkcija ? 'Pregledaj' : 'Odaberi'} sadržaj #${stavka.id}: ${naslovSadrzaja(stavka)}`}
          aria-pressed={onAkcija ? undefined : odabraniId === stavka.id} onClick={() => onOdabir(stavka)}>
          <Ikona className="sadrzaj-ikona-vrste" size={23} aria-hidden="true" />
          <PrikazSadrzaja stavka={stavka} sazetak />
          <span className="sadrzaj-opis-vrste">{opis}</span>
          <span className="sadrzaj-id">#{stavka.id}</span>
        </button>
        {onAkcija && <MeniSadrzaja stavka={stavka} onAkcija={onAkcija} />}
      </li>;
    })}</ul>)}
  </>;
}

function PotvrdaBrisanja({ stavka, onZatvori, onObrisan }: {
  stavka: Sadrzaj; onZatvori: () => void; onObrisan: () => void;
}) {
  const [greska, setGreska] = useState('');
  const [salje, setSalje] = useState(false);

  async function obrisi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;
    setGreska('');
    setSalje(true);
    try {
      const odgovor = await posaljiAdminZahtjev('DELETE', `/api/sadrzaji/${stavka.id}`);
      if (odgovor.status === 409) throw new Error('Sadržaj se koristi u aktivnosti i ne može se obrisati.');
      await provjeriOdgovor(odgovor, 'Brisanje sadržaja nije uspjelo.');
      onObrisan();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Brisanje sadržaja nije uspjelo.');
    } finally {
      setSalje(false);
    }
  }

  return <Modal naslov="Obriši sadržaj" zauzet={salje} onZatvori={onZatvori}>
    <form onSubmit={obrisi}>
      <p>Želiš li trajno obrisati „{naslovSadrzaja(stavka)}”?</p>
      {greska && <p role="alert" className="error">{greska}</p>}
      <div className="sadrzaj-forma-akcije">
        <button type="button" className="secondary" autoFocus disabled={salje} onClick={onZatvori}>Otkaži</button>
        <button type="submit" className="primary opasna-akcija" disabled={salje}>{salje ? 'Brisanje…' : 'Obriši'}</button>
      </div>
    </form>
  </Modal>;
}

export function Sadrzaji({ naslovPrikaza }: { naslovPrikaza: RefObject<HTMLHeadingElement | null> }) {
  const podaci = useSadrzaji();
  const [akcija, setAkciju] = useState<Akcija | null>(null);
  const [poruka, setPoruku] = useState('');
  const zatvori = () => setAkciju(null);

  return <section className="sadrzaji">
    <header className="sadrzaji-zaglavlje">
      <div>
        <h1 ref={naslovPrikaza} tabIndex={-1}>Sadržaji</h1>
        <p>Upravljanje tekstovima i slikama koje se koriste u aktivnostima.</p>
      </div>
      <button className="primary" type="button" aria-haspopup="dialog" onClick={() => setAkciju({ vrsta: 'dodaj' })}>
        <Plus size={18} aria-hidden="true" /> Dodaj sadržaj
      </button>
    </header>
    <div role="status" className="sadrzaj-status">{poruka}</div>
    <Biblioteka podaci={podaci} onOdabir={(stavka) => setAkciju({ vrsta: 'pregled', stavka })} onAkcija={setAkciju} />
    {akcija?.vrsta === 'pregled' && <Modal naslov={`Sadržaj #${akcija.stavka.id}`} onZatvori={zatvori}>
      <PrikazSadrzaja stavka={akcija.stavka} />
      <div className="sadrzaj-forma-akcije"><button type="button" className="secondary" autoFocus
        onClick={() => setAkciju({ vrsta: 'uredi', stavka: akcija.stavka })}>Uredi</button></div>
    </Modal>}
    {(akcija?.vrsta === 'dodaj' || akcija?.vrsta === 'uredi') && <FormaSadrzaja
      stavka={akcija.vrsta === 'uredi' ? akcija.stavka : undefined} onZatvori={zatvori}
      onSacuvan={(stavka) => {
        podaci.sacuvaj(stavka);
        setPoruku(`Sadržaj #${stavka.id} je sačuvan.`);
        zatvori();
      }} />}
    {akcija?.vrsta === 'obrisi' && <PotvrdaBrisanja stavka={akcija.stavka} onZatvori={zatvori}
      onObrisan={() => {
        podaci.obrisi(akcija.stavka.id);
        setPoruku(`Sadržaj #${akcija.stavka.id} je obrisan.`);
        zatvori();
        naslovPrikaza.current?.focus();
      }} />}
  </section>;
}

export function IzaberiSadrzaj({ pocetni, onOdaberi, onZatvori, samoSlike = false }: {
  pocetni?: Sadrzaj; onOdaberi: (stavka: Sadrzaj) => void; onZatvori: () => void; samoSlike?: boolean;
}) {
  const podaci = useSadrzaji();
  const [odabrani, setOdabrani] = useState(pocetni);
  const [dodavanje, setDodavanje] = useState(false);
  const [poruka, setPoruku] = useState('');
  const dostupni = samoSlike && podaci.lista
    ? { ...podaci, lista: podaci.lista.filter((stavka) => stavka.putanjaSlike?.trim()) }
    : podaci;
  const mozeOdabrati = odabrani && (!samoSlike || odabrani.putanjaSlike?.trim());

  return <>
    <Modal naslov={samoSlike ? 'Izaberi sliku' : 'Izaberi sadržaj'} onZatvori={onZatvori}>
      <div role="status" className="sadrzaj-status">{poruka}</div>
      <Biblioteka podaci={dostupni} odabraniId={odabrani?.id} onOdabir={setOdabrani} />
      <div className="sadrzaj-forma-akcije">
        <button type="button" className="secondary" aria-haspopup="dialog" onClick={() => setDodavanje(true)}>
          <Plus size={17} aria-hidden="true" /> Dodaj sadržaj
        </button>
        <button type="button" className="secondary" onClick={onZatvori}>Otkaži</button>
        <button type="button" className="primary" disabled={!mozeOdabrati}
          onClick={() => { if (odabrani && mozeOdabrati) onOdaberi(odabrani); }}>Odaberi</button>
      </div>
    </Modal>
    {dodavanje && <FormaSadrzaja onZatvori={() => setDodavanje(false)} onSacuvan={(stavka) => {
      podaci.sacuvaj(stavka);
      if (samoSlike && !stavka.putanjaSlike?.trim()) {
        setPoruku('Sadržaj je sačuvan. Za memoriju izaberi sadržaj sa slikom.');
        setDodavanje(false);
        return;
      }
      setOdabrani(stavka);
      setPoruku(`Sadržaj #${stavka.id} je sačuvan i izabran.`);
      setDodavanje(false);
    }} />}
  </>;
}
