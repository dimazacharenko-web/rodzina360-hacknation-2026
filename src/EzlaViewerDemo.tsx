import React,{useState} from 'react';
import {
  EZLA_DEMO_DISCLAIMER,ezlaDemoRecords,ezlaDemoToSicknessInput,
  summarizeEzlaRecord,type EzlaDemoId,type EzlaDemoRecord
} from './ezlaDemo.ts';

type Props={
 appliedId:EzlaDemoId|null;
 onApply:(record:EzlaDemoRecord)=>void;
 onClear:()=>void;
};
const ZUS_EZLA_HELP='https://www.zus.pl/portal/pomoc/ksw0014.html';
export function EzlaViewerDemo({appliedId,onApply,onClear}:Props){
 const [selected,setSelected]=useState<EzlaDemoId>('pregnancy_b');
 const [preview,setPreview]=useState(false);
 const record=ezlaDemoRecords.find(r=>r.id===selected)!;
 const summary=summarizeEzlaRecord(record);
 return <section className="planner-card ezla-demo" role="region" aria-label="Podgląd e-ZLA — ZUS DEMO">
  <div className="ezla-demo-head">
   <div><h3>Podgląd zaświadczeń lekarskich e-ZLA · DEMO</h3>
    <p>Przeglądaj syntetyczne zaświadczenia wystawione z powodu niezdolności do pracy wskutek choroby.</p></div>
   <span className="zus-import-badge">TYLKO DEMO</span>
  </div>
  <p className="zus-import-disclaimer">{EZLA_DEMO_DISCLAIMER}</p>
  <div className="ezla-demo-layout">
   <div role="group" aria-label="Lista przykładowych e-ZLA" className="ezla-demo-list">
    {ezlaDemoRecords.map(r=><button key={r.id} type="button"
      aria-pressed={selected===r.id}
      className={'ezla-demo-record'+(selected===r.id?' selected':'')}
      onClick={()=>{setSelected(r.id);setPreview(false);}}>
      <span className="ezla-demo-rowhead"><span>{r.number}</span><small>{r.status==='issued'?'Wystawione':'Anulowane'}</small></span>
      <span>{r.title}</span>
      <small>{r.from} – {r.to}</small>
    </button>)}
   </div>
   <div className="ezla-demo-details">
    <p className="field-hint">Wybrano: {record.number}. To identyfikator DEMO, nie numer dokumentu ZUS.</p>
    <button type="button" className="secondary-button" onClick={()=>setPreview(v=>!v)}>
      {preview?'Ukryj szczegóły e-ZLA':'Pokaż szczegóły e-ZLA · DEMO'}
    </button>
    {preview&&<div className="ezla-demo-preview" role="group" aria-label="Szczegóły wybranego e-ZLA DEMO">
      <div className="ezla-demo-stamp">DEMO — NIE JEST e-ZLA ZUS</div>
      <h4>{record.title}</h4>
      <dl>
       <div><dt>Numer zaświadczenia</dt><dd>{record.number}</dd></div>
       <div><dt>Data wystawienia</dt><dd>{record.issuedOn}</dd></div>
       <div><dt>Okres niezdolności od</dt><dd>{record.from}</dd></div>
       <div><dt>Okres niezdolności do</dt><dd>{record.to}</dd></div>
       <div><dt>Liczba dni kalendarzowych</dt><dd>{summary.days} dni</dd></div>
       <div><dt>Przyczyna niezdolności</dt><dd>Choroba (scenariusz testowy)</dd></div>
       <div><dt>Kod literowy</dt><dd>{summary.codeLabel}</dd></div>
       <div><dt>Status</dt><dd>{summary.statusLabel}</dd></div>
      </dl>
      <p>{record.notes}</p>
      <p className="ezla-demo-warning">{summary.warning}</p>
      <button type="button" className="primary-button"
       disabled={!summary.canUseForSimulation}
       onClick={()=>onApply(record)}>Przenieś okres e-ZLA DEMO do kalkulatora →</button>
      {!summary.canUseForSimulation&&<p className="field-hint">Anulowane zaświadczenie nie jest dostępne do importu.</p>}
    </div>}
   </div>
  </div>
  {appliedId&&<div className="ezla-demo-imported" role="note">
   <p>Zastosowano syntetyczny okres z {ezlaDemoRecords.find(r=>r.id===appliedId)?.number}. Daty trafiły do kalkulatora, ale nie potwierdzają istnienia e-ZLA ani prawa do 100% zasiłku.</p>
   <button type="button" className="secondary-button" onClick={onClear}>Wyczyść dane e-ZLA DEMO i wpisz ręcznie</button>
  </div>}
  <p className="field-hint">Nie wpisuj PESEL ani danych medycznych. Brak kodu B nie zawsze wyklucza ciążę — ZUS może wymagać odrębnego zaświadczenia lekarza. <a href={ZUS_EZLA_HELP} target="_blank" rel="noopener noreferrer">ZUS: zaświadczenia lekarskie ↗</a>.</p>
 </section>;
}
