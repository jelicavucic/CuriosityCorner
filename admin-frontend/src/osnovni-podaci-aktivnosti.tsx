import type { Aktivnost } from './aktivnosti';

export function OsnovniPodaciAktivnosti({ aktivnost, sljedeciBroj, greskaRedoslijeda }: {
  aktivnost: Aktivnost | null;
  sljedeciBroj: number;
  greskaRedoslijeda?: string;
}) {
  return <>
    <label>Uputstvo
      <textarea name="uputstvo" maxLength={1000} rows={3} defaultValue={aktivnost?.uputstvo ?? ''} />
    </label>
    <label>Težina
      <select name="tezina" defaultValue={aktivnost?.tezina ?? 'LAKO'}>
        <option value="LAKO">Lako</option>
        <option value="SREDNJE">Srednje</option>
        <option value="TESKO">Teško</option>
      </select>
    </label>
    <div className="uzrasti">
      <label>Redni broj
        <input name="redniBroj" type="number" min={1} max={2147483647} required
          aria-invalid={Boolean(greskaRedoslijeda)}
          aria-describedby={greskaRedoslijeda ? 'aktivnost-greska-redoslijeda' : undefined}
          defaultValue={aktivnost?.redniBroj ?? sljedeciBroj} />
        {greskaRedoslijeda && <span id="aktivnost-greska-redoslijeda" className="error" role="alert">
          {greskaRedoslijeda}
        </span>}
      </label>
      <label>Bodovi
        <input name="brojBodova" type="number" min={0} max={2147483647} required
          defaultValue={aktivnost?.brojBodova ?? 0} />
      </label>
    </div>
  </>;
}
