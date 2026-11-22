import React,{useEffect,useMemo,useRef,useState} from 'react';
import {
 DEFAULT_ADMIN_CONFIG,OFFICIAL_RULES,newAdminConfig,parseAdminConfig,
 validateAdminConfig,legalRulesChanged,isDemoOverride,formatRate,
 type AdminConfig,type LegalRules,type DemoFeatures
} from './legalConfig.ts';
import {limits,calculateLeavePlan} from './leaveRules.ts';
import {calculateMoney,moneyPL} from './paymentEngine.ts';

type Props={
 config:AdminConfig;
 onApply:(value:AdminConfig)=>void;
 onReset:()=>void;
};
type RateKey='maternityRatePercent'|'parentalRatePercent'|'averagedRatePercent';
type WeeksKey='parentalWeeksSingle'|'parentalWeeksMultiple'|'reservedParentWeeks';
const RATE_FIELDS:ReadonlyArray<{key:RateKey;label:string}>=[
 {key:'maternityRatePercent',label:'Macierzyński — stawka standardowa (%)'},
 {key:'parentalRatePercent',label:'Rodzicielski — stawka standardowa (%)'},
 {key:'averagedRatePercent',label:'Stawka uśredniona (%)'}
];
const WEEK_FIELDS:ReadonlyArray<{key:WeeksKey;label:string}>=[
 {key:'parentalWeeksSingle',label:'Rodzicielski — jedno dziecko (tygodnie)'},
 {key:'parentalWeeksMultiple',label:'Rodzicielski — ciąża mnoga (tygodnie)'},
 {key:'reservedParentWeeks',label:'Część nieprzenoszalna na rodzica (tygodnie)'}
];
const FEATURE_FIELDS:ReadonlyArray<{key:keyof DemoFeatures;label:string}>=[
 {key:'officialLinks',label:'Oficjalne linki ZUS / MRPiPS / PIP'},
 {key:'supportDirectory',label:'Katalog organizacji wsparcia'},
 {key:'civilRegistryDemo',label:'Wnioski USC o odpis aktu urodzenia — DEMO'}
];

