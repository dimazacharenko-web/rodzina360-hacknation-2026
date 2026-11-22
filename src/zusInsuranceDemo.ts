/** Wyłącznie syntetyczne dane testowe do demonstracji pobierania z systemów ZUS.
 * Nie ma połączenia z eZUS, PUE, mObywatel, API ani prawdziwymi danymi obywateli.
 */
export type ZusInsuranceDemoId='employee'|'voluntary'|'no_insurance'|'jdg_debt';
export type ZusDemoEmployment='etat'|'zlecenie'|'dzialalnosc';
export type ZusDemoInsurance='tak'|'nie';
export type ZusDemoDebt='none'|'over'|'unknown';
export type ZusInsuranceDemoRecord=Readonly<{
 id:ZusInsuranceDemoId;
 title:string;
 description:string;
 employment:ZusDemoEmployment;
 insured:ZusDemoInsurance;
 debt:ZusDemoDebt;
 startDate:string;
 endDate:string;
 note:string;
 synthetic:true;
}>;
export const ZUS_INSURANCE_DEMO_DISCLAIMER='DEMO — dane syntetyczne. Nie pobrano informacji z ZUS ani nie potwierdzono ubezpieczenia lub prawa do świadczenia.';
export const zusInsuranceDemoRecords:readonly ZusInsuranceDemoRecord[]=[
 {
  id:'employee',title:'Umowa o pracę — ubezpieczenie chorobowe',
  description:'Przykład aktywnego obowiązkowego ubezpieczenia chorobowego.',
  employment:'etat',insured:'tak',debt:'unknown',
  startDate:'2025-01-15',endDate:'',
  note:'Wariant pokazuje automatyczne uzupełnienie typu zatrudnienia i daty zgłoszenia.',
  synthetic:true
 },
 {
  id:'voluntary',title:'Umowa zlecenie — dobrowolne chorobowe',
  description:'Przykład dobrowolnego ubezpieczenia chorobowego przy zleceniu.',
  employment:'zlecenie',insured:'tak',debt:'unknown',
  startDate:'2026-08-01',endDate:'',
  note:'Przy zleceniu potwierdzenie zgłoszenia i okres wyczekiwania wymagają weryfikacji.',
  synthetic:true
 },
 {
  id:'no_insurance',title:'Brak aktualnego ubezpieczenia chorobowego',
  description:'Przykład zlecenia i zakończonego wcześniej ubezpieczenia.',
  employment:'zlecenie',insured:'nie',debt:'unknown',
  startDate:'2025-02-01',endDate:'2026-03-31',
  note:'Brak bieżącego ubezpieczenia może uniemożliwiać standardową wypłatę; wyjątki wymagają sprawdzenia.',
  synthetic:true
 },
 {
  id:'jdg_debt',title:'JDG — ubezpieczenie i ryzyko zadłużenia',
  description:'Przykład przedsiębiorcy z ubezpieczeniem chorobowym i zaległością ponad próg.',
  employment:'dzialalnosc',insured:'tak',debt:'over',
  startDate:'2025-09-01',endDate:'',
  note:'Zadłużenie wymaga wyjaśnienia w ZUS; dane są wymyślone na potrzeby testu.',
  synthetic:true
 }
] as const;
export function getZusInsuranceDemoRecord(id:ZusInsuranceDemoId):ZusInsuranceDemoRecord{
 const record=zusInsuranceDemoRecords.find(x=>x.id===id);
 if(!record)throw new Error('Nieznany scenariusz ZUS DEMO.');
 return record;
}
