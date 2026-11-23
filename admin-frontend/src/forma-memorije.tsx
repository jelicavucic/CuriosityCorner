import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IzaberiSadrzaj } from './sadrzaji';
import { PrikazSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';

type Konfiguracija = {
  brojKolona: number;
  vrijemeZaRjesavanje: number | null;
  parovi: { brojPara: number; idSadrzaja: number; putanjaSlike: string; alternativniTekst: string | null }[];
};

export async function ucitajMemoriju(id: number, signal: AbortSignal): Promise<Konfiguracija | null> {
  const odgovor = await fetch(`/api/admin/aktivnosti/${id}/memorija`, { signal, cache: 'no-store' });
  if (odgovor.status === 404) return null;
  await provjeriOdgovor(odgovor, 'Učitavanje memorije nije uspjelo.');
  return odgovor.json();
}

export function procitajMemoriju(podaci: FormData, prethodna?: Konfiguracija | null) {
  const idSadrzajaParova = podaci.getAll('slikaPara').map(Number);
  const brojKolona = Number(podaci.get('brojKolona'));
  const vrijemeZaRjesavanje = Number(podaci.get('vrijemeZaRjesavanje')) || null;
  if (prethodna && brojKolona === prethodna.brojKolona
    && vrijemeZaRjesavanje === prethodna.vrijemeZaRjesavanje
    && idSadrzajaParova.length === prethodna.parovi.length
    && idSadrzajaParova.every((id, indeks) => id === prethodna.parovi[indeks].idSadrzaja)) return null;

  if (idSadrzajaParova.length < 2 || idSadrzajaParova.includes(0)) {
    throw new Error('Izaberi po jednu sliku za svaki par. Potrebna su najmanje dva para.');
  }
  if (new Set(idSadrzajaParova).size !== idSadrzajaParova.length) {
    throw new Error('Izaberi različitu sliku za svaki par.');
  }
  if (idSadrzajaParova.length * 2 % brojKolona !== 0) {
    throw new Error('Broj kartica mora biti djeljiv brojem kolona.');
  }
  return { idSadrzajaParova, brojKolona, vrijemeZaRjesavanje };
}

type Par = { kljuc: number; slika: Sadrzaj | null };

export function FormaMemorije({ ucitano, onIzmjena }: { ucitano: Konfiguracija | null; onIzmjena: () => void }) {
  const [parovi, setParove] = useState<Par[]>(() => ucitano?.parovi.length
    ? ucitano.parovi.map(({ brojPara, idSadrzaja, putanjaSlike, alternativniTekst }) => ({
      kljuc: brojPara, slika: { id: idSadrzaja, putanjaSlike, alternativniTekst, tekst: null },
    }))
    : [{ kljuc: 1, slika: null }, { kljuc: 2, slika: null }]);
  const [odabir, setOdabir] = useState<Par | null>(null);

  return <fieldset>
    <legend>Slike za memoriju</legend>
    <p>Izaberi jednu sliku po paru. Igra od svake slike napravi dvije kartice.</p>
    <label>Broj kolona
      <input type="number" name="brojKolona" min={2} max={10} required defaultValue={ucitano?.brojKolona ?? 2} />
    </label>
    <label>Vrijeme u sekundama (opcionalno)
      <input type="number" name="vrijemeZaRjesavanje" min={1} max={2147483647}
        defaultValue={ucitano?.vrijemeZaRjesavanje ?? ''} />
    </label>
    {parovi.map((par, indeks) => <fieldset key={par.kljuc}>
      <legend>Par {indeks + 1}</legend>
      <input type="hidden" name="slikaPara" value={par.slika?.id ?? ''} />
      {par.slika && <PrikazSadrzaja stavka={par.slika} sazetak />}
      <button type="button" className="secondary" onClick={() => setOdabir(par)}>
        {par.slika ? 'Promijeni sliku' : 'Izaberi sliku'}
      </button>
      {parovi.length > 2 && <button type="button" className="secondary" onClick={() => {
        setParove((prethodni) => prethodni.filter(({ kljuc }) => kljuc !== par.kljuc));
        onIzmjena();
      }}>Ukloni par</button>}
    </fieldset>)}
    <p>{parovi.length} parova · {parovi.length * 2} kartica</p>
    <button type="button" className="secondary" disabled={parovi.length >= 50} onClick={() => {
      setParove((prethodni) => [...prethodni, {
        kljuc: Math.max(...prethodni.map(({ kljuc }) => kljuc)) + 1, slika: null,
      }]);
      onIzmjena();
    }}>Dodaj par</button>
    {odabir && createPortal(<IzaberiSadrzaj samoSlike pocetni={odabir.slika ?? undefined}
      onZatvori={() => setOdabir(null)} onOdaberi={(slika) => {
        setParove((prethodni) => prethodni.map((par) => par.kljuc === odabir.kljuc ? { ...par, slika } : par));
        setOdabir(null);
        onIzmjena();
      }} />, document.body)}
  </fieldset>;
}
