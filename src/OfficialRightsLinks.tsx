import React,{useEffect,useMemo,useState} from 'react';
import {
 INSTITUTION_LABELS,OFFICIAL_SOURCE_LIBRARY,hasEmployee,
 officialSourcesFor,recommendedOfficialIds,
 type OfficialInstitution,type OfficialRightsInput,type OfficialTopic
} from './officialRightsSources.ts';

type Props={input:OfficialRightsInput;compact?:boolean};
const TOPICS:ReadonlyArray<{id:OfficialTopic;label:string}>=[
 {id:'all',label:'Wszystkie zagadnienia'},
 {id:'benefits',label:'Zasiłki i kwoty'},
 {id:'leave',label:'Urlopy i prawa pracownicze'},
 {id:'documents',label:'Wnioski i dokumenty'},
 {id:'insurance',label:'Ubezpieczenia'},
 {id:'special',label:'Sytuacje szczególne'}
];
export function OfficialRightsLinks({input,compact=false}:Props){
 const scope=JSON.stringify(input);
 const [all,setAll]=useState(false);
 const [topic,setTopic]=useState<OfficialTopic>('all');
 const [institution,setInstitution]=useState<OfficialInstitution|'all'>('all');
 useEffect(()=>{setAll(false);setTopic('all');setInstitution('all');},[scope]);
 const sources=useMemo(()=>officialSourcesFor(input,topic,institution,all),[scope,topic,institution,all]);
 const featured=recommendedOfficialIds(input);
 const employee=hasEmployee(input);
 const showEmployeeNotice=!employee&&Boolean(input.employment1||input.secondIncluded&&input.employment2);
 return <section className="planner-card official-rights" role="region"
  aria-label="Oficjalne informacje o prawach rodzicielskich">
  <div className="official-rights-header">
   <div><h3>Oficjalne informacje o prawach rodzicielskich</h3>
    <p>Przejdź bezpośrednio do właściwej strony urzędowej. Wybrane źródła odpowiadają sytuacji rodziny w Rodzina360.</p>
   </div><span className="official-rights-badge">ZUS · MRPiPS · PIP</span>
  </div>
  <p className="field-hint">Informacje i formularze mogą się zmieniać. Linki prowadzą na oficjalne strony instytucji; otwierają się w nowej karcie, bez wysyłania danych z kalkulatora.</p>
  {showEmployeeNotice&&<p className="official-rights-notice" role="note">
    Przy umowie zlecenia lub JDG można mieć prawo do zasiłku, ale urlopy pracownicze nie przysługują z samego tego tytułu. Źródła MRPiPS/PIP o urlopach znajdziesz w pełnym katalogu.</p>}
  {input.mode==='loss'||input.mode==='other'?<p className="official-rights-notice" role="note">
    Ta sytuacja wymaga indywidualnej oceny. Strony urzędowe opisują zasady ogólne, nie stanowią potwierdzenia uprawnień dla konkretnej rodziny.</p>:null}
  <div className="official-rights-controls">
   <button type="button" className="secondary-button" aria-pressed={!all}
    onClick={()=>{setAll(false);setTopic('all');setInstitution('all');}}>Dopasowane do planu ({featured.length})</button>
   <button type="button" className="secondary-button" aria-pressed={all}
    onClick={()=>{setAll(true);setTopic('all');setInstitution('all');}}>Wszystkie oficjalne źródła ({OFFICIAL_SOURCE_LIBRARY.length})</button>
  </div>
  {all&&<div className="official-rights-filters">
   <label>Instytucja
    <select aria-label="Instytucja oficjalnych źródeł" value={institution}
     onChange={e=>setInstitution(e.target.value as OfficialInstitution|'all')}>
     <option value="all">Wszystkie instytucje</option>
     {(['ZUS','MRPiPS','PIP'] as const).map(x=><option key={x} value={x}>{INSTITUTION_LABELS[x]}</option>)}
    </select></label>
   <label>Temat
    <select aria-label="Temat oficjalnych źródeł" value={topic}
     onChange={e=>setTopic(e.target.value as OfficialTopic)}>
     {TOPICS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
    </select></label>
  </div>}
  <p className="official-rights-count" role="status" aria-live="polite">Wyświetlono {sources.length} źródeł.</p>
  {sources.length?<div className={'official-rights-list'+(compact?' official-rights-list-compact':'')}>
   {sources.map(source=><article key={source.id} className="official-rights-item">
    <div className="official-rights-item-top"><span>{INSTITUTION_LABELS[source.institution]}</span>
     {source.employmentOnly&&<small>Dotyczy urlopu pracowniczego</small>}</div>
    <h4>{source.title}</h4><p>{source.description}</p>
    <a href={source.url} target="_blank" rel="noopener noreferrer"
     aria-label={'Otwórz oficjalne źródło: '+source.title}>Otwórz stronę urzędową ↗</a>
   </article>)}
  </div>:<p className="official-rights-empty">Brak źródeł odpowiadających wybranemu filtrowi.
   <button type="button" className="secondary-button"
    onClick={()=>{setTopic('all');setInstitution('all');}}>Wyczyść filtry</button>
  </p>}
  <p className="official-rights-footnote">Linki sprawdzono 22.11.2026. Rodzina360 nie jest stroną ZUS, Ministerstwa ani PIP i nie potwierdza prawa do świadczeń.</p>
 </section>;
}