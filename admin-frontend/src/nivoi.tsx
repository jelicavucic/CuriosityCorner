import { useEffect, useRef, useState, type FormEvent } from 'react';
import { posaljiAdminPost } from './auth';

export type Nivo = { id: number; idIgrice: number; naziv: string; redniBroj: number };

type DodajNivoProps = {
  idIgrice: number;
  nazivIgrice: string;
  onSacuvan: (nivo: Nivo) => void;
  onZatvori: () => void;
};

export function DodajNivo({ idIgrice, nazivIgrice, onSacuvan, onZatvori }: DodajNivoProps) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState('');

  useEffect(() => {
    dijalog.current?.showModal();
  }, []);

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;

    const podaci = new FormData(event.currentTarget);
    const naziv = String(podaci.get('naziv') ?? '').trim();

    if (!naziv) {
      setGreska('Unesite naziv nivoa.');
      return;
    }

    setGreska('');
    setSalje(true);
    try {
      const odgovor = await posaljiAdminPost('/api/nivoi', {
        idIgrice,
        naziv,
        redniBroj: Number(podaci.get('redniBroj')),
        bodoviZaOtkljucavanje: Number(podaci.get('bodoviZaOtkljucavanje')),
      });
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        const greskePolja = Object.values(problem?.greske ?? {}).join(' ');
        throw new Error(
          greskePolja || problem?.detail || 'Čuvanje nivoa nije uspjelo.',
        );
      }

      const nivo: Nivo = await odgovor.json();
      dijalog.current?.close();
      onSacuvan(nivo);
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Čuvanje nivoa nije uspjelo.');
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
      <h2 id="dodaj-nivo-naslov">Dodaj nivo</h2>
      <p id="dodaj-nivo-igrica">Igrica: <strong>{nazivIgrice}</strong></p>
      <form onSubmit={sacuvaj}>
        <label htmlFor="nivo-redni-broj">Redni broj</label>
        <input
          id="nivo-redni-broj"
          name="redniBroj"
          type="number"
          min={1}
          max={2147483647}
          step={1}
          required
        />

        <label htmlFor="nivo-naziv">Naziv nivoa</label>
        <input id="nivo-naziv" name="naziv" maxLength={150} required />

        <label htmlFor="nivo-bodovi">Bodovi za otključavanje</label>
        <input
          id="nivo-bodovi"
          name="bodoviZaOtkljucavanje"
          type="number"
          min={0}
          max={2147483647}
          step={1}
          defaultValue={0}
          required
        />

        {greska && <p className="error" role="alert">{greska}</p>}
        <div className="nova-igrica-akcije">
          <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
          <button type="submit" className="primary" disabled={salje}>
            {salje ? 'Čuvanje…' : 'Sačuvaj nivo'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
