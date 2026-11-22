/** Forms demo: scenario-aware templates for employer and ZUS, without submission.
 * The employer leave requests are original Rodzina360 examples.
 * The benefit form is ONLY a worksheet; official ZAM is available at zus.pl.
 * Sources: https://www.gov.pl/web/gov/skorzystajcie-z-urlopow-rodzicielskich
 * https://www.gov.pl/web/rodzina/urlop-rodzicielski
 * https://www.zus.pl/-/wniosek-zas-54-1
 * No real identifiers, online posting, storage, or "official submission".
 */
import {daysInclusive} from './flexibleLeave.ts';
import {OFFICIAL_RULES,formatRate,type LegalRules} from './legalConfig.ts';
export type FormScenarioMode='birth'|'adoption'|'foster';
export type FormOwner=1|2;
export type FormEmployment='etat'|'zlecenie'|'dzialalnosc'|'inne'|'';
export type FormKind='birth_notice'|'care_leave'|'parental_leave'|'zam_worksheet';
export type FormRecipient='employer'|'zus';
export type FormPeriod={owner:FormOwner;id:string;start:string;end:string;used:boolean};
export type FormsDemoInput={
 mode:FormScenarioMode;eventDate:string;eventConfirmed:boolean;childCount:number;
 employment1:FormEmployment;employment2:FormEmployment;insured1:boolean;insured2:boolean;
 maternityStart:string;maternityEnd:string;
 periods:FormPeriod[];
 variant:'standard'|'averaged';rules?:LegalRules;
};
export type FormTemplate={
 id:string;kind:FormKind;owner:FormOwner;recipient:FormRecipient;
 title:string;description:string;formName:string;
 from:string;to:string;eventDate:string;childCount:number;mode:FormScenarioMode;
 sourceUrl:string;attachmentHints:string[];warning:string;conditional:boolean;
 variant:'standard'|'averaged';rules?:LegalRules;
};
export type FormDraftData={
 applicant:string;employer:string;place:string;
 childDetailsConfirmed:boolean;attachmentsChecked:boolean;demoAcknowledged:boolean;
};
export type FormValidation={errors:string[];warnings:string[];ready:boolean};
export type DemoSubmission={id:string;formId:string;recipient:FormRecipient;
 status:'NOT_SENT_DEMO';message:string};
