import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';

type Kategorija = {
  id: number;
  naziv: string;
  opis: string | null;
  idNadkategorije: number | null;
};

// U mobile/.env.local podesiti adresu servera dostupnu telefonu.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export default function KategorijeScreen() {
  const router = useRouter();
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [odabrana, setOdabrana] = useState<Kategorija | null>(null);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);

  const ucitaj = useCallback(async (signal?: AbortSignal) => {
    setUcitavanje(true);
    setGreska(null);
    try {
      if (!apiUrl) throw new Error('Adresa servera nije podešena. Provjeri EXPO_PUBLIC_API_URL.');
      const odgovor = await fetch(`${apiUrl}/api/kategorije`, { signal });
      if (!odgovor.ok) throw new Error('Kategorije trenutno nisu dostupne.');
      const podaci: Kategorija[] = await odgovor.json();
      if (!Array.isArray(podaci)) throw new Error('Podaci kategorija nisu u očekivanom obliku.');
      if (!signal?.aborted) setKategorije(podaci);
    } catch {
      if (!signal?.aborted) {
        setGreska(apiUrl ? 'Ne možemo učitati kategorije. Provjeri vezu sa serverom.' : 'Adresa servera nije podešena. Provjeri EXPO_PUBLIC_API_URL.');
      }
    } finally {
      if (!signal?.aborted) setUcitavanje(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void ucitaj(controller.signal);
    return () => controller.abort();
  }, [ucitaj]);

  const prikazane = kategorije.filter((k) =>
    odabrana ? k.idNadkategorije === odabrana.id : k.idNadkategorije == null
  );

  const nazad = () => {
    if (!odabrana) {
      router.back();
      return;
    }
    const roditelj = kategorije.find((k) => k.id === odabrana.idNadkategorije);
    setOdabrana(roditelj ?? null);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Nazad" onPress={nazad} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{odabrana?.naziv ?? 'Kategorije'}</Text>
      </View>
      <Text style={styles.subtitle}>{odabrana ? 'Izaberi oblast koju želiš istražiti!' : 'Šta danas želiš istraživati?'}</Text>
      {ucitavanje ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#238a7b" /><Text style={styles.message}>Učitavamo kategorije...</Text></View>
      ) : greska ? (
        <View style={styles.center}><Text style={styles.message}>{greska}</Text><Pressable accessibilityRole="button" onPress={() => void ucitaj()} style={styles.retry}><Text style={styles.retryText}>Pokušaj ponovo</Text></Pressable></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {prikazane.length === 0 ? <Text style={styles.message}>Ovdje još nema kategorija.</Text> : prikazane.map((k, index) => (
            <Pressable accessibilityRole="button" accessibilityLabel={k.naziv} key={k.id} onPress={() => setOdabrana(k)} style={styles.card}>
              <View style={[styles.circle, { backgroundColor: ['#FFF3AE', '#FFD8C9', '#D5F5E7', '#E5D9F6'][index % 4] }]}>
                <Text style={styles.emoji}>{['⭐', '🌍', '🌱', '📚', '💡'][index % 5]}</Text>
              </View>
              <Text style={styles.name}>{k.naziv}</Text>
              {k.opis ? <Text style={styles.description}>{k.opis}</Text> : null}
            </Pressable>
          ))}
          {odabrana && prikazane.length === 0 ? <Text style={styles.hint}>Izbor igrica povezujemo u sljedećem koraku.</Text> : null}
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
  subtitle: { textAlign: 'center', marginVertical: 18, fontFamily: 'Baloo2_400Regular', fontSize: 18, color: '#285F56' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingBottom: 48 },
  card: { width: '43%', maxWidth: 200, alignItems: 'center', padding: 12, borderRadius: 24, backgroundColor: '#F5FCF7', minHeight: 155 },
  circle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 38 }, name: { fontFamily: 'Baloo2_700Bold', fontSize: 18, color: '#25665B', textAlign: 'center', marginTop: 8 },
  description: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: '#476D65', textAlign: 'center' },
  message: { fontFamily: 'Baloo2_400Regular', color: '#285F56', textAlign: 'center', fontSize: 16 },
  hint: { width: '100%', textAlign: 'center', color: '#285F56', fontFamily: 'Baloo2_400Regular' },
  retry: { backgroundColor: '#FFF3AE', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18 },
  retryText: { color: '#285F56', fontFamily: 'Baloo2_700Bold' },
});
