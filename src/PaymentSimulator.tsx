import React,{useState} from 'react';
import {calculateMoney,moneyPL,type MoneyInput} from './paymentEngine';
import {OFFICIAL_RULES,formatRate,type LegalRules} from './legalConfig.ts';
import {paymentCases,auditPaymentCase} from './paymentFixtures';
import {type EvaluatedEntry} from './flexibleLeave';
import type {SicknessResult} from './sickness';

type Emp=MoneyInput['employment'][number];type Debt=MoneyInput['debts'][number];
type Props={
 maternityDays:number;maternityUsedDays:number;entries:EvaluatedEntry[];
 initialBases:[string,string];employment:[Emp,Emp];insured:[boolean,boolean];debts:[Debt,Debt];
 variant:MoneyInput['variant'];averagedConfirmed:boolean;special:boolean;
 sickResult:SicknessResult|null;demoCaseId?:string;careMode?:boolean;onBack:()=>void;
 entitlementStatuses?:MoneyInput['entitlementStatuses'];rules?:LegalRules;experimental?:boolean;
};
export function PaymentSimulator(p:Props){
 const [bases,setBases]=useState<[string,string]>(p.initialBases);
 const [baseConfirmed,setBaseConfirmed]=useState<[boolean,boolean]>([false,false]);
 const sampleId=p.demoCaseId||'ZUS-007';
 const [sampleMode,setSampleMode]=useState(Boolean(p.demoCaseId));
 const [show,setShow]=useState(false);
 const [error,setError]=useState('');
 const input:MoneyInput={maternityDays:p.maternityDays,maternityUsedDays:p.maternityUsedDays,
  parentalEntries:p.entries.map(e=>({id:e.id,owner:e.owner,start:e.start,end:e.end,used:e.used,days:e.days})),
  bases:bases.map((b,i)=>baseConfirmed[i]&&b.trim()!==''?Number(b):null) as [number|null,number|null],
  employment:p.employment,insured:p.insured,debts:p.debts,variant:p.variant,
  averagedConfirmed:p.averagedConfirmed,special:p.special,entitlementStatuses:p.entitlementStatuses,rules:p.rules};
 let data:ReturnType<typeof calculateMoney>|null=null;
 let derivedError='';
 if(show&&!sampleMode){try{data=calculateMoney(input)}catch(e){derivedError=e instanceof Error?e.message:'Nie udało się obliczyć.';}}
 const example=paymentCases.find(c=>c.id===sampleId)!;
 const audit=sampleMode?auditPaymentCase(example):null;
 const fixtureData=sampleMode?calculateMoney(example.sample):null;
 const visible=sampleMode?fixtureData:data;
 const synthetic=sampleMode;
 const changeBase=(idx:0|1,v:string)=>{setBases(b=>{const a:[string,string]=[b[0],b[1]];a[idx]=v;return a});setShow(false)};
 return <div className="form-section" aria-label="Symulacja kwot świadczeń">
  <div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 4 Z 4</p>
   <h2>{p.careMode?'Symulacja zasiłku po przyjęciu dziecka':'Symulacja wysokości świadczeń'}</h2><p>Orientacyjna kwota brutto — nie jest decyzją ZUS ani gwarancją wypłaty.</p></div><div className="section-decoration">04 / 04</div></div>
  {p.experimental&&<div className="admin-experimental-banner" role="alert">EKSPERYMENT ADMIN DEMO: obliczenia korzystają z testowych stawek. Nie są to aktualne parametry ZUS.</div>}
  <div className="notice" role="note"><span>ⓘ</span><div>
   <h3>Wyniki są symulacją, a nie ostatecznymi danymi ZUS</h3>
   <p>Wpisz miesięczną podstawę wymiaru zasiłku ustaloną przez płatnika składek, a nie pensję brutto ani obrót firmy. Kwoty obliczamy jako (podstawa / 30) × liczba dni × stawka. Wypłata netto, podatki, wyrównania, szczególne zasady JDG i ewentualne potrącenia nie są tu liczone.</p>
  </div></div>
  {p.entitlementStatuses?.some(s=>s!=='possible')&&<div className="notice" role="note">
    <span>!</span><div><h3>Ważne: uprawnienia do zasiłku nie są potwierdzone</h3>
    <p>W kroku 2–3 weryfikacja prawa wykazała brak danych albo ryzyko braku uprawnienia. Kwoty służą wyłącznie porównaniu scenariuszy i nie oznaczają należnej wypłaty. Gdy brak podstaw w zwykłym trybie, wynik jest zablokowany.</p></div>
  </div>}
  <div className="planner-card"><h3>Podstawa do symulacji</h3>
   <div className="allocation-grid">{([0,1] as const).map(i=><div key={i}>
    <label>{i===0?(p.careMode?'Opiekun 1':'Osoba rodząca'):(p.careMode?'Opiekun 2':'Drugi rodzic')} — miesięczna podstawa zasiłku (zł)
     <input type="number" min="0" step="0.01" placeholder="np. 6000,00" value={bases[i]} onChange={e=>changeBase(i,e.target.value)}/></label>
    <label className="used-check"><input type="checkbox" checked={baseConfirmed[i]} onChange={e=>{setBaseConfirmed(a=>{const b:[boolean,boolean]=[a[0],a[1]];b[i]=e.target.checked;return b});setShow(false)}}/>
     Podstawa została ustalona lub potwierdzona przez płatnika / ZUS</label>
   </div>)}</div>
   <p className="field-hint">Nie znasz podstawy? Pozostaw pole puste. Program nie będzie zgadywać jej z wynagrodzenia. Informacje ZUS: <a href="https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru/dla-pracownikow" target="_blank" rel="noopener noreferrer">dla pracowników ↗</a> oraz <a href="https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru/dla-ubezpieczonych-niebedacych-pracownikami" target="_blank" rel="noopener noreferrer">dla przedsiębiorców i zleceniobiorców ↗</a>.</p>
   <button type="button" className="primary-button" onClick={()=>{setSampleMode(false);setError('');setShow(true)}}>Przelicz moje świadczenia →</button>
  </div>
  {(error||derivedError)&&<p role="alert" className="validation">{error||derivedError}</p>}
  {visible&&<div className="planner-card" aria-live="polite">
   <h3>{synthetic?'Wynik przykładu — baza testowa 6000 zł':'Orientacyjny wynik rodzinny'}</h3>
   {audit&&<p className="field-hint">Kontrola scenariusza {audit.id}: {audit.actualDays}/{audit.expectedDays} dni — {audit.periodOK?'zgodne':'niezgodne'}. {audit.status}. Faktyczna kwota ZUS nie jest weryfikowana.</p>}
   {visible.parents.map((parent,i)=><div key={i} className="family-card" style={{marginBottom:14,padding:18}}>
    <h4 style={{margin:'0 0 6px'}}>{i===0?(p.careMode?'Opiekun 1':'Osoba rodząca'):(p.careMode?'Opiekun 2':'Drugi rodzic')}</h4>
    <p className="field-hint">Podstawa: {parent.base===null?'brak':moneyPL(parent.base)} · {parent.status==='simulated'?'symulacja brutto':'prawo lub podstawa niepotwierdzone'}</p>
    {parent.status!=='simulated'?<p className="validation">{parent.reason||'Wymagana weryfikacja ZUS.'}</p>:<>
     <div className="stats-grid"><div className="stat-card"><span>Planowane wypłaty — brutto</span><strong>{moneyPL(parent.futureGross)}</strong></div><div className="stat-card"><span>Wcześniej wykorzystane okresy — wartość modelowa</span><strong>{moneyPL(parent.historicalGross)}</strong></div></div>
     <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',marginTop:12}}>
      <thead><tr><th style={{textAlign:'left'}}>Okres</th><th>Dni</th><th>Stawka</th><th>Kwota brutto</th></tr></thead>
      <tbody>{parent.periods.map(t=><tr key={t.id}><td>{t.type==='maternity'?(p.careMode?'Na warunkach macierzyńskiego':'Macierzyński'):'Rodzicielski'} {t.used?'· już wykorzystany':''}{t.start?' ('+t.start+'–'+t.end+')':''}</td><td style={{textAlign:'center'}}>{t.days}</td><td style={{textAlign:'center'}}>{Math.round(t.rate*1000)/10}%</td><td style={{textAlign:'right'}}>{moneyPL(t.gross)}</td></tr>)}</tbody>
     </table></div>
    </>}
   </div>)}
   {!synthetic&&<div className="stat-card" style={{marginTop:12}}><span>Hipotetyczna suma przyszłych wypłat — nie potwierdza prawa ani kwoty ZUS</span><strong>{moneyPL(visible.futureGross)}</strong></div>}
   <ul className="risk-list">{visible.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>
   {synthetic&&<p className="field-hint">Wartości PLN są syntetyczne, policzone z podstawy 6000 zł; w dokumentach nie ma wystarczających danych do porównania faktycznych kwot wypłaty.</p>}
  </div>}
  {p.sickResult&&<div className="planner-card"><h3>Wcześniej obliczone e-ZLA w ciąży</h3>
   <p>W kroku 2 wyliczono {p.sickResult.days} dni i {moneyPL(p.sickResult.totalGross)} brutto w modelu dla umowy o pracę. To osobna pozycja; nie jest dodawana do macierzyńskiego.</p>
  </div>}
  <p className="field-hint">ZUS — <a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc" target="_blank" rel="noopener noreferrer">wysokość zasiłku macierzyńskiego ↗</a>. Przy {formatRate(p.rules?.averagedRatePercent??OFFICIAL_RULES.averagedRatePercent)} sprawdź termin i zakres kompletnego wniosku; druga osoba w tej symulacji ma stawkę {formatRate(p.rules?.parentalRatePercent??OFFICIAL_RULES.parentalRatePercent)} (nieprzenoszalna część).</p>
  <div className="step-actions"><button type="button" className="secondary-button" onClick={p.onBack}>← Powrót do planu dni</button></div>
 </div>;
}
