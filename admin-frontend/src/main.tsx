import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { odjaviSe, prijaviSe, provjeriSesiju, type Administrator } from './auth';
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from 'lucide-react';
import './style.css';

function Brend() {
  return <div className="brand"><img src="/logo-mark.png" alt="" />CuriosityCorner</div>;
}

function App() {
  const [admin, setAdmin] = useState<Administrator | null>(null);
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
      <main className="overview">
        <h1>Pregled</h1>
        <p>Dobro došli, {admin.ime}.</p>
        {greska && <p className="error" role="alert">{greska}</p>}
      </main>
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
