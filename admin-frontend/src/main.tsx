import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { odjaviSe, prijaviSe, provjeriSesiju, type Administrator } from './auth';
import { CalendarDays, Eye, EyeOff, Gamepad2, House, Image, Layers, LockKeyhole, LogIn, MessageSquareMore, UserRound, UsersRound } from 'lucide-react';
import './style.css';
import { NovaIgrica, ObrisiIgricu, type Igrica } from './igrice';
import { Kategorije, type Kategorija } from './kategorije';
import { NivoDijalog, type AkcijaNivoa, type Nivo } from './nivoi';
import { PregledIgrica } from './pregled-igrica';
import { DetaljiIgrice } from './detalji-igrice';
import { Sadrzaji } from './sadrzaji';
import type { Aktivnost } from './aktivnosti';

import { Avatari, type Avatar } from './avatari';
import { OdgovorNaRecenziju, type OdgovorRecenzije } from './odgovor-na-recenziju';
import { ChevronDown, CircleCheck, Clock, LogOut, MessageCircle, MessagesSquare, RefreshCw, Star } from 'lucide-react';
type Recenzija = {
  id: number;
  idIgrice: number;
  idKorisnika: number;
  datumKreiranja: string;
  ocjena: number;
  komentar: string | null;
  odgovor: OdgovorRecenzije | null;
};

const stavkeMenija = [
  { ruta: 'pregled', naziv: 'Pregled', ikona: House },
  { ruta: 'kategorije', naziv: 'Kategorije', ikona: Layers },
  { ruta: 'igrice', naziv: 'Igrice', ikona: Gamepad2 },
  { ruta: 'sadrzaji', naziv: 'Sadržaji', ikona: Image },
  { ruta: 'avatari', naziv: 'Avatari', ikona: UsersRound },
  { ruta: 'recenzije', naziv: 'Recenzije', ikona: MessageSquareMore },
];

function Brend() {
  return <div className="brand"><img src="/logo-mark.png" alt="" />CuriosityCorner</div>;
}

