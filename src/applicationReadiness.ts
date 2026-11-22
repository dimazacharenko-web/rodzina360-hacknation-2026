/** Pre-submission completeness screening (not automatic document verification).
 * Sources: ZUS "Niezbędne dokumenty" (updated 24.10.2026), ZUS ZAM,
 * leave procedures in documentPlanner.ts, adoption/foster care rules in careRules.ts.
 * Questions about conditional forms ask users to verify applicability instead of
 * incorrectly treating every optional document as universally required.
 */
import type {DocumentTask,EmploymentKind} from './documentPlanner.ts';
import {OFFICIAL_RULES,formatRate,type LegalRules} from './legalConfig.ts';
import type {CarePlan} from './careRules.ts';
import type {EligibilityStatus} from './entitlementCheck.ts';

export type ChecklistGroup='data'|'application'|'evidence'|'verification';
export type ChecklistItem={id:string;group:ChecklistGroup;title:string;detail:string;url?:string;conditional?:boolean};
export type ChecklistFinding={id:string;text:string;severity:'block'|'review'};
export type ApplicationReadinessInput={
 mode:'birth'|'adoption'|'foster';
 actualEvent:boolean;
 applicantEmployment:EmploymentKind;secondEmployment:EmploymentKind;
 secondIncluded:boolean;
 applicantEligibility:EligibilityStatus;secondEligibility?:EligibilityStatus;
 insuranceStartVerified:boolean;secondInsuranceStartVerified:boolean;
 debtRisk:boolean;sickness:boolean;codeBConfirmed:boolean;ezlaDemoSource?:boolean;
 variant:'standard'|'averaged';averagedAssessment:'eligible_for_review'|'deadline_missed'|'unverified';
 tasks:DocumentTask[];care?:CarePlan|null;rules?:LegalRules;
};
export type ChecklistAssessment={
 items:ChecklistItem[];findings:ChecklistFinding[];
 checked:number;total:number;missing:ChecklistItem[];
 status:'needs_action'|'missing_confirmation'|'requires_review'|'checked';
};
const ZUS_DOCS='https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty';
const ZUS_FORMS='https://www.zus.pl/wzory-formularzy/zasilki/zasilek-macierzynski';
const ZUS_PAYER='https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/postepowanie-w-sprawie-zasilkow/platnicy-zasilku';
const EMPLOYER='https://www.gov.pl/web/rodzina/urlop-rodzicielski';
export function createApplicationChecklist(input:ApplicationReadinessInput):{items:ChecklistItem[];findings:ChecklistFinding[]}{
 const items:ChecklistItem[]=[],findings:ChecklistFinding[]=[];
 const rules=input.rules??OFFICIAL_RULES;
 const averagedRate=formatRate(rules.averagedRatePercent);
 const add=(group:ChecklistGroup,id:string,title:string,detail:string,url?:string,conditional=false)=>
  items.push({group,id,title,detail,url,conditional});
 const finding=(id:string,text:string,severity:ChecklistFinding['severity'])=>findings.push({id,text,severity});
 const care=input.mode!=='birth';
 add('data','personal','Sprawdź dane osobowe i dane do wypłaty',
  'Porównaj PESEL albo dane dokumentu tożsamości, dane dziecka, adres i rachunek bankowy we właściwym wniosku.',ZUS_DOCS);
 if(care){
  add('data','placement-dates','Potwierdź datę przyjęcia dziecka i daty jego urodzenia',
   'Dane muszą być zgodne z dokumentami dotyczącymi przyjęcia na wychowanie.',ZUS_DOCS);
 }else{
  add('data','birth-data','Sprawdź dane faktycznego urodzenia dziecka',
   'Przygotuj informacje o urodzeniu wymagane dla Twojego trybu. Nie zakładamy, że zawsze trzeba dostarczyć papierowy akt urodzenia.',ZUS_DOCS);
  if(!input.actualEvent)finding('event-unconfirmed','Podano przewidywaną, a nie faktyczną datę porodu. Końcowe dane i terminy wymagają aktualizacji po urodzeniu.','block');
 }
 add('verification','insurance','Zweryfikuj prawo do zasiłku i okres ubezpieczenia',
  'Sprawdź historię ubezpieczenia oraz dokumenty potwierdzające tytuł u płatnika lub w eZUS. Samo zaznaczenie pola w aplikacji nie potwierdza prawa.',ZUS_DOCS);
 if(!input.insuranceStartVerified)finding('insurance-date','Brakuje potwierdzonej daty początku ubezpieczenia w ankiecie.','review');
 if(input.applicantEligibility==='blocked_standard')finding('insurance-blocked','Wstępna weryfikacja wskazuje brak podstaw do wypłaty w zwykłym trybie. Wyjaśnij uprawnienie przed wysłaniem wniosku.','block');
 else if(input.applicantEligibility==='review')finding('insurance-review','Prawo wnioskodawcy nie zostało potwierdzone — wymagane wyjaśnienie z ZUS lub płatnikiem.','review');
 if(input.secondIncluded){
  add('verification','second-parent','Sprawdź dane i wykorzystane okresy drugiego rodzica/opiekuna',
   'Potwierdź, czy drugi opiekun ma uprawnienie oraz jakie okresy świadczenia wykorzystał. W razie potrzeby przygotuj wymagane oświadczenia i zaświadczenia.',ZUS_DOCS,true);
  if(!input.secondInsuranceStartVerified)finding('second-insurance-date','Nie potwierdzono początku ubezpieczenia drugiego opiekuna.','review');
  if(input.secondEligibility==='blocked_standard')finding('second-blocked','Drugi opiekun nie ma potwierdzonych podstaw do świadczenia w zwykłym trybie.','block');
  else if(input.secondEligibility==='review')finding('second-review','Status uprawnienia drugiego opiekuna wymaga weryfikacji.','review');
 }
 add('application','application-route','Ustal właściwy wniosek i płatnika zasiłku',
  'Sprawdź aktualny formularz ZAM, gdy jest wymagany, i czy dokumenty należy przekazać pracodawcy, płatnikowi zasiłku lub ZUS. ZAM nie zastępuje pracowniczego wniosku urlopowego.',ZUS_FORMS,true);
 if(input.applicantEmployment==='etat'){
  add('application','employer-z3','Sprawdź zaświadczenie płatnika Z-3 — jeżeli jest wymagane',
   'Potwierdź z kadrami, czy zasiłek wypłaca pracodawca czy ZUS i czy pracodawca przekazał potrzebne zaświadczenie Z-3.',ZUS_PAYER,true);
 }else if(input.applicantEmployment==='zlecenie'){
  add('application','payer-z3a','Sprawdź zaświadczenie Z-3a — jeżeli jest wymagane',
   'Potwierdź ze zleceniodawcą, czy ZUS wymaga zaświadczenia płatnika Z-3a.',ZUS_DOCS,true);
 }else if(input.applicantEmployment==='dzialalnosc'){
  add('verification','jdg-insurance','Sprawdź zgłoszenie do chorobowego i stan rozliczeń ZUS',
   'Potwierdź ubezpieczenie dobrowolne, saldo oraz wpływ ewentualnego zadłużenia na wypłatę.',ZUS_DOCS);
 }
 if(input.debtRisk)finding('debt-risk','Występuje ryzyko zadłużenia JDG. Sprawdź saldo i ewentualny układ ratalny przed złożeniem wniosku.','review');
 if(input.variant==='averaged'){
  add('application','averaged-application','Sprawdź datę i zakres wniosku o stawkę '+averagedRate,
   'Potwierdź właściwy wniosek obejmujący wymagany okres, faktyczną datę złożenia oraz termin 21 dni. Nie obejmuj stawką '+averagedRate+' wyłącznych '+rules.reservedParentWeeks+' tygodni drugiego rodzica.',ZUS_DOCS);
  if(input.averagedAssessment==='deadline_missed')finding('averaged-late','Termin 21 dni dla wariantu '+averagedRate+' jest przekroczony. Ten wariant nie może być automatycznie uznany za należny.','block');
  else if(input.averagedAssessment==='unverified')finding('averaged-unverified','Brakuje potwierdzenia daty i zakresu wniosku o stawkę '+averagedRate+'.','review');
 }
 const futureTasks=input.tasks.filter(t=>!t.id.startsWith('maternity')&&t.id!=='averaged'&&t.id!=='debt'&&t.id!=='sickness');
 for(const t of futureTasks){
  // Form routing is case-specific; tasks identify potentially required steps.
  if(t.id.startsWith('leave-')||t.id.startsWith('benefit-'))
   add('application','task-'+t.id,'Sprawdź formalności: '+t.title,
    t.recipient+'. '+(t.date?'Termin planowany: '+t.date+'. ':'')+t.details,t.url,Boolean(t.id.startsWith('benefit-')));
 }
 const outdated=input.tasks.filter(t=>t.deadlineKind==='statutory'&&t.status==='late'&&!t.dateIsEstimated);
 if(outdated.length)finding('deadlines-past','Co najmniej jeden termin z harmonogramu minął. Sprawdź skutki dla konkretnego wniosku, zamiast zakładać automatyczną odmowę.','review');
 if(input.sickness&&!care){
  add('evidence','sickness-document','Sprawdź e-ZLA i potwierdzenie ciąży (kod B)',
   'Zweryfikuj okres niezdolności oraz dokumenty uzasadniające 100% podstawy. Samo e-ZLA nie oznacza automatycznego prawa do zasiłku.',ZUS_DOCS);
  add('application','sickness-application','Sprawdź, czy potrzebny jest ZAS-53',
   'W niektórych sytuacjach konieczny jest wniosek o zasiłek chorobowy; sprawdź ścieżkę ZUS i płatnika.',ZUS_FORMS,true);
  if(input.ezlaDemoSource)finding('sickness-demo','Okres e-ZLA pochodzi z syntetycznego podglądu DEMO. Sprawdź autentyczne zwolnienie i jego kod w eZUS; DEMO nie jest zaświadczeniem.','review');
  if(!input.codeBConfirmed)finding('sickness-unconfirmed','Nie potwierdzono e-ZLA z kodem B. Wymagana weryfikacja stawki dla niezdolności w ciąży.','review');
 }
 if(care&&input.care){
  for(let i=0;i<input.care.documents.length;i++){
   const doc=input.care.documents[i];
   add('evidence','care-document-'+i,'Przygotuj: '+doc.title,doc.details,doc.url);
  }
  if(input.care.kind==='foster'&&input.care.ageLimitYears===10)
   add('evidence','foster-school','Sprawdź decyzję o odroczeniu obowiązku szkolnego',
    'Odroczenie musi być udokumentowane, jeśli stosujesz granicę wieku 10 lat.',ZUS_DOCS);
  if(input.care.review)finding('care-review','Sytuacja przyjęcia dzieci wymaga dodatkowej oceny ZUS (np. kilka dzieci w różnym wieku).','review');
  if(input.applicantEmployment==='etat'){
   add('application','care-employer','Sprawdź wniosek o urlop na warunkach macierzyńskiego do pracodawcy',
    'Zweryfikuj 7-dniowy termin wniosku i rozpoczęcie urlopu zgodnie z harmonogramem.',EMPLOYER);
  }
 }
 return {items,findings};
}
export function assessApplicationReadiness(input:ApplicationReadinessInput,checked:Record<string,boolean>):ChecklistAssessment{
 const {items,findings}=createApplicationChecklist(input);
 const missing=items.filter(item=>checked[item.id]!==true);
 return {items,findings,checked:items.length-missing.length,total:items.length,missing,
  status:findings.some(f=>f.severity==='block')?'needs_action':
   missing.length?'missing_confirmation':
   findings.length?'requires_review':'checked'};
}
export function readinessReport(result:ChecklistAssessment):string{
 const label={needs_action:'Wymaga działania',missing_confirmation:'Niekompletna lista kontrolna',requires_review:'Kompletna lista, potrzebna dodatkowa weryfikacja',checked:'Potwierdzono wszystkie punkty listy kontrolnej'}[result.status];
 return [
 'Rodzina360 — Kontrola kompletności wniosku',
 'Stan: '+label,
 'Potwierdzono: '+result.checked+'/'+result.total,
 '',
 'BRAKUJĄCE POTWIERDZENIA',
 ...(!result.missing.length?['Brak.']:result.missing.map(x=>'- '+x.title+(x.conditional?' (sprawdź, czy dotyczy)':''))),
 '',
 'OSTRZEŻENIA I DANE DO WERYFIKACJI',
 ...(!result.findings.length?['Brak wykrytych w tej ankiecie.']:result.findings.map(x=>'- '+x.text)),
 '',
 'To wyłącznie lista samokontroli. Aplikacja nie sprawdza treści załączników, nie wysyła wniosku i nie gwarantuje jego przyjęcia.',
 'Dokumenty i wymagania: '+ZUS_DOCS,
 ].join('\n');
}
