import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { odjaviSe, prijaviSe, provjeriSesiju, type Administrator } from './auth';
import { CalendarDays, Eye, EyeOff, Gamepad2, Layers, LockKeyhole, LogIn, MessageSquareMore, UserRound } from 'lucide-react';
import './style.css';

function Brend() {
  return <div className="brand"><img src="/logo-mark.png" alt="" />CuriosityCorner</div>;
}

function App() {
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [brojKategorija, setBrojKategorija] = useState<number | null>(null);
  const [brojIgrica, setBrojIgrica] = useState<number | null>(null);
  const [brojNivoa, setBrojNivoa] = useState<number | null>(null);
  const [brojAktivnosti, setBrojAktivnosti] = useState<number | null>(null);
  const [brojAvatara, setBrojAvatara] = useState<number | null>(null);
  const [brojRecenzija, setBrojRecenzija] = useState<number | null>(null);
  const [provjera, setProvjera] = useState(true);
  const [pokusaj, setPokusaj] = useState(0);
  const [provjeraNeuspjela, setProvjeraNeuspjela] = useState(false);
  const [greska, setGreska] = useState('');
  const [salje, setSalje] = useState(false);
  const [prikaziLozinku, setPrikaziLozinku] = useState(false);

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
      .then((kategorije: { idNadkategorije: number | null }[]) => {
        const glavneKategorije = kategorije.filter((kategorija) => kategorija.idNadkategorije === null);
        setBrojKategorija(glavneKategorije.length);
      })
      .catch((greska) => {
        if (!zahtjev.signal.aborted) console.error(greska);
      });

    return () => zahtjev.abort();
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/igrice', { signal : zahtjev.signal })
      .then((odgovor) => {
        if(!odgovor.ok) throw new Error('Učitavanje igrica nije uspjelo.');
        return odgovor.json();
      })
      .then((igrice) => setBrojIgrica(igrice.length))
      .catch((greska) => {
        if(!zahtjev.signal.aborted) console.error(greska);
  });
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/nivoi', { signal : zahtjev.signal })
      .then((odgovor) => {
        if(!odgovor.ok) throw new Error('Učitavanje nivoa nije uspjelo.');
        return odgovor.json();
      })
      .then((nivoi) => setBrojNivoa(nivoi.length))
      .catch((greska) => {
        if(!zahtjev.signal.aborted) console.error(greska);
      });
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const zahtjev = new AbortController();

    fetch('/api/aktivnosti', { signal : zahtjev.signal })
      .then((odgovor) => {
        if(! odgovor.ok) throw new Error('Ucitavanje aktivnosti nije uspjelo.');
        return odgovor.json();
      })

      .then((aktivnosti) => setBrojAktivnosti(aktivnosti.length))
      .catch((greska) => {
        if(!zahtjev.signal.aborted) console.error(greska);
      });
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
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Odjava nije uspjela.');
    } finally {
      setSalje(false);
    }
  }

  if (admin) {
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
              <li className="sidebar-active">Pregled</li>
              <li>Kategorije</li>
              <li>Igrice</li>
              <li>Sadržaji</li>
              <li>Avatari</li>
              <li>Recenzije</li>
            </ul>
          </nav>
        </aside>
        <main className="overview">
          <h1>Pregled</h1>
          <p>Dobro došli, {admin.ime}.</p>

          <div className = "quick-actions">
            <button type = "button" className = "quick-action" disabled>
              <Gamepad2 size = {28} aria-hidden="true" />
              <span>
                <strong>Nova igrica</strong>
                <small>Dodaj igricu i njene nivoe</small>
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
            <div className = "stat-card">
              <div className="stat-card-icon" aria-hidden="true">
                  <Layers size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojKategorija ?? '-'}</strong>
                  <span>Kategorije</span>
                </div>
              </div>

              <div className = "stat-card stat-card--mint">
                <div className="stat-card-icon" aria-hidden="true">
                  <Gamepad2 size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojIgrica ?? '-'}</strong>
                  <span>Igrice</span>
                </div>
              </div>
              <div className = "stat-card stat-card--lavanda">
                <div className="stat-card-icon" aria-hidden="true">
                  <Layers size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojNivoa ?? '-'}</strong>
                  <span>Nivoi</span>
                </div>
              </div>

              <div className = "stat-card stat-card--mint">
                <div className="stat-card-icon" aria-hidden="true">
                  <CalendarDays size={28} />
                </div>
                <div className="stat-card-text">
                  <strong>{brojAktivnosti ?? '-'}</strong>
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
