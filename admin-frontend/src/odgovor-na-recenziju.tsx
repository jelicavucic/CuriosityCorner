import { useEffect, useRef, useState, type FormEvent } from 'react';
import { posaljiAdminZahtjev } from './auth';
import { CornerDownRight } from 'lucide-react';

export type OdgovorRecenzije = { tekstOdgovora: string };

export function OdgovorNaRecenziju({ id, odgovor, onSacuvan }: {
  id: number;
  odgovor: OdgovorRecenzije | null;
  onSacuvan: (odgovor: OdgovorRecenzije | null) => void;
}) {
  const [otvoren, setOtvoren] = useState(false);
  const [brise, setBrise] = useState(false);
  const [greskaBrisanja, setGreskuBrisanja] = useState('');

  async function obrisi() {
    if (brise || !window.confirm('Obrisati administratorski odgovor na ovu recenziju?')) return;
    setBrise(true);
    setGreskuBrisanja('');
    try {
      const rezultat = await posaljiAdminZahtjev('DELETE', `/api/admin/recenzije/${id}/odgovor`);
      if (!rezultat.ok) {
        const problem = await rezultat.json().catch(() => null);
        throw new Error(problem?.detail || `Brisanje odgovora nije uspjelo (HTTP ${rezultat.status}).`);
      }
      onSacuvan(null);
    } catch (error) {
      setGreskuBrisanja(error instanceof Error ? error.message : 'Brisanje odgovora nije uspjelo.');
    } finally {
      setBrise(false);
    }
  }

  return <>
    {odgovor && <p className="recenzija-odgovor"><strong>Odgovor</strong><br />{odgovor.tekstOdgovora}</p>}
    {greskaBrisanja && <p className="error" role="alert">{greskaBrisanja}</p>}
    <div className="recenzija-akcije">
    {odgovor && <button type="button" className="secondary" disabled={brise} onClick={obrisi}>
      {brise ? 'Brisanje…' : 'Obriši odgovor'}
    </button>}
    <button type="button" className="primary" aria-haspopup="dialog" disabled={brise} onClick={() => setOtvoren(true)}>
      <CornerDownRight size={17} aria-hidden="true" />
      {odgovor ? 'Uredi odgovor' : 'Odgovori'}
    </button>
    </div>
    {otvoren && <DijalogOdgovora id={id} odgovor={odgovor} onSacuvan={onSacuvan} onZatvori={() => setOtvoren(false)} />}
  </>;
}

function DijalogOdgovora({ id, odgovor, onSacuvan, onZatvori }: {
  id: number;
  odgovor: OdgovorRecenzije | null;
  onSacuvan: (odgovor: OdgovorRecenzije) => void;
  onZatvori: () => void;
}) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const [tekst, setTekst] = useState(odgovor?.tekstOdgovora ?? '');
  const [salje, setSalje] = useState(false);
  const [greska, setGresku] = useState('');
  const naslov = odgovor ? 'Uredi odgovor' : 'Odgovori na recenziju';

  useEffect(() => { dijalog.current?.showModal(); }, []);

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tekstOdgovora = tekst.trim();
    if (!tekstOdgovora || salje) return;
    setSalje(true);
    setGresku('');
    try {
      const rezultat = await posaljiAdminZahtjev('PUT', `/api/admin/recenzije/${id}/odgovor`, { tekstOdgovora });
      const podaci = await rezultat.json().catch(() => null);
      if (!rezultat.ok) {
        throw new Error(Object.values(podaci?.greske ?? {}).join(' ') || podaci?.detail
          || `Čuvanje odgovora nije uspjelo (HTTP ${rezultat.status}).`);
      }
      if (typeof podaci?.tekstOdgovora !== 'string') throw new Error('Server nije vratio odgovor na recenziju.');
      dijalog.current?.close();
      onSacuvan(podaci);
    } catch (error) {
      setGresku(error instanceof Error ? error.message : 'Čuvanje odgovora nije uspjelo.');
    } finally {
      setSalje(false);
    }
  }

  return <dialog ref={dijalog} className="admin-dijalog recenzija-dijalog" aria-label={naslov} onClose={onZatvori}
    onCancel={(event) => { if (salje) event.preventDefault(); }}>
    <h2>{naslov}</h2>
    <form onSubmit={sacuvaj}>
      <label>Tekst odgovora
        <textarea required rows={6} maxLength={3000} value={tekst} disabled={salje}
          onChange={(event) => setTekst(event.target.value)} />
      </label>
      {greska && <p className="error" role="alert">{greska}</p>}
      <div className="nova-igrica-akcije">
        <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
        <button type="submit" className="primary" disabled={salje || !tekst.trim()}>
          {salje ? 'Čuvanje…' : 'Sačuvaj odgovor'}
        </button>
      </div>
    </form>
  </dialog>;
}
