import { useState } from 'react';
import { createPortal } from 'react-dom';
import { PrikazSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';
import { IzaberiSadrzaj } from './sadrzaji';

type Konfiguracija = {
  grupe: { id: number; naziv: string; idSadrzaja?: number | null; stavke: { idSadrzaja: number }[] }[];
};
type Grupa = { id: number; naziv: string; sadrzaj?: Sadrzaj; stavke: Sadrzaj[] };

export async function ucitajRazvrstavanje(id: number, signal: AbortSignal) {
  const odgovor = await fetch(`/api/admin/aktivnosti/${id}/razvrstavanje`, { signal, cache: 'no-store' });
  if (odgovor.status === 404) return null;
  await provjeriOdgovor(odgovor, 'Učitavanje razvrstavanja nije uspjelo.');
  const konfiguracija: Konfiguracija = await odgovor.json();
  const ids = new Set(konfiguracija.grupe.flatMap(({ idSadrzaja, stavke }) =>
    [...(idSadrzaja == null ? [] : [idSadrzaja]), ...stavke.map((stavka) => stavka.idSadrzaja)]));
  const sadrzaji = await Promise.all([...ids].map(async (id): Promise<Sadrzaj> => {
    const odgovor = await fetch(`/api/sadrzaji/${id}`, { signal, cache: 'no-store' });
    await provjeriOdgovor(odgovor, 'Učitavanje stavke nije uspjelo.');
    return odgovor.json();
  }));
  return { konfiguracija, sadrzaji: new Map(sadrzaji.map((stavka) => [stavka.id, stavka])) };
}

type Ucitano = Awaited<ReturnType<typeof ucitajRazvrstavanje>>;

export function procitajRazvrstavanje(podaci: FormData, ucitano?: Ucitano) {
  const grupe = podaci.getAll('grupaRazvrstavanja').map((id) => ({
    naziv: String(podaci.get(`nazivGrupe-${id}`) ?? '').trim(),
    idSadrzaja: Number(podaci.get(`sadrzajGrupe-${id}`)) || null,
    stavke: podaci.getAll(`stavkaGrupe-${id}`).map((vrijednost) => ({ idSadrzaja: Number(vrijednost) })),
  }));
  const prethodne = ucitano?.konfiguracija.grupe;
  if (prethodne?.length === grupe.length && grupe.every((grupa, indeks) => {
    const prethodna = prethodne[indeks];
    return grupa.naziv === prethodna.naziv && grupa.idSadrzaja === (prethodna.idSadrzaja ?? null)
      && grupa.stavke.length === prethodna.stavke.length
      && grupa.stavke.every((stavka, pozicija) => stavka.idSadrzaja === prethodna.stavke[pozicija].idSadrzaja);
  })) return null;

  if (grupe.length < 2 || grupe.some(({ naziv, stavke }) => !naziv || !stavke.length)) {
    throw new Error('Unesi najmanje dvije grupe s nazivom i barem jednom slikom po grupi.');
  }
  if (new Set(grupe.map(({ naziv }) => naziv.toLowerCase())).size !== grupe.length) {
    throw new Error('Grupe moraju imati različite nazive.');
  }
  return { grupe };
}

export function FormaRazvrstavanja({ ucitano, onIzmjena }: { ucitano: Ucitano; onIzmjena: () => void }) {
  const [grupe, setGrupe] = useState<Grupa[]>(() => ucitano?.konfiguracija.grupe.map((grupa) => ({
    ...grupa,
    sadrzaj: grupa.idSadrzaja == null ? undefined : ucitano.sadrzaji.get(grupa.idSadrzaja),
    stavke: grupa.stavke.map(({ idSadrzaja }) => ucitano.sadrzaji.get(idSadrzaja)!),
  })) ?? [{ id: 1, naziv: '', stavke: [] }, { id: 2, naziv: '', stavke: [] }]);
  const [odabir, setOdabir] = useState<{ idGrupe: number; vrsta: 'grupa' | 'stavka' } | null>(null);
  const grupaOdabira = grupe.find(({ id }) => id === odabir?.idGrupe);
  const [greska, setGresku] = useState('');

  function izmijeniGrupu(id: number, izmjena: Partial<Grupa>) {
    setGrupe((prethodne) => prethodne.map((grupa) => grupa.id === id ? { ...grupa, ...izmjena } : grupa));
    onIzmjena();
  }

  return <fieldset>
    <legend>Grupe za razvrstavanje</legend>
    {grupe.map((grupa, indeks) => <fieldset key={grupa.id}>
      <legend>Grupa {indeks + 1}</legend>
      <input type="hidden" name="grupaRazvrstavanja" value={grupa.id} />
      <label>Naziv grupe
        <input name={`nazivGrupe-${grupa.id}`} value={grupa.naziv} maxLength={150} required
          onChange={(event) => izmijeniGrupu(grupa.id, { naziv: event.currentTarget.value })} />
      </label>
      <input type="hidden" name={`sadrzajGrupe-${grupa.id}`} value={grupa.sadrzaj?.id ?? ''} />
      {grupa.sadrzaj && <PrikazSadrzaja stavka={grupa.sadrzaj} sazetak />}
      <button type="button" className="secondary" onClick={() => {
        setGresku('');
        setOdabir({ idGrupe: grupa.id, vrsta: 'grupa' });
      }}>{grupa.sadrzaj ? 'Promijeni sadržaj grupe' : 'Dodaj sadržaj grupe'}</button>
      {grupa.sadrzaj && <button type="button" className="secondary"
        onClick={() => izmijeniGrupu(grupa.id, { sadrzaj: undefined })}>Ukloni sadržaj grupe</button>}
      {grupa.stavke.map((stavka) => <div key={stavka.id}>
        <input type="hidden" name={`stavkaGrupe-${grupa.id}`} value={stavka.id} />
        <PrikazSadrzaja stavka={stavka} sazetak />
        <button type="button" className="secondary" onClick={() => {
          setGresku('');
          izmijeniGrupu(grupa.id, { stavke: grupa.stavke.filter(({ id }) => id !== stavka.id) });
        }}>Ukloni stavku</button>
      </div>)}
      <button type="button" className="secondary" onClick={() => {
        setGresku('');
        setOdabir({ idGrupe: grupa.id, vrsta: 'stavka' });
      }}>Dodaj sliku</button>
      {grupe.length > 2 && <button type="button" className="secondary" onClick={() => {
        setGresku('');
        setGrupe((prethodne) => prethodne.filter(({ id }) => id !== grupa.id));
        onIzmjena();
      }}>Ukloni grupu</button>}
    </fieldset>)}
    {greska && <p className="error" role="alert">{greska}</p>}
    <button type="button" className="secondary" onClick={() => {
      setGrupe((prethodne) => [...prethodne, {
        id: Math.max(0, ...prethodne.map(({ id }) => id)) + 1, naziv: '', stavke: [],
      }]);
      onIzmjena();
    }}>Dodaj grupu</button>
    {odabir && grupaOdabira && createPortal(<IzaberiSadrzaj samoSlike={odabir.vrsta === 'stavka'}
      pocetni={odabir.vrsta === 'grupa' ? grupaOdabira.sadrzaj : undefined}
      onZatvori={() => setOdabir(null)} onOdaberi={(sadrzaj) => {
        setOdabir(null);
        if (odabir.vrsta === 'grupa') {
          izmijeniGrupu(grupaOdabira.id, { sadrzaj });
          return;
        }
        if (grupe.some(({ stavke }) => stavke.some(({ id }) => id === sadrzaj.id))) {
          setGresku('Ta slika već pripada jednoj grupi.');
          return;
        }
        izmijeniGrupu(grupaOdabira.id, { stavke: [...grupaOdabira.stavke, sadrzaj] });
      }} />, document.body)}
  </fieldset>;
}
