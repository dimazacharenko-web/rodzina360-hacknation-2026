import {plusDays} from './leaveRules.ts';
import {OFFICIAL_RULES,formatRate,type LegalRules} from './legalConfig.ts';
import type {EvaluatedEntry} from './flexibleLeave.ts';

export const officialSources={
 zusDocuments:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
 zusForms:'https://www.zus.pl/wzory-formularzy/zasilki/zasilek-macierzynski',
 zusZam:'https://www.zus.pl/-/wniosek-zas-54-1',
 employerForms:'https://www.zus.pl/pl/wzory-formularzy/firmy/formularze-dot.-zasilkow',
 govParental:'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
 zusSickness:'https://www.zus.pl/wzory-formularzy/zasilki/zasilek-chorobowy',
 zusInstallments:'https://www.zus.pl/pl/baza-wiedzy/katalog-uslug/katalog-uslug-firmy/pomoc-w-splacie-naleznosci/rozlozenie-naleznosci-na-raty/rozlozenie-na-raty-naleznosci-z-tytulu-skladek',
 payer:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/postepowanie-w-sprawie-zasilkow/platnicy-zasilku',
 rate:'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
 portal:'https://www.zus.pl/'
} as const;

export type EmploymentKind='etat'|'zlecenie'|'dzialalnosc'|'inne'|'';
export type DocumentTask={
 id:string;title:string;recipient:string;who:string;date:string|null;
 dateIsEstimated:boolean;deadlineKind:'statutory'|'planning'|'none';
 details:string;form:string|null;url:string;extraUrl?:string;
 importance:'priority'|'normal';status:'upcoming'|'late'|'no_date';
};
export type DocumentPlanInput={
 birthDate:string;actualBirth:boolean;employment1:EmploymentKind;employment2:EmploymentKind;
 secondEligible:boolean;entries:EvaluatedEntry[];variant:'standard'|'averaged';
 sickness:boolean;debtRisk:boolean;
};