function sampleResult(rules:LegalRules){
 const l=limits(1,rules);
 const plan=calculateLeavePlan({
  birthDate:'2027-01-01',children:1,parent1Weeks:l.maxOneParentWeeks,
  parent2Weeks:0,secondParentEligible:false
 },rules);
 const p=plan.parent1Parental!;
 const money=calculateMoney({
  maternityDays:l.maternityDays,maternityUsedDays:0,
  parentalEntries:[{id:'preview',owner:1,start:p.start,end:p.end,days:p.days,used:false}],
  bases:[6000,null],insured:[true,false],employment:['etat',''],debts:['none','none'],
  variant:'standard',averagedConfirmed:false,special:false,rules
 });
 return {l,money:money.parents[0].futureGross};
}
export function AdminPanelDemo({config,onApply,onReset}:Props){
 const [open,setOpen]=useState(false);
 const [draft,setDraft]=useState<AdminConfig>(()=>parseAdminConfig(config));
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 const draftExperiment=(d:AdminConfig):AdminConfig=>({
  ...d,
  revision:d.revision===DEFAULT_ADMIN_CONFIG.revision?'DEMO-001':d.revision,
  changeReason:d.changeReason===DEFAULT_ADMIN_CONFIG.changeReason?'Test zmiany przepisów lub działania aplikacji — tylko lokalnie.':d.changeReason
 });
 const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{setDraft(parseAdminConfig(config));setError('');},[config]);
 const errors=useMemo(()=>validateAdminConfig(draft),[draft]);
 const preview=useMemo(()=>{
  if(errors.length)return null;
  try{return {official:sampleResult(OFFICIAL_RULES as LegalRules),proposal:sampleResult(draft.rules)};}
  catch{return null;}
 },[draft,errors]);
 const editRate=(key:RateKey,v:number)=>{
  setDraft(d=>draftExperiment({...d,rules:{...d.rules,[key]:v}}));setStatus('');setError('');
 };
 const editWeeks=(key:WeeksKey,v:number)=>{
  setDraft(d=>draftExperiment({...d,rules:{...d.rules,[key]:v}}));setStatus('');setError('');
 };
 const editMaternity=(index:number,v:number)=>{
  setDraft(d=>draftExperiment({...d,rules:{...d.rules,maternityWeeks:d.rules.maternityWeeks.map((n,i)=>i===index?v:n) as LegalRules['maternityWeeks']}}));
  setStatus('');setError('');
 };
 const editFeature=(key:keyof DemoFeatures,v:boolean)=>{
  setDraft(d=>draftExperiment({...d,features:{...d.features,[key]:v}}));setStatus('');setError('');
 };
 const apply=()=>{
  try{
   const checked=parseAdminConfig(draft);onApply(checked);
   setStatus('Zastosowano lokalnie. Plan i kwoty należy przeliczyć od kroku 1; aktualna konfiguracja NIE zmienia prawa.');
   setError('');
  }catch(e){setError(e instanceof Error?e.message:'Nieprawidłowa konfiguracja.');}
 };
 const reset=()=>{
  onReset();setDraft(newAdminConfig());setStatus('Przywrócono oficjalne wartości bazowe i włączono wszystkie funkcje.');setError('');
 };
 const exportJson=()=>{
  try{
   const config=parseAdminConfig(draft);
   const url=URL.createObjectURL(new Blob([JSON.stringify(config,null,2)],{type:'application/json;charset=utf-8'}));
   const a=document.createElement('a');a.href=url;a.download='Rodzina360-PARAMETRY-ADMIN-DEMO.json';
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   setStatus('Wyeksportowano plik JSON z konfiguracją DEMO, bez danych rodzinnych.');setError('');
  }catch(e){setError(e instanceof Error?e.message:'Nie udało się wyeksportować konfiguracji.');}
 };
 const importJson=async(e:React.ChangeEvent<HTMLInputElement>)=>{
  const file=e.target.files?.[0];e.target.value='';
  if(!file)return;
  if(file.size>32768){setError('Plik JSON może mieć maksymalnie 32 KB.');return;}
  try{
   const parsed=parseAdminConfig(JSON.parse(await file.text()));
   setDraft(parsed);setStatus('Zaimportowano projekt. Sprawdź podgląd i kliknij „Zastosuj”, aby go aktywować.');
   setError('');
  }catch(ex){setError(ex instanceof Error?ex.message:'Plik nie ma poprawnego formatu.');}
 };
 return <section className="admin-demo" role="region" aria-label="Panel administracyjny — DEMO">
  <div className="admin-demo-head">
   <div><h2>Panel administracyjny · DEMO</h2>
    <p>Parametry prawne, wersje konfiguracji i przełączniki funkcjonalności — tylko na potrzeby symulacji.</p></div>
   <button type="button" className="secondary-button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
    {open?'Zamknij panel':'Otwórz panel administracyjny'}</button>
  </div>
  <p className="admin-demo-caption">Aktywna wersja: {config.revision}. {isDemoOverride(config)?'EKSPERYMENT — wartości nieoficjalne.':'Domyślne parametry 2026.'}</p>
  {open&&<div className="admin-demo-inner">
   <div className="admin-demo-warning" role="note">
    <p>DEMO bez logowania administratora i bez serwera: nie jest to zabezpieczony panel produkcyjny.
     Zmiany są przechowywane tylko w tej przeglądarce (localStorage), nie w ZUS i nie dla innych użytkowników.
     Nie można na ich podstawie ustalać rzeczywistych uprawnień.</p>
    <p>Zakres MVP: limity standardowego porodu oraz stawki w kalkulatorze kwot; szczególne okresy adopcyjne i „Za życiem” nadal wymagają odrębnych reguł. Przykłady konkursowe ZUS nie są dostępne przy eksperymentalnych stawkach lub limitach, aby nie mieszać reguł.</p>
   </div>
   <div className="admin-demo-grid">
    <fieldset className="admin-demo-card"><legend>1. Stawki zasiłku</legend>
     {RATE_FIELDS.map(({key,label})=><label key={key}>{label}
      <input type="number" step="0.1" min="0.1" max="100" aria-label={label}
       value={Number.isNaN(draft.rules[key])?'':draft.rules[key]}
       onChange={e=>editRate(key,e.target.value===''?NaN:Number(e.target.value))}/></label>)}
     <p>Źródło: <a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc" target="_blank" rel="noopener noreferrer">ZUS — wysokość zasiłku ↗</a></p>
    </fieldset>
    <fieldset className="admin-demo-card"><legend>2. Maksymalne wymiary</legend>
     {draft.rules.maternityWeeks.map((v,i)=><label key={i}>Macierzyński: {i===4?'5+':i+1} {i===0?'dziecko':'dzieci'} (tygodnie)
      <input aria-label={'Macierzyński '+(i+1)+' dzieci — tygodnie'} type="number" step="1" min="1" max="60"
       value={Number.isNaN(v)?'':v} onChange={e=>editMaternity(i,e.target.value===''?NaN:Number(e.target.value))}/></label>)}
     {WEEK_FIELDS.map(({key,label})=><label key={key}>{label}
      <input aria-label={label} type="number" step="1" min="1" max="60"
       value={Number.isNaN(draft.rules[key])?'':draft.rules[key]}
       onChange={e=>editWeeks(key,e.target.value===''?NaN:Number(e.target.value))}/></label>)}
     <p>Źródło: <a href="https://www.gov.pl/web/rodzina/urlop-rodzicielski" target="_blank" rel="noopener noreferrer">MRPiPS — urlop rodzicielski ↗</a>.</p>
    </fieldset>
    <fieldset className="admin-demo-card"><legend>3. Przełączniki funkcji</legend>
     {FEATURE_FIELDS.map(({key,label})=><label key={key} className="admin-demo-toggle">
      <input type="checkbox" checked={draft.features[key]} onChange={e=>editFeature(key,e.target.checked)}/>
      {label}</label>)}
     <p>Nowe funkcje można dopisać do wersjonowanego schematu; nie dodajemy ich z tekstu wprowadzanego przez użytkownika.</p>
    </fieldset>
    <fieldset className="admin-demo-card"><legend>4. Zmiana i jej źródło</legend>
     <label>Wersja parametrów
      <input type="text" maxLength={40} aria-label="Wersja parametrów" value={draft.revision}
       onChange={e=>{setDraft(d=>({...d,revision:e.target.value}));setStatus('');}}/></label>
     <label>Data scenariusza
      <input type="date" aria-label="Data scenariusza" value={draft.effectiveFrom}
       onChange={e=>{setDraft(d=>({...d,effectiveFrom:e.target.value}));setStatus('');}}/></label>
     <label>Uzasadnienie zmiany
      <textarea rows={3} maxLength={240} aria-label="Uzasadnienie zmiany" value={draft.changeReason}
       onChange={e=>{setDraft(d=>({...d,changeReason:e.target.value}));setStatus('');}}/></label>
     <p>Wersja i uzasadnienie są metadanymi testu, nie potwierdzeniem zmiany przepisów.</p>
    </fieldset>
   </div>
   {errors.length>0?<div className="admin-demo-errors" role="alert">
    <p>Nie można zastosować konfiguracji:</p><ul>{errors.map((v,i)=><li key={i}>{v}</li>)}</ul>
   </div>:null}
   {preview&&<div className="admin-demo-preview" role="group" aria-label="Podgląd skutków zmiany">
    <h3>Podgląd porównania — 1 dziecko, podstawa 6000 zł</h3>
    <p>Porównanie dla jednego rodzica, maksymalnego standardowego okresu macierzyńskiego i rodzicielskiego, przy stawkach standardowych. Wszystkie kwoty wyłącznie brutto i demonstracyjne.</p>
    <div className="admin-demo-compare">
     <div><h4>Oficjalna baza</h4><p>Macierzyński: {preview.official.l.maternityWeeks} tyg.</p>
      <p>Rodzicielski: {preview.official.l.parentalWeeks} tyg.</p>
      <p>Stawki: {formatRate(OFFICIAL_RULES.maternityRatePercent)} / {formatRate(OFFICIAL_RULES.parentalRatePercent)}</p>
      <p>Kwota przykładowa: {moneyPL(preview.official.money)}</p></div>
     <div><h4>Projekt konfiguracji — DEMO</h4><p>Macierzyński: {preview.proposal.l.maternityWeeks} tyg.</p>
      <p>Rodzicielski: {preview.proposal.l.parentalWeeks} tyg.</p>
      <p>Stawki: {formatRate(draft.rules.maternityRatePercent)} / {formatRate(draft.rules.parentalRatePercent)}</p>
      <p>Kwota przykładowa: {moneyPL(preview.proposal.money)}</p></div>
    </div>
   </div>}
   {legalRulesChanged(draft.rules)&&<p className="admin-demo-warning" role="note">
    UWAGA: To nie są aktualne stawki ani limity ogłoszone w przepisach. Po zastosowaniu aplikacja oznaczy je jako wariant eksperymentalny.</p>}
   <div className="admin-demo-actions">
    <button type="button" className="primary-button" disabled={errors.length>0} onClick={apply}>Zastosuj do symulacji DEMO</button>
    <button type="button" className="secondary-button" onClick={reset}>Przywróć oficjalne wartości</button>
    <button type="button" className="secondary-button" disabled={errors.length>0} onClick={exportJson}>Eksportuj konfigurację (.json)</button>
    <button type="button" className="secondary-button" onClick={()=>fileRef.current?.click()}>Importuj konfigurację (.json)</button>
    <input type="file" ref={fileRef} accept=".json,application/json" aria-label="Wczytaj plik konfiguracji" onChange={importJson} hidden/>
   </div>
   {error&&<p className="validation" role="alert">{error}</p>}
   {status&&<p className="admin-demo-status" role="status">{status}</p>}
   <p className="admin-demo-footnote">Panel pozwala przygotowywać i testować wersje parametrów. Realne wdrożenie wymaga serwerowego uwierzytelniania, uprawnień, zatwierdzania zmian, historii audytowej i testów regresji przed publikacją.</p>
  </div>}
 </section>;
}