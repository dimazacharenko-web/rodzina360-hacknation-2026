/**
 * Rodzina360 — demonstracyjny kalkulator podstawowego scenariusza.
 * Źródło: ZUS, Poradnik dla rodziców i opiekunów dzieci, stan na 01.04.2026,
 * s. 29–34; https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski
 * Zakres: 1 dziecko, poród bez sytuacji szczególnych, oboje rodzice ubezpieczeni,
 * pełna podstawa wymiaru zasiłku podana przez użytkownika, rodzic 2 = ojciec.
 * Brak obliczeń podatków, miesięcznych okresów wypłaty oraz podwyższenia do 1000 zł.
 */
export type PaymentVariant = 'standard' | 'averaged';
export type BasicCalculation = {
  maternityWeeks: 20;
  parentalWeeks: 41;
  motherParentalWeeks: 32;
  fatherParentalWeeks: 9;
  motherAmount: number;
  fatherAmount: number;
  totalAmount: number;
  variant: PaymentVariant;
};

function roundGrosz(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateBasicScenario(motherBase: number, fatherBase: number, variant: PaymentVariant): BasicCalculation {
  if (![motherBase, fatherBase].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Podstawy wymiaru muszą być dodatnie i skończone.');
  }
  // Uproszczenie prezentacyjne: dzienna stawka = miesięczna podstawa / 30.
  // Liczymy kwoty teoretyczne za pełne tygodnie (7 dni), bez podatku i szczególnych korekt.
  const maternityDays = 20 * 7;
  const motherParentalDays = 32 * 7;
  const fatherParentalDays = 9 * 7;
  const motherAmount = variant === 'averaged'
    ? roundGrosz(motherBase / 30 * (maternityDays + motherParentalDays) * 0.815)
    : roundGrosz(motherBase / 30 * (maternityDays * 1 + motherParentalDays * 0.7));
  const fatherAmount = roundGrosz(fatherBase / 30 * fatherParentalDays * 0.7);
  return {
    maternityWeeks: 20, parentalWeeks: 41, motherParentalWeeks: 32, fatherParentalWeeks: 9,
    motherAmount, fatherAmount, totalAmount: roundGrosz(motherAmount + fatherAmount), variant
  };
}
