# CuriosityCorner

Repozitorijum za projektni zadatak iz Projektovanja softvera

## Get started

1. Kloniraj repozitorijum i uđi u folder

```bash
   git clone <link-repo>
   cd CuriosityCorner
```

2. Instaliraj zavisnosti

```bash
   npm install
```

3. Pokreni aplikaciju

```bash
   npx expo start
```

4. Skeniraj QR kod u terminalu pomoću **Expo Go** aplikacije na telefonu.

## ⚠️ Važna napomena o SDK verziji

Projekat koristi **Expo SDK 54**. Ovo je namerno i ne treba menjati bez dogovora sa timom — trenutno (jul 2026) verzije Expo Go dostupne na App Store-u i Play Store-u podržavaju samo SDK 54, zbog kašnjenja u Apple/Google odobrenju novijih verzija. Ako se projekat pomeri na noviju SDK verziju, Expo Go sa store-ova neće moći da ga otvori.

### Instalacija Expo Go
- **Android/iPhone:** obična instalacija sa Play Store / App Store je dovoljna (podržava SDK 54)

## Struktura projekta

Kod se piše unutar `src/app` foldera — ovo je Expo Router projekat, pa svaki fajl unutar `src/app` predstavlja jednu rutu/ekran u aplikaciji.

## Ako ti `npm install` javlja ERESOLVE grešku

Projekat ima `.npmrc` fajl sa `legacy-peer-deps=true` koji bi trebalo automatski da reši ovaj problem. Ako i dalje puca, pokreni ručno:

```bash
npm install --legacy-peer-deps
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
