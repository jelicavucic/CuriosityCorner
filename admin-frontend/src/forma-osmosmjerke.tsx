import { useState } from 'react';

type Rijec = {
  rijec: string;
  pocetniRed: number;
  pocetnaKolona: number;
  krajnjiRed: number;
  krajnjaKolona: number;
};

export type Osmosmjerka = { brojRedova: number; brojKolona: number; mreza: string[][]; rijeci: Rijec[] };

const smjerovi = [-1, 0, 1].flatMap((red) => [-1, 0, 1].map((kolona) => [red, kolona]))
  .filter(([red, kolona]) => red !== 0 || kolona !== 0);
const abeceda = Array.from('ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ');

export function generisiOsmosmjerku(brojRedova: number, brojKolona: number, unos: string): Osmosmjerka {
  if (![brojRedova, brojKolona].every((broj) => Number.isInteger(broj) && broj >= 1 && broj <= 30)) {
    throw new Error('Broj redova i kolona mora biti između 1 i 30.');
  }
  const rijeci = unos.toUpperCase().normalize('NFC').split(/[,\s]+/u).filter(Boolean);
  if (!rijeci.length || rijeci.some((rijec) => !/^\p{L}+$/u.test(rijec))) {
    throw new Error('Unesi riječi sastavljene od slova, odvojene razmakom, zarezom ili novim redom.');
  }
  if (new Set(rijeci).size !== rijeci.length) throw new Error('Unesi svaku riječ samo jednom.');
  const slovaRijeci = rijeci.map((rijec) => ({ rijec, slova: rijec.match(/DŽ|LJ|NJ|\p{L}/gu)! }))
    .sort((a, b) => b.slova.length - a.slova.length);
  if (slovaRijeci[0].slova.length > Math.max(brojRedova, brojKolona) || rijeci.length > brojRedova * brojKolona) {
    throw new Error('Povećaj mrežu ili skrati listu riječi.');
  }

  for (let pokusaj = 0; pokusaj < 20; pokusaj++) {
    const mreza = Array.from({ length: brojRedova }, () => Array<string>(brojKolona).fill(''));
    const raspored: Rijec[] = [];
    const zauzetePutanje = new Set<string>();
    for (const { rijec, slova } of slovaRijeci) {
      const kandidati: { red: number; kolona: number; dr: number; dk: number; krajRed: number;
        krajKolona: number; putanja: string }[] = [];
      for (let red = 0; red < brojRedova; red++) {
        for (let kolona = 0; kolona < brojKolona; kolona++) {
          for (const [dr, dk] of slova.length === 1 ? [[0, 0]] : smjerovi) {
            const krajRed = red + (slova.length - 1) * dr;
            const krajKolona = kolona + (slova.length - 1) * dk;
            if (krajRed < 0 || krajRed >= brojRedova || krajKolona < 0 || krajKolona >= brojKolona) continue;
            const putanja = [red * brojKolona + kolona, krajRed * brojKolona + krajKolona].sort().join(':');
            if (zauzetePutanje.has(putanja) || !slova.every((slovo, i) => {
              const polje = mreza[red + i * dr][kolona + i * dk];
              return !polje || polje === slovo;
            })) continue;
            kandidati.push({ red, kolona, dr, dk, krajRed, krajKolona, putanja });
          }
        }
      }
      if (!kandidati.length) break;
      const { red, kolona, dr, dk, krajRed, krajKolona, putanja } =
        kandidati[Math.floor(Math.random() * kandidati.length)];
      slova.forEach((slovo, i) => { mreza[red + i * dr][kolona + i * dk] = slovo; });
      zauzetePutanje.add(putanja);
      raspored.push({ rijec, pocetniRed: red, pocetnaKolona: kolona, krajnjiRed: krajRed, krajnjaKolona: krajKolona });
    }
    if (raspored.length === rijeci.length) {
      return { brojRedova, brojKolona, rijeci: raspored,
        mreza: mreza.map((red) => red.map((slovo) => slovo || abeceda[Math.floor(Math.random() * abeceda.length)])) };
    }
  }
  throw new Error('Nije pronađen raspored za sve riječi. Pokušaj ponovo ili povećaj mrežu.');
}

export function FormaOsmosmjerke({ ucitano, onIzmjena }: { ucitano: Osmosmjerka | null; onIzmjena: () => void }) {
  const [redovi, setRedove] = useState(String(ucitano?.brojRedova ?? 8));
  const [kolone, setKolone] = useState(String(ucitano?.brojKolona ?? 8));
  const [rijeci, setRijeci] = useState(ucitano?.rijeci.map(({ rijec }) => rijec).join('\n') ?? '');
  const [raspored, setRaspored] = useState(ucitano);
  const [zastarjela, setZastarjelu] = useState(false);
  const [greska, setGresku] = useState('');

  function promijenjeno() {
    setZastarjelu(true);
    setGresku('');
  }

  return <section className="aktivnost-dodatna-forma">
    <label>Broj redova<input type="number" min="1" required value={redovi}
      onChange={(event) => { setRedove(event.target.value); promijenjeno(); }} /></label>
    <label>Broj kolona<input type="number" min="1" required value={kolone}
      onChange={(event) => { setKolone(event.target.value); promijenjeno(); }} /></label>
    <label>Skrivene riječi<textarea rows={4} required value={rijeci}
      onChange={(event) => { setRijeci(event.target.value); promijenjeno(); }} /></label>
    <button type="button" className="secondary" onClick={() => {
      if (raspored && !window.confirm('Želiš li zamijeniti postojeći raspored mreže?')) return;
      try {
        setRaspored(generisiOsmosmjerku(Number(redovi), Number(kolone), rijeci));
        setZastarjelu(false);
        setGresku('');
        onIzmjena();
      } catch (error) {
        setGresku(error instanceof Error ? error.message : 'Generisanje mreže nije uspjelo.');
      }
    }}>{raspored ? 'Generiši novu mrežu' : 'Generiši mrežu'}</button>
    {greska && <p className="error" role="alert">{greska}</p>}
    {zastarjela && raspored && <p>Generiši mrežu za izmijenjene unose prije čuvanja.</p>}
    <input type="hidden" name="osmosmjerka" value={raspored && !zastarjela ? JSON.stringify(raspored) : ''} />
    {raspored && <div className="detalji-tabela-okvir">
      <table className="aktivnost-mreza" aria-label="Pregled mreže osmosmjerke">
        <tbody>{raspored.mreza.map((red, i) => <tr key={i}>
          {red.map((slovo, j) => <td key={j}>{slovo}</td>)}
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}
