import React from 'react';
import type {LegalRules} from './legalConfig.ts';
import {createDocumentPlan,exportCalendar,officialSources,type DocumentPlanInput,type DocumentTask} from './documentPlanner';

const datePL=(s:string)=>{const [y,m,d]=s.split('-');return d+'.'+m+'.'+y;};
function downloadCalendar(tasks:DocumentTask[]){
 const blob=new Blob([exportCalendar(tasks)],{type:'text/calendar;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='Rodzina360-terminy.ics';document.body.appendChild(a);a.click();a.remove();
 URL.revokeObjectURL(url);
}
export function DocumentRoadmap({input,rules}:{input:DocumentPlanInput;rules?:LegalRules}){
 const tasks=createDocumentPlan(input,rules);
 const deadlines=tasks.filter(t=>t.date);
 const undated=tasks.filter(t=>!t.date);
 return <div className="planner-card" aria-label="Indywidualny kalendarz i dokumenty">
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
    <div><h3 style={{marginBottom:6}}>Twoja lista formalności</h3>
     <p style={{marginTop:0}}>Co złożyć, gdzie i do kiedy — według wybranych dat oraz tytułu ubezpieczenia.</p></div>
    <button type="button" className="secondary-button" disabled={!deadlines.length} onClick={()=>downloadCalendar(tasks)}>Pobierz terminy do kalendarza (.ics)</button>
   </div>
   {!input.actualBirth&&<p className="notice" style={{padding:14}}>Data porodu jest przewidywana. Terminy wyliczone na jej podstawie są orientacyjne; po narodzinach zaktualizuj plan.</p>}
   <h4>Terminy do dopilnowania ({deadlines.length})</h4>
   {deadlines.length?deadlines.map(t=><Entry key={t.id} t={t}/>):<p>W tym wariancie nie ma automatycznie wyznaczonych terminów. Zobacz pozostałe formalności poniżej.</p>}
   <h4 style={{marginTop:24}}>Dokumenty i kolejne kroki ({undated.length})</h4>
   {undated.map(t=><Entry key={t.id} t={t}/>)}
   <div className="notice" style={{marginTop:22}}><span>ⓘ</span><div>
     <h4 style={{margin:'0 0 8px'}}>Aktualne formularze — źródła urzędowe</h4>
     <p>ZUS zaktualizował formularz ZAM 24 października 2026 r. Wcześniejsze ZUR i ZAO zostały zastąpione przez ZAM. Zawsze otwieraj aktualną wersję ze strony ZUS, zamiast kopii przechowywanych w aplikacji.</p>
     <p><a href={officialSources.zusZam} target="_blank" rel="noopener noreferrer">ZAM — wniosek o zasiłek macierzyński ↗</a></p>
     <p><a href={officialSources.zusForms} target="_blank" rel="noopener noreferrer">Wszystkie aktualne formularze macierzyńskiego (ZUS) ↗</a></p>
     <p><a href={officialSources.employerForms} target="_blank" rel="noopener noreferrer">Z-3 / Z-3a — zaświadczenia płatnika składek ↗</a></p>
     <p><a href={officialSources.zusSickness} target="_blank" rel="noopener noreferrer">ZAS-53 — zasiłek chorobowy ↗</a></p>
     <p><a href={officialSources.zusDocuments} target="_blank" rel="noopener noreferrer">Lista dokumentów wymaganych przez ZUS ↗</a></p>
     <p><a href={officialSources.payer} target="_blank" rel="noopener noreferrer">Kto wypłaca zasiłek — ZUS czy pracodawca? ↗</a></p>
   </div></div>
   <p className="field-hint">Wniosek o urlop rodzicielski pracownik składa pracodawcy. Wniosek ZAM dotyczy zasiłku i nie zastępuje wniosku pracowniczego. Dokumenty są dobierane informacyjnie; szczególne sytuacje wymagają indywidualnej weryfikacji w ZUS.</p>
 </div>;
}
function Entry({t}:{t:DocumentTask}){
 return <div className="deadline-row" style={{alignItems:'flex-start',gap:12}}>
  <div style={{flex:1,minWidth:0}}>
   <h4 style={{margin:'0 0 5px'}}>{t.title}</h4>
   <p style={{margin:'0 0 5px'}}>Kto: {t.who} · Gdzie: {t.recipient}</p>
   <p className="field-hint" style={{margin:'3px 0'}}>{t.details}</p>
   <p style={{margin:'8px 0 0'}}>{t.form&&<span>Formularz: {t.form}. </span>}
     <a href={t.url} target="_blank" rel="noopener noreferrer">Oficjalna strona ↗</a>
     {t.extraUrl&&<> · <a href={t.extraUrl} target="_blank" rel="noopener noreferrer">Wymagania i załączniki ↗</a></>}
   </p>
  </div>
  <div style={{minWidth:122,textAlign:'right'}}>
   {t.date?<><span className="day-chip">{datePL(t.date)}</span>
     <small style={{display:'block',marginTop:5}}>{t.dateIsEstimated?'Termin orientacyjny':t.status==='late'?'Termin minął / sprawdź':'Termin do złożenia'}</small></>:
    <span style={{fontSize:12}}>Termin zależny od sytuacji</span>}
  </div>
 </div>;
}
