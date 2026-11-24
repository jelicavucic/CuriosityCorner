import { useState } from 'react';
import { AudioLines, ImagePlus } from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';

export type SlaganjeSlova = { ciljniTekst: string; putanjaSlike: string | null };
export type Bajka = {
  naslov: string;
  tekst: string;
  putanjaNaslovneSlike: string | null;
  putanjaAudioZapisa: string | null;
};

export async function ucitajKonfiguraciju<T>(id: number, tip: string, signal: AbortSignal): Promise<T | null> {
  const odgovor = await fetch(`/api/admin/aktivnosti/${id}/${tip}`, { signal });
  if (odgovor.status === 404) return null;
  if (!odgovor.ok) throw new Error(`Učitavanje konfiguracije nije uspjelo (HTTP ${odgovor.status}).`);
  return odgovor.json();
}

function Medij({ naziv, pocetnaPutanja, audio = false, onIzmjena, onSlanje }: {
  naziv: string;
  pocetnaPutanja: string | null;
  audio?: boolean;
  onIzmjena: () => void;
  onSlanje: (razlika: number) => void;
}) {
  const [putanja, setPutanju] = useState(pocetnaPutanja ?? '');
  const [salje, setSalje] = useState(false);
  const [greska, setGresku] = useState('');
  const polje = audio ? 'putanjaAudioZapisa' : 'putanjaSlike';
  const oznaka = audio ? 'Audio zapis' : naziv === 'putanjaNaslovneSlike' ? 'Naslovna slika' : 'Slika';
  const Ikona = audio ? AudioLines : ImagePlus;
  const akcija = putanja ? 'Zamijeni' : 'Odaberi';
  const input = <input type="file" accept={audio ? '.wav,audio/wav,audio/x-wav' : 'image/png,image/jpeg,image/gif'}
    disabled={salje} onChange={(event) => {
      const fajl = event.currentTarget.files?.[0];
      event.currentTarget.value = '';
      if (fajl) void posalji(fajl);
    }} />;

  async function posalji(fajl: File) {
    setGresku('');
    setSalje(true);
    onSlanje(1);
    onIzmjena();
    try {
      const podaci = new FormData();
      podaci.set(audio ? 'audio' : 'slika', fajl);
      const odgovor = await posaljiAdminZahtjev('POST', audio ? '/api/admin/fajlovi/audio' : '/api/admin/fajlovi', podaci);
      if (!odgovor.ok) {
        const problem = await odgovor.json().catch(() => null);
        throw new Error(problem?.detail || `Slanje datoteke nije uspjelo (HTTP ${odgovor.status}).`);
      }
      const rezultat = await odgovor.json();
      if (!rezultat[polje]) throw new Error('Server nije vratio putanju datoteke.');
      setPutanju(rezultat[polje]);
    } catch (error) {
      setGresku(error instanceof Error ? error.message : 'Slanje datoteke nije uspjelo.');
    } finally {
      onSlanje(-1);
      setSalje(false);
    }
  }

  return <div className="aktivnost-datoteka">
      <span className="aktivnost-datoteka-naslov">{oznaka} <small>Opcionalno</small></span>
      <label className="aktivnost-datoteka-odabir">
        {input}
        <span className="aktivnost-datoteka-ikona"><Ikona size={22} aria-hidden="true" /></span>
        <span>
          <strong>{akcija} {audio ? 'audio zapis' : 'sliku'}</strong>
          <small>{audio ? 'WAV' : 'PNG, JPEG ili GIF'} · do 5 MiB</small>
        </span>
      </label>
    <input type="hidden" name={naziv} value={putanja} />
    {salje && <p role="status">Slanje datoteke…</p>}
    {greska && <p className="error" role="alert">{greska}</p>}
    {putanja && <>
      {audio ? <audio controls preload="metadata" src={putanja} aria-label="Preslušaj bajku" />
        : <img src={putanja} alt="Pregled odabrane slike" className="aktivnost-medij" />}
      <button type="button" className="secondary" disabled={salje} onClick={() => {
        setPutanju('');
        setGresku('');
        onIzmjena();
      }}>Ukloni {audio ? 'audio zapis' : 'sliku'}</button>
    </>}
  </div>;
}

type MedijAkcije = { onIzmjena: () => void; onSlanje: (razlika: number) => void };

export function FormaSlaganjaSlova({ ucitano, ...akcije }: MedijAkcije & { ucitano: SlaganjeSlova | null }) {
  const [tekst, setTekst] = useState(ucitano?.ciljniTekst ?? '');
  const [ponudjena, setPonudjena] = useState<string[]>([]);
  return <section className="aktivnost-dodatna-forma">
    <label>Ciljni tekst
      <input name="ciljniTekst" value={tekst} required maxLength={500} onChange={(event) => {
        setTekst(event.target.value);
        setPonudjena([]);
      }} />
    </label>
    <Medij naziv="putanjaSlaganja" pocetnaPutanja={ucitano?.putanjaSlike ?? null} {...akcije} />
    <button type="button" className="secondary" disabled={!/\p{L}/u.test(tekst)} onClick={() => {
      const slova = Array.from(tekst.normalize('NFC').toUpperCase()).filter((znak) => /\p{L}/u.test(znak));
      for (let i = slova.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slova[i], slova[j]] = [slova[j], slova[i]];
      }
      setPonudjena(slova);
    }}>Prikaži ponuđena slova</button>
    {ponudjena.length > 0 && <p aria-live="polite">{ponudjena.join(' · ')}</p>}
  </section>;
}

export function FormaBajke({ ucitano, ...akcije }: MedijAkcije & { ucitano: Bajka | null }) {
  const [naslov, setNaslov] = useState(ucitano?.naslov ?? '');
  const [tekst, setTekst] = useState(ucitano?.tekst ?? '');
  return <section className="aktivnost-dodatna-forma">
    <label>Naslov<input name="naslovBajke" required maxLength={250} value={naslov}
      onChange={(event) => setNaslov(event.target.value)} /></label>
    <label>Tekst bajke<textarea name="tekstBajke" required rows={7} value={tekst}
      onChange={(event) => setTekst(event.target.value)} /></label>
    <Medij naziv="putanjaNaslovneSlike" pocetnaPutanja={ucitano?.putanjaNaslovneSlike ?? null} {...akcije} />
    <Medij naziv="putanjaAudioZapisa" pocetnaPutanja={ucitano?.putanjaAudioZapisa ?? null} audio {...akcije} />
    <details className="bajka-pregled">
      <summary>Pregled teksta bajke</summary>
      <h3>{naslov}</h3>
      <p className="aktivnost-tekst-bajke">{tekst}</p>
    </details>
  </section>;
}
