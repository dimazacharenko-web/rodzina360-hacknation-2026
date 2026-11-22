/** e-ZLA: wyłącznie syntetyczne rekordy podglądu, bez połączenia z eZUS.
 * Źródła terminologii: ZUS "Zaświadczenia lekarskie" oraz "Niezbędne dokumenty
 * do zasiłku chorobowego" (listopad 2026).
 * Kod B można pominąć na pisemny wniosek ubezpieczonego; ciąża może być
 * potwierdzona odrębnym dokumentem. Nie wyciągamy z tego automatycznej decyzji.
 */
export type EzlaDemoId='pregnancy_b'|'general_illness'|'pregnancy_no_b'|'cancelled';
export type EzlaDemoStatus='issued'|'cancelled';
export type EzlaDemoRecord=Readonly<{
 id:EzlaDemoId;
 number:string;
 title:string;
 issuedOn:string;
 from:string;to:string;
 letterCode:'B'|'none';
 pregnancyContext:boolean;
 status:EzlaDemoStatus;
 reason:'choroba';
 notes:string;
 synthetic:true;
}>;
export const EZLA_DEMO_DISCLAIMER='DEMO — syntetyczne e-ZLA. Nie odczytano zaświadczeń z ZUS ani danych medycznych; dokument nie potwierdza prawa do świadczenia.';
export const ezlaDemoRecords:readonly EzlaDemoRecord[]=[
 {
  id:'pregnancy_b',number:'DEMO-EZLA-001',title:'Choroba w czasie ciąży — kod B',
  issuedOn:'2026-11-04',from:'2026-11-04',to:'2026-11-23',
  letterCode:'B',pregnancyContext:true,status:'issued',reason:'choroba',
  notes:'Kod B potwierdza w demonstracji okres niezdolności do pracy w ciąży. To nie jest rzeczywiste zwolnienie lekarskie ani dokument potrzebny do wypłaty.',
  synthetic:true
 },
 {
  id:'general_illness',number:'DEMO-EZLA-002',title:'Niezdolność do pracy z powodu choroby — bez kodu B',
  issuedOn:'2026-10-07',from:'2026-10-07',to:'2026-10-16',
  letterCode:'none',pregnancyContext:false,status:'issued',reason:'choroba',
  notes:'Przykład zwykłej choroby bez potwierdzenia ciąży. Nie można na tej podstawie zastosować stawki 100% związanej z ciążą.',
  synthetic:true
 },
 {
  id:'pregnancy_no_b',number:'DEMO-EZLA-003',title:'Choroba w ciąży — bez kodu B',
  issuedOn:'2026-11-11',from:'2026-11-11',to:'2026-11-20',
  letterCode:'none',pregnancyContext:true,status:'issued',reason:'choroba',
  notes:'Brak kodu B nie przesądza o braku ciąży. ZUS może wymagać odrębnego zaświadczenia lekarskiego potwierdzającego ciążę.',
  synthetic:true
 },
 {
  id:'cancelled',number:'DEMO-EZLA-004',title:'Zaświadczenie anulowane — przykład',
  issuedOn:'2026-09-01',from:'2026-09-01',to:'2026-09-07',
  letterCode:'B',pregnancyContext:true,status:'cancelled',reason:'choroba',
  notes:'Anulowane zaświadczenie nie może zostać przeniesione do kalkulatora jako ważny okres e-ZLA.',
  synthetic:true
 }
] as const;
export function getEzlaDemoRecord(id:EzlaDemoId):EzlaDemoRecord{
 const record=ezlaDemoRecords.find(x=>x.id===id);
 if(!record)throw new Error('Nieznane przykładowe e-ZLA.');
 return record;
}
const dateDay=(iso:string):number=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))throw new Error('Nieprawidłowa data w rekordzie e-ZLA.');
 const [y,m,d]=iso.split('-').map(Number),raw=Date.UTC(y,m-1,d),dt=new Date(raw);
 if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)throw new Error('Nieprawidłowa data w rekordzie e-ZLA.');
 return raw/86400000;
};
export function summarizeEzlaRecord(record:EzlaDemoRecord):{
 days:number;statusLabel:string;codeLabel:string;canUseForSimulation:boolean;
 warning:string;
}{
 const from=dateDay(record.from),to=dateDay(record.to);
 dateDay(record.issuedOn);
 if(to<from)throw new Error('Data zakończenia e-ZLA poprzedza początek.');
 const days=to-from+1;
 const canUseForSimulation=record.status==='issued';
 return {
  days,
  statusLabel:record.status==='issued'?'Wystawione (DEMO)':'Anulowane (DEMO)',
  codeLabel:record.letterCode==='B'?'B — ciąża':'Brak kodu B',
  canUseForSimulation,
  warning:!canUseForSimulation?'Anulowane e-ZLA nie może zostać wykorzystane do planowania okresu niezdolności.':
    record.letterCode==='B'?'Kod B jest wyłącznie elementem syntetycznego podglądu, nie dowodem medycznym.':
    record.pregnancyContext?'Brak kodu B — sprawdź, czy istnieje osobne zaświadczenie lekarskie o ciąży.':
    'Zwykła choroba: nie potwierdzono związku okresu zwolnienia z ciążą.'
 };
}
export function ezlaDemoToSicknessInput(record:EzlaDemoRecord):{from:string;to:string;ezlaCodeB:'yes'|'no';demoSource:true}{
 const summary=summarizeEzlaRecord(record);
 if(!summary.canUseForSimulation)throw new Error('Nie można przenieść anulowanego e-ZLA do kalkulatora.');
 return {from:record.from,to:record.to,ezlaCodeB:record.letterCode==='B'?'yes':'no',demoSource:true};
}
