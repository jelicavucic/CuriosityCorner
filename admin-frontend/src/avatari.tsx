import { useEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { Ellipsis, ImagePlus, Pencil, Plus, Search } from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';

export type Avatar = { id: number; naziv: string; putanjaSlike: string; aktivan: boolean };

export function Avatari({ avatari, greska, naslovPrikaza, onSacuvan }: {
  avatari: Avatar[] | null;
  greska: string;
  naslovPrikaza: Ref<HTMLHeadingElement>;
  onSacuvan: (avatar: Avatar) => void;
}) {
  const [odabir, setOdabir] = useState<Avatar | null | undefined>();
  const [poruka, setPoruku] = useState('');
  const [pretraga, setPretragu] = useState('');
  const [filter, setFilter] = useState('svi');
  const [mijenja, setMijenja] = useState<number | null>(null);
  const [greskaStatusa, setGreskuStatusa] = useState('');
  const prikazani = avatari?.filter(({ naziv, aktivan }) =>
    naziv.toLocaleLowerCase().includes(pretraga.trim().toLocaleLowerCase())
    && (filter === 'svi' || aktivan === (filter === 'aktivni')));

  async function promijeniStatus(avatar: Avatar) {
    if (mijenja !== null || (avatar.aktivan
      && !window.confirm(`Deaktivirati avatar „${avatar.naziv}”? Korisnici ga više neće moći odabrati.`))) return;
    setMijenja(avatar.id);
    setGreskuStatusa('');
    setPoruku('');
    try {
      const sacuvan: Avatar = await provjeri(await posaljiAdminZahtjev('PUT', `/api/avatari/${avatar.id}`, {
        naziv: avatar.naziv, putanjaSlike: avatar.putanjaSlike, aktivan: !avatar.aktivan,
      }));
      onSacuvan(sacuvan);
      setPoruku(`Avatar „${sacuvan.naziv}” je ${sacuvan.aktivan ? 'aktiviran' : 'deaktiviran'}.`);
    } catch (error) {
      setGreskuStatusa(error instanceof Error ? error.message : 'Promjena statusa nije uspjela.');
    } finally {
      setMijenja(null);
    }
  }

  return <section>
    <header className="sadrzaji-zaglavlje">
      <div><h1 ref={naslovPrikaza} tabIndex={-1}>Avatari</h1>
        <p>Upravljajte avatarima dostupnim korisnicima aplikacije.</p></div>
      <button className="primary" type="button" aria-haspopup="dialog" disabled={!avatari} onClick={() => {
        setPoruku('');
        setOdabir(null);
      }}><Plus size={18} aria-hidden="true" /> Dodaj avatar</button>
    </header>
    <div className="avatar-filteri">
      <label className="igrice-pretraga"><Search size={17} aria-hidden="true" />
        <input type="search" aria-label="Pretraži avatare po nazivu" placeholder="Pretraži avatare…"
          value={pretraga} onChange={(event) => setPretragu(event.target.value)} />
      </label>
      <label className="igrice-filter"><span>Status</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="svi">Svi</option><option value="aktivni">Aktivni</option><option value="neaktivni">Neaktivni</option>
        </select>
      </label>
    </div>
    {poruka && <p role="status">{poruka}</p>}
    {greskaStatusa && <p className="error" role="alert">{greskaStatusa}</p>}
    {greska ? <p className="error" role="alert">{greska}</p>
      : !avatari ? <p role="status">Učitavanje avatara…</p>
      : !avatari.length ? <p>Još nema avatara.</p>
      : !prikazani?.length ? <p role="status">Nema avatara koji odgovaraju pretrazi ili filteru.</p>
      : <div className="avatari-galerija">{prikazani.map((avatar) => <article key={avatar.id} className="avatar-kartica">
        <header className="avatar-kartica-zaglavlje">
          <span className="avatar-status" data-aktivan={avatar.aktivan}>{avatar.aktivan ? 'Aktivan' : 'Neaktivan'}</span>
          <details className="avatar-meni" onKeyDown={(event) => {
            if (event.key === 'Escape' && event.currentTarget.open) {
              event.stopPropagation();
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}>
            <summary className="sadrzaj-ikona" aria-label={`Opcije za avatar ${avatar.naziv}`}><Ellipsis size={20} aria-hidden="true" /></summary>
            <button type="button" className="secondary" disabled={mijenja !== null}
              onClick={(event) => {
                const meni = event.currentTarget.closest('details');
                if (meni) { meni.open = false; meni.querySelector('summary')?.focus(); }
                void promijeniStatus(avatar);
              }}>{avatar.aktivan ? 'Deaktiviraj' : 'Aktiviraj'}</button>
          </details>
        </header>
        <div className="avatar-slika"><img src={avatar.putanjaSlike} alt="" loading="lazy" /></div>
        <h2>{avatar.naziv}</h2>
        <p className="avatar-id">ID #{avatar.id}</p>
        <button className="secondary" type="button" aria-haspopup="dialog" aria-label={`Uredi avatar ${avatar.naziv}`}
          disabled={mijenja === avatar.id}
          onClick={() => { setPoruku(''); setOdabir(avatar); }}><Pencil size={16} aria-hidden="true" /> Uredi avatar</button>
      </article>)}</div>}
    {odabir !== undefined && <AvatarDijalog avatar={odabir} onZatvori={() => setOdabir(undefined)}
      onSacuvan={(avatar) => {
        onSacuvan(avatar);
        setPoruku(`Avatar „${avatar.naziv}” je sačuvan.`);
      }} />}
  </section>;
}

function AvatarDijalog({ avatar, onZatvori, onSacuvan }: {
  avatar: Avatar | null;
  onZatvori: () => void;
  onSacuvan: (avatar: Avatar) => void;
}) {
  const dijalog = useRef<HTMLDialogElement>(null);
  const [naziv, setNaziv] = useState(avatar?.naziv ?? '');
  const [aktivan, setAktivan] = useState(avatar?.aktivan ?? true);
  const [slika, setSliku] = useState<File | null>(null);
  const [pregled, setPregled] = useState('');
  const [putanja, setPutanju] = useState(avatar?.putanjaSlike ?? '');
  const [salje, setSalje] = useState(false);
  const [greska, setGresku] = useState('');
  const naslov = avatar ? 'Uredi avatar' : 'Dodaj avatar';

  useEffect(() => { dijalog.current?.showModal(); }, []);
  useEffect(() => {
    if (!slika) { setPregled(''); return; }
    const url = URL.createObjectURL(slika);
    setPregled(url);
    return () => URL.revokeObjectURL(url);
  }, [slika]);

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;
    if (!naziv.trim() || (!slika && !putanja)) {
      setGresku('Unesi naziv i odaberi sliku avatara.');
      return;
    }
    setGresku('');
    setSalje(true);
    try {
      let putanjaSlike = putanja;
      if (slika) {
        const podaci = new FormData();
        podaci.set('slika', slika);
        const rezultat: { putanjaSlike?: string } = await provjeri(await posaljiAdminZahtjev('POST', '/api/admin/fajlovi', podaci));
        if (!rezultat.putanjaSlike) throw new Error('Server nije vratio putanju slike.');
        putanjaSlike = rezultat.putanjaSlike;
        setPutanju(putanjaSlike);
        setSliku(null);
      }
      const sacuvan: Avatar = await provjeri(await posaljiAdminZahtjev(avatar ? 'PUT' : 'POST',
        avatar ? `/api/avatari/${avatar.id}` : '/api/avatari', { naziv: naziv.trim(), putanjaSlike, aktivan }));
      onSacuvan(sacuvan);
      dijalog.current?.close();
    } catch (error) {
      setGresku(error instanceof Error ? error.message : 'Čuvanje avatara nije uspjelo.');
    } finally {
      setSalje(false);
    }
  }

  return <dialog className="admin-dijalog" ref={dijalog} aria-label={naslov} onClose={onZatvori}
    onCancel={(event) => { if (salje) event.preventDefault(); }}>
    <h2>{naslov}</h2>
    <form onSubmit={sacuvaj}>
      <fieldset className="avatar-polja" disabled={salje}>
        <label>Naziv<input required maxLength={255} value={naziv} onChange={(event) => setNaziv(event.target.value)} /></label>
        <label className="aktivnost-datoteka-odabir">
          <input type="file" accept="image/png,image/jpeg,image/gif" onChange={(event) => {
            const fajl = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!fajl) return;
            if (fajl.size > 5 * 1024 * 1024) { setGresku('Slika smije imati najviše 5 MiB.'); return; }
            setGresku('');
            setSliku(fajl);
          }} />
          <span className="aktivnost-datoteka-ikona"><ImagePlus size={22} aria-hidden="true" /></span>
          <span><strong>{pregled || putanja ? 'Zamijeni sliku' : 'Odaberi sliku'}</strong>
            <small>PNG, JPEG ili GIF · do 5 MiB</small></span>
        </label>
        {(pregled || putanja) && <img className="aktivnost-medij" src={pregled || putanja} alt="Pregled avatara" />}
        <label>Status<select value={aktivan ? 'aktivan' : 'neaktivan'}
          onChange={(event) => setAktivan(event.target.value === 'aktivan')}>
          <option value="aktivan">Aktivan</option>
          <option value="neaktivan">Neaktivan</option>
        </select></label>
      </fieldset>
      {greska && <p className="error" role="alert">{greska}</p>}
      <div className="nova-igrica-akcije">
        <button type="button" className="secondary" disabled={salje} onClick={() => dijalog.current?.close()}>Otkaži</button>
        <button type="submit" className="primary" disabled={salje}>{salje ? 'Čuvanje…' : 'Sačuvaj'}</button>
      </div>
    </form>
  </dialog>;
}

async function provjeri(odgovor: Response) {
  const podaci = await odgovor.json().catch(() => null);
  if (!odgovor.ok) {
    throw new Error(Object.values(podaci?.greske ?? {}).join(' ') || podaci?.detail
      || `Zahtjev nije uspio (HTTP ${odgovor.status}).`);
  }
  if (!podaci) throw new Error('Backend nije vratio podatke.');
  return podaci;
}
