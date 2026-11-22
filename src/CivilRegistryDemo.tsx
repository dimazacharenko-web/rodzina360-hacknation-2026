import React,{useEffect,useState} from 'react';
import {
 assessCivilRegistryDraft,emptyCivilRegistryDraft,makeCivilRegistryReceipt,
 renderCivilRegistryDraftHtml,CIVIL_REGISTRY_SERVICE,CIVIL_REGISTRY_INFO,
 CIVIL_REGISTRY_DISCLAIMER,type CivilRegistryInput,type CivilRegistryDraft,
 type CivilRegistryReceipt,type CivilCopyKind,type CivilDelivery,type CivilPurpose
} from './civilRegistryDemo.ts';

type Props={input:CivilRegistryInput};
type Confirmation='registered'|'detailsConfirmed'|'feeReviewed'|'demoAcknowledged';
export function CivilRegistryDemo({input}:Props){
 const [draft,setDraft]=useState<CivilRegistryDraft>(emptyCivilRegistryDraft);
 const [preview,setPreview]=useState(false);
 const [receipt,setReceipt]=useState<CivilRegistryReceipt|null>(null);
 const [sequence,setSequence]=useState(0);
 const [error,setError]=useState('');
 useEffect(()=>{
  setDraft(emptyCivilRegistryDraft());setPreview(false);setReceipt(null);
  setSequence(0);setError('');
 },[input.eventDate,input.eventConfirmed,input.children]);
 const assessment=assessCivilRegistryDraft(input,draft);
 const edit=(patch:Partial<CivilRegistryDraft>)=>{
  setDraft(p=>({...p,...patch,detailsConfirmed:false,feeReviewed:false,demoAcknowledged:false}));
  setReceipt(null);setError('');
 };
 const confirm=(key:Confirmation,value:boolean)=>{
  setDraft(p=>({...p,[key]:value}));setReceipt(null);setError('');
 };
 const download=()=>{
  try{
   const html=renderCivilRegistryDraftHtml(input,draft);
   const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
   const a=document.createElement('a');a.href=url;
   a.download='Rodzina360-USC-ODPIS-DEMO-'+draft.kind+'-dziecko-'+draft.childNumber+'.html';
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setError(e instanceof Error?e.message:'Nie można pobrać projektu.');}
 };
 const submit=()=>{
  try{
   const next=sequence+1;
   const result=makeCivilRegistryReceipt(input,draft,next);
   setSequence(next);setReceipt(result);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Uzupełnij dane symulacji.');}
 };
 return <section role="region" aria-label="Odpis aktu urodzenia — symulacja USC" className="planner-card forms-demo civil-registry-demo">
  <div className="forms-demo-head"><div>
   <h3>Odpis aktu urodzenia · USC DEMO</h3>
   <p>Symulacja wniosku o wydanie odpisu skróconego albo zupełnego aktu urodzenia z Twojego planu rodzinnego.</p>
  </div><span className="zus-import-badge">BEZ WYSYŁKI</span></div>
  <p className="zus-import-disclaimer">{CIVIL_REGISTRY_DISCLAIMER}</p>
  <p className="field-hint">Po rejestracji urodzenia otrzymujesz jeden odpis skrócony bezpłatnie. Kolejne odpisy mogą być płatne lub zwolnione z opłaty w określonych sprawach. <a href={CIVIL_REGISTRY_SERVICE} target="_blank" rel="noopener noreferrer">Oficjalny wniosek na gov.pl ↗</a></p>
  {!input.eventConfirmed&&<p className="validation" role="note">W planie jest przewidywana data porodu. Możesz obejrzeć projekt, ale symulacja złożenia wymaga potwierdzenia faktycznego urodzenia w kroku 1.</p>}
  <div className="forms-demo-fields">
   <div className="allocation-grid">
    <label>Rodzaj odpisu
     <select aria-label="Rodzaj odpisu USC" value={draft.kind} onChange={e=>edit({kind:e.target.value as CivilCopyKind})}>
      <option value="short">Odpis skrócony aktu urodzenia (22 zł)</option>
      <option value="full">Odpis zupełny aktu urodzenia (33 zł)</option>
     </select></label>
    {input.children>1&&<label>Dziecko w planie
     <select aria-label="Dziecko do odpisu USC" value={draft.childNumber} onChange={e=>edit({childNumber:Number(e.target.value)})}>
      {Array.from({length:Math.min(Math.max(0,input.children),20)},(_,i)=><option key={i+1} value={i+1}>Dziecko {i+1} z {input.children}</option>)}
     </select></label>}
    <label>Sposób otrzymania odpisu
     <select aria-label="Sposób odbioru odpisu USC" value={draft.delivery} onChange={e=>edit({delivery:e.target.value as CivilDelivery})}>
      <option value="electronic">Elektronicznie — e-Doręczenia</option>
      <option value="office">Papierowo — odbiór w USC</option>
      <option value="post">Papierowo — pocztą</option>
     </select></label>
    <label>Cel uzyskania odpisu
     <select aria-label="Cel odpisu USC" value={draft.purpose} onChange={e=>edit({purpose:e.target.value as CivilPurpose})}>
      <option value="zus">Sprawa ZUS / ubezpieczenie społeczne</option>
      <option value="private">Cel prywatny</option>
      <option value="other">Inna sprawa — opisz</option>
     </select></label>
    {draft.purpose==='other'&&<label>Jaki jest cel?
     <input aria-label="Inny cel odpisu USC" maxLength={160} autoComplete="off" value={draft.otherPurpose}
      onChange={e=>edit({otherPurpose:e.target.value})} placeholder="Wyłącznie opis DEMO"/></label>}
   </div>
   <p className="civil-registry-fee" aria-live="polite">Opłata: {assessment.feeDescription}</p>
   <h4>Dane przykładowe do projektu</h4>
   <p className="field-hint">Wpisuj wyłącznie dane fikcyjne. Nie podawaj prawdziwego PESEL, adresu, konta bankowego ani danych dziecka. Informacje pozostają w przeglądarce i nie są wysyłane.</p>
   <div className="allocation-grid">
    <label>Wnioskodawca DEMO
     <input aria-label="Wnioskodawca USC DEMO" autoComplete="off" maxLength={100} value={draft.applicant}
      onChange={e=>edit({applicant:e.target.value})}/></label>
    <label>Imię i nazwisko dziecka DEMO
     <input aria-label="Dziecko USC DEMO" autoComplete="off" maxLength={100} value={draft.childName}
      onChange={e=>edit({childName:e.target.value})}/></label>
    <label>Data urodzenia z planu
     <input aria-label="Data urodzenia do wniosku USC" type="text" value={input.eventDate||'Brak daty'} disabled/></label>
    <label>Miejscowość urodzenia DEMO
     <input aria-label="Miejsce urodzenia USC DEMO" autoComplete="off" maxLength={100} value={draft.birthPlace}
      onChange={e=>edit({birthPlace:e.target.value})}/></label>
    <label>Urząd Stanu Cywilnego DEMO
     <input aria-label="Urząd Stanu Cywilnego DEMO" autoComplete="off" maxLength={120} value={draft.uscName}
      onChange={e=>edit({uscName:e.target.value})}/></label>
   </div>
   <fieldset className="forms-demo-checks"><legend>Kontrola przed symulacją</legend>
    <label className="used-check"><input type="checkbox" checked={draft.registered}
     onChange={e=>confirm('registered',e.target.checked)}/><span>Potwierdzam, że w scenariuszu akt urodzenia jest już zarejestrowany w USC.</span></label>
    <label className="used-check"><input type="checkbox" checked={draft.detailsConfirmed}
     onChange={e=>confirm('detailsConfirmed',e.target.checked)}/><span>Sprawdziłem dane dziecka, rodzaj odpisu oraz sposób odbioru.</span></label>
    <label className="used-check"><input type="checkbox" checked={draft.feeReviewed}
     onChange={e=>confirm('feeReviewed',e.target.checked)}/><span>Rozumiem zasady opłaty lub zwolnienia — symulacja nie dokonuje płatności.</span></label>
    <label className="used-check"><input type="checkbox" checked={draft.demoAcknowledged}
     onChange={e=>confirm('demoAcknowledged',e.target.checked)}/><span>Rozumiem, że wniosek NIE trafi do USC i nie otrzymam urzędowego odpisu.</span></label>
   </fieldset>
   {assessment.errors.length>0&&<div role="note" className="forms-demo-validation">
    <p>Do uzupełnienia przed symulacją ({assessment.errors.length}):</p>
    <ul>{assessment.errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
   </div>}
   <ul className="risk-list">{assessment.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>
  </div>
  <div className="forms-demo-actions">
   <button type="button" className="secondary-button" onClick={()=>setPreview(v=>!v)}>
    {preview?'Ukryj podgląd wniosku':'Pokaż podgląd wniosku USC'}</button>
   <button type="button" className="secondary-button" disabled={!assessment.ready} onClick={download}>
    Pobierz projekt USC (.html)</button>
   <button type="button" className="primary-button" disabled={!assessment.ready} onClick={submit}>
    Zasymuluj złożenie wniosku w USC</button>
  </div>
  {preview&&<div role="group" aria-label="Podgląd wniosku USC DEMO" className="forms-demo-preview">
   <div className="forms-demo-watermark">DEMO — NIE WYSŁANO — NIE JEST ODPISEM</div>
   <h4>Wniosek o wydanie: {assessment.copyLabel.toLowerCase()}</h4>
   <p>Wnioskodawca: {draft.applicant||'—'}. Dziecko: {draft.childName||'—'} ({draft.childNumber} z {input.children}).</p>
   <p>Data: {input.eventDate||'—'}; miejscowość: {draft.birthPlace||'—'}; USC: {draft.uscName||'—'}.</p>
   <p>Odbiór: {assessment.deliveryLabel}. Cel: {assessment.purposeLabel}.</p>
   <p>{assessment.feeDescription}</p>
   <p>Projekt przykładowy, bez podpisu, pieczęci, numeru aktu i rzeczywistego przekazania.</p>
  </div>}
  {error&&<p role="alert" className="validation">{error}</p>}
  {receipt&&<div role="status" aria-label="Wynik symulacji USC" className="forms-demo-receipts">
   <p>{receipt.id} · {receipt.status} · {receipt.message}</p>
  </div>}
  <p className="field-hint">Rejestr i oficjalna e-usługa: <a href={CIVIL_REGISTRY_INFO} target="_blank" rel="noopener noreferrer">Ministerstwo Cyfryzacji ↗</a> · <a href={CIVIL_REGISTRY_SERVICE} target="_blank" rel="noopener noreferrer">Złóż prawdziwy wniosek na gov.pl ↗</a></p>
 </section>;
}
