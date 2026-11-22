import React from 'react';
import {type LeaveEntry,daysInclusive} from './flexibleLeave';
type Props={entries:LeaveEntry[];setEntries:(v:LeaveEntry[])=>void;secondEligible:boolean;careMode?:boolean};
export function LeavePeriodsEditor({entries,setEntries,secondEligible,careMode=false}:Props){
 const update=(id:string,field:keyof LeaveEntry,value:string|boolean|number)=>{
  setEntries(entries.map(x=>x.id===id?{...x,[field]:value}:x));
 };
 const add=()=>setEntries([...entries,{id:'entry-'+Date.now()+'-'+entries.length,owner:1,start:'',end:'',used:false}]);
 return <div className="planner-card">
 <h3>Okresy urlopu rodzicielskiego — wykorzystane i planowane</h3>
 <p>Wprowadź każdy wykorzystany i planowany okres osobno. Rodzice mogą korzystać z urlopu równocześnie. Wykorzystane dni zostaną odjęte od wspólnego limitu oraz limitu danego rodzica. Maksymalnie 5 części łącznie.</p>
 {entries.map((entry,i)=><div key={entry.id} className="family-card" style={{marginBottom:12,padding:18}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
  <h4 style={{margin:'0 0 12px'}}>Okres {i+1} · {entry.used?'wykorzystany':'planowany'}</h4>
  <button type="button" className="secondary-button" onClick={()=>setEntries(entries.filter(x=>x.id!==entry.id))}>Usuń okres</button></div>
  <div className="allocation-grid">
  <label>Rodzic<select value={entry.owner} onChange={e=>update(entry.id,'owner',Number(e.target.value) as 1|2)}>
   <option value={1}>{careMode?'Opiekun 1':'Osoba rodząca'}</option><option value={2} disabled={!secondEligible}>{careMode?'Opiekun 2':'Drugi rodzic'}</option></select></label>
  <label>Status<select value={entry.used?'used':'planned'} onChange={e=>update(entry.id,'used',e.target.value==='used')}>
   <option value="planned">Planuję wykorzystać</option><option value="used">Już wykorzystano</option></select></label>
  <label>Początek<input type="date" value={entry.start} onChange={e=>update(entry.id,'start',e.target.value)}/></label>
  <label>Koniec (włącznie)<input type="date" value={entry.end} onChange={e=>update(entry.id,'end',e.target.value)}/></label>
  </div>
  <p className="field-hint">Dni kalendarzowe: {entry.start&&entry.end?(()=>{try{return daysInclusive(entry.start,entry.end)}catch{return 'popraw daty'}})():'—'}</p>
 </div>)}
 <button type="button" className="secondary-button" disabled={entries.length>=5} onClick={add}>+ Dodaj kolejny okres ({entries.length}/5)</button>
 <p className="field-hint">Wpisz rzeczywiste okresy już wykorzystane. Planowane okresy należy wpisywać w pełnych tygodniach. W szczególnych przypadkach sprawdź zasady z ZUS.</p>
 </div>;
}
