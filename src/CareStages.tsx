import React from 'react';
import {polishDate,plusDays} from './leaveRules.ts';
import {type LeaveEntry,type FlexibleResult} from './flexibleLeave.ts';
import {type CarePlan,careDocuments} from './careRules.ts';
import {LeavePeriodsEditor} from './LeavePeriodsEditor.tsx';
import {CoverageQuestions,EntitlementBadge} from './CoverageQuestions.tsx';
import {type EligibilityResult,type CoverageEvidence} from './entitlementCheck.ts';
import {assessAveragedRate} from './decisionGuards.ts';
import {ApplicationReadiness} from './ApplicationReadiness.tsx';
import {ApplicationFormsDemo} from './ApplicationFormsDemo.tsx';
import {SupportDirectory} from './SupportDirectory.tsx';
import type {DemoFeatures} from './legalConfig.ts';
import {OfficialRightsLinks} from './OfficialRightsLinks.tsx';
import type {FormsDemoInput} from './applicationFormsDemo.ts';
import type {ApplicationReadinessInput} from './applicationReadiness.ts';

type Rate='standard'|'averaged';
type Emp='etat'|'zlecenie'|'dzialalnosc'|'inne'|'';
type Props2={
 plan:CarePlan;entries:LeaveEntry[];setEntries:(v:LeaveEntry[])=>void;
 secondEligible:boolean;variant:Rate;setVariant:(v:Rate)=>void;
 applicationDate:string;setApplicationDate:(v:string)=>void;
 usedDays:number;setUsedDays:(v:number)=>void;
 person1:EligibilityResult;person2:EligibilityResult;familyTwo:boolean;
 coverage1:CoverageEvidence;setCoverage1:(v:CoverageEvidence)=>void;
 coverage2:CoverageEvidence;setCoverage2:(v:CoverageEvidence)=>void;
 error:string;calculation:FlexibleResult|null;onBack:()=>void;onNext:()=>void;
};
const label=(plan:CarePlan)=>plan.kind==='adoption'?'przysposobienia':'rodziny zastępczej niezawodowej';
export function CareStage2(p:Props2){
 const c=p.plan,rate=assessAveragedRate(c.eventDate,p.applicationDate,true);
 return <section className="form-section" aria-label="Planowanie urlopów po przyjęciu dziecka">
   <div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 2 Z 4</p>
    <h2>Urlopy po przyjęciu dziecka</h2><p>Indywidualny scenariusz {label(c)}. Wszystkie okresy podano w dniach kalendarzowych.</p>
   </div><div className="section-decoration">02 / 04</div></div>
   <div className="stats-grid">
    <div className="stat-card"><span>Urlop na warunkach macierzyńskiego</span><strong>{c.maternityDays} dni</strong><small>{c.minimumNineWeeks?'Minimum gwarantowane: 9 tygodni':'Maksymalny okres dla podanej liczby dzieci'}</small></div>
    <div className="stat-card"><span>Urlop rodzicielski — limit</span><strong>{c.parentalDays} dni</strong><small>{c.parentalWeeks} tygodni; z czego 9 tygodni na każdego uprawnionego</small></div>
    <div className="stat-card"><span>Granica wieku dziecka</span><strong>{c.ageLimitYears} lat</strong><small>Nie później niż {polishDate(c.lastParentalDay)} dla rodzicielskiego</small></div>
   </div>
   <div className="planner-card"><h3>Podstawy planu</h3>
    <p>Przyjęcie: {polishDate(c.acceptanceDate)}. Zdarzenie prawne: {polishDate(c.eventDate)}. Urlop na warunkach macierzyńskiego: {polishDate(c.maternity.start)} – {polishDate(c.maternity.end)}.</p>
    {c.warnings.map((v,i)=><p className="field-hint" key={i}>{v}</p>)}
    {c.review&&<p className="validation" role="alert">W przypadku dzieci w różnym wieku wynik jest orientacyjny; ZUS musi potwierdzić zmiany wymiaru po osiągnięciu granicy wieku przez jedno z dzieci.</p>}
   </div>
   <div className="planner-card"><h3>Wstępna weryfikacja prawa do zasiłku</h3>
    <p>Nie uznajemy prawa do wypłaty wyłącznie na podstawie dat. Sprawdź ubezpieczenie osoby wnioskującej.</p>
    <EntitlementBadge result={p.person1}/>{p.familyTwo&&<EntitlementBadge result={p.person2}/>}
   </div>
   <CoverageQuestions title="opiekun / wnioskodawca" coverage={p.coverage1} onChange={p.setCoverage1} forSickness={false} careMode={true}/>
   {p.familyTwo&&<CoverageQuestions title="drugi opiekun" coverage={p.coverage2} onChange={p.setCoverage2} forSickness={false} careMode={true}/>}
   <div className="planner-card"><h3>Wcześniej wykorzystane dni</h3>
    <p>Podaj, ile dni urlopu na warunkach macierzyńskiego wykorzystano już w tej sprawie. Okresów rodzicielskich to nie zmienia.</p>
    <label>Wykorzystane dni urlopu na warunkach macierzyńskiego
     <input type="number" min="0" max={c.maternityDays} step="1" value={p.usedDays} onChange={e=>p.setUsedDays(Number(e.target.value))}/></label>
    <p className="field-hint">Pozostało {Math.max(0,c.maternityDays-p.usedDays)} z {c.maternityDays} dni.</p>
   </div>
   <LeavePeriodsEditor entries={p.entries} setEntries={p.setEntries} secondEligible={p.secondEligible} careMode={true}/>
   <div className="planner-card"><h3>Wariant stawki</h3>
    <div className="choice-grid">
     <label className={'choice-card '+(p.variant==='standard'?'selected':'')}><input type="radio" name="care-rate" checked={p.variant==='standard'} onChange={()=>p.setVariant('standard')}/><strong>Standardowy: 100% / 70%</strong><small>100% za urlop na warunkach macierzyńskiego i 70% za rodzicielski.</small></label>
     <label className={'choice-card '+(p.variant==='averaged'?'selected':'')}><input type="radio" name="care-rate" checked={p.variant==='averaged'} onChange={()=>p.setVariant('averaged')}/><strong>Uśredniony: 81,5%</strong><small>Wniosek obejmujący pełen wymiar nie później niż w ciągu 21 dni po wymaganym zdarzeniu; wyłączne 9 tygodni drugiego opiekuna — 70%.</small></label>
    </div>
    {p.variant==='averaged'&&<><label>Data faktycznego złożenia wniosku o stawkę 81,5%
      <input type="date" value={p.applicationDate} onChange={e=>p.setApplicationDate(e.target.value)}/></label>
     <p className="field-hint">{rate==='deadline_missed'?'Przekroczono 21 dni. Nie zastosujemy stawki 81,5% jako potwierdzonej.':rate==='eligible_for_review'?'Termin wygląda na zachowany; ZUS musi potwierdzić treść i zakres wniosku.':'Brak potwierdzonej daty wniosku — 81,5% może być tylko wariantem hipotetycznym.'}</p>
    </>}
   </div>
   {p.calculation&&<div className="planner-card"><h3>Podział rodzicielskiego</h3>
    <p>Zaplanowano {p.calculation.plannedDays} dni, wykorzystano {p.calculation.usedDays} dni. Do wspólnego limitu pozostało {p.calculation.remainingFamilyDays} dni — nie oznacza to możliwości przejęcia 9 tygodni drugiej osoby.</p>
   </div>}
   {p.error&&<p className="validation" role="alert">{p.error}</p>}
   <div className="step-actions"><button type="button" className="secondary-button" onClick={p.onBack}>← Dane rodziny</button><button type="button" className="primary-button" onClick={p.onNext}>Pokaż mój plan →</button></div>
 </section>;
}
export function CareStage3(p:{plan:CarePlan;flex:FlexibleResult;usedDays:number;
 variant:Rate;employment:Emp;appDate:string;
 person1:EligibilityResult;person2:EligibilityResult;familyTwo:boolean;
 formsInput:FormsDemoInput;features:DemoFeatures;
 readinessInput:ApplicationReadinessInput;readinessChecked:Record<string,boolean>;
 onReadinessToggle:(id:string,value:boolean)=>void;onReadinessReset:()=>void;
 onBack:()=>void;onNext:()=>void}){
 const c=p.plan,docs=careDocuments(c,p.employment,p.variant);
 const averaged=assessAveragedRate(c.eventDate,p.appDate,true);
 const events=[{date:c.employerApplicationDeadline,title:'Wniosek o urlop na warunkach macierzyńskiego (pracownik)'},
  {date:c.leaveStartDeadline,title:'Najpóźniejszy początek urlopu (pracownik)'},
  ...(p.variant==='averaged'?[{date:c.averagedDeadline,title:'Wniosek o uśrednioną stawkę 81,5%'}]:[]),
  ...p.flex.entries.filter(e=>!e.used).map(e=>({date:e.employerDeadline!,title:'Wniosek o urlop rodzicielski — '+e.start}))];
 const download=()=>{
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rodzina360//Opiekunowie//PL'];
  events.filter(e=>e.date).forEach((e,i)=>{const d=e.date.replace(/-/g,'');lines.push('BEGIN:VEVENT','UID:care-'+i+'-'+d+'@rodzina360','DTSTAMP:20261121T000000Z','DTSTART;VALUE=DATE:'+d,'SUMMARY:'+e.title.replace(/[,;]/g,' '),'END:VEVENT');});
  lines.push('END:VCALENDAR');
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='rodzina360-adopcja-terminy.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 };
 return <section className="form-section">
  <div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 3 Z 4</p><h2>Twój plan i dokumenty</h2>
   <p>Harmonogram {label(c)} — terminy, wymagane dowody i pozostałe dni.</p></div><div className="section-decoration">03 / 04</div></div>
  <div className="stats-grid">
   <div className="stat-card"><span>Pozostały urlop na warunkach macierzyńskiego</span><strong>{c.maternityDays-p.usedDays} dni</strong></div>
   <div className="stat-card"><span>Rodzicielski zaplanowany</span><strong>{p.flex.plannedDays} dni</strong></div>
   <div className="stat-card"><span>Rodzicielski jeszcze nieprzydzielony</span><strong>{p.flex.remainingFamilyDays} dni</strong></div>
  </div>
  <div className="planner-card"><h3>Oś czasu</h3>
   <p>Urlop na warunkach macierzyńskiego: {polishDate(c.maternity.start)} – {polishDate(c.maternity.end)} ({c.maternityDays} dni).</p>
   {p.flex.entries.length?p.flex.entries.map(e=><p key={e.id}>{e.owner===1?'Opiekun 1':'Opiekun 2'}: {polishDate(e.start)} – {polishDate(e.end)}, {e.days} dni ({e.used?'wykorzystano':'zaplanowano'}).</p>):<p>Nie zaplanowano urlopu rodzicielskiego: limit wieku może uniemożliwiać kolejne okresy.</p>}
   <p className="field-hint">Termin graniczny zależny od wieku: {polishDate(c.lastParentalDay)}. Nie przenosi to 9 tygodni drugiego uprawnionego opiekuna.</p>
  </div>
  <div className="planner-card"><h3>Weryfikacja uprawnień</h3>
   <EntitlementBadge result={p.person1}/>{p.familyTwo&&<EntitlementBadge result={p.person2}/>}
   {c.warnings.map((w,i)=><p key={i} className="field-hint">{w}</p>)}
   {p.variant==='averaged'&&averaged!=='eligible_for_review'&&<p className="validation">Niepotwierdzona stawka 81,5%; kwota będzie tylko hipotetyczna, a nie należna.</p>}
  </div>
  <div className="planner-card"><h3>Dokumenty do ZUS i pracodawcy</h3>
   {docs.map((d,i)=><div className="deadline-row" key={i}><div><strong>{d.title}</strong><small>{d.details}</small></div><a href={d.url} target="_blank" rel="noopener noreferrer">Źródło ZUS / gov.pl ↗</a></div>)}
  </div>
  <ApplicationFormsDemo input={p.formsInput}/>
  {p.features.supportDirectory&&<SupportDirectory compact/>}
  {p.features.officialLinks&&<OfficialRightsLinks input={{mode:p.plan.kind,employment1:p.formsInput.employment1,employment2:p.formsInput.employment2,secondIncluded:p.familyTwo,averaged:p.variant==='averaged'}} compact/>}
  <ApplicationReadiness input={p.readinessInput} checked={p.readinessChecked}
   onToggle={p.onReadinessToggle} onReset={p.onReadinessReset}/>
  <div className="planner-card"><h3>Terminy</h3>
   <p>Wniosek pracownika o urlop: do {polishDate(c.employerApplicationDeadline)} (7 dni od zdarzenia).</p>
   <p>Rozpoczęcie urlopu pracowniczego: najpóźniej {polishDate(c.leaveStartDeadline)} (21 dni).</p>
   {p.variant==='averaged'&&<p>Wniosek o 81,5%: do {polishDate(c.averagedDeadline)} (21 dni).</p>}
   {p.flex.entries.filter(e=>!e.used).map(e=><p key={e.id}>Urlop rodzicielski od {polishDate(e.start)}: wniosek do pracodawcy do {polishDate(e.employerDeadline!)}.</p>)}
   <p className="field-hint">Terminy 7 i 21 dni dotyczą odpowiednich wniosków pracowniczych; przy JDG/zleceniu sprawdź zasady dokumentowania w ZUS.</p>
   <button type="button" className="secondary-button" onClick={download}>Pobierz terminy do kalendarza (.ics)</button>
  </div>
  <div className="step-actions"><button type="button" className="secondary-button" onClick={p.onBack}>← Zmień podział dni</button><button type="button" className="primary-button" onClick={p.onNext}>Dalej: symulacja wypłat →</button></div>
 </section>;
}
