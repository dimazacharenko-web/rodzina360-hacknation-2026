import React,{useState} from 'react';
import {
 issueZusDebtCertificate,minimumWageForDate,thresholdForDate,
 moneyPL,renderZusDebtCertificateHtml,certificateMatches,
 type DebtPreset,type ZusDebtCertificate
} from './zusDebtCertificate.ts';

type Props={
  employment1:string;employment2:string;
  eventDate:string;eventConfirmed:boolean;
  certificates:[ZusDebtCertificate|null, ZusDebtCertificate|null];
  onIssue:(certificate:ZusDebtCertificate)=>void;
  onClear:(owner:1|2)=>void;
};
export function ZusDebtCertificateDemo(p:Props){
  const available=([
    ...(p.employment1==='dzialalnosc'?[1 as const]:[]),
    ...(p.employment2==='dzialalnosc'?[2 as const]:[])
  ]);
  const [selected,setSelected]=useState<1|2>(1);
  const [preset,setPreset]=useState<DebtPreset>('over');
  const [custom,setCustom]=useState('50,00');
  const [error,setError]=useState('');
  if(!available.length)return null;
  const owner=available.includes(selected)?selected:available[0];
  const wage=minimumWageForDate(p.eventDate);
  const threshold=thresholdForDate(p.eventDate);
  const doc=p.certificates[owner-1];
  const current=doc&&certificateMatches(doc,owner,p.eventDate,owner===1?p.employment1:p.employment2)?doc:null;
  const issue=()=>{
    setError('');
    try{
      p.onIssue(issueZusDebtCertificate({
        owner,entitlementDate:p.eventDate,preset,customAmount:custom,
        issuedOn:new Date().toISOString().slice(0,10)
      }));
    }catch(e){setError(e instanceof Error?e.message:'Nie można zasymulować zaświadczenia.');}
  };
  const download=()=>{
    if(!current)return;
    const html=renderZusDebtCertificateHtml(current);
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;
    a.download='Rodzina360-ZUS-DEMO-zadluzenie-'+current.entitlementDate+'-osoba'+current.owner+'.html';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  return <section className="planner-card zus-debt-demo" role="region" aria-label="Zaświadczenie o zadłużeniu ZUS — DEMO">
    <div className="zus-import-head">
      <div>
        <h3>Zaświadczenie o stanie zadłużenia — ZUS DEMO</h3>
        <p>Symulacja sprawdzenia salda na dzień powstania prawa do świadczenia i wystawienia przykładowego dokumentu.</p>
      </div>
      <span className="zus-import-badge">TYLKO DEMO</span>
    </div>
    <p className="zus-import-disclaimer">SYMULACJA — kwoty są wymyślone. Aplikacja nie łączy się z ZUS, nie sprawdza konta płatnika i nie wystawia urzędowego zaświadczenia.</p>
    {available.length===2&&<label>Osoba prowadząca działalność
      <select value={owner} onChange={e=>{setSelected(Number(e.target.value) as 1|2);setError('');}}>
        <option value={1}>Osoba 1 (JDG)</option><option value={2}>Osoba 2 (JDG)</option>
      </select>
    </label>}
    <div className="zus-debt-facts">
      <div><small>Data powstania prawa — przyjęta z ankiety</small><strong>{p.eventDate||'Nie podano'}</strong>
        <span>{p.eventConfirmed?'Data podana jako faktyczna':'Data przewidywana lub niepotwierdzona'}</span></div>
      <div><small>Próg 1% minimalnego wynagrodzenia</small>
        <strong>{threshold!==null?moneyPL(threshold):'Nie można ustalić'}</strong>
        <span>{wage?'Minimalne wynagrodzenie: '+moneyPL(wage.wagePLN*100)+' ('+wage.law+')':'Wprowadź datę w latach 2023–2027'}</span></div>
    </div>
    <label>Testowa kwota zadłużenia na ten dzień
      <select value={preset} onChange={e=>{setPreset(e.target.value as DebtPreset);setError('');}}>
        <option value="zero">0 zł — brak zadłużenia (DEMO)</option>
        <option value="below">Zadłużenie poniżej progu (DEMO)</option>
        <option value="equal">Zadłużenie równe progowi 1% (DEMO)</option>
        <option value="over">Zadłużenie powyżej progu (DEMO)</option>
        <option value="custom">Inna kwota testowa (wpisz samodzielnie)</option>
      </select>
    </label>
    {preset==='custom'&&<label>Własna kwota testowa w PLN
      <input type="text" inputMode="decimal" value={custom} onChange={e=>setCustom(e.target.value)}
        placeholder="np. 48,07" autoComplete="off"/>
    </label>}
    <p className="field-hint">Art. 2a ustawy zasiłkowej: znaczenie ma dług <em>przekraczający</em> próg, a nie równy progowi. Przy przekroczeniu należy sprawdzić spłatę całej zaległości i termin 6 miesięcy. Scenariusz nie uwzględnia faktycznych wpłat ani szczegółów ulg.</p>
    <button type="button" className="primary-button" onClick={issue}
      disabled={!wage}>Zasymuluj wystawienie zaświadczenia</button>
    {error&&<p role="alert" className="validation">{error}</p>}
    {current&&<div className="zus-debt-certificate" role="group" aria-label="Podgląd zaświadczenia ZUS DEMO">
      <div className="zus-debt-watermark">DEMO · NIE JEST DOKUMENTEM ZUS</div>
      <h4>Symulacja zaświadczenia o stanie zadłużenia</h4>
      <p>Osoba {current.owner} (JDG), na dzień: {current.entitlementDate}</p>
      <dl>
        <div><dt>Syntetyczne saldo składek</dt><dd>{moneyPL(current.amountGrosze)}</dd></div>
        <div><dt>Minimalne wynagrodzenie</dt><dd>{moneyPL(current.minimumWageGrosze)}</dd></div>
        <div><dt>Próg 1% minimalnej pensji</dt><dd>{moneyPL(current.thresholdGrosze)}</dd></div>
        <div><dt>Wniosek z porównania</dt><dd>{current.conclusion==='above_threshold'?'Powyżej progu':current.conclusion==='none'?'Brak zadłużenia (DEMO)':'Nie przekracza progu'}</dd></div>
      </dl>
      <p className="zus-debt-outcome">{current.warning}</p>
      <div className="zus-debt-actions">
        <button className="secondary-button" type="button" onClick={download}>Pobierz zaświadczenie DEMO (.html)</button>
        <button className="secondary-button" type="button" onClick={()=>p.onClear(owner)}>Wyczyść zaświadczenie DEMO</button>
      </div>
      <p className="field-hint">Dokument HTML można otworzyć w przeglądarce i wydrukować do PDF. Nie ma logotypu, podpisu ani pieczęci ZUS, a wszystkie kwoty są syntetyczne.</p>
    </div>}
    {doc&&!current&&<p className="validation" role="status">Data lub tytuł ubezpieczenia uległy zmianie. Stara symulacja nie jest aktualna; wystaw nową dla bieżącej daty.</p>}
    <p className="field-hint">Źródła: <a href="https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje" target="_blank" rel="noopener noreferrer">ZUS — zadłużenie a zasiłek ↗</a> · <a href="https://eli.gov.pl/eli/DU/2026/1213/ogl/pol" target="_blank" rel="noopener noreferrer">Podstawa stawki minimalnej 2027 ↗</a>. Symulacja nie poświadcza stanu rzeczywistego.</p>
  </section>;
}