export const OFFICIAL_ZAM='https://www.zus.pl/-/wniosek-zas-54-1';
export const OFFICIAL_FORMS='https://www.zus.pl/pl/wzory-formularzy/zasilki/zasilek-macierzynski';
export const OFFICIAL_PARENTAL='https://www.gov.pl/web/rodzina/urlop-rodzicielski';
export const OFFICIAL_DOCS='https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty';
export const FORMS_DEMO_DISCLAIMER='DEMO — przygotowane projekty nie są wnioskami urzędowymi ZUS. Symulacja wysłania NIE przekazuje dokumentów do ZUS ani pracodawcy.';
export const emptyFormDraft=():FormDraftData=>({
 applicant:'Rodzic DEMO',employer:'Pracodawca DEMO',place:'Miasto DEMO',
 childDetailsConfirmed:false,attachmentsChecked:false,demoAcknowledged:false
});
const validIso=(s:string):boolean=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const [y,m,d]=s.split('-').map(Number),v=new Date(Date.UTC(y,m-1,d));
 return v.getUTCFullYear()===y&&v.getUTCMonth()===m-1&&v.getUTCDate()===d;
};
const allowed=(e:FormEmployment)=>e==='etat'||e==='zlecenie'||e==='dzialalnosc';
function make(t:Omit<FormTemplate,'childCount'|'mode'|'eventDate'|'variant'>,input:FormsDemoInput):FormTemplate{
 return {...t,childCount:input.childCount,mode:input.mode,eventDate:input.eventDate,variant:input.variant,...(input.rules?{rules:input.rules}:{})};
}
export function buildFormTemplates(input:FormsDemoInput):FormTemplate[]{
 if(!validIso(input.eventDate)||!validIso(input.maternityStart)||!validIso(input.maternityEnd))
  return [];
 if(input.maternityStart>input.maternityEnd||!Number.isInteger(input.childCount)||input.childCount<1)
  return [];
 const templates:FormTemplate[]=[];
 const motherEmployee=input.employment1==='etat';
 const mode=input.mode;
 const care=mode!=='birth';
 if(motherEmployee){
  templates.push(make({
   id:'employer-'+(care?'care-leave':'birth-notice'),kind:care?'care_leave':'birth_notice',owner:1,
   recipient:'employer',
   title:care?'Wniosek o urlop na warunkach urlopu macierzyńskiego':'Informacja o urodzeniu dziecka dla pracodawcy',
   description:care?'Projekt wniosku pracownika o urlop na warunkach macierzyńskiego.':
    'To informacja dla kadr, nie wniosek matki o urlop macierzyński. Po porodzie matka nie składa zwykłego wniosku o udzielenie urlopu macierzyńskiego.',
   formName:care?'Projekt Rodzina360 — urlop na warunkach macierzyńskiego':'Projekt Rodzina360 — zawiadomienie o urodzeniu',
   from:input.maternityStart,to:input.maternityEnd,sourceUrl:care?OFFICIAL_DOCS:OFFICIAL_PARENTAL,
   attachmentHints:care?
    mode==='adoption'?['Potwierdzenie przyjęcia dziecka na wychowanie','Dokument dotyczący wniosku do sądu o przysposobienie']:
      ['Dokument powierzenia dziecka niezawodowej rodzinie zastępczej','Dokument potwierdzający wiek dziecka']:
    ['Dane o rzeczywistym urodzeniu dziecka; dokument potwierdzający, jeżeli wymaga go pracodawca'],
   warning:care?'Urlop pracowniczy i dokumenty dotyczące przyjęcia dziecka wymagają sprawdzenia z pracodawcą.':
    'Przy zwykłym porodzie matka nie składa wniosku o udzielenie urlopu macierzyńskiego.',
   conditional:!care
  },input));
 }
 const employment=[input.employment1,input.employment2];
 for(const [index,p] of input.periods.entries()){
  if(p.used||employment[p.owner-1]!=='etat')continue;
  if(!validIso(p.start)||!validIso(p.end)||p.end<p.start)continue;
  templates.push(make({
   id:'parental-'+p.id+'-'+index,kind:'parental_leave',owner:p.owner,
   recipient:'employer',title:'Wniosek o urlop rodzicielski — opiekun '+p.owner,
   description:'Autorski szablon wniosku pracownika na konkretną część urlopu rodzicielskiego z Twojego harmonogramu.',
   formName:'Projekt Rodzina360 — wniosek o urlop rodzicielski',
   from:p.start,to:p.end,sourceUrl:OFFICIAL_PARENTAL,
   attachmentHints:['Oświadczenie dotyczące sposobu korzystania przez drugiego rodzica/opiekuna, jeżeli wymagane',
    'Dokumenty dotyczące dziecka i poprzednich okresów, jeżeli nie znajdują się w aktach pracodawcy'],
   warning:'Wniosek do pracodawcy składa się co do zasady co najmniej 21 dni przed rozpoczęciem urlopu. Uzgodnij wymagane oświadczenia i załączniki.',
   conditional:false
  },input));
 }
 const requiredOwners=new Set<FormOwner>();
 if(allowed(input.employment1)&&input.insured1)requiredOwners.add(1);
 if(allowed(input.employment2)&&input.insured2&&input.periods.some(e=>e.owner===2&&!e.used))
  requiredOwners.add(2);
 for(const owner of requiredOwners){
  const first=owner===1?{start:input.maternityStart,end:input.maternityEnd}:
   input.periods.filter(e=>e.owner===owner&&!e.used).sort((a,b)=>a.start.localeCompare(b.start))[0];
  if(!first)continue;
  templates.push(make({
   id:'zus-zam-'+owner,kind:'zam_worksheet',owner,recipient:'zus',
   title:'Dane do formularza ZAM — opiekun '+owner+' (gdy wymagany)',
   description:'Podgląd pól do przeniesienia do aktualnego oficjalnego formularza ZAM ZUS. To NIE jest odtworzenie ani złożenie formularza urzędowego.',
   formName:'Arkusz Rodzina360 — dane do oficjalnego ZAM',
   from:first.start,to:first.end,sourceUrl:OFFICIAL_ZAM,
   attachmentHints:care?['Dokumenty potwierdzające przyjęcie dziecka na wychowanie i prawo do zasiłku']:
    ['Dane urodzenia dziecka i dokumenty wymagane przez płatnika'],
   warning:'Sprawdź na zus.pl, czy w Twojej sytuacji wymagany jest ZAM i kto jest płatnikiem zasiłku. W przypadku etatu wypłatę może realizować pracodawca. Aktualizacja ZAM: 24.10.2026.'+(input.variant==='averaged'?' Wybrano w planie wariant '+formatRate(input.rules?.averagedRatePercent??OFFICIAL_RULES.averagedRatePercent)+' — wymaga terminowego i odpowiedniego wniosku.':'') ,
   conditional:true
  },input));
 }
 return templates;
}
export function validateFormDraft(t:FormTemplate,d:FormDraftData):FormValidation{
 const errors:string[]=[],warnings:string[]=[];
 if(d.applicant.trim().length<3)errors.push('Podaj nazwę testową wnioskodawcy (minimum 3 znaki).');
 if(t.recipient==='employer'&&d.employer.trim().length<3)
  errors.push('Podaj testową nazwę pracodawcy (minimum 3 znaki).');
 if(!validIso(t.eventDate)||!validIso(t.from)||!validIso(t.to)||t.to<t.from)
  errors.push('Niepoprawne daty w harmonogramie. Wróć do planowania.');
 if(!d.childDetailsConfirmed)errors.push('Potwierdź zgodność dat i danych dziecka ze scenariuszem DEMO.');
 if(!d.attachmentsChecked)errors.push('Potwierdź sprawdzenie listy wymaganych załączników.');
 if(!d.demoAcknowledged)errors.push('Zaznacz, że to tylko symulacja, bez prawdziwej wysyłki.');
 if(t.kind==='zam_worksheet')warnings.push('Arkusz nie zastępuje urzędowego ZAM. Przepisz i sprawdź dane w aktualnym formularzu ZUS.');
 if(t.kind==='birth_notice')warnings.push('Po porodzie matka nie składa osobnego wniosku o urlop macierzyński; przygotowuje wymagane dokumenty.');
 if(t.recipient==='employer'&&t.kind==='parental_leave')warnings.push('Termin pracowniczego wniosku: co najmniej 21 dni przed rozpoczęciem urlopu.');
 return {errors,warnings,ready:errors.length===0};
}
export function makeDemoSubmission(t:FormTemplate,d:FormDraftData,sequence:number):DemoSubmission{
 const check=validateFormDraft(t,d);
 if(!check.ready)throw new Error(check.errors.join(' '));
 if(!Number.isSafeInteger(sequence)||sequence<1||sequence>9999)throw new Error('Nieprawidłowy numer symulacji.');
 return Object.freeze({
  id:'DEMO-WYS-'+String(sequence).padStart(3,'0'),
  formId:t.id,recipient:t.recipient,status:'NOT_SENT_DEMO',
  message:'Symulacja zakończona. NIE WYSŁANO do '+(t.recipient==='zus'?'ZUS':'pracodawcy')+'. Brak potwierdzenia wpływu.'
 });
}
const esc=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function renderFormDraftHtml(t:FormTemplate,d:FormDraftData):string{
 const v=validateFormDraft(t,d);
 if(!v.ready)throw new Error(v.errors.join(' '));
 const duration=daysInclusive(t.from,t.to);
 const txt=t.kind==='zam_worksheet'
  ?'Arkusz danych do ZAM (nie formularz ZUS). Sprawdź aktualny oficjalny ZAM na stronie zus.pl, przepisz dane oraz dołącz wymagane dokumenty.'
  :t.kind==='birth_notice'
   ?'Informuję o urodzeniu dziecka i przekazuję dane dotyczące okresu urlopu macierzyńskiego. Jest to informacja dla pracodawcy, a nie wniosek o udzielenie urlopu macierzyńskiego.'
   :'Zwracam się z prośbą o udzielenie '+(t.kind==='care_leave'?'urlopu na warunkach urlopu macierzyńskiego.':'urlopu rodzicielskiego.')+' Wskazany okres pochodzi z mojego planu Rodzina360.';
 const row=(label:string,v:string)=>'<tr><th>'+esc(label)+'</th><td>'+esc(v)+'</td></tr>';
 const fields=[['Wnioskodawca (przykład)',d.applicant.trim()],
   ['Miejscowość (przykład)',d.place.trim()||'Nie podano'],
   ['Adresat',t.recipient==='employer'?d.employer.trim():'ZUS — wyłącznie arkusz danych DEMO'],
   ['Osoba w planie',String(t.owner)],['Zdarzenie',t.mode==='birth'?'Urodzenie':t.mode==='adoption'?'Przysposobienie':'Niezawodowa rodzina zastępcza'],
   ['Data zdarzenia',t.eventDate],['Liczba dzieci',String(t.childCount)],
   ['Wariant zasiłku',t.variant==='averaged'?formatRate(t.rules?.averagedRatePercent??OFFICIAL_RULES.averagedRatePercent)+' (warunkowo — do weryfikacji)':formatRate(t.rules?.maternityRatePercent??OFFICIAL_RULES.maternityRatePercent)+'/'+formatRate(t.rules?.parentalRatePercent??OFFICIAL_RULES.parentalRatePercent)+' (wariant standardowy)'],
   ['Od',t.from],['Do',t.to],['Dni kalendarzowe',String(duration)]];
 const lis=t.attachmentHints.map(x=>'<li>'+esc(x)+'</li>').join('');
 return '<!doctype html><html lang="pl"><head><meta charset="UTF-8"><title>Rodzina360 · DEMO · '+esc(t.title)+'</title>'+
  '<style>body{font:15px/1.6 Arial,sans-serif;color:#253b45;max-width:780px;margin:35px auto;padding:0 22px}header{border:3px solid #9e4b42;color:#8a352d;background:#fff1ef;text-align:center;padding:16px;font-size:22px;font-weight:900;letter-spacing:.04em;margin-bottom:20px}h1{font-size:23px}table{border-collapse:collapse;width:100%;margin:19px 0}th,td{border:1px solid #d4dedb;padding:9px;text-align:left;vertical-align:top}th{width:34%;background:#f4f7f6}.warn{background:#fff4e1;padding:14px;border:1px solid #e5cc9b}footer{border-top:1px solid #ccd6d3;padding-top:18px;font-size:12px;margin-top:25px}button{padding:10px 16px}@media print{button{display:none}}</style></head><body>'+
  '<header>DEMO · NIE WYSŁANO · NIE JEST DOKUMENTEM ZUS</header>'+
  '<h1>'+esc(t.title)+'</h1><p>'+esc(txt)+'</p>'+
  '<table>'+fields.map(([k,v])=>row(k,v)).join('')+'</table>'+
  '<h2>Dokumenty do sprawdzenia</h2><ul>'+lis+'</ul>'+
  '<p class="warn">'+esc(t.warning)+'</p>'+
  '<footer>Projekt demonstracyjny Rodzina360. Bez numeru PESEL, podpisu, pieczęci i faktycznego nadania. '+
  'W przypadku formularza ZAM korzystaj wyłącznie z aktualnego formularza na <a href="'+esc(t.sourceUrl)+'">oficjalnej stronie</a>.</footer>'+
  '<button onclick="window.print()">Drukuj / zapisz jako PDF</button></body></html>';
}
