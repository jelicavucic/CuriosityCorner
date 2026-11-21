import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type Sadrzaj = {
  id: number;
  tekst: string | null;
  putanjaSlike: string | null;
  alternativniTekst: string | null;
};

export function naslovSadrzaja(stavka: Sadrzaj) {
  const naslov = stavka.tekst?.trim() || stavka.alternativniTekst?.trim() || `Sadržaj #${stavka.id}`;
  return naslov.length > 85 ? `${naslov.slice(0, 84).trimEnd()}…` : naslov;
}

export async function provjeriOdgovor(odgovor: Response, poruka: string) {
  if (odgovor.ok) return;
  if (odgovor.status === 401 || odgovor.status === 403) {
    throw new Error('Provjeri administratorsku sesiju pa pokušaj ponovo.');
  }
  const problem: { detail?: string; greske?: Record<string, string> } | null =
    await odgovor.json().catch(() => null);
  throw new Error(Object.values(problem?.greske ?? {}).join(' ') || problem?.detail || poruka);
}

export function Modal({ naslov, zauzet = false, onZatvori, prijeZatvaranja, children }: {
  naslov: string; zauzet?: boolean; onZatvori: () => void; prijeZatvaranja?: () => boolean; children: ReactNode;
}) {
  const naslovId = useId();
  const dijalog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prethodniFokus = document.activeElement;
    const element = dijalog.current;
    if (element && !element.open) element.showModal();
    return () => {
      queueMicrotask(() => {
        const aktivni = document.activeElement;
        if (prethodniFokus instanceof HTMLElement && prethodniFokus.isConnected
          && (aktivni === document.body || aktivni === element)) prethodniFokus.focus();
      });
    };
  }, []);

  return <dialog className="admin-dijalog sadrzaj-modal" ref={dijalog} aria-labelledby={naslovId}
    onClose={onZatvori} onCancel={(event) => {
      if (zauzet || prijeZatvaranja?.() === false) event.preventDefault();
    }}>
    <header className="sadrzaj-modal-zaglavlje">
      <h2 id={naslovId}>{naslov}</h2>
      <button type="button" className="sadrzaj-ikona" aria-label="Zatvori" disabled={zauzet}
        onClick={() => {
          if (prijeZatvaranja?.() !== false) dijalog.current?.close();
        }}><X size={20} aria-hidden="true" /></button>
    </header>
    {children}
  </dialog>;
}

function Slika({ putanja, opis }: { putanja: string; opis: string }) {
  const [greska, setGreska] = useState(false);
  return greska ? <span className="sadrzaj-nedostupna">Slika nije dostupna</span>
    : <img src={putanja} alt={opis} loading="lazy" onError={() => setGreska(true)} />;
}

export function PrikazSadrzaja({ stavka, sazetak = false }: { stavka: Sadrzaj; sazetak?: boolean }) {
  return <span className={`sadrzaj-vizual${sazetak ? ' sadrzaj-vizual--sazetak' : ''}`}>
    {stavka.putanjaSlike && <span className="sadrzaj-slika">
      <Slika key={stavka.putanjaSlike} putanja={stavka.putanjaSlike} opis={stavka.alternativniTekst || ''} />
    </span>}
    {stavka.tekst && <span className="sadrzaj-tekst">{stavka.tekst}</span>}
    {!stavka.tekst && stavka.putanjaSlike && <span className="sadrzaj-tekst">{naslovSadrzaja(stavka)}</span>}
  </span>;
}

