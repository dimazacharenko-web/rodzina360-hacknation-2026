import React from 'react';
import type {CoverageEvidence,EligibilityResult,WaitingException,PostInsuranceException,Confirmed} from './entitlementCheck';

export function EntitlementBadge({result}:{result:EligibilityResult}){
 const border=result.status==='blocked_standard'?'#df8b81':result.status==='possible'?'#8ccdbd':'#e7cd89';
 const bgcolor=result.status==='blocked_standard'?'#fff5f1':result.status==='possible'?'#effaf5':'#fffaf0';
 return <section className="family-card" style={{padding:16,border:'1px solid '+border,background:bgcolor,marginBottom:12}}>
   <h4 style={{margin:'0 0 6px'}}>{result.kind==='pregnancy_sickness'?'Zasiłek chorobowy w ciąży':result.kind==='parental'?'Zasiłek za okres rodzicielski':'Zasiłek macierzyński'}</h4>
   <p style={{margin:'0 0 8px'}}>{result.label}</p>
   {result.details.map((msg,i)=><p key={i} className="field-hint" style={{margin:'4px 0'}}>{msg}</p>)}
   {result.actions.length>0&&<details style={{marginTop:10}}><summary>Co jeszcze sprawdzić w ZUS?</summary><ul>{result.actions.map((msg,i)=><li key={i}>{msg}</li>)}</ul></details>}
 </section>;
}

type Props={title:string;coverage:CoverageEvidence;onChange:(value:CoverageEvidence)=>void;forSickness:boolean;careMode?:boolean};
export function CoverageQuestions({title,coverage,onChange,forSickness,careMode=false}:Props){
 const change=<K extends keyof CoverageEvidence>(key:K,value:CoverageEvidence[K])=>onChange({...coverage,[key]:value});
 return <div className="planner-card" role="region" aria-label={'Historia ubezpieczenia – '+title}>
  <h3>Historia ubezpieczenia — {title}</h3>
  <p className="field-hint">Sprawdź daty w eZUS albo u płatnika składek. Bez tych informacji nie potwierdzamy prawa do zasiłku.</p>
  <div className="allocation-grid">
   <label>Od kiedy obowiązuje obecne ubezpieczenie chorobowe?
    <input type="date" value={coverage.startDate} onChange={e=>change('startDate',e.target.value)}/></label>
   <label>Data ustania ubezpieczenia (pozostaw puste, jeżeli trwa)
    <input type="date" value={coverage.endDate} onChange={e=>change('endDate',e.target.value)}/></label>
  </div>
  {!careMode&&<label>Jeśli ubezpieczenie ustało przed porodem — czy wystąpiła sytuacja szczególna?
   <select value={coverage.postInsuranceException} onChange={e=>change('postInsuranceException',e.target.value as PostInsuranceException)}>
    <option value="unknown">Nie wiem / do sprawdzenia</option>
    <option value="none">Nie, nie dotyczy żaden wyjątek</option>
    <option value="extended_to_birth">Umowa przedłużona do dnia porodu (art. 177 § 3 KP)</option>
    <option value="employer_death">Wygaśnięcie z powodu śmierci pracodawcy</option>
    <option value="liquidation">Upadłość lub likwidacja pracodawcy w ciąży</option>
    <option value="unlawful_termination">Rozwiązanie niezgodne z prawem, prawomocny wyrok</option>
   </select></label>}
  {careMode&&<p className="field-hint">Dla przyjęcia dziecka sprawdź, czy ubezpieczenie obejmowało datę powstania prawa; wyjątki dotyczące ciąży i ustania zatrudnienia nie są automatycznie stosowane.</p>}
  {forSickness&&<>
   <div className="allocation-grid">
    <label>Poprzednie okresy ubezpieczenia zaliczane do wyczekiwania (dni)
     <input type="number" min="0" step="1" value={coverage.priorCreditedDays} onChange={e=>change('priorCreditedDays',e.target.value)}/></label>
    <label>Wyjątek od 30/90 dni wyczekiwania
     <select value={coverage.waitingException} onChange={e=>change('waitingException',e.target.value as WaitingException)}>
      <option value="unknown">Nie wiem / do sprawdzenia</option><option value="none">Nie dotyczy</option>
      <option value="graduate">Absolwentka objęta ubezpieczeniem w ustawowym terminie</option>
      <option value="ten_years">Co najmniej 10 lat wcześniejszego ubezpieczenia obowiązkowego</option>
      <option value="other">Inny przypadek — do weryfikacji w ZUS</option>
     </select></label>
   </div>
   <label className="used-check"><input type="checkbox" checked={coverage.priorPeriodsConfirmed}
    onChange={e=>change('priorPeriodsConfirmed',e.target.checked)}/>
    Sprawdzono możliwość doliczenia poprzednich okresów ubezpieczenia (przerwy i tytuły).</label>
   <label>Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?
    <select value={coverage.ezlaCodeB} onChange={e=>change('ezlaCodeB',e.target.value as Confirmed)}>
     <option value="unknown">Nie wiem / do sprawdzenia</option><option value="yes">Tak, kod B</option><option value="no">Nie / nie potwierdzono kodu B</option>
    </select></label>
  </>}
  <label className="used-check"><input type="checkbox" checked={coverage.debtAgreementConfirmed}
   onChange={e=>change('debtAgreementConfirmed',e.target.checked)}/>
   Jeśli dotyczy JDG: podpisany układ ratalny, raty opłacane terminowo i brak innych zaległości (sprawdzono w ZUS).</label>
  <p className="field-hint">Podstawy prawne: ustawa zasiłkowa art. 2a, 4, 6, 29, 30. <a href="https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje" target="_blank" rel="noopener noreferrer">Prawo do macierzyńskiego — ZUS ↗</a> · <a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-chorobowy/z-ubezpieczenia-chorobowego/prawo-do-zasilku-i-okres-przyslugiwania" target="_blank" rel="noopener noreferrer">Prawo do chorobowego — ZUS ↗</a>.</p>
 </div>;
}
