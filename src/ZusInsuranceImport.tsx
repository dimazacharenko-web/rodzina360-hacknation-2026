import React,{useState} from 'react';
import {
  getZusInsuranceDemoRecord,zusInsuranceDemoRecords,
  ZUS_INSURANCE_DEMO_DISCLAIMER,
  type ZusInsuranceDemoId,type ZusInsuranceDemoRecord
} from './zusInsuranceDemo';

export type ZusImportTarget=1|2;
type Props={
  secondAvailable:boolean;
  demoOwners:readonly boolean[];
  onApply:(owner:ZusImportTarget,record:ZusInsuranceDemoRecord)=>void;
  onClear:()=>void;
};
export function ZusInsuranceImport({secondAvailable,demoOwners,onApply,onClear}:Props){
  const [mode,setMode]=useState<'manual'|'demo'>('manual');
  const [target,setTarget]=useState<ZusImportTarget>(1);
  const [selected,setSelected]=useState<ZusInsuranceDemoId>('employee');
  const [preview,setPreview]=useState(false);
  const [notice,setNotice]=useState('');
  const record=getZusInsuranceDemoRecord(selected);
  const hasDemo=demoOwners.some(Boolean);

  const useManual=()=>{
    setMode('manual');setPreview(false);
    if(hasDemo){onClear();setNotice('Wyczyszczono wszystkie załadowane dane DEMO. Możesz wprowadzić własne dane poniżej.');}
    else setNotice('Uzupełnij ręcznie status ubezpieczenia i dane zatrudnienia poniżej.');
  };
  const apply=()=>{
    onApply(target,record);
    setPreview(false);
    setNotice('Załadowano syntetyczny rekord '+record.title+' dla osoby '+target+'. Nie jest to odczyt z ZUS.');
  };
  return <section className="planner-card zus-import-card" role="region" aria-label="Dane o ubezpieczeniu — ZUS DEMO">
    <div className="zus-import-head">
      <div>
        <h3>Dane o ubezpieczeniu — ZUS DEMO</h3>
        <p>Wybierz sposób wprowadzenia danych do sprawdzenia uprawnień do świadczeń.</p>
      </div>
      <span className="zus-import-badge">SYMULACJA</span>
    </div>
    <p className="zus-import-disclaimer">{ZUS_INSURANCE_DEMO_DISCLAIMER}</p>
    <div className="zus-import-methods" role="group" aria-label="Sposób wprowadzenia danych ubezpieczeniowych">
      <button type="button" aria-pressed={mode==='demo'}
        className={mode==='demo'?'zus-import-method is-active':'zus-import-method'}
        onClick={()=>{setMode('demo');setNotice('');setPreview(false);}}>
        Pobierz przykładowe dane z ZUS · DEMO
        <small>Wybierz gotowy syntetyczny scenariusz.</small>
      </button>
      <button type="button" aria-pressed={mode==='manual'}
        className={mode==='manual'?'zus-import-method is-active':'zus-import-method'} onClick={useManual}>
        Wpiszę dane samodzielnie
        <small>Ręczne uzupełnianie danych w formularzu.</small>
      </button>
    </div>
    {mode==='demo'&&<div className="zus-import-demo-fields">
      <div className="allocation-grid">
        {secondAvailable&&<label>Osoba do uzupełnienia
          <select value={target} onChange={e=>{setTarget(Number(e.target.value) as ZusImportTarget);setPreview(false);}}>
            <option value={1}>Osoba 1</option><option value={2}>Osoba 2</option>
          </select>
        </label>}
        <label>Scenariusz ubezpieczenia ZUS — DEMO
          <select value={selected} onChange={e=>{setSelected(e.target.value as ZusInsuranceDemoId);setPreview(false);}}>
            {zusInsuranceDemoRecords.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      </div>
      <p className="field-hint">{record.description}</p>
      {preview&&<div className="zus-import-preview" role="group" aria-label="Podgląd danych ZUS DEMO">
        <h4>Podgląd syntetycznych danych</h4>
        <dl>
          <div><dt>Tytuł ubezpieczenia</dt><dd>{record.employment==='etat'?'Umowa o pracę':record.employment==='zlecenie'?'Umowa zlecenie':'JDG'}</dd></div>
          <div><dt>Ubezpieczenie chorobowe</dt><dd>{record.insured==='tak'?'Tak (DEMO)':'Brak (DEMO)'}</dd></div>
          <div><dt>Data rozpoczęcia</dt><dd>{record.startDate}</dd></div>
          <div><dt>Data zakończenia</dt><dd>{record.endDate||'Brak w rekordzie testowym'}</dd></div>
          {record.employment==='dzialalnosc'&&<div><dt>Zadłużenie</dt><dd>{record.debt==='over'?'Powyżej progu — DEMO':'Nieokreślone'}</dd></div>}
        </dl>
        <p>{record.note}</p>
      </div>}
      <div className="zus-import-actions">
        {!preview?
          <button type="button" className="secondary-button" onClick={()=>setPreview(true)}>Zasymuluj pobranie danych</button>
          :<button type="button" className="primary-button" onClick={apply}>Przenieś dane DEMO do formularza →</button>}
      </div>
    </div>}
    {notice&&<p role="status" className="zus-import-notice">{notice}</p>}
    {hasDemo&&<div className="zus-import-loaded" role="note">
      <p>Dane testowe wykorzystane w formularzu: {demoOwners[0]?'osoba 1':''}{demoOwners[0]&&demoOwners[1]?', ':''}{demoOwners[1]?'osoba 2':''}. Aplikacja pokazuje wyniki tylko jako wstępną symulację; nie potwierdza ubezpieczenia ani wypłaty.</p>
      <button type="button" className="secondary-button" onClick={useManual}>Wyczyść dane DEMO i wpisz własne</button>
    </div>}
    <p className="field-hint">Dane testowe nie zawierają PESEL, nazwisk, numerów kont ani prawdziwych identyfikatorów. Nie jest wykonywane żadne zapytanie do systemów ZUS. Po załadowaniu można zmieniać pola ręcznie, ale rekord pozostaje oznaczony jako DEMO do jego wyczyszczenia.</p>
  </section>;
}
