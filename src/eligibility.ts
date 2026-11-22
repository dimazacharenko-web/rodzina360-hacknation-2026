// Reguły demonstracyjne. Źródło: ZUS, Poradnik dla rodziców (stan na 1.04.2026),
// oraz HackNation 2026, zadanie „Zasiłkowy Przewodnik Przyszłego Rodzica”.
// Wynik nie zastępuje indywidualnej decyzji ZUS.
export type Employment = '' | 'etat' | 'zlecenie' | 'dzialalnosc' | 'inne';
export type ParentProfile = { employment: Employment; insured: string; base: string };
export type Assessment = {
  status: 'possible' | 'risk' | 'review';
  title: string;
  details: string;
  warnings: string[];
};

export function assessMaternity(profile: ParentProfile): Assessment {
  if (!profile.employment || !profile.insured || profile.insured === 'nie_wiem') {
    return {status:'review',title:'Wymagana weryfikacja',details:'Brakuje potwierdzenia tytułu do ubezpieczenia chorobowego. Sprawdź dane w eZUS lub u płatnika składek.', warnings:['Brak danych o ubezpieczeniu — nie można potwierdzić prawa do zasiłku.']};
  }
  if (profile.employment === 'etat' && profile.insured === 'nie') {
    return {status:'review',title:'Niespójne dane',details:'Pracownicy co do zasady podlegają obowiązkowemu ubezpieczeniu chorobowemu. Zweryfikuj odpowiedź z pracodawcą.', warnings:['Dane o umowie o pracę i ubezpieczeniu wymagają wyjaśnienia.']};
  }
  if (profile.insured === 'nie') {
    return {status:'risk', title:'Brak standardowej podstawy do zasiłku',details:'Przy zadeklarowanym braku ubezpieczenia chorobowego standardowe prawo do zasiłku macierzyńskiego nie wynika z formularza. Istnieją ustawowe wyjątki, m.in. po ustaniu zatrudnienia.',warnings:['Sprawdź szczególne okoliczności po ustaniu zatrudnienia.','Może przysługiwać świadczenie rodzicielskie poza systemem zasiłków ZUS — wymaga odrębnej oceny.']};
  }
  if (profile.employment === 'inne') {
    return {status:'review', title:'Konieczna indywidualna ocena',details:'Wybierz dokładniejszy tytuł do ubezpieczenia i potwierdź jego ważność. Sama deklaracja „tak” nie wystarcza w tej sytuacji.',warnings:['Nie ustalono tytułu do ubezpieczenia.']};
  }
  const warnings = profile.employment === 'dzialalnosc'
    ? ['Przy działalności gospodarczej sprawdź zadłużenie składkowe i datę objęcia ubezpieczeniem chorobowym.']
    : [] as string[];
  if (profile.base.trim() !== '' && (!Number.isFinite(Number(profile.base)) || Number(profile.base) <= 0)) {
    return {status:'review', title:'Błędna podstawa wymiaru', details:'Podaj dodatnią i poprawną podstawę wymiaru zasiłku. Nie należy przyjmować wynagrodzenia brutto automatycznie za podstawę.', warnings:['Podstawa wymiaru musi być większa od 0 zł.']};
  }
  return {status:'possible', title:'Możliwe prawo do zasiłku', details:'Zadeklarowano ubezpieczenie chorobowe. Zasiłek macierzyński nie wymaga okresu wyczekiwania, ale ostateczne uprawnienia zależą od okoliczności i dokumentów.',warnings};
}
