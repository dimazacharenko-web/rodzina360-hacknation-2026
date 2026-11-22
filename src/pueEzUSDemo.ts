/** PUE/eZUS — offline demo of account lookup and inquiry.
 * Only hardcoded synthetic records; no connection, identity verification,
 * account access, transport, government API or correspondence submission.
 * Official reference: https://www.zus.pl/baza-wiedzy/o-portalu-pue-/informacje-
 */
import {getZusInsuranceDemoRecord,type ZusInsuranceDemoId} from './zusInsuranceDemo.ts';

export type PueInquiryTopic='insurance'|'contributions'|'sickness'|'maternity'|'documents';
export type PueDemoInquiry=Readonly<{
 id:string;
 topic:PueInquiryTopic;
 question:string;
 status:'not_sent_demo';
 guidance:string;
 synthetic:true;
}>;
export type PueDemoAccount=Readonly<{
 scenarioId:ZusInsuranceDemoId;
 insured:boolean;
 employment:'etat'|'zlecenie'|'dzialalnosc';
 coverageFrom:string;
 coverageTo:string|null;
 contributionPeriod:string|null;
 contributionBasePLN:number|null;
 payerLabel:string;
 debtOverview:string;
 synthetic:true;
}>;
export const PUE_DEMO_DISCLAIMER='PUE/eZUS DEMO — symulacja bez połączenia z ZUS, weryfikacji tożsamości i pobierania danych. Wszystkie rekordy są syntetyczne.';
export const PUE_INQUIRY_DISCLAIMER='Wiadomość DEMO nie jest wysyłana do ZUS. Podpowiedzi pochodzą z Rodzina360, a nie od konsultanta ZUS.';
const accountDetails:Record<ZusInsuranceDemoId,{
 contributionPeriod:string|null;contributionBasePLN:number|null;
 payerLabel:string;debtOverview:string;
}>={
 employee:{
  contributionPeriod:'2026-10',contributionBasePLN:6200,
  payerLabel:'Płatnik składek — przykład DEMO',
  debtOverview:'Dane płatnika składek nie są saldem osobistego konta ubezpieczonego.'
 },
 voluntary:{
  contributionPeriod:'2026-10',contributionBasePLN:4500,
  payerLabel:'Zleceniodawca — przykład DEMO',
  debtOverview:'Sprawdź dobrowolne zgłoszenie do ubezpieczenia chorobowego.'
 },
 no_insurance:{
  contributionPeriod:null,contributionBasePLN:null,
  payerLabel:'Poprzedni płatnik składek — przykład DEMO',
  debtOverview:'Brak aktywnego tytułu w tym scenariuszu. Nie oznacza to automatycznie braku wszystkich uprawnień.'
 },
 jdg_debt:{
  contributionPeriod:'2026-10',contributionBasePLN:5100,
  payerLabel:'Własna działalność gospodarcza — DEMO',
  debtOverview:'Przykładowe zadłużenie przekracza próg 1%; dokładną syntetyczną kwotę można sprawdzić w osobnej symulacji zaświadczenia.'
 }
};
export function pueDemoAccount(id:ZusInsuranceDemoId):PueDemoAccount{
 const insurance=getZusInsuranceDemoRecord(id);
 return Object.freeze({
  scenarioId:id,insured:insurance.insured==='tak',
  employment:insurance.employment,
  coverageFrom:insurance.startDate,
  coverageTo:insurance.endDate||null,
  ...accountDetails[id],
  synthetic:true
 });
}
export const PUE_INQUIRY_TOPICS:ReadonlyArray<{id:PueInquiryTopic;title:string}>=[
 {id:'insurance',title:'Okresy i zgłoszenia do ubezpieczeń'},
 {id:'contributions',title:'Podstawa składek i stan konta'},
 {id:'sickness',title:'Zaświadczenia lekarskie e-ZLA'},
 {id:'maternity',title:'Prawo do zasiłku macierzyńskiego'},
 {id:'documents',title:'Wnioski, dokumenty i terminy'}
];
const help:Record<PueInquiryTopic,string>={
 insurance:'Sprawdź w eZUS: Ubezpieczony → Ubezpieczenia i płatnicy. Porównaj tytuł, datę zgłoszenia i koniec ubezpieczenia; rozbieżności wyjaśnij z płatnikiem lub ZUS.',
 contributions:'Sprawdź w eZUS informacje o podstawach i składkach. Podstawa wymiaru składek nie musi być tożsama z podstawą wymiaru zasiłku.',
 sickness:'Sprawdź w eZUS okres i status rzeczywistego e-ZLA; kod B może wymagać dodatkowego zaświadczenia o ciąży. Anulowane zwolnienie nie jest podstawą do symulacji.',
 maternity:'Sprawdź w eZUS tytuł ubezpieczenia i datę powstania prawa oraz ewentualne wyjątki. Rozstrzygnięcie prawa do świadczenia należy do właściwego płatnika lub ZUS.',
 documents:'Sprawdź aktualne formularze oraz terminy właściwe dla Twojego tytułu ubezpieczenia i rodzaju urlopu. W Rodzina360 użyj Kalendarza i Kontroli kompletności.'
};
export function validatePueInquiry(text:string):string|null{
 const trimmed=text.trim();
 if(trimmed.length<10)return 'Wpisz pytanie o długości co najmniej 10 znaków.';
 if(trimmed.length>1000)return 'Pytanie może mieć maksymalnie 1000 znaków.';
 return null;
}
export function simulatePueInquiry(input:{
 topic:PueInquiryTopic;question:string;sequence:number
}):PueDemoInquiry{
 const error=validatePueInquiry(input.question);
 if(error)throw new Error(error);
 if(!Object.prototype.hasOwnProperty.call(help,input.topic))throw new Error('Nieznany temat zapytania.');
 if(!Number.isSafeInteger(input.sequence)||input.sequence<1||input.sequence>9999)
  throw new Error('Nieprawidłowy numer zgłoszenia DEMO.');
 return Object.freeze({
  id:'DEMO-ZAP-'+String(input.sequence).padStart(3,'0'),
  topic:input.topic,
  question:input.question.trim(),
  status:'not_sent_demo',
  guidance:help[input.topic],
  synthetic:true
 });
}
