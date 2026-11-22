# Rodzina360

**Zasiłkowy Przewodnik Przyszłego Rodzica** — HackNation 2026

Aplikacja React + TypeScript do planowania okresów opieki, wstępnej weryfikacji uprawnień ZUS i symulacji świadczeń rodzicielskich.

## Film demonstracyjny (maks. 3 minuty)

[**Obejrzyj film Rodzina360 v2 (MP4, 1:59)**](https://github.com/dimazacharenko-web/rodzina360-demo/blob/main/rodzina360-hacknation-2026-v2.mp4)

[Publiczne repozytorium z filmami](https://github.com/dimazacharenko-web/rodzina360-demo)

[Poprzednia wersja MP4 (v1)](demo/rodzina360-hacknation-2026.mp4)

Film pokazuje faktycznie działającą aplikację: profil rodziny, plan urlopów, kalendarz wniosków, Risk Radar i symulację wypłat. Wszystkie dane demonstracyjne są syntetyczne; film nie jest prezentacją prawdziwej sesji ZUS.

Film powstaje automatycznie z użyciem Playwright oraz GitHub Actions:
- [Scenariusz nagrania v2 — kursor i dodatkowe komentarze](scripts/record-hacknation-demo-v2.mjs)
- [Workflow generowania filmu v2](.github/workflows/demo-video-v2.yml)
- [Scenariusz v1](scripts/record-hacknation-demo.mjs)

## Uruchomienie

Wymagany Node.js 22.

```bash
npm install
npm run dev
```

Następnie otwórz adres podany przez Vite.

## Funkcje

- profil rodziców, warunki ubezpieczenia chorobowego oraz sytuacje szczególne,
- planowanie urlopów i indywidualnych części rodzicielskich,
- weryfikacja możliwych uprawnień i ryzyk formalnych,
- indywidualna lista dokumentów i terminów,
- orientacyjna symulacja kwot brutto oraz przykłady testowe,
- demonstracyjne integracje mObywatel i eZUS, bez rzeczywistego pobierania danych.

## Zastrzeżenie

Rodzina360 jest projektem demonstracyjnym. Informacje i symulacje nie są decyzją ZUS ani poradą prawną. Wyniki zależą od kompletności danych i potwierdzenia prawa do świadczeń.

Przed opublikowaniem całego repozytorium trzeba sprawdzić materiały w `knowledge/` pod kątem danych osobowych i ograniczeń udostępniania przykładów ZUS.
