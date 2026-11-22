/** Wyłącznie makieta przebiegu logowania przez mObywatel do HackNation 2026.
 * Brak kontaktu z systemami publicznymi, tokenów, uprawnień i realnej autoryzacji.
 */
export type MobywatelDemoSession=Readonly<{
  provider:'mObywatel';
  mode:'demonstration';
  displayName:'Rodzic demonstracyjny';
  authenticated:false;
  source:'simulated';
}>;

export const MOBYWATEL_DEMO_NOTICE=
  'DEMO — to nie jest usługa mObywatel, nie następuje uwierzytelnienie ani pobranie danych z rejestrów.';

export function createMobywatelDemoSession():MobywatelDemoSession{
  return {
    provider:'mObywatel',
    mode:'demonstration',
    displayName:'Rodzic demonstracyjny',
    authenticated:false,
    source:'simulated'
  };
}
