import React,{useEffect,useMemo,useState} from 'react';
import {
 buildFormTemplates,emptyFormDraft,validateFormDraft,makeDemoSubmission,
 renderFormDraftHtml,FORMS_DEMO_DISCLAIMER,OFFICIAL_FORMS,
 type FormsDemoInput,type FormDraftData,type DemoSubmission
} from './applicationFormsDemo.ts';

type Props={input:FormsDemoInput};
export function ApplicationFormsDemo({input}:Props){
 const scope=JSON.stringify(input);
 const templates=useMemo(()=>buildFormTemplates(input),[scope]);
 const [selected,setSelected]=useState('');
 const [data,setData]=useState<FormDraftData>(emptyFormDraft);
 const [preview,setPreview]=useState(false);
 const [error,setError]=useState('');
 const [sent,setSent]=useState<DemoSubmission[]>([]);
 useEffect(()=>{setSelected('');setPreview(false);setError('');setSent([]);setData(emptyFormDraft());},[scope]);
 const form=templates.find(t=>t.id===selected)||templates[0];
 const check=form?validateFormDraft(form,data):null;
 const change=(key:keyof FormDraftData,value:string|boolean)=>{
  setData(prev=>({...prev,[key]:value}));
  setError('');setSent([]);
 };
 const download=()=>{
  if(!form)return;
  try{
   const html=renderFormDraftHtml(form,data);
   const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
   const a=document.createElement('a');
   a.href=url;a.download='Rodzina360-WNIOSEK-DEMO-'+form.id.replace(/[^a-zA-Z0-9-]/g,'-')+'.html';
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setError(e instanceof Error?e.message:'Nie można przygotować projektu.');}
 };
 const send=()=>{
  if(!form)return;
  try{
   const receipt=makeDemoSubmission(form,data,sent.length+1);
   setSent(prev=>[...prev,receipt]);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Brakuje danych do symulacji.');}
 };
 return <section role="region" aria-label="Wnioski o urlopy i świadczenia — DEMO" className="planner-card forms-demo">
  <div className="forms-demo-head"><div>
   <h3>Wnioski o urlopy i świadczenia · DEMO</h3>
   <p>Wybierz dokument powiązany z Twoim planem, sprawdź dane, przygotuj projekt oraz przejdź przez symulację wysłania.</p>
  </div><span className="zus-import-badge">BEZ WYSYŁKI</span></div>
  <p className="zus-import-disclaimer">{FORMS_DEMO_DISCLAIMER}</p>
  {templates.length===0?<p>Brak kompletnych okresów do przygotowania projektu wniosku. Sprawdź daty i zatrudnienie na wcześniejszych etapach.</p>
  :<>
   <label>Dokument do przygotowania
    <select value={form?.id||''} onChange={e=>{setSelected(e.target.value);setPreview(false);setSent([]);setError('');setData(prev=>({...prev,childDetailsConfirmed:false,attachmentsChecked:false,demoAcknowledged:false}));}}>
     {templates.map(t=><option key={t.id} value={t.id}>{t.title} · {t.recipient==='employer'?'pracodawca':'ZUS (arkusz)'}</option>)}
    </select></label>
   {!input.eventConfirmed&&<p className="field-hint">Data zdarzenia jest na razie przewidywana. Po porodzie zaktualizuj dane przed przygotowaniem rzeczywistego wniosku.</p>}
   <div className="forms-demo-details" role="group" aria-label="Parametry wybranego wniosku DEMO">
    <h4>{form.title}</h4>
    <p>{form.description}</p>
    <dl className="forms-demo-grid">
     <div><dt>Adresat</dt><dd>{form.recipient==='employer'?'Pracodawca':'ZUS / płatnik — sprawdź właściwość'}</dd></div>
     <div><dt>Osoba</dt><dd>{form.owner}</dd></div>
     <div><dt>Zdarzenie</dt><dd>{form.mode==='birth'?'Urodzenie dziecka':form.mode==='adoption'?'Adopcja':'Rodzina zastępcza niezawodowa'}</dd></div>
     <div><dt>Data zdarzenia</dt><dd>{form.eventDate}</dd></div>
     <div><dt>Okres od–do</dt><dd>{form.from} – {form.to}</dd></div>
     <div><dt>Liczba dzieci</dt><dd>{form.childCount}</dd></div>
    </dl>
    {form.warning&&<p className="field-hint">{form.warning}</p>}
   </div>
   <div className="forms-demo-fields">
    <h4>Dane do projektu — wyłącznie przykładowe</h4>
    <p className="field-hint">Nie wpisuj PESEL, adresu zamieszkania, numeru rachunku ani innych wrażliwych danych. Pola są przeznaczone do demonstracji, nie do formalnego złożenia.</p>
    <div className="allocation-grid">
     <label>Imię i nazwisko DEMO
      <input aria-label="Imię i nazwisko DEMO" value={data.applicant}
       onChange={e=>change('applicant',e.target.value)} maxLength={100} autoComplete="off"/></label>
     {form.recipient==='employer'&&<label>Nazwa pracodawcy DEMO
      <input aria-label="Nazwa pracodawcy DEMO" value={data.employer}
       onChange={e=>change('employer',e.target.value)} maxLength={120} autoComplete="off"/></label>}
     <label>Miejscowość DEMO
      <input aria-label="Miejscowość DEMO" value={data.place}
       onChange={e=>change('place',e.target.value)} maxLength={80} autoComplete="off"/></label>
    </div>
    <fieldset className="forms-demo-checks"><legend>Kontrola przed symulacją</legend>
     <label className="used-check"><input type="checkbox" checked={data.childDetailsConfirmed}
      onChange={e=>change('childDetailsConfirmed',e.target.checked)}/>
      <span>Sprawdziłem zgodność dat i danych dziecka w scenariuszu DEMO.</span></label>
     <label className="used-check"><input type="checkbox" checked={data.attachmentsChecked}
      onChange={e=>change('attachmentsChecked',e.target.checked)}/>
      <span>Sprawdziłem, jakie załączniki mogą być wymagane.</span></label>
     <label className="used-check"><input type="checkbox" checked={data.demoAcknowledged}
      onChange={e=>change('demoAcknowledged',e.target.checked)}/>
      <span>Rozumiem, że nic nie zostanie wysłane do pracodawcy ani ZUS.</span></label>
    </fieldset>
    <h4>Lista załączników do sprawdzenia</h4>
    <ul>{form.attachmentHints.map((hint,i)=><li key={i}>{hint}</li>)}</ul>
    {check&&check.errors.length>0&&<div className="forms-demo-validation" role="note">
     <p>Do uzupełnienia przed symulacją ({check.errors.length}):</p>
     <ul>{check.errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
    </div>}
   </div>
   <div className="forms-demo-actions">
    <button type="button" className="secondary-button" onClick={()=>setPreview(v=>!v)}>
     {preview?'Ukryj podgląd projektu':'Pokaż podgląd projektu wniosku'}</button>
    <button type="button" className="secondary-button" onClick={download} disabled={!check?.ready}>
     Pobierz projekt (.html)</button>
    <button type="button" className="primary-button" onClick={send} disabled={!check?.ready}>
     Zasymuluj wysłanie do {form.recipient==='employer'?'pracodawcy':'ZUS'}</button>
   </div>
   {preview&&<div className="forms-demo-preview" role="group" aria-label="Podgląd przygotowanego projektu DEMO">
    <div className="forms-demo-watermark">DEMO — NIE WYSŁANO</div>
    <h4>{form.title}</h4>
    <p>Wnioskodawca: {data.applicant||'Do uzupełnienia'} · adresat: {form.recipient==='employer'?data.employer:'ZUS / właściwy płatnik'}</p>
    <p>Dotyczy {form.childCount} {form.childCount===1?'dziecka':'dzieci'}; zdarzenie: {form.eventDate}, okres: {form.from} – {form.to}.</p>
    <p>{form.kind==='zam_worksheet'?'To zestawienie do uzupełnienia aktualnego urzędowego ZAM; nie zastępuje formularza ZUS.':
      form.kind==='birth_notice'?'To informacja do pracodawcy, a nie wniosek matki o urlop macierzyński.':
      'To projekt wniosku pracownika o udzielenie urlopu. Przed użyciem sprawdź wymagania pracodawcy.'}</p>
    <p className="field-hint">{form.warning}</p>
   </div>}
   {error&&<p role="alert" className="validation">{error}</p>}
   {sent.length>0&&<div className="forms-demo-sent" role="status" aria-label="Wynik symulacji wysłania wniosku">
    {sent.map(receipt=><p key={receipt.id}><span>{receipt.id} · NIE WYSŁANO</span> {receipt.message}</p>)}
   </div>}
   <div className="forms-demo-links">
    <p>Oficjalne źródła i formularze: <a href={form.sourceUrl} target="_blank" rel="noopener noreferrer">
     {form.kind==='zam_worksheet'?'Pobierz aktualny ZAM na zus.pl':'Sprawdź oficjalne wymagania'}</a>
     {' · '}<a href={OFFICIAL_FORMS} target="_blank" rel="noopener noreferrer">Wszystkie formularze do zasiłku macierzyńskiego (ZUS)</a>.</p>
    <p className="field-hint">Symulacja nie tworzy urzędowego UPP, nie jest podpisem elektronicznym ani nie przesyła dokumentów. Właściwy formularz ZUS należy wypełnić niezależnie.</p>
   </div>
  </>}
 </section>;
}
