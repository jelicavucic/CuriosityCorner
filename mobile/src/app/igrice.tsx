import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Igrica = { id: number; idKategorije: number; naziv: string; opis: string | null; status: string };
type Nivo = { id: number; idIgrice: number; redniBroj: number; naziv: string; bodoviZaOtkljucavanje: number };

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export default function IgriceScreen() {
  const router = useRouter();
  const { kategorijaId, naziv } = useLocalSearchParams<{ kategorijaId: string; naziv: string }>();
  const [igrice, setIgrice] = useState<Igrica[]>([]);
  const [nivoi, setNivoi] = useState<Nivo[]>([]);
  const [odabrana, setOdabrana] = useState<Igrica | null>(null);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [odabraniNivo, setOdabraniNivo] = useState<Nivo | null>(null);

  const ucitaj = useCallback(async (signal?: AbortSignal) => {
    setUcitavanje(true);
    setGreska(null);
    try {
      if (!apiUrl) throw new Error('Nedostaje adresa servera.');
      const [odgovorIgrice, odgovorNivoi] = await Promise.all([
        fetch(`${apiUrl}/api/igrice`, { signal }),
        fetch(`${apiUrl}/api/nivoi`, { signal }),
      ]);
      if (!odgovorIgrice.ok || !odgovorNivoi.ok) throw new Error('Server nije vratio podatke.');
      const [podaciIgrice, podaciNivoi] = await Promise.all([odgovorIgrice.json(), odgovorNivoi.json()]);
      if (!Array.isArray(podaciIgrice) || !Array.isArray(podaciNivoi)) throw new Error('Neispravan format podataka.');
      if (!signal?.aborted) {
        setIgrice(podaciIgrice);
        setNivoi(podaciNivoi);
      }
    } catch {
      if (!signal?.aborted) setGreska(apiUrl ? 'Ne možemo učitati igrice i nivoe. Provjeri vezu sa serverom.' : 'Adresa servera nije podešena.');
    } finally {
      if (!signal?.aborted) setUcitavanje(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void ucitaj(controller.signal);
    return () => controller.abort();
  }, [ucitaj]);

  const vidljiveIgrice = igrice.filter((igra) => igra.idKategorije === Number(kategorijaId) && igra.status === 'AKTIVNA');
  const vidljiviNivoi = nivoi.filter((nivo) => nivo.idIgrice === odabrana?.id).sort((a, b) => a.redniBroj - b.redniBroj);

  const nazad = () => {
    if (odabraniNivo) setOdabraniNivo(null);
    else if (odabrana) setOdabrana(null);
    else router.back();
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Nazad" onPress={nazad} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{odabraniNivo?.naziv || odabrana?.naziv || naziv || 'Igrice'}</Text>
      </View>
      {ucitavanje ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#238a7b" /><Text style={styles.message}>Učitavamo...</Text></View>
      ) : greska ? (
        <View style={styles.center}><Text style={styles.message}>{greska}</Text><Pressable accessibilityRole="button" onPress={() => void ucitaj()} style={styles.retry}><Text style={styles.name}>Pokušaj ponovo</Text></Pressable></View>
      ) : odabraniNivo ? (
        <View style={styles.center}><Text style={styles.message}>Aktivnosti ovog nivoa povezaćemo u sljedećem koraku.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>{odabrana ? 'Izaberi nivo!' : 'Izaberi igricu!'}</Text>
          <View style={styles.list}>
            {odabrana ? (
              vidljiviNivoi.length === 0 ? <Text style={styles.message}>Za ovu igricu još nema nivoa.</Text> :
              vidljiviNivoi.map((nivo) => (
                <Pressable key={nivo.id} accessibilityRole="button" onPress={() => setOdabraniNivo(nivo)} style={styles.card}>
                  <View style={styles.circle}><Text style={styles.number}>{nivo.redniBroj}</Text></View>
                  <Text style={styles.name}>{nivo.naziv || `Nivo ${nivo.redniBroj}`}</Text>
                  {nivo.bodoviZaOtkljucavanje > 0 ? <Text style={styles.description}>Potrebno bodova: {nivo.bodoviZaOtkljucavanje}</Text> : null}
                </Pressable>
              ))
            ) : (
              vidljiveIgrice.length === 0 ? <Text style={styles.message}>U ovoj kategoriji još nema aktivnih igrica.</Text> :
              vidljiveIgrice.map((igra) => (
                <Pressable key={igra.id} accessibilityRole="button" onPress={() => setOdabrana(igra)} style={styles.card}>
                  <View style={styles.circle}><Text style={styles.number}>★</Text></View>
                  <Text style={styles.name}>{igra.naziv}</Text>
                  {igra.opis ? <Text style={styles.description}>{igra.opis}</Text> : null}
                </Pressable>
              ))
            )}
          </View>
          {odabrana ? <Text style={styles.hint}>Otključavanje nivoa povezaćemo kada budu dostupni podaci o napretku.</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#B5EADF', paddingTop: 56, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF5B3', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 36, lineHeight: 40, color: '#317e72' },
  title: { flex: 1, textAlign: 'center', overflow: 'hidden', backgroundColor: '#FFDAD0', borderRadius: 24, padding: 8, fontFamily: 'Baloo2_700Bold', fontSize: 26, color: '#80575A', marginRight: 58 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { paddingBottom: 48 },
  subtitle: { textAlign: 'center', marginVertical: 18, fontFamily: 'Baloo2_400Regular', fontSize: 18, color: '#285F56' },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  card: { width: '43%', maxWidth: 200, minHeight: 150, alignItems: 'center', padding: 12, borderRadius: 24, backgroundColor: '#F5FCF7' },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF3AE', alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: 'Baloo2_700Bold', fontSize: 32, color: '#D28C48' },
  name: { fontFamily: 'Baloo2_700Bold', fontSize: 18, color: '#25665B', textAlign: 'center', marginTop: 8 },
  description: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: '#476D65', textAlign: 'center' },
  message: { fontFamily: 'Baloo2_400Regular', color: '#285F56', textAlign: 'center', fontSize: 16 },
  hint: { textAlign: 'center', marginTop: 24, color: '#285F56', fontFamily: 'Baloo2_400Regular' },
  retry: { backgroundColor: '#FFF3AE', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18 },
});
