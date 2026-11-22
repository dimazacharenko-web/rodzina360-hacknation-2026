import React,{useState} from 'react';
import {assessApplicationReadiness,readinessReport,type ApplicationReadinessInput,type ChecklistGroup} from './applicationReadiness.ts';

type Props={
 input:ApplicationReadinessInput;
 checked:Record<string,boolean>;
 onToggle:(id:string,on:boolean)=>void;
 onReset:()=>void;
};
const groups:Record<ChecklistGroup,string>={
 data:'Dane wnioskodawcy i dziecka',
 application:'Wnioski i formalności',
 evidence:'Załączniki i potwierdzenia',
 verification:'Weryfikacja uprawnień'
};
const titles={
 needs_action:'Wniosek nie jest jeszcze gotowy do samokontroli',
 missing_confirmation:'Uzupełnij listę przed złożeniem',
 requires_review:'Lista potwierdzona — wymagana dodatkowa weryfikacja',
 checked:'Wszystkie punkty kontrolne potwierdzone'
};
export function ApplicationReadiness({input,checked,onToggle,onReset}:Props){
 const [showMissing,setShowMissing]=useState(false);
 const result=assessApplicationReadiness(input,checked);
 const missingSet=new Set(result.missing.map(x=>x.id));
 const save=()=>{
  const blob=new Blob([readinessReport(result)],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Rodzina360-kontrola-wniosku.txt';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const statusLabel=titles[result.status];
 return <section className="planner-card" role="region" aria-label="Kontrola kompletności wniosku" style={{marginTop:20,border:'1px solid #b9d8d3',background:'#f8fcfa'}}>
  <div className="section-head" style={{marginBottom:12}}>
   <div><h3>Kontrola kompletności wniosku</h3>
    <p>Sprawdź przed wysłaniem, czy dane, dokumenty i formalności są przygotowane. Lista dopasowuje się do Twojego scenariusza.</p>
   </div>
  </div>
  <p role="status" aria-live="polite" style={{marginBottom:8}}>{statusLabel} · potwierdzono {result.checked} z {result.total}</p>
  <progress aria-label="Postęp kompletowania wniosku" value={result.checked} max={Math.max(1,result.total)} style={{display:'block',width:'100%',height:14,marginBottom:16}}/>
  {result.findings.length>0&&<div className="notice" role="note"><span>!</span><div>
   <h4 style={{margin:'0 0 8px'}}>Dane wymagające wyjaśnienia ({result.findings.length})</h4>
   <ul style={{margin:'0 0 0 14px',padding:0}}>{result.findings.map(f=><li key={f.id} style={{marginBottom:6}}>{f.severity==='block'?'Do uzupełnienia: ':'Sprawdź: '}{f.text}</li>)}</ul>
  </div></div>}
  <div className="step-actions" style={{justifyContent:'flex-start',marginTop:14,marginBottom:12}}>
   <button type="button" className="secondary-button" onClick={()=>setShowMissing(v=>!v)}>
    {showMissing?'Pokaż wszystkie punkty':`Pokaż, czego brakuje (${result.missing.length})`}
   </button>
   <button type="button" className="secondary-button" onClick={save}>Pobierz raport kontroli (.txt)</button>
   <button type="button" className="secondary-button" onClick={onReset} disabled={result.checked===0}>Wyczyść potwierdzenia</button>
  </div>
  {result.items.length===0?<p>Brak danych do utworzenia listy. Sprawdź ankietę.</p>:
   (Object.keys(groups) as ChecklistGroup[]).map(group=>{
    const items=result.items.filter(x=>x.group===group&&(!showMissing||missingSet.has(x.id)));
    return items.length?<div key={group} style={{marginTop:16}}>
      <h4 style={{margin:'0 0 10px'}}>{groups[group]}</h4>
      {items.map(item=><div className="deadline-row" key={item.id} style={{alignItems:'start',gap:12}}>
       <div style={{flex:1,minWidth:0}}>
        <label className="used-check" style={{marginBottom:4}}>
         <input type="checkbox" checked={checked[item.id]===true} onChange={e=>onToggle(item.id,e.target.checked)}/>
         <span>{item.title}</span>
        </label>
        <p className="field-hint" style={{margin:'2px 0 3px 30px'}}>{item.detail}</p>
        {item.conditional&&<p className="field-hint" style={{margin:'0 0 0 30px'}}>Warunkowe — potwierdź, czy dotyczy Twojej sprawy. Nie oznacza, że dokument trzeba zawsze załączyć.</p>}
        {item.url&&<p style={{margin:'4px 0 0 30px'}}><a href={item.url} target="_blank" rel="noopener noreferrer">Wymagania urzędowe ↗</a></p>}
       </div>
      </div>)}
     </div>:null;
   })
  }
  {showMissing&&result.missing.length===0&&<p>Wszystkie punkty listy zostały potwierdzone.</p>}
  <p className="field-hint" style={{marginTop:18}}>Potwierdzenia zaznaczasz samodzielnie — aplikacja nie odczytuje ani nie sprawdza treści dokumentów, nie wysyła wniosku i nie gwarantuje prawa do świadczenia. Dodatkowych dokumentów może zażądać ZUS lub płatnik. Zmiana danych sprawy zeruje potwierdzenia tej listy.</p>
 </section>;
}