function App() {
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [adresa, setAdresa] = useState(() => window.location.hash);
  const [ruta, upit] = adresa.slice(1).split('?');
  const prikaz = ruta === 'igrice' || ruta === 'kategorije' || ruta === 'sadrzaji'
    || ruta === 'avatari' || ruta === 'recenzije' ? ruta : 'pregled';
  const parametri = new URLSearchParams(upit);
  const idDetalja = prikaz === 'igrice' && parametri.has('igrica') ? Number(parametri.get('igrica')) : null;
  parametri.delete('igrica');
  const povratakNaIgrice = parametri.size ? `#igrice?${parametri}` : '#igrice';
  const idKategorije = Number(parametri.get('kategorija'));
  const idOtvoreneKategorije = prikaz === 'kategorije' ? idKategorije : 0;
  const idPotkategorije = Number(parametri.get('potkategorija'));
  const filterPotkategorije = prikaz === 'igrice' && Number.isSafeInteger(idPotkategorije) && idPotkategorije > 0
    ? idPotkategorije : null;
  const naslovPrikaza = useRef<HTMLHeadingElement>(null);
  const [kategorije, setKategorije] = useState<Kategorija[] | null>(null);
  const [greskaKategorija, setGreskaKategorija] = useState(false);
  const [igrice, setIgrice] = useState<Igrica[]>([]);
  const [stanjeIgrica, setStanjeIgrica] = useState<'ucitavanje' | 'ucitano' | 'greska'>('ucitavanje');
  const [kreiranaIgrica, setKreiranaIgrica] = useState('');
  const dijalogIgrice = useRef<HTMLDialogElement>(null);
  const dijalogUredjivanja = useRef<HTMLDialogElement>(null);
  const [igricaZaUredjivanje, setIgricuZaUredjivanje] = useState<Igrica | null>(null);
  const [igricaZaBrisanje, setIgricuZaBrisanje] = useState<Igrica | null>(null);
  const otvorenaIgrica = igrice.find(({ id }) => id === idDetalja);
  const [nivoi, setNivoe] = useState<Nivo[]>([]);
  const [stanjeNivoa, setStanjeNivoa] = useState<'ucitavanje' | 'ucitano' | 'greska'>('ucitavanje');
  const [zahtjevNivoa, setZahtjevNivoa] = useState<{ igrica: Igrica; akcija: AkcijaNivoa } | null>(null);
  const [porukaNivoa, setPorukaNivoa] = useState('');
  const [aktivnosti, setAktivnosti] = useState<Aktivnost[] | null>(null);
  const [greskaAktivnosti, setGreskaAktivnosti] = useState(false);
  const [avatari, setAvatare] = useState<Avatar[] | null>(null);
  const [recenzije, setRecenzije] = useState<Recenzija[] | null>(null);
  const [greskaAvatara, setGreskuAvatara] = useState('');
  const [greskaRecenzija, setGreskuRecenzija] = useState('');
  const [porukaRecenzije, setPorukuRecenzije] = useState('');
  const [osvjezavanjeRecenzija, setOsvjezavanjeRecenzija] = useState(0);
  const [ucitavaRecenzije, setUcitavaRecenzije] = useState(false);
  const bezOdgovora = parametri.get('filter') === 'bez-odgovora';
  const neodgovoreneRecenzije = recenzije?.filter(({ odgovor }) => !odgovor);
  const brojBezOdgovora = neodgovoreneRecenzije?.length ?? 0;
  const samoOdgovorene = parametri.get('filter') === 'odgovorene';
  const prikazaneRecenzije = bezOdgovora ? neodgovoreneRecenzije
    : samoOdgovorene ? recenzije?.filter(({ odgovor }) => odgovor) : recenzije;
  const [provjera, setProvjera] = useState(true);
  const [pokusaj, setPokusaj] = useState(0);
  const [provjeraNeuspjela, setProvjeraNeuspjela] = useState(false);
  const [greska, setGreska] = useState('');
  const [salje, setSalje] = useState(false);
  const [prikaziLozinku, setPrikaziLozinku] = useState(false);

  useEffect(() => {
    function promijeniPrikaz() {
      setAdresa(window.location.hash);
    }
    window.addEventListener('hashchange', promijeniPrikaz);
    return () => window.removeEventListener('hashchange', promijeniPrikaz);
  }, []);

  useEffect(() => {
    naslovPrikaza.current?.focus();
  }, [admin, prikaz, idOtvoreneKategorije, idDetalja, otvorenaIgrica?.id]);

  useEffect(() => {
    if (igricaZaUredjivanje && !dijalogUredjivanja.current?.open) {
      dijalogUredjivanja.current?.showModal();
    }
  }, [igricaZaUredjivanje]);

  useEffect(() => {
    let aktivno = true;
    provjeriSesiju()
      .then((sesija) => { if (aktivno) setAdmin(sesija); })
      .catch((error: Error) => {
        if (aktivno) {
          setGreska(error.message);
          setProvjeraNeuspjela(true);
        }
      })
      .finally(() => { if (aktivno) setProvjera(false); });
    return () => { aktivno = false; };
  }, [pokusaj]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/kategorije', { signal: zahtjev.signal })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error('Učitavanje kategorija nije uspjelo.');
        return odgovor.json();
      })
      .then((podaci: Kategorija[]) => {
        if (!zahtjev.signal.aborted) setKategorije(podaci);
      })
      .catch(() => {
        if (!zahtjev.signal.aborted) setGreskaKategorija(true);
      });

    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/igrice', { signal: zahtjev.signal, cache: 'no-store' })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error('Učitavanje igrica nije uspjelo.');
        return odgovor.json();
      })
      .then((podaci: Igrica[]) => {
        if (zahtjev.signal.aborted) return;
        setIgrice((trenutne) => {
          const trenutniId = new Set(trenutne.map(({ id }) => id));
          return [...trenutne, ...podaci.filter(({ id }) => !trenutniId.has(id))];
        });
        setStanjeIgrica('ucitano');
      })
      .catch(() => {
        if (!zahtjev.signal.aborted) setStanjeIgrica('greska');
      });

    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/nivoi', { signal: zahtjev.signal, cache: 'no-store' })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error('Učitavanje nivoa nije uspjelo.');
        return odgovor.json();
      })
      .then((podaci: Nivo[]) => {
        if (zahtjev.signal.aborted) return;
        setNivoe((trenutni) => {
          const trenutniId = new Set(trenutni.map(({ id }) => id));
          return [...trenutni, ...podaci.filter(({ id }) => !trenutniId.has(id))];
        });
        setStanjeNivoa('ucitano');
      })
      .catch(() => {
        if (!zahtjev.signal.aborted) setStanjeNivoa('greska');
      });

    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/aktivnosti', { signal: zahtjev.signal, cache: 'no-store' })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error('Učitavanje aktivnosti nije uspjelo.');
        return odgovor.json();
      })

      .then((podaci: Aktivnost[]) => {
        if (!zahtjev.signal.aborted) setAktivnosti(podaci);
      })
      .catch(() => {
        if (!zahtjev.signal.aborted) setGreskaAktivnosti(true);
      });

    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() =>{ 
    if (!admin) return;

    const zahtjev = new AbortController();
    
    fetch('/api/avatari', { signal: zahtjev.signal })
  .then((odgovor) => {
    if (!odgovor.ok) throw new Error('Učitavanje avatara nije uspjelo.');
    return odgovor.json();
  })
  .then((podaci: Avatar[]) => {
    if (!zahtjev.signal.aborted) setAvatare(podaci);
  })
    .catch(() => {
      if (!zahtjev.signal.aborted) setGreskuAvatara('Učitavanje avatara nije uspjelo.');
    });
    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() =>{ 
    if (!admin) return;

    const zahtjev = new AbortController();
    
    if (prikaz !== 'recenzije' && prikaz !== 'pregled') return;
    setGreskuRecenzija('');
    setUcitavaRecenzije(true);
    fetch('/api/admin/recenzije', { signal: zahtjev.signal, cache: 'no-store' })
      .then((odgovor) => {
        if (!odgovor.ok) throw new Error(`Učitavanje recenzija nije uspjelo (HTTP ${odgovor.status}).`);
        return odgovor.json();
      })
      .then((podaci: Recenzija[]) => {
        if (!Array.isArray(podaci)) throw new Error('Backend nije vratio listu recenzija.');
        if (!zahtjev.signal.aborted) setRecenzije(podaci);
      })
      .catch((greska: Error) => {
        if (!zahtjev.signal.aborted) setGreskuRecenzija(greska.message);
      })
      .finally(() => {
        if (!zahtjev.signal.aborted) setUcitavaRecenzije(false);
      });
    return () => zahtjev.abort();
  }, [admin, prikaz, osvjezavanjeRecenzija]);

  async function prijava(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const podaci = new FormData(event.currentTarget);
    setGreska('');
    setSalje(true);
    try {
      setAdmin(await prijaviSe(String(podaci.get('korisnickoIme')).trim(), String(podaci.get('lozinka'))));
      setPrikaziLozinku(false);
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Prijava nije uspjela.');
    } finally {
      setSalje(false);
    }
  }

  async function odjava() {
    setGreska('');
    setSalje(true);
    try {
      await odjaviSe();
      setAdmin(null);
      setZahtjevNivoa(null);
      setIgricuZaUredjivanje(null);
      setIgricuZaBrisanje(null);
      setPorukaNivoa('');
      setNivoe([]);
      setStanjeNivoa('ucitavanje');
      setKategorije(null);
      setGreskaKategorija(false);
      setIgrice([]);
      setAktivnosti(null);
      setGreskaAktivnosti(false);
      setStanjeIgrica('ucitavanje');
      setKreiranaIgrica('');
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Odjava nije uspjela.');
    } finally {
      setSalje(false);
    }
  }

  if (admin) {
    const odabranaPotkategorija = kategorije?.find(({ id }) => id === filterPotkategorije);

    return <>
      <header className="toolbar">
        <Brend />
        <div className="toolbar-nalog">
          <details>
            <summary aria-label="Administratorski nalog"><UserRound size={18} aria-hidden="true" />
              Admin <ChevronDown size={14} aria-hidden="true" /></summary>
            <div className="toolbar-nalog-detalji">
              <strong>{admin.ime}</strong>
              <span>{admin.korisnickoIme}</span>
            </div>
          </details>
          <button type="button" className="toolbar-odjava" disabled={salje} onClick={odjava}>
            <LogOut size={18} aria-hidden="true" /> {salje ? 'Odjava…' : 'Odjavi se'}
          </button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="sidebar">
          <nav aria-label="Admin meni">
            <ul>
              {stavkeMenija.map(({ ruta, naziv, ikona: Ikona }) => <li key={ruta}>
                <a href={`#${ruta}`} aria-current={prikaz === ruta ? 'page' : undefined}>
                  <Ikona size={20} aria-hidden="true" />
                  <span>{naziv}</span>
                  {ruta === 'recenzije' && brojBezOdgovora > 0 && <span className="sidebar-broj"
                    aria-label={`Recenzije bez odgovora: ${brojBezOdgovora}`}>{brojBezOdgovora}</span>}
                </a>
              </li>)}
            </ul>
          </nav>
        </aside>
        <main className="overview">
          {prikaz === 'pregled' ? <>
          <h1 id="pregled" ref={naslovPrikaza} tabIndex={-1}>Pregled</h1>
          <p>Dobro došli, {admin.ime}.</p>

          <div className = "quick-actions">
            <button type="button" className="quick-action" aria-haspopup="dialog" onClick={() => dijalogIgrice.current?.showModal()}>
              <Gamepad2 size = {28} aria-hidden="true" />
              <span>
                <strong>Nova igrica</strong>
                <small>Dodaj novu igricu</small>
                </span>
              </button>

            <a className="quick-action" href="#igrice">
              <CalendarDays size = {28} aria-hidden = "true" />
              <span>
                <strong>Nova aktivnost</strong>
                <small>Odaberi igricu i nivo</small>
                </span>
                </a>

            <a className="quick-action" href="#recenzije?filter=bez-odgovora">
              <MessageSquareMore size={28} aria-hidden="true" />
              <span>
                <strong>Recenzije bez odgovora</strong>
                <small>Pogledaj i odgovori na komentare</small>
                </span>
                {recenzije && <span className="quick-action-broj"
                  aria-label={`${brojBezOdgovora} recenzija bez odgovora`}>{brojBezOdgovora}</span>}
                </a>
                </div>
          <section aria-labelledby = "sadrzaj-naslov">
            <h2 id = "sadrzaj-naslov">Pregled sadržaja</h2>

          <div className = "stats-grid">
            <a className="stat-card stat-card-link" href="#kategorije">
              <div className="stat-card-icon" aria-hidden="true">
                  <Layers size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{kategorije?.filter(({ idNadkategorije }) => idNadkategorije === null).length ?? '-'}</strong>
                  <span>Kategorije</span>
                </div>
              </a>

              <a className="stat-card stat-card--mint stat-card-link" href="#igrice">
                <div className="stat-card-icon" aria-hidden="true">
                  <Gamepad2 size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{stanjeIgrica === 'ucitano' ? igrice.length : '-'}</strong>
                  <span>Igrice</span>
                </div>
              </a>
              <a className="stat-card stat-card--lavanda stat-card-link" href="#igrice">
                <div className="stat-card-icon" aria-hidden="true">
                  <Layers size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{stanjeNivoa === 'ucitano' ? nivoi.length : '-'}</strong>
                  <span>Nivoi</span>
                </div>
              </a>

              <a className="stat-card stat-card--mint stat-card-link" href="#igrice">
                <div className="stat-card-icon" aria-hidden="true">
                  <CalendarDays size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{aktivnosti?.length ?? '-'}</strong>
                  <span>Aktivnosti</span>
                </div>
              </a>

              <a className="stat-card stat-card-link" href="#avatari">
                <div className="stat-card-icon" aria-hidden="true">
                  <UserRound size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{avatari?.length ?? '-'}</strong>
                  <span>Avatari</span>
                </div>
                </a>

              <a className="stat-card stat-card--zelena stat-card-link" href="#recenzije">
                <div className="stat-card-icon" aria-hidden="true">
                  <MessageSquareMore size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{recenzije?.length ?? '-'}</strong>
                  <span>Recenzije</span>
                </div>
                </a>
              </div>
              </section>
          </> : prikaz === 'avatari' ? <Avatari avatari={avatari} greska={greskaAvatara} naslovPrikaza={naslovPrikaza}
            onSacuvan={(avatar) => setAvatare((lista) => lista?.some(({ id }) => id === avatar.id)
              ? lista.map((stavka) => stavka.id === avatar.id ? avatar : stavka)
              : [...(lista ?? []), avatar])} />
          : prikaz === 'recenzije' ? <section className="recenzije">
            <header className="recenzije-zaglavlje">
              <div><h1 ref={naslovPrikaza} tabIndex={-1}>Recenzije</h1>
                <p>Pregled ocjena, komentara i odgovora korisnicima.</p></div>
              <button className="secondary" type="button" disabled={ucitavaRecenzije}
                onClick={() => setOsvjezavanjeRecenzija((broj) => broj + 1)}>
                <RefreshCw size={17} aria-hidden="true" /> {ucitavaRecenzije ? 'Učitavanje…' : 'Osvježi'}
              </button>
            </header>
            <div className="recenzije-brojaci">
              <a href="#recenzije"><MessageCircle size={19} aria-hidden="true" /><strong>{recenzije?.length ?? '–'}</strong>Ukupno recenzija</a>
              <a href="#recenzije?filter=bez-odgovora"><Clock size={19} aria-hidden="true" /><strong>{recenzije ? brojBezOdgovora : '–'}</strong>Bez odgovora</a>
              <a href="#recenzije?filter=odgovorene"><CircleCheck size={19} aria-hidden="true" /><strong>{recenzije ? recenzije.length - brojBezOdgovora : '–'}</strong>Sa odgovorom</a>
            </div>
            <div className="recenzije-lista">
            <nav className="recenzije-filteri" aria-label="Filter recenzija">
              <a href="#recenzije" aria-current={!bezOdgovora && !samoOdgovorene ? 'page' : undefined}>Sve recenzije</a>
              <a href="#recenzije?filter=bez-odgovora" aria-current={bezOdgovora ? 'page' : undefined}>Bez odgovora</a>
              <a href="#recenzije?filter=odgovorene" aria-current={samoOdgovorene ? 'page' : undefined}>Odgovorene</a>
            </nav>
            {porukaRecenzije && <p role="status">{porukaRecenzije}</p>}
            {greskaRecenzija ? <p className="error" role="alert">{greskaRecenzija}</p>
              : !prikazaneRecenzije ? <p role="status">Učitavanje recenzija…</p>
              : !prikazaneRecenzije.length ? <div className="recenzije-prazno">
                <span><MessagesSquare size={32} aria-hidden="true" /></span>
                <h2>{bezOdgovora ? 'Nema recenzija bez odgovora' : samoOdgovorene ? 'Nema odgovorenih recenzija' : 'Još nema recenzija'}</h2>
                {!bezOdgovora && !samoOdgovorene && <p>Kada korisnici ocijene igrice ili ostave komentare, njihove recenzije će se prikazati ovdje.</p>}
              </div>
              : prikazaneRecenzije.map((recenzija) => <article key={recenzija.id} className="recenzija-kartica">
                <header className="recenzije-zaglavlje">
                  <div><h2>Korisnik #{recenzija.idKorisnika}</h2>
                    <p>Igrica: {igrice?.find(({ id }) => id === recenzija.idIgrice)?.naziv ?? `#${recenzija.idIgrice}`}
                      {' · '}{new Date(recenzija.datumKreiranja).toLocaleDateString('sr-Latn-BA')}</p></div>
                  <span className={recenzija.odgovor ? 'recenzija-status odgovorena' : 'recenzija-status'}>
                    {recenzija.odgovor ? 'Odgovorena' : 'Bez odgovora'}</span>
                </header>
                <div className="recenzija-zvjezdice" role="img" aria-label={`Ocjena ${recenzija.ocjena} od 5`}>
                  {[1, 2, 3, 4, 5].map((broj) => <Star key={broj} size={20} aria-hidden="true"
                    fill={broj <= recenzija.ocjena ? 'currentColor' : 'none'} />)}
                </div>
                {recenzija.komentar && <blockquote>{recenzija.komentar}</blockquote>}
                <OdgovorNaRecenziju id={recenzija.id} odgovor={recenzija.odgovor} onSacuvan={(odgovor) => {
                  setRecenzije((lista) => lista?.map((stavka) => stavka.id === recenzija.id
                    ? { ...stavka, odgovor } : stavka) ?? null);
                  setPorukuRecenzije(odgovor ? 'Odgovor je sačuvan.' : 'Odgovor je obrisan.');
                }} />
              </article>)}
            </div>
          </section> : prikaz === 'sadrzaji' ? (
            <Sadrzaji naslovPrikaza={naslovPrikaza} />
          ) : prikaz === 'kategorije' ? <Kategorije
            key={idOtvoreneKategorije}
            naslovPrikaza={naslovPrikaza}
            idOtvoreneKategorije={idOtvoreneKategorije}
            kategorije={kategorije}
            igrice={stanjeIgrica === 'ucitano' ? igrice : null}
            greskaUcitavanja={greskaKategorija}
            onSacuvana={(kategorija) => {
              setKategorije((lista) => lista?.some(({ id }) => id === kategorija.id)
                ? lista.map((stavka) => stavka.id === kategorija.id ? kategorija : stavka)
                : [...(lista ?? []), kategorija]);
            }}
            onObrisana={(id) => setKategorije((lista) => lista?.filter((stavka) => stavka.id !== id) ?? null)}
          /> : idDetalja !== null ? otvorenaIgrica ? <DetaljiIgrice
            key={otvorenaIgrica.id}
            igrica={otvorenaIgrica}
            naslov={naslovPrikaza}
            povratak={povratakNaIgrice}
            kategorije={kategorije}
            nivoi={nivoi}
            stanjeNivoa={stanjeNivoa}
            aktivnosti={aktivnosti}
            greskaAktivnosti={greskaAktivnosti}
            porukaNivoa={porukaNivoa}
            onUredi={() => setIgricuZaUredjivanje(otvorenaIgrica)}
            onObrisi={() => setIgricuZaBrisanje(otvorenaIgrica)}
            onAkcijaNivoa={(akcija) => {
              setPorukaNivoa('');
              setZahtjevNivoa({ igrica: otvorenaIgrica, akcija });
            }}
            onSacuvanaAktivnost={(aktivnost) => setAktivnosti((lista) =>
              [...(lista ?? []).filter(({ id }) => id !== aktivnost.id), aktivnost])}
            onObrisanaAktivnost={(id) => setAktivnosti((lista) =>
              lista?.filter((aktivnost) => aktivnost.id !== id) ?? null)}
          /> : <section>
            <a href={povratakNaIgrice}>Nazad na igrice</a>
            <h1 ref={naslovPrikaza} tabIndex={-1}>Detalji igrice</h1>
            {stanjeIgrica === 'ucitavanje' && <p role="status">Učitavanje igrice…</p>}
            {stanjeIgrica === 'greska' && <p role="alert">Učitavanje igrice nije uspjelo.</p>}
            {stanjeIgrica === 'ucitano' && <p>Igrica nije pronađena.</p>}
          </section> : <PregledIgrica
            naslovPrikaza={naslovPrikaza}
            igrice={igrice}
            kategorije={kategorije}
            nivoi={stanjeNivoa === 'ucitano' ? nivoi : null}
            aktivnosti={aktivnosti}
            stanje={stanjeIgrica}
            filterKategorije={idKategorije}
            filterPotkategorije={filterPotkategorije}
            porukaIgrice={kreiranaIgrica}
            porukaNivoa={porukaNivoa}
            onNovaIgrica={() => dijalogIgrice.current?.showModal()}
            onUredi={setIgricuZaUredjivanje}
            onObrisi={setIgricuZaBrisanje}
          />}
          {zahtjevNivoa && <NivoDijalog
            akcija={zahtjevNivoa.akcija}
            idIgrice={zahtjevNivoa.igrica.id}
            nazivIgrice={zahtjevNivoa.igrica.naziv}
            onZatvori={() => setZahtjevNivoa(null)}
            onSacuvan={(nivo) => {
              setNivoe((trenutni) => [...trenutni.filter(({ id }) => id !== nivo.id), nivo]);
              setPorukaNivoa(zahtjevNivoa.akcija.vrsta === 'dodaj'
                ? `Nivo „${nivo.naziv}” dodat je u igricu „${zahtjevNivoa.igrica.naziv}”.`
                : `Izmjene nivoa „${nivo.naziv}” su sačuvane.`);
            }}
            onObrisan={(nivo) => {
              setNivoe((trenutni) => trenutni.filter(({ id }) => id !== nivo.id));
              setPorukaNivoa(`Nivo „${nivo.naziv}” je obrisan.`);
            }}
          />}
          <NovaIgrica
            dijalog={dijalogIgrice}
            pocetnaKategorija={odabranaPotkategorija?.id}
            kategorije={kategorije}
            greskaKategorija={greskaKategorija}
            onKreirana={(igrica) => {
              setIgrice((lista) => [igrica, ...lista.filter(({ id }) => id !== igrica.id)]);
              setKreiranaIgrica(igrica.naziv);
            }}
          />
          {igricaZaUredjivanje && <NovaIgrica
            dijalog={dijalogUredjivanja}
            igricaZaUredjivanje={igricaZaUredjivanje}
            kategorije={kategorije}
            greskaKategorija={greskaKategorija}
            onKreirana={(igrica) => setIgrice((lista) => lista.map((stavka) =>
              stavka.id === igrica.id ? igrica : stavka))}
            onZatvori={() => setIgricuZaUredjivanje(null)}
          />}
          {igricaZaBrisanje && <ObrisiIgricu igrica={igricaZaBrisanje}
            onZatvori={() => setIgricuZaBrisanje(null)}
            onObrisana={(id) => {
              const obrisaniNivoi = new Set(nivoi.filter(({ idIgrice }) => idIgrice === id).map((nivo) => nivo.id));
              setIgrice((lista) => lista.filter((igrica) => igrica.id !== id));
              setNivoe((lista) => lista.filter(({ idIgrice }) => idIgrice !== id));
              setAktivnosti((lista) => lista?.filter(({ idNivoa }) => !obrisaniNivoi.has(idNivoa)) ?? null);
              setKreiranaIgrica('');
              setPorukaNivoa('');
              if (idDetalja === id) window.location.hash = povratakNaIgrice;
            }}
          />}
          {greska && <p className="error" role="alert">{greska}</p>}
        </main>
      </div>
    </>;
  }

  return <main className="login">
    <div className="login-bottom-wave" aria-hidden="true" />
    <Brend />
    <section className="card" aria-labelledby="login-title">
      <div className="login-icon" aria-hidden="true">
        <img src="/login-user-badge.png" alt="" />
      </div>
      <h1 id="login-title">Prijava administratora</h1>
      {provjera ? <p role="status">Provjera sesije…</p> : <form onSubmit={prijava}>
        <label htmlFor="username"><UserRound size={18} aria-hidden="true" />Korisničko ime</label>
        <input id="username" name="korisnickoIme" autoComplete="username" required maxLength={100} />
        <label htmlFor="password"><LockKeyhole size={18} aria-hidden="true" />Lozinka</label>
        <div className="password">
          <input id="password" name="lozinka" type={prikaziLozinku ? 'text' : 'password'}
            autoComplete="current-password" required maxLength={72} />
          <button type="button" className="toggle"
            aria-label={prikaziLozinku ? 'Sakrij lozinku' : 'Prikaži lozinku'}
            onClick={() => setPrikaziLozinku(!prikaziLozinku)}>
            {prikaziLozinku ? <Eye size={20} aria-hidden="true" /> : <EyeOff size={20} aria-hidden="true" />}
          </button>
        </div>
        {greska && <p className="error" role="alert">{greska}</p>}
        <button className="primary" type="submit" disabled={salje}>
          <LogIn size={20} aria-hidden="true" />
          {salje ? 'Prijava…' : 'Prijavi se'}
        </button>
        {provjeraNeuspjela && <button type="button" className="secondary retry" disabled={salje} onClick={() => {
          setGreska('');
          setProvjeraNeuspjela(false);
          setProvjera(true);
          setPokusaj(pokusaj + 1);
        }}>Ponovo provjeri sesiju</button>}
      </form>}
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
