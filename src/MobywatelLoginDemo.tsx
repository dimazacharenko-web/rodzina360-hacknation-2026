import React,{useEffect,useRef,useState} from 'react';
import {
  createMobywatelDemoSession,
  MOBYWATEL_DEMO_NOTICE,
  type MobywatelDemoSession
} from './mobywatelDemo';

type Props={
  session:MobywatelDemoSession|null;
  onLogin:(session:MobywatelDemoSession)=>void;
  onLogout:()=>void;
};

export function MobywatelLoginDemo({session,onLogin,onLogout}:Props){
  const [open,setOpen]=useState(false);
  const [step,setStep]=useState<'redirect'|'approval'>('redirect');
  const triggerRef=useRef<HTMLButtonElement>(null);
  const dialogRef=useRef<HTMLDivElement>(null);

  const close=()=>{
    setOpen(false);
    setStep('redirect');
    triggerRef.current?.focus();
  };
  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      if(event.key!=='Tab'||!dialogRef.current)return;
      const focusables=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]'));
      if(focusables.length===0)return;
      const first=focusables[0],last=focusables[focusables.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',onKey);
    const previouslyFocused=document.activeElement instanceof HTMLElement?document.activeElement:null;
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    return ()=>{
      document.removeEventListener('keydown',onKey);
      previouslyFocused?.focus();
    };
  },[open]);

  const begin=()=>{setStep('redirect');setOpen(true);};
  const approve=()=>{
    onLogin(createMobywatelDemoSession());
    close();
  };

  return <div className="moby-demo-header">
    {session?
      <div className="moby-demo-active" role="status" aria-label="Status symulacji mObywatel">
        <span className="moby-demo-label">mObywatel · DEMO</span>
        <button type="button" className="moby-demo-logout" onClick={onLogout}>Zakończ sesję</button>
      </div>
      :<button type="button" className="moby-demo-login" ref={triggerRef} onClick={begin}>
        Zaloguj przez mObywatel <span className="moby-demo-pill">DEMO</span>
      </button>}
    {open&&<div className="moby-demo-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
      <div role="dialog" aria-modal="true" aria-labelledby="moby-demo-title" aria-describedby="moby-demo-description"
        className="moby-demo-dialog" ref={dialogRef}>
        <div className="moby-demo-top">
          <span className="moby-demo-flag">SYMULACJA INTEGRACJI · HACKNATION 2026</span>
          <button type="button" className="moby-demo-close" aria-label="Zamknij symulację logowania" onClick={close}>×</button>
        </div>
        <h2 id="moby-demo-title">Logowanie przez mObywatel — DEMO</h2>
        <p id="moby-demo-description" className="moby-demo-warning">{MOBYWATEL_DEMO_NOTICE}</p>
        {step==='redirect'?<>
          <p>W docelowym systemie użytkownik zostałby przekierowany do usługi publicznej. Tutaj przedstawiamy wyłącznie przebieg procesu.</p>
          <ol className="moby-demo-steps">
            <li><span>1</span> Wybór metody logowania mObywatel — demonstracja.</li>
            <li><span>2</span> Potwierdzenie tożsamości na urządzeniu — demonstracja.</li>
            <li><span>3</span> Powrót do Rodzina360 z sesją testową — bez danych osobowych.</li>
          </ol>
          <p className="moby-demo-footnote">Nie wpisuj PESEL, haseł, kodów SMS ani PIN-u. Żadne dane z aplikacji mObywatel lub ZUS nie zostaną pobrane.</p>
          <div className="moby-demo-actions">
            <button type="button" className="secondary-button" onClick={close}>Anuluj</button>
            <button type="button" className="primary-button" onClick={()=>setStep('approval')}>Przejdź do potwierdzenia DEMO →</button>
          </div>
        </>:<>
          <div className="moby-demo-confirmation">
            <span aria-hidden="true" className="moby-demo-check">✓</span>
            <div><h3>Potwierdzenie tożsamości — symulacja</h3>
              <p>W rzeczywistej usłudze potwierdzenie odbywa się poza Rodzina360. Tutaj wystarczy zatwierdzić przykładowy przebieg.</p>
            </div>
          </div>
          <p className="moby-demo-footnote">Po potwierdzeniu zobaczysz status „mObywatel · DEMO”. To nie jest prawdziwe uwierzytelnienie i nie potwierdza prawa do świadczeń.</p>
          <div className="moby-demo-actions">
            <button type="button" className="secondary-button" onClick={()=>setStep('redirect')}>← Wróć</button>
            <button type="button" className="primary-button" onClick={approve}>Zasymuluj potwierdzenie</button>
          </div>
        </>}
      </div>
    </div>}
  </div>;
}
