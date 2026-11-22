/** Ostrożna weryfikacja wstępna, nie decyzja ZUS.
 * Źródła: ustawa zasiłkowa art. 2a, 4, 6, 29, 30; ZUS Poradnik dla rodziców 2026.
 * Zwracamy REVIEW zamiast domniemywać ubezpieczenie, wyjątki i dokumenty.
 */
export type Employment='etat'|'zlecenie'|'dzialalnosc'|'inne'|'';
export type InsuranceAnswer='tak'|'nie'|'nie_wiem'|'';
export type DebtStatus='none'|'small'|'over'|'installments'|'application'|'unknown';
export type PostInsuranceException='none'|'extended_to_birth'|'employer_death'|'liquidation'|'unlawful_termination'|'unknown';
export type WaitingException='none'|'graduate'|'ten_years'|'other'|'unknown';
export type Confirmed='yes'|'no'|'unknown';
export type CoverageEvidence={
 startDate:string;endDate:string;
 priorCreditedDays:string;priorPeriodsConfirmed:boolean;
 waitingException:WaitingException;postInsuranceException:PostInsuranceException;
 debtAgreementConfirmed:boolean;ezlaCodeB:Confirmed;
};
export const emptyCoverage=():CoverageEvidence=>({
 startDate:'',endDate:'',priorCreditedDays:'0',priorPeriodsConfirmed:false,
 waitingException:'unknown',postInsuranceException:'unknown',
 debtAgreementConfirmed:false,ezlaCodeB:'unknown'
});
export type BenefitKind='maternity'|'parental'|'pregnancy_sickness';
export type EligibilityStatus='possible'|'review'|'blocked_standard';
export type EligibilityInput={
 kind:BenefitKind;employment:Employment;insured:InsuranceAnswer;
 coverage:CoverageEvidence;eventDate:string;eventConfirmed:boolean;
 debt:DebtStatus;legalParentConfirmed?:boolean;demoSource?:boolean;demoDebtSource?:boolean;demoEzlaSource?:boolean;
};
export type EligibilityResult={
 kind:BenefitKind;status:EligibilityStatus;label:string;details:string[];
 actions:string[];rules:string[];waitingDays:number|null;eventDate:string;
};
const format:{[K in BenefitKind]:string}={
 maternity:'Zasiłek macierzyński',parental:'Zasiłek za okres rodzicielski',pregnancy_sickness:'Zasiłek chorobowy w ciąży'
};
const ms=86400000;
function date(s:string):number|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
 const [y,m,d]=s.split('-').map(Number),v=Date.UTC(y,m-1,d),x=new Date(v);
 return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d?v/ms:null;
}
const finish=(v:EligibilityResult)=>({...v,label:v.status==='possible'?'Wstępnie możliwe prawo':v.status==='blocked_standard'?'Brak podstaw do świadczenia w zwykłym trybie':'Wymaga indywidualnej weryfikacji'});
export function assessEligibility(i:EligibilityInput):EligibilityResult{
 const result:EligibilityResult={kind:i.kind,status:'possible',label:'',details:[],actions:[],rules:[],waitingDays:null,eventDate:i.eventDate};
 const review=(msg:string)=>{if(result.status!=='blocked_standard')result.status='review';result.details.push(msg);};
 const blocked=(msg:string)=>{result.status='blocked_standard';result.details.push(msg);};
 const action=(msg:string)=>{if(!result.actions.includes(msg))result.actions.push(msg)};
 const maternity=i.kind!=='pregnancy_sickness';
 const when=date(i.eventDate);
 if(when===null){review('Nie podano poprawnej daty zdarzenia, na którą trzeba sprawdzić ubezpieczenie.');action('Uzupełnij datę porodu albo początek zwolnienia / urlopu.');return finish(result);}
 if(!i.eventConfirmed){review('Data jest przewidywana, więc wynik dotyczy wyłącznie planowania.');action('Po zdarzeniu podaj faktyczną datę.');}
 if(i.kind==='parental'&&i.legalParentConfirmed===false){review('Status prawny drugiego rodzica i prawo do świadczenia nie zostały potwierdzone.');action('Sprawdź dokumenty potwierdzające uprawnienia rodzicielskie w ZUS.');}
 if(i.employment===''||i.employment==='inne'){review('Nie ustalono tytułu do ubezpieczenia chorobowego.');action('Potwierdź tytuł do ubezpieczenia w eZUS lub u płatnika.');}
 if(i.insured==='nie_wiem'||i.insured===''){review('Nie wiadomo, czy ubezpieczenie chorobowe obejmowało właściwą datę.');action('Sprawdź historię zgłoszeń i daty ubezpieczenia w eZUS.');}
 if(i.employment==='etat'&&i.insured==='nie'){review('Umowa o pracę co do zasady oznacza obowiązkowe ubezpieczenie chorobowe; odpowiedzi są niespójne.');action('Wyjaśnij status zatrudnienia i zgłoszenia z pracodawcą.');}
 else if(i.insured==='nie'){
   const exceptionClaim=maternity&&i.coverage.endDate&&i.coverage.postInsuranceException!=='none'&&i.coverage.postInsuranceException!=='unknown';
   if(exceptionClaim)review('Zgłoszono wyjątek po ustaniu ubezpieczenia — należy zweryfikować dokumenty, mimo braku bieżącego ubezpieczenia.');
   else blocked('Brak zadeklarowanego ubezpieczenia chorobowego. Nie ma podstaw do automatycznego potwierdzenia standardowego prawa.');
   action('Sprawdź wyjątki ustawowe, zwłaszcza świadczenia po ustaniu ubezpieczenia.');
 }
 const start=i.coverage.startDate?date(i.coverage.startDate):null;
 const end=i.coverage.endDate?date(i.coverage.endDate):null;
 if(i.coverage.startDate&&start===null)review('Nieprawidłowa data rozpoczęcia ubezpieczenia.');
 if(i.coverage.endDate&&end===null)review('Nieprawidłowa data ustania ubezpieczenia.');
 if(start!==null&&end!==null&&end<start)review('Data zakończenia jest wcześniejsza od daty rozpoczęcia ubezpieczenia.');
 if(i.insured==='tak'&&start===null){review('Nie znamy początku aktualnego ubezpieczenia chorobowego.');action('Wpisz potwierdzoną datę rozpoczęcia ubezpieczenia.');}
 const currentPeriod=start!==null&&start<=when&&(end===null||end>=when);
 if(start!==null&&start>when){
   blocked('Ubezpieczenie rozpoczęło się po dacie zdarzenia; ten tytuł nie potwierdza prawa w dniu zdarzenia.');
   action('Sprawdź wcześniejsze tytuły ubezpieczenia i możliwe wyjątki.');
 }
 if(end!==null&&end<when){
   if(maternity){
     if(i.coverage.postInsuranceException==='none')blocked('Ubezpieczenie ustało przed datą zdarzenia i nie wskazano ustawowego wyjątku.');
     else review('Ubezpieczenie ustało przed datą zdarzenia. Wskazany wyjątek wymaga potwierdzenia dokumentami ZUS.');
     action('Zweryfikuj art. 30 ustawy zasiłkowej i przyczynę ustania ubezpieczenia.');
     result.rules.push('Ustawa zasiłkowa art. 30: szczególne przypadki po ustaniu ubezpieczenia.');
   }else{
     review('Niezdolność przypada po ustaniu ubezpieczenia: obowiązują odrębne warunki i ograniczenia.');
     action('Sprawdź odrębnie prawo do chorobowego po ustaniu ubezpieczenia i wyłączenia z art. 13.');
   }
 }
 if(maternity){
   result.rules.push('Art. 29 i 30 ustawy zasiłkowej. Zasiłek macierzyński nie wymaga okresu wyczekiwania.');
   if(i.kind==='parental')result.rules.push('Art. 29a: uprawnienia i wspólny limit rodziców wymagają kontroli.');
 }else{
   result.rules.push('Art. 4 i 6 ustawy zasiłkowej: okres wyczekiwania oraz niezdolność do pracy.');
   if(i.coverage.ezlaCodeB==='no'){review('Brak potwierdzenia kodu B: nie można stosować stawki 100% właściwej dla niezdolności do pracy w ciąży.');action('Sprawdź e-ZLA i kod B.');}
   else if(i.coverage.ezlaCodeB==='unknown'){review('Nie potwierdzono e-ZLA z kodem B.');action('Sprawdź dokument e-ZLA, daty niezdolności i kod B.');}
   if(i.insured==='tak'&&currentPeriod){
     const min=i.employment==='etat'?30:90;
     let previous=0;
     const raw=i.coverage.priorCreditedDays.trim();
     if(raw!==''&&(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw)))){
       review('Błędna liczba dni poprzednich okresów ubezpieczenia.');
     }else if(Number(raw)>0&&!i.coverage.priorPeriodsConfirmed){
       review('Wcześniejszych okresów nie można doliczyć bez sprawdzenia przerw i tytułów ubezpieczenia.');
       action('Potwierdź w eZUS, że poprzednie okresy można doliczyć.');
     }else{
       previous=Number(raw||0);
     }
     const duration=when-start+previous;
     result.waitingDays=Math.max(0,min-duration);
     if(duration<min){
       if(i.coverage.waitingException==='none'){
         blocked('Nie upłynęło wymagane '+min+' dni ubezpieczenia; według podanych danych brakuje '+(min-duration)+' dni okresu wyczekiwania.');
       }else if(i.coverage.waitingException==='ten_years'&&i.employment!=='etat'){
         review('Wyjątek 10-letniego wcześniejszego ubezpieczenia obowiązkowego nie został wykazany dla dobrowolnego ubezpieczenia.');
       }else if(i.coverage.waitingException==='graduate'||i.coverage.waitingException==='ten_years'){
         review('Wskazano wyjątek od okresu wyczekiwania, który musi zostać udokumentowany.');
       }else{
         review('Możliwy okres wyczekiwania: nie potwierdzono, czy obowiązuje wyjątek ustawowy.');
       }
       action('Potwierdź okresy ubezpieczenia i wyjątki określone w art. 4.');
     }else if(duration>=min)result.waitingDays=0;
   } else if(i.insured==='tak'&&start===null){
     review('Bez daty rozpoczęcia nie można obliczyć okresu wyczekiwania (30 lub 90 dni).');
   }
 }
 if(i.employment==='dzialalnosc'){
   result.rules.push('Art. 2a ustawy zasiłkowej: próg zadłużenia 1% minimalnego wynagrodzenia i 6 miesięcy.');
   switch(i.debt){
    case 'none':break;
    case 'small':review('Dług zgłoszono jako nieprzekraczający progu, lecz kwota i właściwy dzień wymagają potwierdzenia.');break;
    case 'over':blocked('Zadłużenie ponad 1% płacy minimalnej może wyłączyć świadczenie do spłaty całości; sprawdź termin 6 miesięcy.');action('Zweryfikuj stan długu na dzień powstania prawa i możliwość jego spłaty w 6 miesięcy.');break;
    case 'application':blocked('Samo złożenie wniosku o raty nie oznacza zawarcia układu ratalnego.');action('Ustal, czy ZUS zawarł układ ratalny i jakie należności on obejmuje.');break;
    case 'installments':
     if(i.coverage.debtAgreementConfirmed)review('Zadeklarowano wykonywany układ ratalny. Sprawdź jego zakres oraz brak innych zaległości.');
     else review('Nie potwierdzono zawarcia układu i terminowej spłaty rat.');
     action('Potwierdź zawarty układ, terminowe raty i brak nieobjętych nim zaległości.');break;
    case 'unknown':review('Nie ustalono zadłużenia ZUS na datę powstania prawa.');action('Pobierz saldo składek z eZUS.');break;
   }
 }
 if(i.kind==='pregnancy_sickness'&&i.demoEzlaSource){
   review('e-ZLA pochodzi z syntetycznego podglądu DEMO, a nie z rzeczywistego zaświadczenia lekarskiego ZUS.');
   action('Sprawdź rzeczywisty okres zwolnienia w eZUS oraz kod B lub odrębne zaświadczenie o ciąży. DEMO nie uprawnia do wypłaty.');
 }
 if(i.demoDebtSource){
   review('Kwota zadłużenia pochodzi z symulowanego zaświadczenia ZUS DEMO. Brak urzędowego potwierdzenia salda na dzień powstania prawa.');
   action('Sprawdź rzeczywiste saldo składek w eZUS; wydruk DEMO nie jest zaświadczeniem.');
 }
 if(i.demoSource){
   review('Dane o ubezpieczeniu pochodzą z syntetycznego scenariusza ZUS DEMO i nie są potwierdzeniem ze źródeł urzędowych.');
   action('Wprowadź własne dane i potwierdź historię ubezpieczenia w eZUS lub u płatnika.');
 }
 if(result.status==='possible'){
   result.details.push(maternity?'W zadeklarowanym, standardowym scenariuszu widać podstawy do dalszego wniosku; ZUS musi zweryfikować dokumenty.':'Zadeklarowane dane spełniają podstawowe warunki okresu wyczekiwania i ubezpieczenia; potwierdzenie dokumentów nadal jest wymagane.');
 }
 if(i.kind==='pregnancy_sickness')result.rules.push('e-ZLA z kodem B: 100% podstawy w okresie ciąży; niezdolność do pracy nie wynika z samej ciąży.');
 return finish(result);
}
