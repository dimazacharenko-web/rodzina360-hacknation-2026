import React,{useEffect,useMemo,useState} from 'react';
import {
 CRISIS_SUPPORT,SUPPORT_KINDS,SUPPORT_RESOURCES,SUPPORT_TOPICS,
 filterSupportResources,type SupportKind,type SupportTopic
} from './supportDirectory.ts';

type Props={initialTopic?:SupportTopic;compact?:boolean};
export function SupportDirectory({initialTopic='all',compact=false}:Props){
 const [topic,setTopic]=useState<SupportTopic>(initialTopic);
 const [kind,setKind]=useState<SupportKind>('all');
 const [query,setQuery]=useState('');
 useEffect(()=>{setTopic(initialTopic);setKind('all');setQuery('');},[initialTopic]);
 const results=useMemo(()=>filterSupportResources(topic,kind,query),[topic,kind,query]);
 return <section role="region" aria-label="Wsparcie w trudnych sytuacjach" className="planner-card support-directory">
  <div className="support-directory-head">
   <div>
    <h3>Wsparcie w trudnych sytuacjach</h3>
    <p>Sprawdzone źródła informacji o fundacjach i programach pomagających rodzinom m.in. po stracie dziecka, w czasie ciężkiej diagnozy lub wcześniactwa.</p>
   </div>
   <span className="support-directory-tag">INFORMACJE · POLSKA</span>
  </div>
  <p className="field-hint">Nie musisz podawać imienia, nazwiska, danych dziecka ani opisywać swojej historii. Wyszukiwanie odbywa się tylko w tej przeglądarce.</p>
  <div className="support-directory-filters">
   <label>Sytuacja
    <select aria-label="Sytuacja — wsparcie rodzin" value={topic}
     onChange={e=>setTopic(e.target.value as SupportTopic)}>
     {SUPPORT_TOPICS.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
    </select></label>
   <label>Rodzaj pomocy
    <select aria-label="Rodzaj pomocy — wsparcie rodzin" value={kind}
     onChange={e=>setKind(e.target.value as SupportKind)}>
     {SUPPORT_KINDS.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
    </select></label>
   <label>Szukaj po nazwie lub usłudze
    <input aria-label="Szukaj organizacji" type="search" autoComplete="off" maxLength={120}
     value={query} placeholder="np. żałoba, prawne, wcześniak"
     onChange={e=>setQuery(e.target.value)}/></label>
  </div>
  <p className="support-directory-count" role="status" aria-live="polite">Znaleziono {results.length} z {SUPPORT_RESOURCES.length} źródeł.</p>
  {results.length===0?<div className="support-directory-empty">
   <p>Brak źródeł pasujących do wybranych kryteriów. Spróbuj wybrać „Wszystkie sytuacje” lub „Każdy rodzaj wsparcia”.</p>
   <button type="button" className="secondary-button" onClick={()=>{setTopic('all');setKind('all');setQuery('');}}>
    Pokaż wszystkie źródła</button>
  </div>:<div className={'support-directory-list'+(compact?' support-directory-list-compact':'')}>
   {results.map(entry=><article className="support-directory-card" key={entry.id}>
    <div className="support-directory-card-head"><h4>{entry.name}</h4>
     <span>{entry.organisationType==='fundacja'?'Fundacja':'Program wsparcia'}</span></div>
    <p>{entry.summary}</p>
    <p className="support-directory-meta">{entry.location}</p>
    {entry.contact&&<p className="support-directory-meta">Kontakt: {entry.contact}</p>}
    {entry.hours&&<p className="support-directory-meta">Godziny: {entry.hours}</p>}
    {entry.note&&<p className="support-directory-note">{entry.note}</p>}
    <a href={entry.url} target="_blank" rel="noopener noreferrer"
      aria-label={'Oficjalna strona: '+entry.name}>Oficjalna strona i aktualne informacje ↗</a>
   </article>)}
  </div>}
  <div className="support-directory-crisis">
   <h4>Gdy potrzebna jest pilna rozmowa</h4>
   <p>Bezpłatne wsparcie dla dorosłych w kryzysie psychicznym: <a href={'tel:'+CRISIS_SUPPORT.phone.replace(/\s/g,'')}>{CRISIS_SUPPORT.phone}</a> ({CRISIS_SUPPORT.hours}).
    Jeżeli życie lub zdrowie jest bezpośrednio zagrożone, zadzwoń pod <a href={'tel:'+CRISIS_SUPPORT.emergency}>{CRISIS_SUPPORT.emergency}</a>.</p>
   <a href={CRISIS_SUPPORT.url} target="_blank" rel="noopener noreferrer">Źródło: Ministerstwo Zdrowia ↗</a>
  </div>
  <p className="support-directory-footer">Źródła zweryfikowano 22.11.2026. To informator, nie rejestr świadczeniodawców ani potwierdzenie dostępności usług. Przed kontaktem sprawdź aktualne warunki na stronie organizacji. Rodzina360 nie przekazuje do nich żadnych danych.</p>
 </section>;
}