function task(id:string,title:string,who:string,recipient:string,date:string|null,
 deadlineKind:DocumentTask['deadlineKind'],details:string,form:string|null,url:string,
 dateIsEstimated:boolean,importance:DocumentTask['importance']='normal',extraUrl?:string):DocumentTask{
 const today=new Date().toISOString().slice(0,10);
 return {id,title,who,recipient,date,deadlineKind,details,form,url,dateIsEstimated,importance,extraUrl,
  status:date===null?'no_date':date<today?'late':'upcoming'};
}
export function createDocumentPlan(input:DocumentPlanInput,rules:LegalRules=OFFICIAL_RULES as LegalRules):DocumentTask[]{
 const tasks:DocumentTask[]=[];
 const put=(...args:Parameters<typeof task>)=>tasks.push(task(...args));
 const maternitySource=input.employment1==='etat'?'Pracodawca / dział kadr; w zależności od płatnika zasiłku dokumenty trafiają dalej do ZUS':'ZUS / eZUS lub płatnik składek (ustal właściwą ścieżkę)';
 put('maternity','Zgłoś urodzenie dziecka i dokumenty do zasiłku','Osoba rodząca',maternitySource,null,'none',
 'Przekaż wymagane dane o urodzeniu dziecka i sprawdź listę załączników ZUS. Termin standardowego zgłoszenia zależy od trybu i sytuacji; nie przypisujemy uniwersalnej daty.',
 'ZAM – wniosek o zasiłek macierzyński (gdy wymagany)',officialSources.zusZam,!input.actualBirth,'priority',officialSources.zusDocuments);
 if(input.variant==='averaged'){
  put('averaged','Wniosek o wypłatę zasiłku w wysokości uśrednionej '+formatRate(rules.averagedRatePercent),'Osoba rodząca',maternitySource,
   plusDays(input.birthDate,21),'statutory',
   'Złóż odpowiedni wniosek w ciągu 21 dni po porodzie, obejmując nim wymagane okresy. Nie obejmuje nieprzenoszalnych '+rules.reservedParentWeeks+' tygodni drugiego rodzica. Dla innych szczególnych sytuacji sprawdź przepisy.',
   'ZAM – aktualny wniosek',officialSources.zusZam,!input.actualBirth,'priority',officialSources.rate);
 }
 if(input.employment1==='etat'){
  put('maternity-employer','Sprawdź przekazanie dokumentów płatnika składek','Osoba rodząca','Pracodawca / kadry',null,'none',
  'Jeśli płatnikiem świadczenia jest ZUS, pracodawca przekazuje wymagane zaświadczenie Z-3. ZUS wypłaca świadczenia w części zakładów pracy; ustal płatnika zasiłku.',
  'Z-3 – zaświadczenie płatnika (wystawia pracodawca)',officialSources.employerForms,!input.actualBirth,'normal',officialSources.payer);
 }else if(input.employment1==='zlecenie'){
  put('maternity-z3a','Sprawdź zaświadczenie płatnika składek','Osoba rodząca','Zleceniodawca / płatnik składek',null,'none',
  'Przy wypłacie świadczenia przez ZUS co do zasady potrzebne jest zaświadczenie płatnika Z-3a, gdy dotyczy tego tytułu.',
  'Z-3a – zaświadczenie płatnika',officialSources.employerForms,!input.actualBirth);
 }else if(input.employment1==='dzialalnosc'){
  put('maternity-jdg','Złóż dokumenty dotyczące macierzyńskiego','Osoba rodząca','ZUS / eZUS',null,'none',
  'W przypadku działalności gospodarczej potwierdź ubezpieczenie chorobowe, ewentualne zadłużenie i komplet dokumentów. Od 24.10.2026 r. korzystaj z aktualnego ZAM, a nie starych ZUR/ZAO.',
  'ZAM – aktualny wniosek',officialSources.zusZam,!input.actualBirth,'priority',officialSources.zusDocuments);
 }
 for(const p of input.entries.filter(e=>!e.used)){
  const employment=p.owner===1?input.employment1:input.employment2;
  const who=p.owner===1?'Osoba rodząca':'Drugi rodzic';
  if(p.owner===2&&!input.secondEligible)continue;
  if(employment==='etat'){
   put('leave-'+p.id,'Złóż wniosek o urlop rodzicielski: '+p.start,who,'Pracodawca / kadry',plusDays(p.start,-21),'statutory',
   'Wniosek o udzielenie urlopu rodzicielskiego w postaci papierowej lub elektronicznej co najmniej 21 dni przed rozpoczęciem tego okresu. To inny wniosek niż ZAM dotyczący wypłaty zasiłku.',
   'Wniosek pracownika o urlop rodzicielski (do pracodawcy)',officialSources.govParental,!input.actualBirth,'priority');
   put('benefit-'+p.id,'Potwierdź dokumenty do wypłaty za okres rodzicielski: '+p.start,who,'Płatnik zasiłku / ZUS',null,'none',
   'Sprawdź, czy informacje o okresie urlopu i wypłacie świadczenia zostały przekazane płatnikowi zasiłku. Nie stosuj automatycznie 21-dniowego terminu urlopu pracowniczego do wniosku o świadczenie.',
   'ZAM (jeżeli wymagany dla danego trybu)',officialSources.zusZam,!input.actualBirth,'normal',officialSources.zusDocuments);
  }else{
   put('benefit-'+p.id,'Wniosek o zasiłek za okres odpowiadający rodzicielskiemu: '+p.start,who,
   employment==='dzialalnosc'?'ZUS / eZUS':'Płatnik składek / ZUS',null,'none',
   'Osoba bez umowy o pracę nie korzysta z urlopu pracowniczego. Termin i komplet dokumentów ustal dla danego świadczenia; nie stosuj terminu 21 dni dla pracodawcy.',
   'ZAM – wniosek o zasiłek macierzyński',officialSources.zusZam,!input.actualBirth,'priority',officialSources.zusDocuments);
  }
 }
 if(input.sickness){
  put('sickness','Dokumentacja zwolnienia lekarskiego w ciąży','Osoba rodząca',
   input.employment1==='etat'?'Pracodawca / płatnik zasiłku':'Płatnik składek / ZUS',null,'none',
   'Sprawdź e-ZLA, tytuł do ubezpieczenia i to, kto wypłaca zasiłek. ZAS-53 służy do wnioskowania o zasiłek chorobowy w sytuacjach, gdy jest wymagany.',
   'ZAS-53 – wniosek o zasiłek chorobowy',officialSources.zusSickness,!input.actualBirth,'normal');
 }
 if(input.debtRisk)put('debt','Zweryfikuj zadłużenie i ewentualnie wystąp o raty','Osoba prowadząca działalność','ZUS / eZUS',null,'none',
 'Samo złożenie wniosku RSR nie stanowi zawarcia układu ratalnego i nie potwierdza prawa do świadczenia. Sprawdź stan zaległości i terminy z ZUS.',
 'RSR – wniosek o rozłożenie składek na raty',officialSources.zusInstallments,false,'priority');
 return tasks.sort((a,b)=>a.date===null?(b.date===null?0:1):b.date===null?-1:a.date.localeCompare(b.date));
}
export function exportCalendar(tasks:DocumentTask[]):string{
 const esc=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const header=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rodzina360//Formalnosci//PL','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 const events=tasks.filter(t=>t.date).map(t=>{
  const date=t.date!.replace(/-/g,'');
  const end=plusDays(t.date!,1).replace(/-/g,'');
  return ['BEGIN:VEVENT','UID:rodzina360-'+t.id.replace(/[^a-z0-9-]/gi,'-')+'-'+date+'@rodzina360',
   'DTSTAMP:20261121T000000Z','DTSTART;VALUE=DATE:'+date,'DTEND;VALUE=DATE:'+end,
   'SUMMARY:'+esc('Termin: '+t.title),
   'DESCRIPTION:'+esc(t.recipient+' | '+t.details+' | '+t.url+(t.dateIsEstimated?' | Data orientacyjna':'') ),
   'URL:'+t.url,'END:VEVENT'].join('\r\n');
 });
 return [...header,...events,'END:VCALENDAR'].join('\r\n')+'\r\n';
}
