import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { odjaviSe, prijaviSe, provjeriSesiju, type Administrator } from './auth';
import { CalendarDays, Eye, EyeOff, Gamepad2, Layers, LockKeyhole, LogIn, MessageSquareMore, UserRound } from 'lucide-react';
import './style.css';
import { NovaIgrica, type Igrica } from './igrice';
import { Kategorije, type Kategorija } from './kategorije';
import { DodajNivo, type Nivo } from './nivoi';
import { PregledIgrica } from './pregled-igrica';

function Brend() {
  return <div className="brand"><img src="/logo-mark.png" alt="" />CuriosityCorner</div>;
}

function App() {
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [adresa, setAdresa] = useState(() => window.location.hash);
  const [ruta, upit] = adresa.slice(1).split('?');
  const prikaz = ruta === 'igrice' || ruta === 'kategorije' ? ruta : 'pregled';
  const parametri = new URLSearchParams(upit);
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
  const [nivoi, setNivoe] = useState<Nivo[]>([]);
  const [stanjeNivoa, setStanjeNivoa] = useState<'ucitavanje' | 'ucitano' | 'greska'>('ucitavanje');
  const [igricaZaNivo, setIgricaZaNivo] = useState<Igrica | null>(null);
  const [porukaNivoa, setPorukaNivoa] = useState('');
  const [aktivnosti, setAktivnosti] = useState<{ idNivoa: number }[] | null>(null);
  const [brojAvatara, setBrojAvatara] = useState<number | null>(null);
  const [brojRecenzija, setBrojRecenzija] = useState<number | null>(null);
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
  }, [prikaz, idOtvoreneKategorije]);

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

      .then((podaci: { idNivoa: number }[]) => {
        if (!zahtjev.signal.aborted) setAktivnosti(podaci);
      })
      .catch((greska) => {
        if(!zahtjev.signal.aborted) console.error(greska);
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
  .then((avatari) => setBrojAvatara(avatari.length))
    .catch((greska) => {
      if(!zahtjev.signal.aborted) console.error(greska);
    });
  }, [admin]);

  useEffect(() =>{ 
    if (!admin) return;

    const zahtjev = new AbortController();
    
    fetch('/api/admin/recenzije', { signal: zahtjev.signal })
  .then((odgovor) => {
    if (!odgovor.ok) throw new Error('Učitavanje recenzija nije uspjelo.');
    return odgovor.json();
  })
  .then((recenzije) => setBrojRecenzija(recenzije.length))
    .catch((greska) => {
      if(!zahtjev.signal.aborted) console.error(greska);
    });
  }, [admin]);

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
      setIgricaZaNivo(null);
      setPorukaNivoa('');
      setNivoe([]);
      setStanjeNivoa('ucitavanje');
      setKategorije(null);
      setGreskaKategorija(false);
      setIgrice([]);
      setAktivnosti(null);
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
        <button className="secondary" disabled={salje} onClick={odjava}>
          {salje ? 'Odjava…' : 'Odjavi se'}
        </button>
      </header>
      <div className="admin-layout">
        <aside className="sidebar">
          <nav aria-label="Admin meni">
            <ul>
              <li><a href="#pregled" aria-current={prikaz === 'pregled' ? 'page' : undefined}>Pregled</a></li>
              <li><a href="#kategorije" aria-current={prikaz === 'kategorije' ? 'page' : undefined}>Kategorije</a></li>
              <li><a href="#igrice" aria-current={prikaz === 'igrice' ? 'page' : undefined}>Igrice</a></li>
              <li>Sadržaji</li>
              <li>Avatari</li>
              <li>Recenzije</li>
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

            <button type = "button" className = "quick-action" disabled>
              <CalendarDays size = {28} aria-hidden = "true" />
              <span>
                <strong>Nova aktivnost</strong>
                <small>Dodaj aktivnost u postojeću igricu</small>
                </span>
                </button>

            <button type = "button" className = "quick-action" disabled>
              <MessageSquareMore size={28} aria-hidden = "true" />
              <span>
                <strong>Recenzije bez odgovora</strong>
                <small>Pogledaj komentare koji čekaju odgovor</small>
                </span>
                </button>
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
              <div className = "stat-card stat-card--lavanda">
                <div className="stat-card-icon" aria-hidden="true">
                  <Layers size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{stanjeNivoa === 'ucitano' ? nivoi.length : '-'}</strong>
                  <span>Nivoi</span>
                </div>
              </div>

              <div className = "stat-card stat-card--mint">
                <div className="stat-card-icon" aria-hidden="true">
                  <CalendarDays size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{aktivnosti?.length ?? '-'}</strong>
                  <span>Aktivnosti</span>
                </div>
              </div>

              <div className = "stat-card">
                <div className="stat-card-icon" aria-hidden="true">
                  <UserRound size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojAvatara ?? '-'}</strong>
                  <span>Avatari</span>
                </div>
                </div>

              <div className = "stat-card stat-card--zelena">
                <div className="stat-card-icon" aria-hidden="true">
                  <MessageSquareMore size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojRecenzija ?? '-'}</strong>
                  <span>Recenzije</span>
                </div>
                </div>
              </div>
              </section>

          </> : prikaz === 'kategorije' ? <Kategorije
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
          /> : <PregledIgrica
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
            onDodajNivo={(igrica) => {
              setPorukaNivoa('');
              setIgricaZaNivo(igrica);
            }}
          />}
          {igricaZaNivo && <DodajNivo
            idIgrice={igricaZaNivo.id}
            nazivIgrice={igricaZaNivo.naziv}
            onZatvori={() => setIgricaZaNivo(null)}
            onSacuvan={(nivo) => {
              setNivoe((trenutni) => [...trenutni.filter(({ id }) => id !== nivo.id), nivo]);
              setPorukaNivoa(`Nivo „${nivo.naziv}” dodat je u igricu „${igricaZaNivo.naziv}”.`);
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
