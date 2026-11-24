import { useEffect, useRef, useState, type FormEvent } from 'react';
import { posaljiAdminZahtjev } from './auth';
import { OsnovniPodaciAktivnosti } from './osnovni-podaci-aktivnosti';
import { IzborTipaAktivnosti } from './izbor-tipa-aktivnosti';
import { FormaPitanja, procitajPitanje, ucitajPitanje } from './forma-pitanje';
import { FormaSpajanja, procitajSpajanje, ucitajSpajanje } from './forma-spajanja';
import { FormaMemorije, procitajMemoriju, ucitajMemoriju } from './forma-memorije';
import { FormaRazvrstavanja, procitajRazvrstavanje, ucitajRazvrstavanje } from './forma-razvrstavanja';
import { FormaBajke, FormaSlaganjaSlova, ucitajKonfiguraciju, type Bajka, type SlaganjeSlova } from './forma-tekstualne-aktivnosti';
import { FormaOsmosmjerke, type Osmosmjerka } from './forma-osmosmjerke';

const dodatniTipovi = {
  'slaganje-slova': { resurs: 'slaganja-slova', polje: 'slaganjeSlova' },
  osmosmjerka: { resurs: 'osmosmjerke', polje: 'osmosmjerka' },
  bajka: { resurs: 'bajke', polje: 'bajka' },
} as const;
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
  aktivnostiNivoa: Aktivnost[];
  tipovi: TipAktivnosti[] | null;
  onSacuvana: (aktivnost: Aktivnost) => void;
  onObrisana: (id: number) => void;
  onZatvori: () => void;
};

