import { useEffect, useRef, useState, type FormEvent } from 'react';
import { posaljiAdminZahtjev } from './auth';

export type Aktivnost = {
  id: number;
  idNivoa: number;
  idTipa: number;
  redniBroj: number;
  uputstvo: string | null;
  tezina: 'LAKO' | 'SREDNJE' | 'TESKO';
  brojBodova: number;
};

export type TipAktivnosti = { id: number; oznaka: string; naziv: string };

type AktivnostDijalogProps = {
  akcija: { vrsta: 'dodaj' } | { vrsta: 'uredi' | 'obrisi'; aktivnost: Aktivnost };
  idNivoa: number;
  nazivNivoa: string;
  sljedeciBroj: number;
  tipovi: TipAktivnosti[] | null;
  onSacuvana: (aktivnost: Aktivnost) => void;
  onObrisana: (id: number) => void;
  onZatvori: () => void;
};

export function AktivnostDijalog({
  akcija, idNivoa, nazivNivoa, sljedeciBroj, tipovi, onSacuvana, onObrisana, onZatvori,
}: AktivnostDijalogProps) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState('');
  const aktivnost = akcija.vrsta === 'dodaj' ? null : akcija.aktivnost;
  const brise = akcija.vrsta === 'obrisi';
  const naslov = brise ? 'Obriši aktivnost' : aktivnost ? 'Uredi aktivnost' : 'Dodaj aktivnost';

  useEffect(() => {
    if (!dijalog.current?.open) dijalog.current?.showModal();
  }, []);

  async function potvrdi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;
    const podaci = new FormData(event.currentTarget);
    setGreska('');
    setSalje(true);

    try {
      const putanja = aktivnost ? `/api/aktivnosti/${aktivnost.id}` : '/api/aktivnosti';
      const odgovor = brise
        ? await posaljiAdminZahtjev('DELETE', putanja)
        : await posaljiAdminZahtjev(aktivnost ? 'PUT' : 'POST', putanja, {
          idNivoa,
          idTipa: Number(podaci.get('idTipa')),
          redniBroj: Number(podaci.get('redniBroj')),
          uputstvo: String(podaci.get('uputstvo') ?? '').trim() || null,
          tezina: podaci.get('tezina'),
          brojBodova: Number(podaci.get('brojBodova')),
        });
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        throw new Error(Object.values(problem?.greske ?? {}).join(' ') || problem?.detail
          || (brise ? 'Brisanje aktivnosti nije uspjelo.' : 'Čuvanje aktivnosti nije uspjelo.'));
      }
      if (akcija.vrsta === 'obrisi') onObrisana(akcija.aktivnost.id);
      else onSacuvana(await odgovor.json());
      dijalog.current?.close();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Zahtjev nije uspio.');
    } finally {
      setSalje(false);
    }
  }

  return <dialog ref={dijalog} className="admin-dijalog" aria-label={naslov} onClose={onZatvori}
    onCancel={(event) => { if (salje) event.preventDefault(); }}>
    <h2>{naslov}</h2>
    <p>Nivo: <strong>{nazivNivoa}</strong></p>
    <form onSubmit={potvrdi}>
      {brise ? <p>Želiš li obrisati aktivnost broj {aktivnost?.redniBroj}?</p> : <>
        <label>Tip aktivnosti
          <select name="idTipa" defaultValue={aktivnost?.idTipa ?? ''} required>
            <option value="" disabled>Odaberite tip</option>
            {tipovi?.map(({ id, naziv }) => <option key={id} value={id}>{naziv}</option>)}
          </select>
        </label>
        <label>Uputstvo
          <textarea name="uputstvo" maxLength={1000} rows={3} defaultValue={aktivnost?.uputstvo ?? ''} />
        </label>
        <label>Težina
          <select name="tezina" defaultValue={aktivnost?.tezina ?? 'LAKO'}>
            <option value="LAKO">Lako</option>
            <option value="SREDNJE">Srednje</option>
            <option value="TESKO">Teško</option>
          </select>
        </label>
        <div className="uzrasti">
          <label>Redni broj
            <input name="redniBroj" type="number" min={1} max={2147483647} required
              defaultValue={aktivnost?.redniBroj ?? sljedeciBroj} />
          </label>
          <label>Bodovi
            <input name="brojBodova" type="number" min={0} max={2147483647} required
              defaultValue={aktivnost?.brojBodova ?? 0} />
          </label>
        </div>
      </>}
      {greska && <p className="error" role="alert">{greska}</p>}
      <div className="nova-igrica-akcije">
        <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
        <button type="submit" className={brise ? 'primary opasna-akcija' : 'primary'}
          disabled={salje || (!brise && !tipovi?.length)}>
          {salje ? (brise ? 'Brisanje…' : 'Čuvanje…') : brise ? 'Obriši' : 'Sačuvaj'}
        </button>
      </div>
    </form>
  </dialog>;
}
