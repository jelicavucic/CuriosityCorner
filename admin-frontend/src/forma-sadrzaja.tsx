import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Image, ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { posaljiAdminZahtjev } from './auth';
import { Modal, PrikazSadrzaja, provjeriOdgovor, type Sadrzaj } from './sadrzaj-prikaz';

const formati = ['image/png', 'image/jpeg', 'image/gif'];
const maksimalnaVelicinaMiB = 5;
const maksimalnaVelicina = maksimalnaVelicinaMiB * 1024 * 1024;

function provjeriDatoteku(datoteka: File) {
  if (!formati.includes(datoteka.type) && (datoteka.type || !/\.(png|jpe?g|gif)$/i.test(datoteka.name))) {
    return 'Odaberi sliku u formatu PNG, JPG ili GIF.';
  }
  if (!datoteka.size) return 'Odabrana datoteka je prazna.';
  if (datoteka.size > maksimalnaVelicina) return `Slika smije imati najviše ${maksimalnaVelicinaMiB} MiB.`;
  return '';
}

export function FormaSadrzaja({ stavka, onZatvori, onSacuvan }: {
  stavka?: Sadrzaj;
  onZatvori: () => void;
  onSacuvan: (zapis: Sadrzaj) => void;
}) {
  const [tekst, setTekst] = useState(stavka?.tekst ?? '');
  const [putanja, setPutanja] = useState(stavka?.putanjaSlike ?? '');
  const [opis, setOpis] = useState(stavka?.alternativniTekst ?? '');
  const [datoteka, setDatoteku] = useState<File | null>(null);
  const [lokalnaSlika, setLokalnuSliku] = useState<{ datoteka: File; url: string } | null>(null);
  const [prevlacenje, setPrevlacenje] = useState(false);
  const [greska, setGreska] = useState('');
  const [salje, setSalje] = useState(false);
  const poljeSlike = useRef<HTMLInputElement>(null);
  const dubinaPrevlacenja = useRef(0);
  const imaSliku = Boolean(putanja || datoteka);
  const imaIzmjena = Boolean(datoteka) || tekst !== (stavka?.tekst ?? '')
    || putanja !== (stavka?.putanjaSlike ?? '') || opis !== (stavka?.alternativniTekst ?? '');
  const greskaDatoteke = datoteka ? provjeriDatoteku(datoteka) : '';
  const lokalnaPutanja = lokalnaSlika?.datoteka === datoteka ? lokalnaSlika?.url : null;
  const pregled: Sadrzaj = {
    id: stavka?.id ?? 0,
    tekst: tekst.trim() || null,
    putanjaSlike: (datoteka ? lokalnaPutanja : putanja) || null,
    alternativniTekst: imaSliku ? opis.trim() || 'Slika' : null,
  };

  useEffect(() => {
    if (!datoteka?.size) {
      setLokalnuSliku(null);
      return;
    }
    const url = URL.createObjectURL(datoteka);
    setLokalnuSliku({ datoteka, url });
    return () => URL.revokeObjectURL(url);
  }, [datoteka]);

  useEffect(() => {
    if (!imaIzmjena) return;
    function upozori(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }
    window.addEventListener('beforeunload', upozori);
    return () => window.removeEventListener('beforeunload', upozori);
  }, [imaIzmjena]);

  function potvrdiZatvaranje() {
    return !imaIzmjena || window.confirm('Imaš nesačuvane izmjene. Želiš li ih odbaciti?');
  }

  function odaberiSliku(slika: File) {
    setDatoteku(slika);
    setGreska('');
  }

  async function sacuvaj(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salje) return;
    const sadrzaj = tekst.trim();
    if (!sadrzaj && !imaSliku) {
      setGreska('Unesi tekst, dodaj sliku ili oboje.');
      return;
    }
    if (greskaDatoteke) {
      setGreska(greskaDatoteke);
      return;
    }

    setGreska('');
    setSalje(true);
    try {
      let sacuvanaPutanja = putanja;
      if (datoteka) {
        const podaci = new FormData();
        podaci.append('slika', datoteka);
        const upload = await posaljiAdminZahtjev('POST', '/api/admin/fajlovi', podaci);
        await provjeriOdgovor(upload, 'Slanje slike nije uspjelo.');
        const rezultat: { putanjaSlike?: string } = await upload.json();
        if (!rezultat.putanjaSlike) throw new Error('Server nije vratio putanju slike.');
        sacuvanaPutanja = rezultat.putanjaSlike;
        setPutanja(sacuvanaPutanja);
        setDatoteku(null);
      }
      const odgovor = await posaljiAdminZahtjev(stavka ? 'PUT' : 'POST',
        stavka ? `/api/sadrzaji/${stavka.id}` : '/api/sadrzaji', {
          tekst: sadrzaj || null,
          putanjaSlike: sacuvanaPutanja || null,
          alternativniTekst: sacuvanaPutanja ? opis.trim() || null : null,
        });
      await provjeriOdgovor(odgovor, 'Čuvanje sadržaja nije uspjelo.');
      onSacuvan(await odgovor.json());
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Čuvanje sadržaja nije uspjelo.');
    } finally {
      setSalje(false);
    }
  }

  return <Modal naslov={stavka ? 'Uredi sadržaj' : 'Dodaj novi sadržaj'} zauzet={salje}
    onZatvori={onZatvori} prijeZatvaranja={potvrdiZatvaranje}>
    <form onSubmit={sacuvaj} className="sadrzaj-forma">
      <fieldset disabled={salje}>
        <div className="sadrzaj-forma-kolone">
          <div className="sadrzaj-polja">
            <label>Tekst sadržaja
              <textarea rows={4} maxLength={10000} placeholder="Unesi tekst sadržaja…"
                value={tekst} onChange={(event) => {
                  setTekst(event.currentTarget.value);
                  setGreska('');
                }} />
            </label>
            <div className="sadrzaj-polje-slike">
              <span className="sadrzaj-labela">Slika</span>
              <div className={`sadrzaj-datoteka${prevlacenje ? ' sadrzaj-datoteka--aktivna' : ''}`}
                onDragEnter={(event) => {
                  if (!event.dataTransfer.types.includes('Files')) return;
                  event.preventDefault();
                  dubinaPrevlacenja.current += 1;
                  if (!salje) setPrevlacenje(true);
                }}
                onDragOver={(event) => {
                  if (!event.dataTransfer.types.includes('Files')) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = salje ? 'none' : 'copy';
                }}
                onDragLeave={() => {
                  dubinaPrevlacenja.current = Math.max(0, dubinaPrevlacenja.current - 1);
                  if (!dubinaPrevlacenja.current) setPrevlacenje(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dubinaPrevlacenja.current = 0;
                  setPrevlacenje(false);
                  const slika = event.dataTransfer.files[0];
                  if (!salje && slika) odaberiSliku(slika);
                }}>
                <input ref={poljeSlike} type="file" hidden accept={formati.join(',')} onChange={(event) => {
                  const slika = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (slika) odaberiSliku(slika);
                }} />
                {imaSliku ? <div className="sadrzaj-odabrana-slika">
                  {pregled.putanjaSlike && <img src={pregled.putanjaSlike} alt="" />}
                  <span>{datoteka?.name ?? 'Sačuvana slika'}</span>
                  <div className="sadrzaj-slika-akcije">
                    <button type="button" className="secondary" onClick={() => poljeSlike.current?.click()}>
                      <RefreshCw size={15} aria-hidden="true" /> Zamijeni
                    </button>
                    <button type="button" className="secondary" onClick={() => {
                      setPutanja('');
                      setDatoteku(null);
                      setOpis('');
                      setGreska('');
                    }}><Trash2 size={15} aria-hidden="true" /> Ukloni</button>
                  </div>
                </div> : <button type="button" className="sadrzaj-odaberi-sliku" onClick={() => poljeSlike.current?.click()}>
                  <ImagePlus size={26} aria-hidden="true" />
                  Odaberi ili prevuci sliku
                  <small>PNG, JPG ili GIF do {maksimalnaVelicinaMiB} MiB</small>
                </button>}
              </div>
            </div>
            {imaSliku && <label>Alternativni tekst slike
              <input value={opis} maxLength={250} placeholder="Opiši šta je prikazano na slici"
                onChange={(event) => setOpis(event.currentTarget.value)} />
            </label>}
            <small>Unesi tekst, dodaj sliku ili oboje.</small>
          </div>
          <aside className="sadrzaj-pregled sadrzaj--tekst" aria-label="Pregled sadržaja">
            <h3>Pregled sadržaja</h3>
            <div className="sadrzaj-pregled-tijelo">
              {pregled.tekst || pregled.putanjaSlike ? <PrikazSadrzaja stavka={pregled} />
                : <div className="sadrzaj-pregled-prazan">
                  <Image size={30} aria-hidden="true" />
                  <p>Ovdje će se prikazati odabrana slika i uneseni tekst.</p>
                </div>}
            </div>
          </aside>
        </div>
        {greska && <p className="error" role="alert">{greska}</p>}
        <div className="sadrzaj-forma-akcije">
          <button type="button" className="secondary" onClick={() => {
            if (potvrdiZatvaranje()) onZatvori();
          }}>Otkaži</button>
          <button type="submit" className="primary"><Check size={17} aria-hidden="true" />
            {salje ? 'Čuvanje…' : 'Sačuvaj sadržaj'}</button>
        </div>
      </fieldset>
    </form>
  </Modal>;
}
