import { useEffect, useRef, useState, type FormEvent } from 'react';
import { posaljiAdminZahtjev } from './auth';

export type Nivo = {
  id: number;
  idIgrice: number;
  naziv: string;
  redniBroj: number;
  bodoviZaOtkljucavanje: number;
};

export type AkcijaNivoa = { vrsta: 'dodaj' } | { vrsta: 'uredi' | 'obrisi'; nivo: Nivo };

type NivoDijalogProps = {
  akcija: AkcijaNivoa;
  idIgrice: number;
  nazivIgrice: string;
  onSacuvan: (nivo: Nivo) => void;
  onObrisan: (nivo: Nivo) => void;
  onZatvori: () => void;
};

export function NivoDijalog({ akcija, idIgrice, nazivIgrice, onSacuvan, onObrisan, onZatvori }: NivoDijalogProps) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState('');
  const nivo = akcija.vrsta === 'dodaj' ? null : akcija.nivo;
  const brise = akcija.vrsta === 'obrisi';
  const naslov = brise ? 'Obriši nivo' : nivo ? 'Uredi nivo' : 'Dodaj nivo';
  const porukaGreske = brise ? 'Brisanje nivoa nije uspjelo.' : 'Čuvanje nivoa nije uspjelo.';

  useEffect(() => {
    dijalog.current?.showModal();
  }, []);

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;

    const podaci = new FormData(event.currentTarget);
    const naziv = String(podaci.get('naziv') ?? '').trim();

    if (!brise && !naziv) {
      setGreska('Unesite naziv nivoa.');
      return;
    }

    setGreska('');
    setSalje(true);
    try {
      const putanja = nivo ? `/api/nivoi/${nivo.id}` : '/api/nivoi';
      const odgovor = brise ? await posaljiAdminZahtjev('DELETE', putanja)
        : await posaljiAdminZahtjev(nivo ? 'PUT' : 'POST', putanja, {
        idIgrice,
        naziv,
        redniBroj: Number(podaci.get('redniBroj')),
        bodoviZaOtkljucavanje: Number(podaci.get('bodoviZaOtkljucavanje')),
      });
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (brise && odgovor.status === 409) {
        throw new Error('Nivo nije moguće obrisati dok ima povezane aktivnosti ili pokušaje igranja.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        const greskePolja = Object.values(problem?.greske ?? {}).join(' ');
        throw new Error(
          greskePolja || problem?.detail || porukaGreske,
        );
      }

      if (akcija.vrsta === 'obrisi') onObrisan(akcija.nivo);
      else onSacuvan(await odgovor.json());
      dijalog.current?.close();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : porukaGreske);
    } finally {
      setSalje(false);
    }
  }

  return (
    <dialog
      ref={dijalog}
      className="admin-dijalog"
      aria-labelledby="dodaj-nivo-naslov"
      aria-describedby="dodaj-nivo-igrica"
      onCancel={(event) => { if (salje) event.preventDefault(); }}
      onClose={onZatvori}
    >
      <h2 id="dodaj-nivo-naslov">{naslov}</h2>
      <p id="dodaj-nivo-igrica">Igrica: <strong>{nazivIgrice}</strong></p>
      <form onSubmit={sacuvaj}>
        {brise ? <p>Želiš li obrisati nivo „{nivo?.naziv}”?</p> : <>
        <label htmlFor="nivo-redni-broj">Redni broj</label>
        <input
          id="nivo-redni-broj"
          name="redniBroj"
          type="number"
          min={1}
          max={2147483647}
          step={1}
          defaultValue={nivo?.redniBroj}
          required
        />

        <label htmlFor="nivo-naziv">Naziv nivoa</label>
        <input id="nivo-naziv" name="naziv" defaultValue={nivo?.naziv} maxLength={150} required />

        <label htmlFor="nivo-bodovi">Bodovi za otključavanje</label>
        <input
          id="nivo-bodovi"
          name="bodoviZaOtkljucavanje"
          type="number"
          min={0}
          max={2147483647}
          step={1}
          defaultValue={nivo?.bodoviZaOtkljucavanje ?? 0}
          required
        />
        </>}

        {greska && <p className="error" role="alert">{greska}</p>}
        <div className="nova-igrica-akcije">
          <button type="button" className="secondary" autoFocus={brise} disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
          <button type="submit" className={brise ? 'primary opasna-akcija' : 'primary'} disabled={salje}>
            {brise ? (salje ? 'Brisanje…' : 'Obriši nivo') : (salje ? 'Čuvanje…' : 'Sačuvaj nivo')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