export function AktivnostDijalog({
  akcija, idNivoa, nazivNivoa, sljedeciBroj, aktivnostiNivoa, tipovi, onSacuvana, onObrisana, onZatvori,
}: AktivnostDijalogProps) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const fokusKoraka = useRef<HTMLHeadingElement>(null);
  const [salje, setSalje] = useState(false);
  const [brojPrenosa, setBrojPrenosa] = useState(0);
  const zauzeto = salje || brojPrenosa > 0;
  const [greska, setGreska] = useState('');
  const [greskaRedoslijeda, setGreskuRedoslijeda] = useState('');
  const [biraTip, setBiraTip] = useState(akcija.vrsta === 'dodaj');
  const [odabraniTip, setOdabraniTip] = useState<TipAktivnosti | null>(null);
  const [imaIzmjena, setImaIzmjena] = useState(false);
  const [ucitanoPitanje, setUcitanoPitanje] = useState<Awaited<ReturnType<typeof ucitajPitanje>>>();
  const [ucitanoSpajanje, setUcitanoSpajanje] = useState<Awaited<ReturnType<typeof ucitajSpajanje>>>();
  const [ucitanaMemorija, setUcitanuMemoriju] = useState<Awaited<ReturnType<typeof ucitajMemoriju>>>();
  const [ucitanoRazvrstavanje, setUcitanoRazvrstavanje] = useState<Awaited<ReturnType<typeof ucitajRazvrstavanje>>>();
  const [ucitanaKonfiguracija, setUcitanuKonfiguraciju] = useState<SlaganjeSlova | Bajka | Osmosmjerka | null>();
  const [greskaUcitavanja, setGreskuUcitavanja] = useState('');
  const [pokusajUcitavanja, setPokusajUcitavanja] = useState(0);
  const aktivnost = akcija.vrsta === 'dodaj' ? null : akcija.aktivnost;
  const brise = akcija.vrsta === 'obrisi';
  const tip = aktivnost ? tipovi?.find(({ id }) => id === aktivnost.idTipa) : odabraniTip;
  const jePitanje = !brise && tip?.oznaka.toLowerCase() === 'pitanje';
  const jeSpajanje = !brise && tip?.oznaka.toLowerCase() === 'spajanje';
  const jeMemorija = !brise && tip?.oznaka.toLowerCase() === 'memorija';
  const jeRazvrstavanje = !brise && tip?.oznaka.toLowerCase() === 'razvrstavanje';
  const oznaka = tip?.oznaka.toLowerCase() ?? '';
  const dodatniTip = !brise && Object.hasOwn(dodatniTipovi, oznaka)
    ? oznaka as keyof typeof dodatniTipovi : undefined;
  const idKonfiguracije = dodatniTip ? aktivnost?.id : undefined;
  const idPitanja = jePitanje ? aktivnost?.id : undefined;
  const idSpajanja = jeSpajanje ? aktivnost?.id : undefined;
  const idMemorije = jeMemorija ? aktivnost?.id : undefined;
  const idRazvrstavanja = jeRazvrstavanje ? aktivnost?.id : undefined;
  const cekaPodatke = (jePitanje && idPitanja !== undefined && ucitanoPitanje === undefined)
    || (idSpajanja !== undefined && ucitanoSpajanje === undefined)
    || (idMemorije !== undefined && ucitanaMemorija === undefined)
    || (idRazvrstavanja !== undefined && ucitanoRazvrstavanje === undefined)
    || (idKonfiguracije !== undefined && ucitanaKonfiguracija === undefined)
    || (akcija.vrsta === 'uredi' && tipovi === null);
  const naslov = brise ? 'Obriši aktivnost' : biraTip ? 'Izaberi tip aktivnosti'
    : `${aktivnost ? 'Uredi aktivnost' : 'Dodaj aktivnost'}${tip ? ` – ${tip.naziv}` : ''}`;

  useEffect(() => {
    if (!dijalog.current?.open) dijalog.current?.showModal();
  }, []);

  useEffect(() => {
    if (akcija.vrsta === 'dodaj') fokusKoraka.current?.focus();
  }, [akcija.vrsta, biraTip]);

  useEffect(() => {
    if (idPitanja === undefined) return;
    const kontroler = new AbortController();
    ucitajPitanje(idPitanja, kontroler.signal).then((rezultat) => {
      if (!kontroler.signal.aborted) setUcitanoPitanje(rezultat);
    }).catch((error) => {
      if (!kontroler.signal.aborted) {
        setGreskuUcitavanja(error instanceof Error ? error.message : 'Učitavanje pitanja nije uspjelo.');
      }
    });
    return () => kontroler.abort();
  }, [idPitanja, pokusajUcitavanja]);

  useEffect(() => {
    if (idSpajanja === undefined) return;
    const kontroler = new AbortController();
    ucitajSpajanje(idSpajanja, kontroler.signal).then((rezultat) => {
      if (!kontroler.signal.aborted) setUcitanoSpajanje(rezultat);
    }).catch((error) => {
      if (!kontroler.signal.aborted) {
        setGreskuUcitavanja(error instanceof Error ? error.message : 'Učitavanje parova nije uspjelo.');
      }
    });
    return () => kontroler.abort();
  }, [idSpajanja, pokusajUcitavanja]);

  useEffect(() => {
    if (idMemorije === undefined) return;
    const kontroler = new AbortController();
    ucitajMemoriju(idMemorije, kontroler.signal).then((rezultat) => {
      if (!kontroler.signal.aborted) setUcitanuMemoriju(rezultat);
    }).catch((error) => {
      if (!kontroler.signal.aborted) {
        setGreskuUcitavanja(error instanceof Error ? error.message : 'Učitavanje memorije nije uspjelo.');
      }
    });
    return () => kontroler.abort();
  }, [idMemorije, pokusajUcitavanja]);

  useEffect(() => {
    if (idRazvrstavanja === undefined) return;
    const kontroler = new AbortController();
    ucitajRazvrstavanje(idRazvrstavanja, kontroler.signal).then((rezultat) => {
      if (!kontroler.signal.aborted) setUcitanoRazvrstavanje(rezultat);
    }).catch((error) => {
      if (!kontroler.signal.aborted) {
        setGreskuUcitavanja(error instanceof Error ? error.message : 'Učitavanje razvrstavanja nije uspjelo.');
      }
    });
    return () => kontroler.abort();
  }, [idRazvrstavanja, pokusajUcitavanja]);

  useEffect(() => {
    if (idKonfiguracije === undefined || !dodatniTip) return;
    const kontroler = new AbortController();
    ucitajKonfiguraciju<SlaganjeSlova | Bajka | Osmosmjerka>(idKonfiguracije, dodatniTip, kontroler.signal)
      .then((rezultat) => {
        if (!kontroler.signal.aborted) setUcitanuKonfiguraciju(rezultat);
      }).catch((error) => {
        if (!kontroler.signal.aborted) {
          setGreskuUcitavanja(error instanceof Error ? error.message : 'Učitavanje konfiguracije nije uspjelo.');
        }
      });
    return () => kontroler.abort();
  }, [idKonfiguracije, dodatniTip, pokusajUcitavanja]);

  function dozvoliZatvaranje() {
    return !zauzeto && (!imaIzmjena || window.confirm('Imaš nesačuvane izmjene. Želiš li ih odbaciti?'));
  }

  async function potvrdi(event: FormEvent<HTMLFormElement>) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    const idTipa = aktivnost?.idTipa ?? odabraniTip?.id;
    if (zauzeto || cekaPodatke || (!brise && (biraTip || idTipa === undefined))) return;
    const podaci = new FormData(event.currentTarget);
    setGreska('');
    setGreskuRedoslijeda('');
    const redniBroj = Number(podaci.get('redniBroj'));
    if (!brise && aktivnostiNivoa.some((stavka) => stavka.redniBroj === redniBroj && stavka.id !== aktivnost?.id)) {
      setGreskuRedoslijeda('Ovaj redni broj je već zauzet na odabranom nivou.');
      return;
    }
    setSalje(true);

    try {
      const osnovniPodaci = {
        idNivoa,
        idTipa,
        redniBroj,
        uputstvo: String(podaci.get('uputstvo') ?? '').trim() || null,
        tezina: podaci.get('tezina'),
        brojBodova: Number(podaci.get('brojBodova')),
      };
      const pitanje = jePitanje ? procitajPitanje(podaci) : null;
      const postojecaKonfiguracija = ucitanoPitanje?.pitanje;
      const promjenaPitanja = pitanje && (!postojecaKonfiguracija
        || pitanje.tekst !== null
        || pitanje.idSadrzaja !== postojecaKonfiguracija.idSadrzaja
        || pitanje.objasnjenje !== (postojecaKonfiguracija.objasnjenje || null)
        || pitanje.odgovori.length !== postojecaKonfiguracija.odgovori.length
        || pitanje.odgovori.some((stavka, indeks) => {
          const prethodna = postojecaKonfiguracija.odgovori[indeks];
          return stavka.idSadrzaja !== prethodna.idSadrzaja || stavka.redniBroj !== prethodna.redniBroj
            || stavka.jeTacan !== prethodna.jeTacan;
        }));
      const spajanje = jeSpajanje ? procitajSpajanje(podaci) : null;
      const prethodnoSpajanje = ucitanoSpajanje?.konfiguracija;
      const promjenaSpajanja = spajanje && (!prethodnoSpajanje
        || spajanje.nasumicanRaspored !== prethodnoSpajanje.nasumicanRaspored
        || spajanje.parovi.length !== prethodnoSpajanje.parovi.length
        || spajanje.parovi.some((par, indeks) => {
          const prethodni = prethodnoSpajanje.parovi[indeks];
          return par.redniBroj !== prethodni.redniBroj || par.lijevo.idSadrzaja !== prethodni.idLijevogSadrzaja
            || par.desno.idSadrzaja !== prethodni.idDesnogSadrzaja;
        }));
      const memorija = jeMemorija ? procitajMemoriju(podaci, ucitanaMemorija) : null;
      const razvrstavanje = jeRazvrstavanje ? procitajRazvrstavanje(podaci, ucitanoRazvrstavanje) : null;
      const konfiguracija = dodatniTip ? procitajKonfiguraciju(dodatniTip, podaci, ucitanaKonfiguracija) : null;
      const dodatniResurs = dodatniTip && konfiguracija ? dodatniTipovi[dodatniTip] : null;
      const resurs = dodatniResurs ? `/api/admin/aktivnosti/${dodatniResurs.resurs}`
        : razvrstavanje ? '/api/admin/aktivnosti/razvrstavanja'
        : memorija ? '/api/admin/aktivnosti/memorije' : promjenaPitanja ? '/api/admin/aktivnosti/pitanja'
        : promjenaSpajanja ? '/api/admin/aktivnosti/spajanja' : '/api/aktivnosti';
      const zahtjev = dodatniResurs ? { aktivnost: osnovniPodaci, [dodatniResurs.polje]: konfiguracija }
        : razvrstavanje ? { aktivnost: osnovniPodaci, razvrstavanje }
        : memorija ? { aktivnost: osnovniPodaci, memorija } : promjenaPitanja ? { aktivnost: osnovniPodaci, pitanje }
        : promjenaSpajanja ? { aktivnost: osnovniPodaci, spajanje } : osnovniPodaci;
      const putanja = aktivnost ? `${resurs}/${aktivnost.id}` : resurs;
      const odgovor = brise
        ? await posaljiAdminZahtjev('DELETE', putanja)
        : await posaljiAdminZahtjev(aktivnost ? 'PUT' : 'POST', putanja, zahtjev);
      if (odgovor.status === 401 || odgovor.status === 403) {
        throw new Error('Provjerite administratorsku sesiju pa pokušajte ponovo.');
      }
      if (!odgovor.ok) {
        const problem: { detail?: string; greske?: Record<string, string> } | null =
          await odgovor.json().catch(() => null);
        const zadanaPoruka = brise ? 'Brisanje aktivnosti nije uspjelo' : 'Čuvanje aktivnosti nije uspjelo';
        throw new Error(Object.values(problem?.greske ?? {}).join(' ') || problem?.detail
          || `${zadanaPoruka} (HTTP ${odgovor.status}).`);
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

  const medijAkcije = {
    onIzmjena: () => setImaIzmjena(true),
    onSlanje: (razlika: number) => setBrojPrenosa((broj) => broj + razlika),
  };
  return <dialog ref={dijalog}
    className={`admin-dijalog${biraTip ? ' aktivnost-izbor-dijalog' : jePitanje ? ' aktivnost-pitanje-dijalog' : ''}`}
    aria-label={naslov} onClose={(event) => { if (event.target === event.currentTarget) onZatvori(); }}
    onCancel={(event) => {
      if (event.target === event.currentTarget && !dozvoliZatvaranje()) event.preventDefault();
    }}>
    <h2 ref={fokusKoraka} tabIndex={-1}>{naslov}</h2>
    <p>Nivo: <strong>{nazivNivoa}</strong></p>
    {biraTip && <>
      <IzborTipaAktivnosti tipovi={tipovi ?? []} odabraniId={odabraniTip?.id} onOdaberi={(izabrani) => {
        setOdabraniTip(izabrani);
        setBiraTip(false);
      }} />
      <div className="nova-igrica-akcije">
        <button type="button" className="secondary" onClick={() => {
          if (dozvoliZatvaranje()) dijalog.current?.close();
        }}>Otkaži</button>
      </div>
    </>}
    <div hidden={biraTip}>
    <form onSubmit={potvrdi} onChange={(event) => {
      setImaIzmjena(true);
      if (event.target instanceof HTMLInputElement && event.target.name === 'redniBroj') setGreskuRedoslijeda('');
    }}>
      {brise ? <p>Želiš li obrisati aktivnost broj {aktivnost?.redniBroj}?</p> : <>
        <OsnovniPodaciAktivnosti aktivnost={aktivnost} sljedeciBroj={sljedeciBroj} greskaRedoslijeda={greskaRedoslijeda} />
        {jePitanje && !cekaPodatke && <FormaPitanja ucitano={ucitanoPitanje ?? null}
          onIzmjena={() => setImaIzmjena(true)} />}
        {jeSpajanje && !cekaPodatke && <FormaSpajanja ucitano={ucitanoSpajanje ?? null}
          onIzmjena={() => setImaIzmjena(true)} />}
        {jeMemorija && !cekaPodatke && <FormaMemorije ucitano={ucitanaMemorija ?? null}
          onIzmjena={() => setImaIzmjena(true)} />}
        {jeRazvrstavanje && !cekaPodatke && <FormaRazvrstavanja ucitano={ucitanoRazvrstavanje ?? null}
          onIzmjena={() => setImaIzmjena(true)} />}
        {dodatniTip === 'slaganje-slova' && !cekaPodatke && <FormaSlaganjaSlova
          ucitano={ucitanaKonfiguracija as SlaganjeSlova ?? null} {...medijAkcije} />}
        {dodatniTip === 'bajka' && !cekaPodatke && <FormaBajke
          ucitano={ucitanaKonfiguracija as Bajka ?? null} {...medijAkcije} />}
        {dodatniTip === 'osmosmjerka' && !cekaPodatke && <FormaOsmosmjerke
          ucitano={ucitanaKonfiguracija as Osmosmjerka ?? null} onIzmjena={medijAkcije.onIzmjena} />}
        {greskaUcitavanja ? <>
          <p className="error" role="alert">{greskaUcitavanja}</p>
          <button type="button" className="secondary" onClick={() => {
            setGreskuUcitavanja('');
            setPokusajUcitavanja((pokusaj) => pokusaj + 1);
          }}>Pokušaj ponovo</button>
        </> : cekaPodatke && <p role="status">Učitavanje podataka…</p>}
      </>}
      {greska && <p className="error" role="alert">{greska}</p>}
      <div className="nova-igrica-akcije">
        {akcija.vrsta === 'dodaj' && <button type="button" className="secondary" disabled={zauzeto} onClick={() => {
          setGreska('');
          setBiraTip(true);
        }}>Nazad na tipove</button>}
        <button type="button" className="secondary" disabled={zauzeto} autoFocus={brise} onClick={() => {
          if (dozvoliZatvaranje()) dijalog.current?.close();
        }}>Otkaži</button>
        <button type="submit" className={brise ? 'primary opasna-akcija' : 'primary'}
          disabled={zauzeto || cekaPodatke || (!aktivnost && !odabraniTip)}>
          {salje ? (brise ? 'Brisanje…' : 'Čuvanje…') : brise ? 'Obriši' : 'Sačuvaj'}
        </button>
      </div>
    </form>
    </div>
  </dialog>;
}

function procitajKonfiguraciju(tip: keyof typeof dodatniTipovi, podaci: FormData,
  prethodna: SlaganjeSlova | Osmosmjerka | Bajka | null | undefined) {
  const tekst = (ime: string) => String(podaci.get(ime) ?? '').trim();
  if (tip === 'osmosmjerka') {
    const mreza = tekst('osmosmjerka');
    if (!mreza) throw new Error('Generiši mrežu prije čuvanja.');
    return prethodna && mreza === JSON.stringify(prethodna) ? null : JSON.parse(mreza) as Osmosmjerka;
  }
  if (tip === 'slaganje-slova') {
    const ciljniTekst = tekst('ciljniTekst');
    const putanjaSlike = tekst('putanjaSlaganja') || null;
    if (prethodna && 'ciljniTekst' in prethodna
      && ciljniTekst === prethodna.ciljniTekst && putanjaSlike === prethodna.putanjaSlike) return null;
    if (!/\p{L}/u.test(ciljniTekst)) throw new Error('Ciljni tekst mora sadržati bar jedno slovo.');
    return { ciljniTekst, putanjaSlike };
  }
  const bajka = {
    naslov: tekst('naslovBajke'), tekst: tekst('tekstBajke'),
    putanjaNaslovneSlike: tekst('putanjaNaslovneSlike') || null,
    putanjaAudioZapisa: tekst('putanjaAudioZapisa') || null,
  };
  if (!bajka.naslov || !bajka.tekst) throw new Error('Unesi naslov i tekst bajke.');
  return prethodna && 'naslov' in prethodna && Object.entries(bajka).every(([ime, vrijednost]) =>
    prethodna[ime as keyof Bajka] === vrijednost) ? null : bajka;
}
