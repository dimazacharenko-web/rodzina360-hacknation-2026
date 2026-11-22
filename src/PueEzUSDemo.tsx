import React,{useState} from 'react';
import {
 PUE_DEMO_DISCLAIMER,PUE_INQUIRY_DISCLAIMER,PUE_INQUIRY_TOPICS,
 pueDemoAccount,simulatePueInquiry,validatePueInquiry,
 type PueInquiryTopic,type PueDemoInquiry
} from './pueEzUSDemo.ts';
import {
 zusInsuranceDemoRecords,getZusInsuranceDemoRecord,
 type ZusInsuranceDemoId,type ZusInsuranceDemoRecord
} from './zusInsuranceDemo.ts';
import {ezlaDemoRecords,summarizeEzlaRecord,type EzlaDemoId,type EzlaDemoRecord} from './ezlaDemo.ts';

type Props={
 secondAvailable:boolean;
 allowSicknessImport:boolean;
 onInsuranceImport:(owner:1|2,record:ZusInsuranceDemoRecord)=>void;
 onEzlaImport:(record:EzlaDemoRecord)=>void;
};
export function PueEzUSDemo({secondAvailable,allowSicknessImport,onInsuranceImport,onEzlaImport}:Props){
 const [connected,setConnected]=useState(false);
 const [tab,setTab]=useState<'account'|'ezla'|'messages'>('account');
 const [accountId,setAccountId]=useState<ZusInsuranceDemoId>('employee');
 const [owner,setOwner]=useState<1|2>(1);
 const [ezlaId,setEzlaId]=useState<EzlaDemoId>('pregnancy_b');
 const [topic,setTopic]=useState<PueInquiryTopic>('insurance');
 const [question,setQuestion]=useState('');
 const [inquiries,setInquiries]=useState<PueDemoInquiry[]>([]);
 const [feedback,setFeedback]=useState('');
 const [error,setError]=useState('');
 const account=pueDemoAccount(accountId);
 const record=ezlaDemoRecords.find(x=>x.id===ezlaId)!;
 const summary=summarizeEzlaRecord(record);
 const currentOwner=secondAvailable?owner:1;
 const simulateConnection=()=>{
  setConnected(true);setTab('account');setFeedback('Uruchomiono lokalny podgląd konta DEMO. Nie wykonano połączenia z PUE/eZUS.');
 };
 const disconnect=()=>{
  setConnected(false);setFeedback('');setError('');setQuestion('');setInquiries([]);
 };
 const importInsurance=()=>{
  onInsuranceImport(currentOwner,getZusInsuranceDemoRecord(accountId));
  setFeedback('Przeniesiono syntetyczne dane ubezpieczeniowe osoby '+currentOwner+' do ankiety. Wynik nie jest potwierdzeniem ZUS.');
 };
 const importEzla=()=>{
  if(!summary.canUseForSimulation||!allowSicknessImport)return;
  onEzlaImport(record);
  setFeedback('Przeniesiono syntetyczny okres '+record.number+' do kalkulatora e-ZLA w kroku 2. Nie jest to zaświadczenie ZUS.');
 };
 const sendDemoQuestion=()=>{
  setError('');
  const err=validatePueInquiry(question);
  if(err){setError(err);return;}
  try{
   const message=simulatePueInquiry({topic,question,sequence:inquiries.length+1});
   setInquiries(prev=>[...prev,message]);setQuestion('');
   setFeedback('Utworzono '+message.id+' — symulacja, wiadomości NIE wysłano do ZUS.');
  }catch(e){setError(e instanceof Error?e.message:'Nie można przygotować zapytania DEMO.');}
 };
 return <details id="pue-ezus-demo" className="pue-demo-shell">
  <summary>PUE/eZUS · DEMO — sprawdź konto ubezpieczonego i zadaj pytanie</summary>
  <section className="pue-demo-panel" role="region" aria-label="PUE/eZUS — centrum DEMO">
   <div className="pue-demo-head"><div>
    <h3>Symulacja połączenia z PUE/eZUS</h3>
    <p>Podgląd testowego profilu ubezpieczonego, zaświadczeń e-ZLA i korespondencji — bez autoryzacji oraz połączenia z serwerami ZUS.</p>
   </div><span className="zus-import-badge">SYMULACJA</span></div>
   <p className="zus-import-disclaimer">{PUE_DEMO_DISCLAIMER}</p>
   {!connected?<div className="pue-demo-connect">
    <p>W prawdziwym eZUS można sprawdzić dane zgromadzone na koncie i wysyłać pytania. Tutaj każde działanie odbywa się tylko w pamięci przeglądarki.</p>
    <button type="button" className="primary-button" onClick={simulateConnection}>Zasymuluj połączenie z PUE/eZUS</button>
   </div>:<>
    <div className="pue-demo-bar">
     <span role="status">Tryb DEMO aktywny — brak rzeczywistego połączenia z ZUS</span>
     <button type="button" className="secondary-button" onClick={disconnect}>Zakończ symulację PUE/eZUS</button>
    </div>
    <nav className="pue-demo-tabs" aria-label="Widoki demonstracyjne eZUS">
     <button type="button" aria-pressed={tab==='account'} onClick={()=>setTab('account')}>Konto ubezpieczonego</button>
     <button type="button" aria-pressed={tab==='ezla'} onClick={()=>setTab('ezla')}>Zaświadczenia e-ZLA</button>
     <button type="button" aria-pressed={tab==='messages'} onClick={()=>setTab('messages')}>Zadaj pytanie · DEMO</button>
    </nav>
    {tab==='account'&&<div className="pue-demo-content" role="group" aria-label="Dane konta ubezpieczonego PUE DEMO">
     <h4>Ubezpieczenia i płatnicy — konto testowe</h4>
     <div className="allocation-grid">
      {secondAvailable&&<label>Profil w ankiecie
       <select value={currentOwner} onChange={e=>setOwner(Number(e.target.value) as 1|2)}>
        <option value={1}>Osoba 1</option><option value={2}>Osoba 2</option>
       </select></label>}
      <label>Przykładowy stan konta
       <select value={accountId} onChange={e=>{setAccountId(e.target.value as ZusInsuranceDemoId);setFeedback('');}}>
        {zusInsuranceDemoRecords.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}
       </select></label>
     </div>
     <dl className="pue-demo-account-data">
      <div><dt>Tytuł do ubezpieczeń</dt><dd>{account.employment==='etat'?'Umowa o pracę':account.employment==='zlecenie'?'Umowa zlecenie':'Działalność gospodarcza'}</dd></div>
      <div><dt>Chorobowe</dt><dd>{account.insured?'Tak · DEMO':'Brak · DEMO'}</dd></div>
      <div><dt>Okres od</dt><dd>{account.coverageFrom}</dd></div>
      <div><dt>Data końca</dt><dd>{account.coverageTo||'Nie podano (DEMO)'}</dd></div>
      <div><dt>Płatnik</dt><dd>{account.payerLabel}</dd></div>
      <div><dt>Podstawa składek — okres</dt><dd>{account.contributionPeriod||'Brak danych DEMO'}</dd></div>
      <div><dt>Podstawa składek — kwota</dt><dd>{account.contributionBasePLN===null?'Brak danych DEMO':account.contributionBasePLN.toLocaleString('pl-PL',{style:'currency',currency:'PLN'})+' · DEMO'}</dd></div>
      <div><dt>Stan rozliczeń</dt><dd>{account.debtOverview}</dd></div>
     </dl>
     <p className="field-hint">Podstawa składek nie oznacza automatycznie podstawy wymiaru zasiłku. Dane nie są pobrane z prawdziwego konta ubezpieczonego.</p>
     <button className="primary-button" type="button" onClick={importInsurance}>Przenieś dane konta DEMO do ankiety →</button>
    </div>}
    {tab==='ezla'&&<div className="pue-demo-content" role="group" aria-label="Podgląd zaświadczeń e-ZLA PUE DEMO">
     <h4>Zaświadczenia lekarskie zapisane na koncie — DEMO</h4>
     <label>Wybierz zaświadczenie testowe
      <select value={ezlaId} onChange={e=>{setEzlaId(e.target.value as EzlaDemoId);setFeedback('');}}>
       {ezlaDemoRecords.map(r=><option key={r.id} value={r.id}>{r.number} · {r.title}</option>)}
      </select>
     </label>
     <dl className="pue-demo-account-data">
      <div><dt>Numer</dt><dd>{record.number}</dd></div>
      <div><dt>Okres</dt><dd>{record.from} – {record.to}</dd></div>
      <div><dt>Dni</dt><dd>{summary.days}</dd></div>
      <div><dt>Status</dt><dd>{summary.statusLabel}</dd></div>
      <div><dt>Kod literowy</dt><dd>{summary.codeLabel}</dd></div>
     </dl>
     <p className="field-hint">{summary.warning}</p>
     <button type="button" className="primary-button" onClick={importEzla}
      disabled={!summary.canUseForSimulation||!allowSicknessImport}>Przenieś e-ZLA DEMO do kalkulatora →</button>
     {!summary.canUseForSimulation&&<p className="field-hint">Anulowanego e-ZLA nie można wykorzystać.</p>}
     {!allowSicknessImport&&<p className="field-hint">Dla adopcji i rodziny zastępczej nie stosujemy kalkulatora chorobowego w ciąży.</p>}
    </div>}
    {tab==='messages'&&<div className="pue-demo-content" role="group" aria-label="Zapytania PUE DEMO">
     <h4>Zapytaj w razie wątpliwości — korespondencja DEMO</h4>
     <p className="field-hint">{PUE_INQUIRY_DISCLAIMER}</p>
     <label>Temat pytania
      <select value={topic} onChange={e=>{setTopic(e.target.value as PueInquiryTopic);setError('');}}>
       {PUE_INQUIRY_TOPICS.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
      </select></label>
     <label>Treść pytania — DEMO
      <textarea value={question} onChange={e=>{setQuestion(e.target.value);setError('');}}
       placeholder="Np. Dlaczego okres ubezpieczenia nie zgadza się z datą zgłoszenia?" rows={4}
       maxLength={1001} autoComplete="off"/></label>
     <p className="field-hint">Nie wpisuj PESEL, haseł, kodów, danych medycznych ani danych innych osób. Tekst nie opuszcza przeglądarki i znika po zakończeniu symulacji.</p>
     <button className="primary-button" type="button" onClick={sendDemoQuestion}>Zasymuluj wysłanie pytania</button>
     {error&&<p role="alert" className="validation">{error}</p>}
     {inquiries.length>0&&<div className="pue-demo-messages" aria-label="Wiadomości DEMO">
      {inquiries.map(m=><article className="pue-demo-message" key={m.id}>
       <strong>{m.id} · NIE WYSŁANO DO ZUS</strong>
       <p>{m.question}</p>
       <p><span>Podpowiedź Rodzina360 — DEMO, nie odpowiedź ZUS:</span> {m.guidance}</p>
      </article>)}
     </div>}
     <p className="field-hint">W rzeczywistym eZUS możesz korzystać z <a href="https://www.zus.pl/baza-wiedzy/o-portalu-pue-/informacje-" target="_blank" rel="noopener noreferrer">oficjalnej usługi eZUS</a> i korespondencji z ZUS. To nie jest wysyłka.</p>
    </div>}
   </>}
   {feedback&&<p className="pue-demo-feedback" role="status">{feedback}</p>}
  </section>
 </details>;
}
