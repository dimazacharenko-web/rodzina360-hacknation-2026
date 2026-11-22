import React,{useState} from 'react';
import {examples,auditExample,type CaseId} from './caseExamples';
import {makeWizardCase} from './caseWizard';

export function CaseExplorer({onStart}:{onStart:(id:CaseId)=>void}){
 const [open,setOpen]=useState(false);
 const [id,setId]=useState<CaseId>('ZUS-045');
 const [ran,setRan]=useState(false);
 const selected=examples.find(e=>e.id===id)!;
 const result=ran?auditExample(selected):null;
 return <div className="planner-card" style={{marginBottom:24,border:'1px solid #b7dfd5',background:'#f3fbf8'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,flexWrap:'wrap'}}>
   <div><h3 style={{margin:'0 0 6px'}}>Przetestuj na przykładzie ZUS</h3><p style={{margin:0}}>Wybierz zanonimizowany przykład ZUS. Aplikacja wstawi znane dane do formularza i poprowadzi Cię przez cztery etapy.</p></div>
   <button className="secondary-button" type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Zamknij test':'Przetestuj na przykładzie ZUS →'}</button>
  </div>
  {open&&<div style={{marginTop:20}}>
   <label>Wybierz przykład<select value={id} onChange={e=>{setId(e.target.value as CaseId);setRan(false);}}>{examples.map(e=><option key={e.id} value={e.id}>{e.id} · {e.title}</option>)}</select></label>
   <p style={{marginTop:12}}>{selected.kind}: {selected.summary}</p>
   <p className="field-hint">Źródło: zanonimizowana sprawa {selected.id}; używamy wyłącznie nieidentyfikujących danych.</p><p className="field-hint">{makeWizardCase(id).unknowns.length} pola lub warunki wymagają weryfikacji w dokumentach ZUS; aplikacja pokaże je w dalszych etapach.</p>
   <div className="step-actions" style={{justifyContent:'flex-start',marginTop:14}}><button type="button" className="primary-button" onClick={()=>onStart(id)}>Wypełnij formularz i przejdź do kroku 2 →</button><button type="button" className="secondary-button" onClick={()=>setRan(true)}>Tylko sprawdź dni</button></div><p className="field-hint">Automatycznie wprowadzamy tylko informacje potwierdzone w dokumentach. Nieznane pola oznaczamy jako niepotwierdzone.</p>
   {result&&<div className="sickness-result" style={{marginTop:16}} aria-live="polite">
     <h4>{result.pass?'Zgodność okresów: TAK':'Zgodność okresów: NIE'}</h4>
     {result.checks.map((v,i)=><div className="deadline-row" key={i}><div><strong>{v.label}</strong><small>{v.from? v.from+' – '+v.to:'Porównanie z regułą 9 tygodni'}</small></div><span className="day-chip">{v.actualDays} / {v.expectedDays} dni {v.ok?'✓':'✕'}</span></div>)}
     <p>{selected.expectedDecision}</p><p className="field-hint">{selected.verification}. {selected.note}</p>
     <p className="field-hint">{result.scope}</p>
   </div>}
  </div>}
 </div>;
}
