/** Rodzina360: wyłącznie udokumentowany wariant L4 w ciąży dla pracownika.
 * Podstawa: załącznik do wyzwania HackNation 2026 s.1;
 * ustawa zasiłkowa (Dz.U. 2026 poz.854) art. 4, 8, 11, 36, 62;
 * Kodeks pracy art. 92. Dane o prawie i podstawie podaje użytkownik.
 * To obliczenie kwoty, a nie automatyczne przyznanie prawa do świadczenia.
 */
export type SicknessInput = {
  from: string; to: string; base: number;
  employerLimit: 14 | 33; employerDaysUsed: number;
  sicknessDaysUsed: number;
};
export type SicknessMonth = { month: string; employerDays: number; benefitDays: number; employerGross: number; benefitGross: number };
export type SicknessResult = {
  days: number; dailyGross: number; employerDays: number; benefitDays: number;
  employerGross: number; benefitGross: number; totalGross: number; months: SicknessMonth[];
};
const DAY = 86400000;
function parseISO(s: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw Error('Wybierz poprawne daty zwolnienia.');
  const t = Date.parse(s + 'T00:00:00Z');
  if (!Number.isFinite(t) || new Date(t).toISOString().slice(0,10) !== s) throw Error('Nieprawidłowa data.');
  return t;
}
export function calculatePregnancySickness(input: SicknessInput): SicknessResult {
  const start = parseISO(input.from), end = parseISO(input.to);
  if (end < start) throw Error('Data końca zwolnienia jest wcześniejsza niż początek.');
  if (input.from.slice(0,4) !== input.to.slice(0,4)) throw Error('Zwolnienie obejmujące dwa lata wymaga rozdzielenia na okresy roczne.');
  const days = Math.round((end - start) / DAY) + 1;
  if (days > 270) throw Error('Wybrany okres przekracza 270 dni.');
  if (!Number.isFinite(input.base) || input.base <= 0 || Math.round(input.base * 100) !== input.base * 100 && Math.abs(Math.round(input.base*100)-input.base*100)>1e-7) throw Error('Podaj potwierdzoną podstawę do dwóch miejsc po przecinku.');
  if (!Number.isInteger(input.employerDaysUsed) || input.employerDaysUsed < 0 || input.employerDaysUsed > input.employerLimit) throw Error('Nieprawidłowa liczba wykorzystanych dni wynagrodzenia chorobowego.');
  if (!Number.isInteger(input.sicknessDaysUsed) || input.sicknessDaysUsed < 0 || input.sicknessDaysUsed > 270) throw Error('Nieprawidłowa liczba wcześniej wykorzystanych dni okresu zasiłkowego.');
  if (input.sicknessDaysUsed + days > 270) throw Error('Łączny okres zasiłkowy przekracza 270 dni. Wymagana weryfikacja ZUS.');
  const dailyGrosz = Math.round(Math.round(input.base * 100) / 30);
  const employerDays = Math.min(days, input.employerLimit - input.employerDaysUsed);
  const benefitDays = days - employerDays;
  const monthly = new Map<string, { employerDays: number; benefitDays: number }>();
  for (let i=0; i<days; i++) {
    const month = new Date(start + i*DAY).toISOString().slice(0,7);
    const row = monthly.get(month) || { employerDays:0, benefitDays:0 };
    if (i<employerDays) row.employerDays++; else row.benefitDays++;
    monthly.set(month,row);
  }
  const months = [...monthly].map(([month, row]) => ({month, ...row, employerGross:row.employerDays*dailyGrosz/100, benefitGross:row.benefitDays*dailyGrosz/100}));
  return { days, dailyGross:dailyGrosz/100, employerDays, benefitDays, employerGross: employerDays*dailyGrosz/100, benefitGross:benefitDays*dailyGrosz/100, totalGross:days*dailyGrosz/100, months };
}
