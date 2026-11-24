import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IzaberiSadrzaj } from './sadrzaji';
import { PrikazSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';

export type Pitanje = {
  idSadrzaja: number;
  objasnjenje: string | null;
  odgovori: { idSadrzaja: number; redniBroj: number; jeTacan: boolean }[];
};

type UcitanoPitanje = { pitanje: Pitanje; sadrzaji: Sadrzaj[] };

export async function ucitajPitanje(id: number, signal: AbortSignal): Promise<UcitanoPitanje | null> {
  const odgovor = await fetch(`/api/admin/aktivnosti/${id}/pitanje`, { signal, cache: 'no-store' });
  if (odgovor.status === 404) return null;
  await provjeriOdgovor(odgovor, 'Učitavanje pitanja nije uspjelo.');
  const pitanje: Pitanje = await odgovor.json();
  const idSadrzaja = new Set([pitanje.idSadrzaja, ...pitanje.odgovori.map((stavka) => stavka.idSadrzaja)]);
  const sadrzaji = await Promise.all(Array.from(idSadrzaja, async (id): Promise<Sadrzaj> => {
    const odgovor = await fetch(`/api/sadrzaji/${id}`, { signal, cache: 'no-store' });
    await provjeriOdgovor(odgovor, 'Učitavanje sadržaja nije uspjelo.');
    return odgovor.json();
  }));
  return { pitanje, sadrzaji };
}

function procitajSadrzaj(podaci: FormData, ime: string, poruka: string) {
  const idSadrzaja = Number(podaci.get(ime)) || null;
  const uneseniTekst = podaci.get(`${ime}-tekst`);
  const tekst = String(uneseniTekst ?? '').replace(/\r\n?/g, '\n').trim();
  const prethodniTekst = String(podaci.get(`${ime}-prethodni`) ?? '').replace(/\r\n?/g, '\n').trim();
  if (idSadrzaja && (uneseniTekst === null || tekst === prethodniTekst)) {
    return { idSadrzaja, tekst: null };
  }
  if (idSadrzaja && podaci.get(`${ime}-slika`)) return { idSadrzaja, tekst };
  if (!tekst) throw new Error(poruka);
  return { idSadrzaja: null, tekst };
}

export function procitajPitanje(podaci: FormData) {
  const sadrzaj = procitajSadrzaj(podaci, 'pitanjeSadrzaj', 'Upiši pitanje ili izaberi sadržaj iz biblioteke.');
  const tacanOdgovor = Number(podaci.get('tacanOdgovor'));
  if (!tacanOdgovor) throw new Error('Označi tačan odgovor.');
  const odgovori = podaci.getAll('redniBrojOdgovora').map((stavka, indeks) => {
    const redniBroj = Number(stavka);
    return {
      ...procitajSadrzaj(podaci, `odgovorSadrzaj-${redniBroj}`, `Upiši odgovor ${indeks + 1} ili izaberi sadržaj.`),
      redniBroj,
      jeTacan: redniBroj === tacanOdgovor,
    };
  });
  return { ...sadrzaj, objasnjenje: String(podaci.get('objasnjenje') || '') || null, odgovori };
}

export function FormaPitanja({ ucitano, onIzmjena }: {
  ucitano: UcitanoPitanje | null;
  onIzmjena: () => void;
}) {
  const [redniBrojevi, setRedneBrojeve] = useState(
    () => ucitano?.pitanje.odgovori.map((odgovor) => odgovor.redniBroj) ?? [1, 2, 3, 4],
  );
  const [tacanOdgovor, setTacanOdgovor] = useState<number | null>(
    () => ucitano?.pitanje.odgovori.find((odgovor) => odgovor.jeTacan)?.redniBroj ?? 1,
  );
  const [izbor, setIzbor] = useState<string | null>(null);
  const [unosi, setUnose] = useState<Record<string, string>>({});
  const [odabrani, setOdabrane] = useState(() => {
    const sadrzaji = new Map<string, Sadrzaj>();
    if (ucitano) {
      const poId = new Map(ucitano.sadrzaji.map((stavka) => [stavka.id, stavka]));
      sadrzaji.set('pitanjeSadrzaj', poId.get(ucitano.pitanje.idSadrzaja)!);
      for (const odgovor of ucitano.pitanje.odgovori) {
        sadrzaji.set(`odgovorSadrzaj-${odgovor.redniBroj}`, poId.get(odgovor.idSadrzaja)!);
      }
    }
    return sadrzaji;
  });

  function ukloniOdgovor(redniBroj: number) {
    const polje = `odgovorSadrzaj-${redniBroj}`;
    setRedneBrojeve((prethodni) => prethodni.filter((broj) => broj !== redniBroj));
    setTacanOdgovor((prethodni) => prethodni === redniBroj ? null : prethodni);
    setUnose((prethodni) => {
      const sljedeci = { ...prethodni };
      delete sljedeci[polje];
      return sljedeci;
    });
    setOdabrane((prethodni) => {
      const sljedeci = new Map(prethodni);
      sljedeci.delete(polje);
      return sljedeci;
    });
    onIzmjena();
  }

  function prikaziIzbor(ime: string, naziv: string) {
    const stavka = odabrani.get(ime);
    const jePitanje = ime === 'pitanjeSadrzaj';
    return <div className="pitanje-unos">
      <input type="hidden" name={ime} value={stavka?.id ?? ''} />
      <input type="hidden" name={`${ime}-prethodni`} value={stavka?.tekst ?? ''} />
      {stavka?.putanjaSlike && <>
        {jePitanje && <input type="hidden" name={`${ime}-slika`} value="1" />}
        <PrikazSadrzaja stavka={stavka} sazetak />
      </>}
      {(jePitanje || !stavka?.putanjaSlike) &&
        <textarea name={`${ime}-tekst`} aria-label={naziv}
          rows={jePitanje ? 2 : 1} maxLength={10000}
          placeholder={jePitanje ? 'Upiši pitanje…' : 'Upiši odgovor…'}
          value={unosi[ime] ?? stavka?.tekst ?? ''}
          onChange={(event) => {
            const tekst = event.currentTarget.value;
            setUnose((prethodni) => ({ ...prethodni, [ime]: tekst }));
          }} />}
      <div className="pitanje-biblioteka">
        <button type="button" className="secondary" aria-haspopup="dialog"
          aria-label={`Otvori biblioteku sadržaja za ${naziv.toLowerCase()}`} onClick={() => setIzbor(ime)}>
          Iz biblioteke
        </button>
        {stavka?.putanjaSlike && <button type="button" className="secondary" onClick={() => {
          if (jePitanje) {
            setUnose((prethodni) => ({ ...prethodni, [ime]: prethodni[ime] ?? stavka.tekst ?? '' }));
          }
          setOdabrane((prethodni) => {
            const izmijenjeni = new Map(prethodni);
            izmijenjeni.delete(ime);
            return izmijenjeni;
          });
          onIzmjena();
        }}>{jePitanje ? 'Ukloni sliku' : 'Upiši tekst'}</button>}
      </div>
    </div>;
  }

  return (
    <section className="forma-pitanja" aria-label="Sadržaj pitanja">
      <div className="pitanje-stavka">
        <span className="pitanje-naziv">Pitanje</span>
        {prikaziIzbor('pitanjeSadrzaj', 'Pitanje')}
      </div>

      <fieldset className="pitanje-odgovori">
        <legend>Ponuđeni odgovori</legend>
        {redniBrojevi.map((redniBroj, indeks) => (
          <div key={redniBroj} className="pitanje-stavka">
            <input type="hidden" name="redniBrojOdgovora" value={redniBroj} />
            <div className="pitanje-red">
              <span className="pitanje-naziv">Odgovor {indeks + 1}</span>
              <div className="pitanje-biblioteka">
                <label className="pitanje-tacan">
                  <input type="radio" name="tacanOdgovor" value={redniBroj}
                    checked={tacanOdgovor === redniBroj}
                    onChange={() => setTacanOdgovor(redniBroj)} />
                  <span>Tačan odgovor</span>
                </label>
                {redniBrojevi.length > 2 && (
                  <button type="button" className="pitanje-ukloni" aria-label={`Ukloni odgovor ${indeks + 1}`}
                    onClick={() => ukloniOdgovor(redniBroj)}>Ukloni</button>
                )}
              </div>
            </div>
            {prikaziIzbor(`odgovorSadrzaj-${redniBroj}`, `Odgovor ${indeks + 1}`)}
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        className="secondary"
        onClick={() => {
          setRedneBrojeve((prethodni) => [...prethodni, prethodni[prethodni.length - 1] + 1]);
          onIzmjena();
        }}
      >
        Dodaj odgovor
      </button>

      <label className="pitanje-stavka">
        Objašnjenje <span className="pitanje-opcionalno">(opcionalno)</span>
        <textarea name="objasnjenje" maxLength={2000} rows={3} defaultValue={ucitano?.pitanje.objasnjenje ?? ''} />
      </label>
      {izbor && createPortal(
        <IzaberiSadrzaj pocetni={odabrani.get(izbor)} onZatvori={() => setIzbor(null)}
          onOdaberi={(stavka) => {
            setOdabrane((prethodni) => new Map(prethodni).set(izbor, stavka));
            setUnose((prethodni) => ({
              ...prethodni,
              [izbor]: izbor === 'pitanjeSadrzaj' && stavka.putanjaSlike && prethodni[izbor]?.trim()
                ? prethodni[izbor]
                : stavka.tekst ?? '',
            }));
            setIzbor(null);
            onIzmjena();
          }} />,
        document.body,
      )}
    </section>
  );
}
