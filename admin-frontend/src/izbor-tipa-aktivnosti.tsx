import { BookOpen, CircleHelp, Gamepad2, Grid3X3, Layers, Link2, ListTree, Type } from 'lucide-react';
import type { TipAktivnosti } from './aktivnosti';

const kartice = {
  pitanje: { ikona: CircleHelp, opis: 'Pitanje s ponuđenim odgovorima.' },
  spajanje: { ikona: Link2, opis: 'Povezivanje sadržaja koji čine par.' },
  memorija: { ikona: Layers, opis: 'Pronalaženje parova okretanjem kartica.' },
  osmosmjerka: { ikona: Grid3X3, opis: 'Pronalaženje riječi u mreži slova.' },
  'slaganje-slova': { ikona: Type, opis: 'Slaganje ciljne riječi od ponuđenih slova.' },
  razvrstavanje: { ikona: ListTree, opis: 'Razvrstavanje sadržaja u odgovarajuće grupe.' },
  bajka: { ikona: BookOpen, opis: 'Priča za čitanje ili slušanje.' },
};

export function IzborTipaAktivnosti({ tipovi, odabraniId, onOdaberi }: {
  tipovi: TipAktivnosti[];
  odabraniId?: number;
  onOdaberi: (tip: TipAktivnosti) => void;
}) {
  const poOznaci = new Map(tipovi.map((tip) => [tip.oznaka.toLowerCase(), tip]));
  const redoslijed = Object.keys(kartice);
  const uredjeni = [...redoslijed, ...[...poOznaci.keys()].filter((oznaka) => !redoslijed.includes(oznaka))];

  return <ul className="aktivnost-tipovi">
    {uredjeni.map((oznaka) => {
      const tip = poOznaci.get(oznaka);
      if (!tip) return null;
      const izgled = kartice[oznaka as keyof typeof kartice];
      const Ikona = izgled?.ikona ?? Gamepad2;
      return <li key={tip.id}>
        <button type="button" className="aktivnost-tip-kartica" aria-pressed={tip.id === odabraniId}
          onClick={() => onOdaberi(tip)}>
          <span className="aktivnost-tip-ikona"><Ikona size={22} aria-hidden="true" /></span>
          <strong>{tip.naziv}</strong>
          {izgled && <small>{izgled.opis}</small>}
        </button>
      </li>;
    })}
  </ul>;
}
