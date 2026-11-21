import { useState, type FormEvent, type RefObject } from 'react';
import { Blocks, Calculator, Gamepad2, Shapes, Trophy } from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';
import type { Kategorija } from './kategorije';

export type Igrica = {
  id: number;
  idKategorije: number;
  naziv: string;
  opis: string | null;
  status: string;
  minimalniUzrast: number;
  maksimalniUzrast: number;
};

const izgledIgrice = new Map([
  ['avantura brojeva', { Ikona: Blocks, boja: 'zuta' }],
  ['brojčana misija', { Ikona: Calculator, boja: 'mint' }],
  ['geometrijski svemir', { Ikona: Shapes, boja: 'lavanda' }],
  ['logički izazov', { Ikona: Trophy, boja: 'roze' }],
]);

export function izgledZaIgricu(naziv: string) {
  return izgledIgrice.get(naziv.toLocaleLowerCase()) ?? { Ikona: Gamepad2, boja: 'mint' };
}

export function oznakaStatusa(status: string) {
  return status === 'NACRT' ? 'Nacrt' : status === 'AKTIVNA' ? 'Aktivna'
    : status === 'NEAKTIVNA' ? 'Neaktivna' : status;
}

type NovaIgricaProps = {
  dijalog: RefObject<HTMLDialogElement | null>;
  pocetnaKategorija?: number;
  igricaZaUredjivanje?: Igrica;
  kategorije: Kategorija[] | null;
  greskaKategorija: boolean;
  onKreirana: (igrica: Igrica) => void;
  onZatvori?: () => void;
};

export function NovaIgrica({
  dijalog, pocetnaKategorija, igricaZaUredjivanje, kategorije, greskaKategorija, onKreirana, onZatvori,
}: NovaIgricaProps) {
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState('');

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;

    const forma = event.currentTarget;
    const podaci = new FormData(forma);
    const naziv = String(podaci.get('naziv')).trim();
    const minimalniUzrast = Number(podaci.get('minimalniUzrast'));
    const maksimalniUzrast = Number(podaci.get('maksimalniUzrast'));

    if (!naziv || maksimalniUzrast < minimalniUzrast) {
      setGreska(naziv ? 'Maksimalni uzrast ne smije biti manji od minimalnog.' : 'Unesite naziv igrice.');
      return;
    }

    setGreska('');
    setSalje(true);
    try {
      const putanja = igricaZaUredjivanje ? `/api/igrice/${igricaZaUredjivanje.id}` : '/api/igrice';
      const odgovor = await posaljiAdminZahtjev(igricaZaUredjivanje ? 'PUT' : 'POST', putanja, {
        naziv,
        idKategorije: Number(podaci.get('idKategorije')),
        opis: String(podaci.get('opis')).trim() || null,
        status: igricaZaUredjivanje?.status ?? 'NACRT',
        minimalniUzrast,
        maksimalniUzrast,
      });
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        throw new Error(
          (problem?.greske && Object.values(problem.greske).join(' ')) ||
          problem?.detail || 'Čuvanje igrice nije uspjelo. Pokušajte ponovo.',
        );
      }
      const igrica: Igrica = await odgovor.json();
      onKreirana(igrica);
      dijalog.current?.close();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Čuvanje igrice nije uspjelo.');
    } finally {
      setSalje(false);
    }
  }

  return <dialog
    ref={dijalog}
    className="admin-dijalog"
    aria-label={igricaZaUredjivanje ? 'Uredi igricu' : 'Nova igrica'}
    onCancel={(event) => { if (salje) event.preventDefault(); }}
    onClose={() => {
      dijalog.current?.querySelector('form')?.reset();
      setGreska('');
      onZatvori?.();
    }}
  >
    <h2>{igricaZaUredjivanje ? 'Uredi igricu' : 'Nova igrica'}</h2>
    <form onSubmit={sacuvaj}>
      <label>Naziv
        <input name="naziv" defaultValue={igricaZaUredjivanje?.naziv} required maxLength={200} autoFocus />
      </label>
      <label>Kategorija
      <select key={pocetnaKategorija ?? ''} name="idKategorije"
        defaultValue={igricaZaUredjivanje?.idKategorije ?? pocetnaKategorija ?? ''} required disabled={!kategorije?.length}>
        <option value="" disabled>Odaberite kategoriju</option>
        {kategorije?.map(({ id, naziv }) => <option key={id} value={id}>{naziv}</option>)}
      </select>
      </label>
      {greskaKategorija && <p className="error" role="alert">Kategorije se nisu učitale. Osvježite stranicu i pokušajte ponovo.</p>}
      {!greskaKategorija && kategorije === null && <p role="status">Učitavanje kategorija…</p>}
      {kategorije?.length === 0 && <p role="status">Za novu igricu potrebna je barem jedna kategorija.</p>}
      <label>Opis (opcionalno)
        <textarea name="opis" defaultValue={igricaZaUredjivanje?.opis ?? ''} rows={3} maxLength={2000} />
      </label>
      <div className="uzrasti">
        <div>
          <label>Minimalni uzrast
            <input name="minimalniUzrast" defaultValue={igricaZaUredjivanje?.minimalniUzrast} type="number" min={0} max={2147483647} required />
          </label>
        </div>
        <div>
          <label>Maksimalni uzrast
            <input name="maksimalniUzrast" defaultValue={igricaZaUredjivanje?.maksimalniUzrast} type="number" min={0} max={2147483647} required />
          </label>
        </div>
      </div>
      {greska && <p className="error" role="alert">{greska}</p>}
      <div className="nova-igrica-akcije">
        <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
        <button type="submit" className="primary" disabled={salje || !kategorije?.length}>
          {salje ? 'Čuvanje…' : igricaZaUredjivanje ? 'Sačuvaj izmjene' : 'Sačuvaj nacrt'}
        </button>
      </div>
    </form>
  </dialog>;
}
