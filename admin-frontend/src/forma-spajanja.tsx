import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IzaberiSadrzaj } from './sadrzaji';
import { PrikazSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';

type Konfiguracija = {
  nasumicanRaspored: boolean;
  parovi: { redniBroj: number; idLijevogSadrzaja: number; idDesnogSadrzaja: number }[];
};
type UcitanoSpajanje = { konfiguracija: Konfiguracija; sadrzaji: Map<number, Sadrzaj> };

export async function ucitajSpajanje(id: number, signal: AbortSignal): Promise<UcitanoSpajanje | null> {
  const odgovor = await fetch(`/api/admin/aktivnosti/${id}/spajanje`, { signal, cache: 'no-store' });
  if (odgovor.status === 404) return null;
  await provjeriOdgovor(odgovor, 'Učitavanje parova nije uspjelo.');
  const konfiguracija: Konfiguracija = await odgovor.json();
  const ids = new Set(konfiguracija.parovi.flatMap((par) => [par.idLijevogSadrzaja, par.idDesnogSadrzaja]));
  const stavke = await Promise.all(Array.from(ids, async (id): Promise<Sadrzaj> => {
    const odgovor = await fetch(`/api/sadrzaji/${id}`, { signal, cache: 'no-store' });
    await provjeriOdgovor(odgovor, 'Učitavanje sadržaja para nije uspjelo.');
    return odgovor.json();
  }));
  return { konfiguracija, sadrzaji: new Map(stavke.map((stavka) => [stavka.id, stavka])) };
}

export function procitajSpajanje(podaci: FormData) {
  const parovi = podaci.getAll('redniBrojPara').map((vrijednost, indeks) => {
    const redniBroj = Number(vrijednost);
    function procitajStranu(strana: 'lijevo' | 'desno') {
      const idSadrzaja = Number(podaci.get(`${strana}-${redniBroj}-id`));
      if (idSadrzaja) return { idSadrzaja };
      const tekst = String(podaci.get(`${strana}-${redniBroj}`) ?? '').trim();
      if (!tekst) throw new Error(`Popuni par ${indeks + 1} (${strana}).`);
      return { tekst };
    }
    return { redniBroj, lijevo: procitajStranu('lijevo'), desno: procitajStranu('desno') };
  });
  return { nasumicanRaspored: podaci.has('nasumicanRaspored'), parovi };
}

function StranaPara({ naziv, ime, pocetni, onIzmjena }: {
  naziv: string; ime: string; pocetni?: Sadrzaj; onIzmjena: () => void;
}) {
  const [sadrzaj, setSadrzaj] = useState<Sadrzaj | null>(pocetni ?? null);
  const [biraSadrzaj, setBiraSadrzaj] = useState(false);

  return (
    <div>
      <label>
        {naziv}
        <input
          name={ime}
          placeholder="Upiši tekst"
          defaultValue={pocetni?.tekst ?? ''}
          maxLength={10000}
          hidden={sadrzaj !== null}
          disabled={sadrzaj !== null}
        />
      </label>

      {sadrzaj && (
        <>
          <PrikazSadrzaja stavka={sadrzaj} sazetak />
          <input type="hidden" name={`${ime}-id`} value={sadrzaj.id} />
        </>
      )}

      <button
        type="button"
        className="secondary"
        onClick={() => setBiraSadrzaj(true)}
      >
        {sadrzaj ? 'Promijeni sadržaj' : 'Iz biblioteke'}
      </button>

      {sadrzaj && (
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setSadrzaj(null);
            onIzmjena();
          }}
        >
          Upiši tekst
        </button>
      )}

      {biraSadrzaj && createPortal(
        <IzaberiSadrzaj
          pocetni={sadrzaj ?? undefined}
          onZatvori={() => setBiraSadrzaj(false)}
          onOdaberi={(stavka) => {
            setSadrzaj(stavka);
            setBiraSadrzaj(false);
            onIzmjena();
          }}
        />,
        document.body,
      )}
    </div>
  );
}

export function FormaSpajanja({ ucitano, onIzmjena }: { ucitano: UcitanoSpajanje | null; onIzmjena: () => void }) {
  const [redniBrojevi, setRedneBrojeve] = useState(
    () => ucitano?.konfiguracija.parovi.map((par) => par.redniBroj) ?? [1],
  );

  return (
    <fieldset>
      <legend>Parovi za spajanje</legend>

      <label className="pitanje-tacan">
        <input type="checkbox" name="nasumicanRaspored" defaultChecked={ucitano?.konfiguracija.nasumicanRaspored ?? true} />
        Nasumičan raspored
      </label>

      {redniBrojevi.map((redniBroj, indeks) => {
        const par = ucitano?.konfiguracija.parovi.find((par) => par.redniBroj === redniBroj);

        return (
          <fieldset key={redniBroj}>
            <legend>Par {indeks + 1}</legend>
            <input type="hidden" name="redniBrojPara" value={redniBroj} />

            <StranaPara naziv="Lijevo" ime={`lijevo-${redniBroj}`} onIzmjena={onIzmjena}
              pocetni={par && ucitano?.sadrzaji.get(par.idLijevogSadrzaja)} />
            <StranaPara naziv="Desno" ime={`desno-${redniBroj}`} onIzmjena={onIzmjena}
              pocetni={par && ucitano?.sadrzaji.get(par.idDesnogSadrzaja)} />
            {redniBrojevi.length > 1 && <button type="button" className="secondary" onClick={() => {
              setRedneBrojeve((prethodni) => prethodni.filter((broj) => broj !== redniBroj));
              onIzmjena();
            }}>Ukloni par</button>}
          </fieldset>
        );
      })}

      <button
        type="button"
        className="secondary"
        onClick={() => {
          setRedneBrojeve((prethodni) => [...prethodni, Math.max(...prethodni,
            ...(ucitano?.konfiguracija.parovi.map((par) => par.redniBroj) ?? [])) + 1]);
          onIzmjena();
        }}
      >
        Dodaj par
      </button>
    </fieldset>
  );
}
