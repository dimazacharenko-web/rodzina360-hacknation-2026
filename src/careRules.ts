/** Wsparcie przysposobienia i niezawodowej pieczy zastępczej.
 * Art. 183 Kodeksu pracy (wyciąg HackNation 2026, strona z art. 183),
 * ZUS: okresy zasiłku i dokumenty; MRPiPS: Urlop adopcyjny.
 * Wyniki szacunkowe — zdarzenia prawne i dokumenty potwierdza ZUS.
 */
import {limits,plusDays,type Period} from './leaveRules.ts';
import {daysInclusive,type LeaveEntry,type EvaluatedEntry,type FlexibleResult} from './flexibleLeave.ts';
export type CareKind='adoption'|'foster';
export type CareProfile={
 acceptanceDate:string;courtFilingDate:string;leaveStartDate:string;
 childBirthDates:string[];schoolDeferred:'yes'|'no'|'unknown';
 fosterType:'nonprofessional'|'professional'|'unknown';zaZyciem:'yes'|'no';
};
export const emptyCare=():CareProfile=>({acceptanceDate:'',courtFilingDate:'',leaveStartDate:'',childBirthDates:[''],schoolDeferred:'unknown',fosterType:'nonprofessional',zaZyciem:'no'});
const ageLimit=(kind:CareKind,p:CareProfile)=>kind==='adoption'?14:p.schoolDeferred==='yes'?10:7;
function date(s:string):number{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Podaj pełne i prawidłowe daty dziecka i przyjęcia.');
 const [y,m,d]=s.split('-').map(Number),v=Date.UTC(y,m-1,d),dt=new Date(v);
 if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)throw Error('Nieprawidłowa data: '+s);
 return v/86400000;
}
function birthday(dob:string,years:number):string{
 const [y,m,d]=dob.split('-').map(Number);
 // 29 lutego i specjalne ustalanie daty ukończenia wieku: skieruj do weryfikacji.
 const dt=new Date(Date.UTC(y+years,m-1,d));
 return dt.toISOString().slice(0,10);
}
export type CarePlan={
 kind:CareKind;start:string;eventDate:string;acceptanceDate:string;
 maternity:Period;maternityDays:number;parentalDays:number;parentalWeeks:number;
 maternityFullDays:number;ageLimitYears:number;ageDeadline:string;lastParentalDay:string;
 averagedDeadline:string;employerApplicationDeadline:string;leaveStartDeadline:string;
 review:boolean;warnings:string[];documents:{title:string;details:string;url:string}[];
 children:number;zaZyciem:boolean;minimumNineWeeks:boolean;
};
const add=(s:string,n:number)=>plusDays(s,n);
export function calculateCarePlan(kind:CareKind,p:CareProfile,children:number):CarePlan{
 const l=limits(children);
 const accepted=date(p.acceptanceDate);
 if(children!==p.childBirthDates.length)throw Error('Podaj datę urodzenia każdego przyjętego dziecka.');
 const births=p.childBirthDates.map(date);
 if(births.some(x=>x>accepted))throw Error('Data urodzenia dziecka nie może być późniejsza od daty przyjęcia.');
 if(kind==='foster'&&p.fosterType!=='nonprofessional')throw Error('Automatyczny kalkulator obejmuje tylko niezawodową rodzinę zastępczą. Zawodowa rodzina zastępcza nie jest objęta tym świadczeniem.');
 if(kind==='foster'&&p.schoolDeferred==='unknown')throw Error('Potwierdź, czy odroczono obowiązek szkolny. To decyduje o limicie wieku 7/10 lat.');
 if(kind==='adoption'&&!p.courtFilingDate)throw Error('Przysposobienie wymaga daty złożenia wniosku do sądu opiekuńczego.');
 const court=kind==='adoption'?date(p.courtFilingDate):accepted;
 // Oba zdarzenia są wymagane; mogą wystąpić w różnej kolejności. Data bazowa to późniejsze zdarzenie.
 const eventDate=kind==='adoption'&&court>accepted?p.courtFilingDate:p.acceptanceDate;
 const event=date(eventDate);
 const start=p.leaveStartDate?date(p.leaveStartDate):event;
 if(start<event)throw Error('Urlop na warunkach macierzyńskiego nie może rozpoczynać się przed wymaganym zdarzeniem prawnym.');
 if(start>event+21)throw Error('Termin rozpoczęcia urlopu pracowniczego nie może przekroczyć 21 dni od przyjęcia / wniosku sądowego (art. 183 § 6).');
 const years=ageLimit(kind,p);
 const cutoffs=p.childBirthDates.map(d=>birthday(d,years));
 const oldestCutoff=cutoffs.slice().sort()[0];
 if(date(oldestCutoff)<=accepted)throw Error('Co najmniej jedno dziecko osiągnęło już limit wieku '+years+' lat w dniu przyjęcia. Ten standardowy wariant nie obejmuje tego przypadku.');
 if(date(oldestCutoff)<=event)throw Error('Zdarzenie uprawniające nastąpiło po ukończeniu przez dziecko limitu wieku '+years+' lat.');
 const allowedNatural=Math.max(0,date(oldestCutoff)-start);
 const maternityDays=Math.min(l.maternityDays,Math.max(63,allowedNatural));
 const maternityEnd=add(p.leaveStartDate||eventDate,maternityDays-1);
 const minimumNineWeeks=maternityDays<l.maternityDays;
 const parentalWeeks=p.zaZyciem==='yes'?(minimumNineWeeks?62:children===1?65:67):(minimumNineWeeks?38:l.parentalWeeks);
 const parentalDays=parentalWeeks*7;
 const warnings:string[]=[];
 if(kind==='adoption'&&court<accepted)warnings.push('Wniosek do sądu złożono przed przyjęciem dziecka. Wymagane oba zdarzenia — przyjęto późniejszą datę jako punkt odniesienia.');
 let review=false;
 if(children>1){
  review=true;
  warnings.push('Przyjęcie kilkorga dzieci w różnym wieku: wynik jest ostrożnym wariantem opartym na najwcześniejszej granicy wieku. W razie ukończenia wieku przez jedno z dzieci wymiar może zależeć od pozostałych dzieci. Potwierdź okres w ZUS.');
 }
 if(minimumNineWeeks)warnings.push('Zastosowano gwarantowane minimum 9 tygodni urlopu na warunkach macierzyńskiego. Łączny zwykły wymiar byłby krótszy ze względu na wiek dziecka.');
 if(p.leaveStartDate&&p.leaveStartDate!==eventDate)warnings.push('Początek urlopu przesunięto w dopuszczalnym oknie 21 dni. Sprawdź rzeczywistą datę przyznaną przez pracodawcę.');
 if(kind==='adoption')warnings.push('Prawo do urlopu wymaga faktycznego przyjęcia dziecka i wystąpienia do sądu o przysposobienie; sama intencja adopcji nie wystarcza.');
 else warnings.push('Prawo do zasiłku dotyczy rodziny zastępczej niezawodowej; zawodowa rodzina zastępcza jest wyłączona.');
 if(p.zaZyciem==='yes')warnings.push('Wydłużony rodzicielski wymaga ważnego zaświadczenia „Za życiem”.');
 if(p.childBirthDates.some(d=>d.endsWith('-02-29'))) {review=true;warnings.push('Data ukończenia wieku osoby urodzonej 29 lutego wymaga indywidualnej oceny; zastosowano model kalendarzowy.');}
 const baseDocs=kind==='adoption'?[
  {title:'Zaświadczenie sądu / kopia wniosku o przysposobienie',details:'Dokument z datą wystąpienia do sądu oraz datą urodzenia dziecka.',url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'},
  {title:'Oświadczenie o przyjęciu dziecka',details:'Oświadczenie z datą faktycznego przyjęcia dziecka na wychowanie.',url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'}
 ]:[
  {title:'Prawomocne orzeczenie sądu albo umowa ze starostą',details:'Dokument potwierdzający powierzenie dziecka niezawodowej rodzinie zastępczej.',url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'},
  {title:'Dokument potwierdzający wiek dziecka',details:'W razie odroczenia obowiązku szkolnego także decyzja ostateczna o odroczeniu.',url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'}
 ];
 if(p.zaZyciem==='yes')baseDocs.push({title:'Zaświadczenie „Za życiem”',details:'Potwierdź aktualne zaświadczenie uprawniające do wydłużonego urlopu rodzicielskiego.',url:'https://www.gov.pl/web/rodzina/urlop-adopcyjny'});
 return {kind,start:p.leaveStartDate||eventDate,eventDate,acceptanceDate:p.acceptanceDate,
  maternity:{start:p.leaveStartDate||eventDate,end:maternityEnd,days:maternityDays},maternityDays,
  parentalDays,parentalWeeks,maternityFullDays:l.maternityDays,ageLimitYears:years,ageDeadline:oldestCutoff,
  lastParentalDay:add(oldestCutoff,-1),
  averagedDeadline:add(eventDate,21),employerApplicationDeadline:add(eventDate,7),
  leaveStartDeadline:add(eventDate,21),review,warnings,documents:baseDocs,
  children,zaZyciem:p.zaZyciem==='yes',minimumNineWeeks};
}
export function initialCareEntries(c:CarePlan,secondEligible:boolean):LeaveEntry[]{
 const firstDay=add(c.maternity.end,1);
 const available=Math.max(0,Math.floor((date(c.ageDeadline)-date(firstDay))/7));
 const cap=Math.max(0,c.parentalWeeks-9),firstWeeks=Math.min(cap,available);
 const entries:LeaveEntry[]=[];
 if(firstWeeks>0)entries.push({id:'care-p1',owner:1,start:firstDay,end:add(firstDay,firstWeeks*7-1),used:false});
 const after=firstWeeks?add(firstDay,firstWeeks*7):firstDay;
 const secondWeeks=secondEligible?Math.min(9,Math.max(0,Math.floor((date(c.ageDeadline)-date(after))/7))):0;
 if(secondWeeks)entries.push({id:'care-p2',owner:2,start:after,end:add(after,secondWeeks*7-1),used:false});
 return entries;
}
export function calculateCarePeriods(c:CarePlan,entries:LeaveEntry[],secondEligible:boolean):FlexibleResult{
 if(entries.length>5)throw Error('Urlop rodzicielski może mieć maksymalnie 5 części.');
 const items:EvaluatedEntry[]=entries.map((e,i)=>{
  if(e.owner!==1&&e.owner!==2)throw Error('Niepoprawny rodzic.');
  if(e.owner===2&&!secondEligible)throw Error('Drugi opiekun nie ma potwierdzonego uprawnienia.');
  const days=daysInclusive(e.start,e.end);
  if(date(e.start)<date(c.eventDate))throw Error('Okres rodzicielski nie może zaczynać się przed przyjęciem dziecka i wymaganym zdarzeniem.');
  if(date(e.end)>=date(c.ageDeadline))throw Error('Okres rodzicielski wykracza poza '+c.ageLimitYears+'. urodziny dziecka.');
  if(!e.used&&days%7!==0)throw Error('Planowany okres '+(i+1)+' powinien obejmować pełne tygodnie.');
  return {...e,days,employerDeadline:e.used?null:add(e.start,-21)};
 });
 for(const owner of [1,2]){
  const periods=items.filter(e=>e.owner===owner).sort((a,b)=>a.start.localeCompare(b.start));
  for(let n=1;n<periods.length;n++)if(date(periods[n].start)<=date(periods[n-1].end))throw Error('Nakładające się okresy jednego opiekuna.');
 }
 const usedByParent:[number,number]=[0,0],plannedByParent:[number,number]=[0,0];
 for(const e of items)(e.used?usedByParent:plannedByParent)[e.owner-1]+=e.days;
 const totals=usedByParent.map((n,i)=>n+plannedByParent[i]);
 const cap=(c.parentalWeeks-9)*7;
 if(totals.some(n=>n>cap))throw Error('Przekroczono limit jednego opiekuna. Nieprzenoszalne 9 tygodni przysługuje drugiemu uprawnionemu opiekunowi.');
 const totalDays=totals[0]+totals[1];
 if(totalDays>c.parentalDays)throw Error('Przekroczono wspólny limit urlopu rodzicielskiego.');
 const warnings=c.warnings.slice();
 if(items.some(e=>date(e.start)<=date(c.maternity.end)))warnings.push('Rodzicielski nachodzi na urlop na warunkach macierzyńskiego — wymaga sprawdzenia, który z opiekunów korzysta.');
 const usedDays=usedByParent[0]+usedByParent[1],plannedDays=plannedByParent[0]+plannedByParent[1];
 return {entries:items,usedDays,plannedDays,usedByParent,plannedByParent,totalDays,
  remainingFamilyDays:c.parentalDays-totalDays,
  remainingByParent:[cap-totals[0],cap-totals[1]],
  parentalMaxDays:c.parentalDays,maternity:c.maternity,warnings};
}
export function careDocuments(c:CarePlan,employment:'etat'|'zlecenie'|'dzialalnosc'|'inne'|'',variant:'standard'|'averaged'){
 const docs=[...c.documents];
 if(employment==='etat')docs.unshift({title:'Wniosek o urlop na warunkach macierzyńskiego',details:'Złóż pracodawcy nie później niż 7 dni po zdarzeniu. Urlop musi zacząć się nie później niż w ciągu 21 dni od zdarzenia (art. 183 § 6).',url:'https://www.gov.pl/web/rodzina/urlop-adopcyjny'});
 else docs.unshift({title:'Wniosek o zasiłek macierzyński z tytułu przyjęcia dziecka',details:'Dla osób bez urlopu pracowniczego: złóż wniosek do płatnika / ZUS i potwierdź dokumenty oraz okres zasiłku.',url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'});
 if(variant==='averaged')docs.push({title:'Wniosek o uśrednioną stawkę 81,5%',details:'Termin 21 dni od dnia przyjęcia dziecka i wystąpienia do sądu / przyjęcia do rodziny zastępczej. Wniosek obejmuje wymagany pełny wymiar.',url:'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc'});
 docs.push({title:'Wnioski o urlop rodzicielski / świadczenie',details:'Dla pracownika: do pracodawcy co najmniej 21 dni przed każdym planowanym okresem rodzicielskiego. W pozostałych tytułach stosuj zasady ZUS.',url:'https://www.gov.pl/web/rodzina/urlop-adopcyjny'});
 return docs;
}
