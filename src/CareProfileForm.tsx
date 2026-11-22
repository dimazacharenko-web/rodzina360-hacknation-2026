import React from 'react';
import type {CareKind,CareProfile} from './careRules.ts';
type Props={kind:CareKind;value:CareProfile;onChange:(v:CareProfile)=>void;children:number;setChildren:(v:number)=>void};
export function CareProfileForm({kind,value,onChange,children,setChildren}:Props){
 const edit=<K extends keyof CareProfile>(key:K,val:CareProfile[K])=>onChange({...value,[key]:val});
 const setChildDate=(i:number,s:string)=>{const dates=value.childBirthDates.slice();dates[i]=s;edit('childBirthDates',dates);};
 return <div className="family-card" aria-label="Dane dziecka i przyjęcia na wychowanie">
   <div className="family-top"><span className="mini-icon">⌁</span><h3>{kind==='adoption'?'Przysposobienie — dane dziecka i sądu':'Rodzina zastępcza niezawodowa — dane dziecka'}</h3></div>
   <p>Świadczenia dotyczą przyjęcia dziecka na wychowanie. To inna sytuacja niż poród. Sprawdzamy wiek każdego dziecka w dniu przyjęcia.</p>
   <div className="family-fields">
    <label>Liczba dzieci przyjętych jednocześnie
     <select value={children} onChange={e=>{const n=Number(e.target.value);setChildren(n);const dates=Array.from({length:n},(_,i)=>value.childBirthDates[i]||'');edit('childBirthDates',dates);}}>
      {[1,2,3,4,5].map(n=><option value={n} key={n}>{n===5?'5 lub więcej':n}</option>)}
     </select></label>
    <label>Data przyjęcia dziecka na wychowanie
     <input type="date" required value={value.acceptanceDate} onChange={e=>edit('acceptanceDate',e.target.value)}/></label>
    {kind==='adoption'&&<label>Data wystąpienia do sądu o przysposobienie
     <input type="date" required value={value.courtFilingDate} onChange={e=>edit('courtFilingDate',e.target.value)}/></label>}
    {value.childBirthDates.map((date,i)=><label key={i}>Data urodzenia {children===1?'dziecka':`dziecka ${i+1}`}
     <input type="date" required value={date} onChange={e=>setChildDate(i,e.target.value)}/></label>)}
    {kind==='foster'&&<>
     <label>Rodzaj rodziny zastępczej<select value={value.fosterType} onChange={e=>edit('fosterType',e.target.value as CareProfile['fosterType'])}>
      <option value="nonprofessional">Rodzina zastępcza niezawodowa</option>
      <option value="professional">Rodzina zastępcza zawodowa — wyłączona</option>
      <option value="unknown">Nie potrafię potwierdzić rodzaju</option></select></label>
     <label>Odroczenie obowiązku szkolnego dziecka<select value={value.schoolDeferred} onChange={e=>edit('schoolDeferred',e.target.value as CareProfile['schoolDeferred'])}>
      <option value="unknown">Nie wiem — do sprawdzenia</option><option value="no">Nie (limit 7 lat)</option><option value="yes">Tak, decyzja ostateczna (limit 10 lat)</option>
     </select></label>
    </>}
    <label>Zaświadczenie „Za życiem”
     <select value={value.zaZyciem} onChange={e=>edit('zaZyciem',e.target.value as CareProfile['zaZyciem'])}><option value="no">Nie</option><option value="yes">Tak, ważne zaświadczenie</option></select></label>
    <label>Pierwszy dzień urlopu na warunkach macierzyńskiego (opcjonalnie)
     <input type="date" value={value.leaveStartDate} onChange={e=>edit('leaveStartDate',e.target.value)}/></label>
   </div>
   <p className="field-hint">Pusty początek urlopu = data zdarzenia prawnego. U pracownika urlop zaczyna się nie później niż w ciągu 21 dni od przyjęcia / wystąpienia do sądu. Przesunięcie urlopu i daty innych świadczeń trzeba potwierdzić z pracodawcą/ZUS.</p>
   <p className="field-hint">Prawo do świadczeń: art. 183 Kodeksu pracy i ustawa zasiłkowa. Dla 5 lub więcej dzieci podaj pięć dat; złożone przypadki wymagają weryfikacji indywidualnej.</p>
 </div>;
}
