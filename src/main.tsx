import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
import {assessMaternity, type ParentProfile, type Employment} from './eligibility';
import {calculateLeavePlan,limits,polishDate,type Period} from './leaveRules';
import {calculatePregnancySickness,type SicknessResult} from './sickness';
import {assessAveragedRate,assessJdgDebt,validateWeeks} from './decisionGuards';
import {CaseExplorer} from './CaseExplorer';
import {makeWizardCase,type WizardCase} from './caseWizard';
import type {CaseId} from './caseExamples';
import {LeavePeriodsEditor} from './LeavePeriodsEditor';
import {calculateFlexiblePlan,initialEntries,type LeaveEntry,type FlexibleResult} from './flexibleLeave';
import {DocumentRoadmap} from './DocumentRoadmap';
import {createDocumentPlan,type DocumentPlanInput} from './documentPlanner';
import {ApplicationReadiness} from './ApplicationReadiness';
import {ApplicationFormsDemo} from './ApplicationFormsDemo';
import {CivilRegistryDemo} from './CivilRegistryDemo';
import {AdminPanelDemo} from './AdminPanelDemo';
import {newAdminConfig,loadAdminDemoConfig,saveAdminDemoConfig,CONFIG_STORAGE_KEY,legalRulesChanged,formatRate,type AdminConfig} from './legalConfig.ts';
import {SupportDirectory} from './SupportDirectory';
import {OfficialRightsLinks} from './OfficialRightsLinks';
import {initialSupportTopic} from './supportDirectory';
import type {FormsDemoInput} from './applicationFormsDemo';
import type {ApplicationReadinessInput} from './applicationReadiness';
import {PaymentSimulator} from './PaymentSimulator';
import {emptyCoverage,assessEligibility,type CoverageEvidence,type InsuranceAnswer} from './entitlementCheck';
import {CoverageQuestions,EntitlementBadge} from './CoverageQuestions';
import {emptyCare,calculateCarePlan,initialCareEntries,calculateCarePeriods,type CarePlan,type CareProfile} from './careRules';
import {CareProfileForm} from './CareProfileForm';
import {CareStage2,CareStage3} from './CareStages';
import {MobywatelLoginDemo} from './MobywatelLoginDemo';
import {PueEzUSDemo} from './PueEzUSDemo';
import type {MobywatelDemoSession} from './mobywatelDemo';
import {ZusInsuranceImport,type ZusImportTarget} from './ZusInsuranceImport';
import type {ZusInsuranceDemoRecord} from './zusInsuranceDemo';
import {ZusDebtCertificateDemo} from './ZusDebtCertificateDemo';
import {certificateMatches,moneyPL,type ZusDebtCertificate} from './zusDebtCertificate';
import {EzlaViewerDemo} from './EzlaViewerDemo';
import {ezlaDemoToSicknessInput,getEzlaDemoRecord,type EzlaDemoRecord,type EzlaDemoId} from './ezlaDemo';

type Family='one'|'two'|'uncertain';
type LegalRole='father'|'legal_parent'|'partner'|'other';
type Special='none'|'adoption'|'foster'|'loss'|'other';
type Debt='none'|'small'|'over'|'installments'|'application'|'unknown';
type Person=ParentProfile & {debt:Debt};
const emptyPerson=():Person=>({employment:'',insured:'',base:'',debt:'unknown'});
type Form={birthDate:string;actual:boolean;children:number;family:Family;legalRole:LegalRole;special:Special;person1:Person;person2:Person};
const defaultForm:Form={birthDate:'',actual:false,children:1,family:'two',legalRole:'father',special:'none',person1:emptyPerson(),person2:emptyPerson()};
const employmentLabels:Record<Exclude<Employment,''>,string>={etat:'Umowa o pracę',zlecenie:'Umowa zlecenie',dzialalnosc:'Działalność gospodarcza (B2B)',inne:'Inna sytuacja / brak zatrudnienia'};
const ZUS='https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje';
const DOCS='https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty';
const LOAN='https://www.zus.pl/firmy/ulgi/uklady-ratalne';
function ParentForm({title,value,onChange}:{title:string;value:Person;onChange:(p:Person)=>void}){
  const edit=(name:keyof Person,val:string)=>onChange({...value,[name]:val});
  return <section className="parent-card"><div className="parent-title"><span className="avatar">♡</span><div><h3>{title}</h3><p>Ubezpieczenie i status świadczenia</p></div></div>
    <label>Tytuł do ubezpieczenia chorobowego<select value={value.employment} onChange={e=>{const emp=e.target.value as Employment;onChange({...value,employment:emp,insured:emp==='etat'?'tak':value.insured});}}><option value="">Wybierz</option>{Object.entries(employmentLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <p className="field-hint">Podstawa objęcia ubezpieczeniem: np. umowa o pracę (co do zasady obowiązkowe), umowa zlecenia lub działalność gospodarcza (co do zasady dobrowolne, po spełnieniu warunków). <a href="https://www.zus.pl/pl/firmy/rodzaje-ubezpieczen/ubezpieczenie-chorobowe" target="_blank" rel="noreferrer">Wyjaśnienie ZUS ↗</a></p>
    <label>Czy podlegasz ubezpieczeniu chorobowemu?<select value={value.insured} onChange={e=>edit('insured',e.target.value)}><option value="">Wybierz</option><option value="tak">Tak</option><option value="nie">Nie</option><option value="nie_wiem">Nie wiem / do sprawdzenia</option></select></label>
    {value.employment==='dzialalnosc'&&<label>Stan zadłużenia z tytułu składek społecznych w ZUS<select value={value.debt} onChange={e=>edit('debt',e.target.value)}><option value="unknown">Nie wiem / nie sprawdzono</option><option value="none">Brak zadłużenia</option><option value="small">Zadłużenie nie przekracza 1% płacy minimalnej</option><option value="over">Zadłużenie powyżej progu</option><option value="installments">Obowiązuje układ ratalny – spłacam terminowo</option><option value="application">Złożono dopiero wniosek o raty</option></select></label>}
    <p className="field-hint">Wysokość świadczeń nie jest tu liczona. Działalność gospodarcza nie daje urlopu pracowniczego, lecz może dawać zasiłek za odpowiedni okres.</p>
  </section>;
}
function Timeline({title,period}:{title:string;period:Period|null}){
  return <div className="leave-period"><div><strong>{title}</strong><small>{period?`${polishDate(period.start)} – ${polishDate(period.end)}`:'Nie zaplanowano'}</small></div><span className="day-chip">{period?`${period.days} dni`:'0 dni'}</span></div>;
}
function App(){
  const [adminConfig,setAdminConfig]=useState<AdminConfig>(()=>loadAdminDemoConfig(window.localStorage));
  const rules=adminConfig.rules;
  const experimental=legalRulesChanged(rules);
  const [stage,setStage]=useState<1|2|3|4>(1);
  const [mobywatelDemoSession,setMobywatelDemoSession]=useState<MobywatelDemoSession|null>(null);
  const [form,setForm]=useState<Form>(defaultForm);
  const [demoCase,setDemoCase]=useState<WizardCase|null>(null);
  const [demoInsuranceOwners,setDemoInsuranceOwners]=useState<[boolean,boolean]>([false,false]);
  const [debtDemoRecords,setDebtDemoRecords]=useState<[ZusDebtCertificate|null, ZusDebtCertificate|null]>([null,null]);
  const [care,setCare]=useState<CareProfile>(emptyCare);
  const [carePlan,setCarePlan]=useState<CarePlan|null>(null);
  const [careError,setCareError]=useState('');
  const [checklistState,setChecklistState]=useState<{scope:string;values:Record<string,boolean>}>({scope:'',values:{}});
  const [coverage1,setCoverage1]=useState<CoverageEvidence>(emptyCoverage);
  const [coverage2,setCoverage2]=useState<CoverageEvidence>(emptyCoverage);
  const [leaveEntries,setLeaveEntries]=useState<LeaveEntry[]>([]);
  const [maternityUsedDays,setMaternityUsedDays]=useState(0);
  const [entriesBirthKey,setEntriesBirthKey]=useState('');
  const [variant,setVariant]=useState<'standard'|'averaged'>('standard');
  const [averagedApplicationDate,setAveragedApplicationDate]=useState('');
  const [error,setError]=useState('');
  const [resultTab,setResultTab]=useState<'days'|'docs'|'risks'>('days');
  const [sickMode,setSickMode]=useState<'none'|'yes'>('none');
  const [sickFrom,setSickFrom]=useState('');
  const [sickTo,setSickTo]=useState('');
  const [ezlaDemoApplied,setEzlaDemoApplied]=useState<EzlaDemoId|null>(null);
  const [employerLimit,setEmployerLimit]=useState<14|33>(33);
  const [employerDaysUsed,setEmployerDaysUsed]=useState('0');
  const [sicknessDaysUsed,setSicknessDaysUsed]=useState('0');
  const [sickEntitlement,setSickEntitlement]=useState(false);
  const [confirmedBase,setConfirmedBase]=useState('');
  const [sickError,setSickError]=useState('');
  const [sickResult,setSickResult]=useState<SicknessResult|null>(null);
  const applyEzlaDemo=(record:EzlaDemoRecord)=>{
    const data=ezlaDemoToSicknessInput(record);
    setSickMode('yes');setSickFrom(data.from);setSickTo(data.to);
    setEzlaDemoApplied(record.id);
    setCoverage1(prev=>({...prev,ezlaCodeB:data.ezlaCodeB}));
    setSickEntitlement(false);setSickResult(null);setSickError('');
  };
  const clearEzlaDemo=()=>{
    setEzlaDemoApplied(null);
    setSickFrom('');setSickTo('');
    setCoverage1(prev=>({...prev,ezlaCodeB:'unknown'}));
    setSickEntitlement(false);setSickResult(null);setSickError('');
  };
  const calculateSickness=()=>{
    if(ezlaDemoApplied){setSickResult(null);setSickError('Wybrano wyłącznie syntetyczne e-ZLA DEMO. Nie można na tej podstawie potwierdzić prawa ani obliczyć należnej wypłaty. Wyczyść DEMO i wpisz dane z rzeczywistego e-ZLA.');return;}
    setSickResult(null);setSickError('');
    if(form.person1.employment!=='etat'){setSickError('Automatyczne obliczenie obecnie obsługuje tylko umowę o pracę. Dla zlecenia i działalności sprawdź okres wyczekiwania i zasady w ZUS.');return;}
    if(form.person1.insured!=='tak'||!sickEntitlement){setSickError('Potwierdź ubezpieczenie chorobowe i prawo do wypłaty (w tym okres wyczekiwania lub ustawowy wyjątek).');return;}
    if(coverage1.ezlaCodeB!=='yes'){setSickError('Wymagane potwierdzenie e-ZLA z kodem B dla stawki 100% w ciąży.');return;}
    const check=assessEligibility({kind:'pregnancy_sickness',employment:form.person1.employment,insured:form.person1.insured as InsuranceAnswer,coverage:coverage1,eventDate:sickFrom,eventConfirmed:Boolean(sickFrom),debt:form.person1.debt,demoSource:demoInsuranceOwners[0],demoDebtSource:Boolean(currentDebt1)});
    if(check.status!=='possible'){setSickError('Prawo do zasiłku chorobowego nie jest jeszcze potwierdzone. Uzupełnij historię ubezpieczenia i rozwiąż wskazane ryzyka.');return;}
    if(!sickFrom||!sickTo){setSickError('Podaj datę początku i końca e-ZLA.');return;}
    if(!confirmedBase){setSickError('Do obliczenia kwoty potrzebna jest potwierdzona podstawa wymiaru zasiłku.');return;}
    if(Number(employerDaysUsed)<0||Number(sicknessDaysUsed)<0||employerDaysUsed.trim()===''||sicknessDaysUsed.trim()==='') {setSickError('Podaj poprawne liczby dni już wykorzystanych.');return;}
    try{setSickResult(calculatePregnancySickness({from:sickFrom,to:sickTo,base:Number(confirmedBase),employerLimit,employerDaysUsed:Number(employerDaysUsed),sicknessDaysUsed:Number(sicknessDaysUsed)}));}
    catch(e){setSickError(e instanceof Error?e.message:'Nie można obliczyć świadczenia.');}
  };
  const isCare=form.special==='adoption'||form.special==='foster';
  const l=limits(form.children,isCare?undefined:rules);
  const maternityRemainingDays=l.maternityDays-maternityUsedDays;
  const secondLegal=form.family==='two'&&form.legalRole==='father';
  const secondEligible=secondLegal&&form.person2.insured==='tak'&&form.person2.employment!==''&&form.person2.employment!=='inne';
  const updatePerson=(name:'person1'|'person2',value:Person)=>{
    const old=form[name],index=name==='person1'?0:1;
    if(debtDemoRecords[index]&&(old.debt!==value.debt||old.employment!==value.employment))
      setDebtDemoRecords(prev=>index===0?[null,prev[1]]:[prev[0],null]);
    setForm(f=>({...f,[name]:value}));
  };
  const issueDebtDemo=(certificate:ZusDebtCertificate)=>{
    const index=certificate.owner-1,key=certificate.owner===1?'person1':'person2';
    setDebtDemoRecords(prev=>index===0?[certificate,prev[1]]:[prev[0],certificate]);
    setForm(f=>({...f,[key]:{...f[key],debt:certificate.category}}));
  };
  const clearDebtDemo=(owner:1|2)=>{
    const index=owner-1,key=owner===1?'person1':'person2';
    setDebtDemoRecords(prev=>index===0?[null,prev[1]]:[prev[0],null]);
    setForm(f=>({...f,[key]:{...f[key],debt:'unknown'}}));
  };
  const invalidateDebtDemo=()=>{
    if(!debtDemoRecords.some(Boolean))return;
    setForm(f=>({...f,
      person1:debtDemoRecords[0]?{...f.person1,debt:'unknown'}:f.person1,
      person2:debtDemoRecords[1]?{...f.person2,debt:'unknown'}:f.person2
    }));
    setDebtDemoRecords([null,null]);
  };
  const importZusInsuranceDemo=(owner:ZusImportTarget,record:ZusInsuranceDemoRecord)=>{
    const target=owner===1?'person1':'person2';
    setForm(f=>({...f,[target]:{
      ...f[target],employment:record.employment,insured:record.insured,
      debt:record.debt,base:''
    }}));
    const fresh:CoverageEvidence={...emptyCoverage(),startDate:record.startDate,
      endDate:record.endDate,postInsuranceException:'none'};
    if(owner===1)setCoverage1(fresh);else setCoverage2(fresh);
    setDemoInsuranceOwners(prev=>owner===1?[true,prev[1]]:[prev[0],true]);
    setSickResult(null);
    setError('');
  };
  const clearZusInsuranceDemo=()=>{
    setForm(f=>({...f,
      person1:demoInsuranceOwners[0]?emptyPerson():f.person1,
      person2:demoInsuranceOwners[1]?emptyPerson():f.person2
    }));
    if(demoInsuranceOwners[0])setCoverage1(emptyCoverage());
    if(demoInsuranceOwners[1])setCoverage2(emptyCoverage());
    setDemoInsuranceOwners([false,false]);
    setSickResult(null);
    setError('');
  };
  const go=(n:1|2|3|4)=>{setError('');setStage(n);window.scrollTo({top:0,behavior:'smooth'});};

  const applyAdminDemoConfig=(value:AdminConfig)=>{
    const next=saveAdminDemoConfig(window.localStorage,value);
    setAdminConfig(next);
    setStage(1);setDemoCase(null);setLeaveEntries([]);setEntriesBirthKey('');
    setMaternityUsedDays(0);setVariant('standard');setAveragedApplicationDate('');
    setCarePlan(null);setCareError('');setResultTab('days');
    setChecklistState({scope:'',values:{}});setSickResult(null);setSickError('');setError('');
  };
  const resetAdminDemoConfig=()=>{
    try{window.localStorage.removeItem(CONFIG_STORAGE_KEY);}catch{/* private mode */}
    setAdminConfig(newAdminConfig());
    setStage(1);setDemoCase(null);setLeaveEntries([]);setEntriesBirthKey('');
    setMaternityUsedDays(0);setVariant('standard');setAveragedApplicationDate('');
    setCarePlan(null);setCareError('');setResultTab('days');
    setChecklistState({scope:'',values:{}});setSickResult(null);setSickError('');setError('');
  };

  const startCase=(id:CaseId)=>{
    const c=makeWizardCase(id);
    setDebtDemoRecords([null,null]);
    setDemoCase(c);
    setDemoInsuranceOwners([false,false]);
    setCoverage1(emptyCoverage());
    setCoverage2(emptyCoverage());
    setForm({
      birthDate:c.birthDate,actual:c.birthDateVerified,children:1,
      family:'one',legalRole:'father',special:'none',
      person1:{employment:c.motherEmployment||'inne',insured:c.motherInsured||'nie_wiem',base:'',debt:'unknown'},
      person2:emptyPerson()
    });
    setLeaveEntries(c.entries);
    setEntriesBirthKey(c.birthDate+'|1|false');
    setMaternityUsedDays(0);
    setVariant('standard');
    setAveragedApplicationDate('');
    setEzlaDemoApplied(null);
    setSickMode(c.sickness?'yes':'none');
    setSickFrom(c.sickness?.from||'');
    setSickTo(c.sickness?.to||'');
    setConfirmedBase('');
    setSickResult(null);
    setSickError('');
    setResultTab('days');
    go(2);
  };

  const firstNext=(e:React.FormEvent)=>{e.preventDefault();
    if(demoCase) setDemoCase(null);
    if(isCare){
      if(!form.person1.employment||!form.person1.insured){setError('Uzupełnij tytuł i status ubezpieczenia opiekuna.');return;}
      if(form.family==='two'&&(!form.person2.employment||!form.person2.insured)){setError('Podaj dane drugiego opiekuna lub wybierz plan dla jednej osoby.');return;}
      try{
        const plan=calculateCarePlan(form.special==='adoption'?'adoption':'foster',care,form.children);
        setCarePlan(plan);setLeaveEntries(initialCareEntries(plan,secondEligible));
        setEntriesBirthKey('care|'+plan.eventDate+'|'+form.children);
        setMaternityUsedDays(0);setVariant('standard');setSickMode('none');setEzlaDemoApplied(null);
        setCareError('');go(2);
      }catch(ex){setError(ex instanceof Error?ex.message:'Nie udało się ustalić uprawnień opiekunów.');}
      return;
    }
    if(!form.birthDate||!form.person1.employment||!form.person1.insured){setError('Podaj datę porodu, zatrudnienie i ubezpieczenie osoby rodzącej.');return;}
    if(form.family==='two'&&(!form.person2.employment||!form.person2.insured)){setError('Uzupełnij status ubezpieczenia drugiej osoby lub wybierz wariant bez uwzględniania jej danych.');return;}
    const key=form.birthDate+'|'+form.children+'|'+secondEligible+'|'+adminConfig.revision+'|'+JSON.stringify(rules);
    if(key!==entriesBirthKey){setLeaveEntries(initialEntries(form.birthDate,form.children,secondEligible,rules));setEntriesBirthKey(key);}
    go(2);
  };
  const special=form.special!=='none'&&!isCare;
  const debtEventDate=isCare?(form.special==='adoption'?(care.acceptanceDate&&care.courtFilingDate?(care.acceptanceDate>care.courtFilingDate?care.acceptanceDate:care.courtFilingDate):''):care.acceptanceDate):form.birthDate;
  const debtEventConfirmed=isCare?Boolean(debtEventDate):form.actual;
  const currentDebt1=certificateMatches(debtDemoRecords[0],1,debtEventDate,form.person1.employment)?debtDemoRecords[0]:null;
  const currentDebt2=certificateMatches(debtDemoRecords[1],2,debtEventDate,form.person2.employment)?debtDemoRecords[1]:null;
  const uncertain=form.family==='uncertain'||(form.family==='two'&&form.legalRole!=='father');
  const anyDebtRisk=[form.person1,...(form.family==='two'?[form.person2]:[])].some(p=>p.employment==='dzialalnosc'&&p.debt!=='none');
  const debtDecisions=[form.person1,...(form.family==='two'?[form.person2]:[])].filter(p=>p.employment==='dzialalnosc').map(p=>assessJdgDebt(p.debt));
  const debtBlocks=debtDecisions.some(d=>d.outcome==='blocked');
  const averagedAssessment=assessAveragedRate(isCare?(carePlan?.eventDate||''):form.birthDate,averagedApplicationDate,isCare?Boolean(carePlan):form.actual);
  const maternalEligibility=assessEligibility({kind:'maternity',employment:form.person1.employment,insured:form.person1.insured as InsuranceAnswer,coverage:isCare?{...coverage1,postInsuranceException:'none'}:coverage1,eventDate:isCare?(carePlan?.eventDate||''):form.birthDate,eventConfirmed:isCare?Boolean(carePlan):form.actual,debt:form.person1.debt,demoSource:demoInsuranceOwners[0],demoDebtSource:Boolean(currentDebt1)});
  const secondPeriodStart=leaveEntries.find(e=>e.owner===2)?.start||(isCare?carePlan?.eventDate||'':form.birthDate);
  const secondParentEligibility=assessEligibility({kind:'parental',employment:form.person2.employment,insured:form.person2.insured as InsuranceAnswer,coverage:isCare?{...coverage2,postInsuranceException:'none'}:coverage2,eventDate:secondPeriodStart,eventConfirmed:isCare?Boolean(carePlan):form.actual,debt:form.person2.debt,legalParentConfirmed:secondLegal,demoSource:demoInsuranceOwners[1],demoDebtSource:Boolean(currentDebt2)});
  const sicknessEligibility=sickMode==='yes'?assessEligibility({kind:'pregnancy_sickness',employment:form.person1.employment,insured:form.person1.insured as InsuranceAnswer,coverage:coverage1,eventDate:sickFrom,eventConfirmed:Boolean(sickFrom),debt:form.person1.debt,demoSource:demoInsuranceOwners[0],demoDebtSource:Boolean(currentDebt1),demoEzlaSource:Boolean(ezlaDemoApplied)}):null;
  const riskItems:string[]=[];
  if(sickMode==='yes'&&ezlaDemoApplied)riskItems.push('e-ZLA DEMO: w symulacji użyto '+getEzlaDemoRecord(ezlaDemoApplied).number+'. Nie pobrano zwolnienia z ZUS; okres, kod B i prawo do zasiłku muszą zostać potwierdzone.');
  for(const c of [currentDebt1,currentDebt2])if(c)riskItems.push('Zaświadczenie ZUS DEMO — osoba '+c.owner+': syntetyczne saldo '+moneyPL(c.amountGrosze)+' na dzień '+c.entitlementDate+' (próg '+moneyPL(c.thresholdGrosze)+'). '+c.warning);
  if(demoInsuranceOwners.some(Boolean))riskItems.push('ZUS DEMO: zastosowano syntetyczne dane ubezpieczeniowe, niepotwierdzone przez ZUS. Wynik ma wyłącznie charakter testowy.');
  if(!form.actual)riskItems.push('Data porodu jest przewidywana. Harmonogram należy przeliczyć po narodzinach.');
  if(special)riskItems.push('Okoliczności szczególne mogą zmieniać wymiar i warunki świadczeń. Wymagana indywidualna analiza w ZUS.');
  if(uncertain)riskItems.push('Status prawny drugiego rodzica nie jest potwierdzony. Nie przypisujemy mu automatycznie okresu świadczenia.');
  if(form.family!=='two')riskItems.push('Brak drugiej osoby w planie nie przenosi automatycznie jej '+l.individualWeeks+'-tygodniowej części na wnioskodawczynię.');
  for(const [i,p] of [form.person1,...(form.family==='two'?[form.person2]:[])].entries()){
    if(p.insured!=='tak'||p.employment==='inne')riskItems.push(`Osoba ${i+1}: prawo do zasiłku zależy od potwierdzenia tytułu i ochrony ubezpieczeniowej.`);
    if(p.employment==='dzialalnosc'){
      if(p.debt==='over')riskItems.push(`Osoba ${i+1}: zadłużenie powyżej 1% minimalnego wynagrodzenia może blokować zasiłek. Sprawdź spłatę lub układ ratalny w ZUS (art. 2a).`);
      if(p.debt==='application')riskItems.push(`Osoba ${i+1}: samo złożenie wniosku o raty nie jest równoznaczne z zawarciem układu ratalnego.`);
      if(p.debt==='installments')riskItems.push(`Osoba ${i+1}: istniejący układ ratalny wymaga oceny jego zakresu i terminowego wykonywania; sprawdź status w ZUS.`);
      if(p.debt==='unknown')riskItems.push(`Osoba ${i+1}: przed złożeniem wniosku sprawdź saldo składek społecznych na eZUS.`);
    }
  }
  debtDecisions.forEach(d=>{if(d.outcome!=='clear')riskItems.push(d.message);});
  if(variant==='averaged'&&averagedAssessment!=='eligible_for_review')riskItems.push('Nie potwierdzono spełnienia warunków wniosku o stawkę '+formatRate(rules.averagedRatePercent)+'. Nie przyznawaj jej automatycznie.');
  if(maternalEligibility.status!=='possible')riskItems.push('Prawo do macierzyńskiego: '+maternalEligibility.label+'. '+maternalEligibility.details.join(' '));
  if(form.family==='two'&&secondParentEligibility.status!=='possible')riskItems.push('Drugi rodzic: '+secondParentEligibility.label+'. '+secondParentEligibility.details.join(' '));
  if(sicknessEligibility&&sicknessEligibility.status!=='possible')riskItems.push('Chorobowy w ciąży: '+sicknessEligibility.label+'. '+sicknessEligibility.details.join(' '));
  const canPlan=!special&&form.person1.employment!==''; // Plan dni można pokazać nawet bez prawa do wypłaty; kwot nie potwierdzamy.
  let careFlex:FlexibleResult|null=null;
  let careCalcError='';
  if(isCare&&carePlan){try{careFlex=calculateCarePeriods(carePlan,leaveEntries,secondEligible);}catch(ex){careCalcError=ex instanceof Error?ex.message:'Nie można obliczyć okresów opiekuna.';}}
  let flexPlan:FlexibleResult|null=null;
  let planError='';
  if(form.birthDate&&leaveEntries.length){
    try{flexPlan=calculateFlexiblePlan(form.birthDate,form.children,leaveEntries,secondEligible,rules);}
    catch(e){planError=e instanceof Error?e.message:'Nieprawidłowe okresy.';}
  } else if(form.birthDate){planError='Dodaj co najmniej jeden okres urlopu rodzicielskiego.';}
  // Lista kontrolna współdzieli dokładnie te same okresy i dane co harmonogram.
  const documentInput:DocumentPlanInput={
    birthDate:form.birthDate,actualBirth:form.actual,employment1:form.person1.employment,
    employment2:form.person2.employment,secondEligible,entries:flexPlan?.entries||[],
    variant,sickness:sickMode==='yes',debtRisk:anyDebtRisk
  };
  const readinessInput:ApplicationReadinessInput={
    mode:isCare?(form.special==='adoption'?'adoption':'foster'):'birth',
    actualEvent:isCare?Boolean(carePlan):form.actual,
    applicantEmployment:form.person1.employment,secondEmployment:form.person2.employment,
    secondIncluded:form.family==='two',
    applicantEligibility:maternalEligibility.status,
    secondEligibility:form.family==='two'?secondParentEligibility.status:undefined,
    insuranceStartVerified:Boolean(coverage1.startDate)&&!demoInsuranceOwners[0],
    secondInsuranceStartVerified:Boolean(coverage2.startDate)&&!demoInsuranceOwners[1],
    debtRisk:anyDebtRisk,sickness:!isCare&&sickMode==='yes',
    codeBConfirmed:coverage1.ezlaCodeB==='yes'&&!ezlaDemoApplied,
    ezlaDemoSource:sickMode==='yes'&&Boolean(ezlaDemoApplied),
    variant,averagedAssessment,
    rules:isCare?undefined:rules,
    tasks:isCare?[]:createDocumentPlan(documentInput,rules),
    care:isCare?carePlan:undefined
  };
  const formsInput:FormsDemoInput={
    mode:isCare?(form.special==='adoption'?'adoption':'foster'):'birth',
    eventDate:isCare?(carePlan?.eventDate||''):form.birthDate,
    eventConfirmed:isCare?Boolean(carePlan):form.actual,
    childCount:form.children,
    employment1:form.person1.employment,employment2:form.family==='two'?form.person2.employment:'',
    insured1:form.person1.insured==='tak',insured2:form.family==='two'&&form.person2.insured==='tak',
    maternityStart:isCare?(carePlan?.maternity.start||''):(flexPlan?.maternity.start||''),
    maternityEnd:isCare?(carePlan?.maternity.end||''):(flexPlan?.maternity.end||''),
    periods:isCare?(careFlex?.entries||[]):(flexPlan?.entries||[]),
    variant,rules:isCare?undefined:rules
  };
  const checklistScope=JSON.stringify({
    form,care:isCare?care:null,coverage1,coverage2,demoInsuranceOwners,debtDemoRecords,leaveEntries,adminRevision:adminConfig.revision,adminRules:rules,
    maternityUsedDays,variant,averagedApplicationDate,sickMode,sickFrom,sickTo,ezlaDemoApplied
  });
  const activeChecklist=checklistState.scope===checklistScope?checklistState.values:{};
  const toggleChecklist=(id:string,value:boolean)=>setChecklistState(prev=>({
    scope:checklistScope,values:{...(prev.scope===checklistScope?prev.values:{}),[id]:value}
  }));
  const clearChecklist=()=>setChecklistState({scope:checklistScope,values:{}});
  // Dane nagłówka i terminu 21 dni. Okresy rodzicielskie pochodzą wyłącznie z flexibleLeave.
  const plan=form.birthDate?calculateLeavePlan({birthDate:form.birthDate,children:form.children,parent1Weeks:0,parent2Weeks:0,secondParentEligible:false},rules):null;
  if(flexPlan)riskItems.push(...flexPlan.warnings);
  const calculate=()=>{
    if(!Number.isInteger(maternityUsedDays)||maternityUsedDays<0||maternityUsedDays>l.maternityDays){setError('Podaj poprawną liczbę wykorzystanych dni urlopu macierzyńskiego.');return;}
    if(!canPlan){setError('Nie można automatycznie wyznaczyć planu dla sytuacji szczególnej. Wymagana indywidualna analiza ZUS.');return;}
    if(!flexPlan){setError(planError||'Popraw okresy urlopu rodzicielskiego.');return;}
    go(3);
  };
  return <div className="app-shell"><header className="site-header"><div className="header-inner"><div className="brand-mark">✳</div><div className="brand">Rodzina<span>360</span></div><span className="header-tag">HackNation 2026 · Planer urlopów</span>
    <MobywatelLoginDemo session={mobywatelDemoSession}
      onLogin={setMobywatelDemoSession} onLogout={()=>setMobywatelDemoSession(null)}/>
   </div></header><main>
    <div className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> Zasiłkowy Przewodnik Przyszłego Rodzica</div><h1>Wasze dni.<br/><span>Wasz wspólny plan.</span></h1><p>Sprawdź, ile dni przysługuje każdemu rodzicowi, zaplanuj okresy opieki i dowiedz się, jakie wnioski złożyć w terminie.</p><div className="hero-points"><span>✓ Dni i terminy</span><span>✓ Podział między rodziców</span><span>✓ Formalności ZUS</span></div></div><div className="hero-visual" aria-hidden="true"><div className="halo halo-one"/><div className="halo halo-two"/><div className="visual-card"><span className="visual-icon">♡</span><div className="visual-title">Każdy dzień<br/>ma znaczenie.</div><div className="visual-caption">Urlopy • ZUS • Rodzina</div><div className="visual-bars"><span/><span/><span/></div></div></div></div>
    <AdminPanelDemo config={adminConfig} onApply={applyAdminDemoConfig} onReset={resetAdminDemoConfig}/>
    {experimental&&<div className="admin-experimental-banner" role="alert">EKSPERYMENT ADMIN DEMO — zmodyfikowane stawki lub limity NIE są aktualnym prawem ani decyzją ZUS. Obowiązujące wartości: <a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc" target="_blank" rel="noopener noreferrer">ZUS ↗</a>. Wersja: {adminConfig.revision}.</div>}
    <nav className="progress-track" aria-label="Etapy planowania">{([{n:1,title:'Twoja sytuacja',desc:'Dziecko i ubezpieczenie'},{n:2,title:'Zaplanuj urlopy',desc:'Urlopy i e-ZLA w ciąży'},{n:3,title:'Twój plan',desc:'Dni, terminy, ryzyka'},{n:4,title:'Symulacja wypłat',desc:'Orientacyjne kwoty brutto'}] as const).map((v,i)=><React.Fragment key={v.n}>{i>0&&<div className={'progress-line '+(stage>=v.n?'done':'')}/>}<div className={'progress-step '+(stage===v.n?'current':stage>v.n?'completed':'upcoming')} aria-current={stage===v.n?'step':undefined}><div className="progress-dot">{stage>v.n?'✓':v.n}</div><div className="progress-label">{v.title}<small>{v.desc}</small></div></div></React.Fragment>)}</nav>
    <PueEzUSDemo secondAvailable={form.family==='two'} allowSicknessImport={!isCare}
      onInsuranceImport={importZusInsuranceDemo} onEzlaImport={applyEzlaDemo}/>
    {mobywatelDemoSession&&<div className="moby-demo-session-info" role="status">
      <span>mObywatel · DEMO</span>
      <p>Sesja demonstracyjna: {mobywatelDemoSession.displayName}. Nie pobrano danych osobowych ani informacji z ZUS. Formularz wypełniasz samodzielnie; symulacja nie potwierdza tożsamości ani prawa do zasiłku.</p>
    </div>}
    {stage>1&&(currentDebt1||currentDebt2)&&<div className="zus-debt-persistent" role="note">
      <strong>Zaświadczenie o zadłużeniu · ZUS DEMO</strong>
      <p>{[currentDebt1,currentDebt2].filter((v):v is ZusDebtCertificate=>Boolean(v)).map(c=>'Osoba '+c.owner+': '+moneyPL(c.amountGrosze)+' na dzień '+c.entitlementDate+'; próg '+moneyPL(c.thresholdGrosze)).join(' · ')}. Wyłącznie dane syntetyczne, nie potwierdzone przez ZUS.</p>
    </div>}
    {demoCase&&<div className="planner-card" role="status" style={{background:'#fff9ea',border:'1px solid #f0d69c',marginBottom:20}}>
      <h3 style={{margin:'0 0 8px'}}>Przykład ZUS: {demoCase.id} · {demoCase.title}</h3>
      <p style={{margin:'0 0 8px'}}>Dane wprowadzone automatycznie z przygotowanego opisu sprawy. Nieznane pola NIE zostały uznane za potwierdzone.</p>
      <details><summary>Co potwierdzono, a czego brakuje?</summary>
       <p>Fakty ze sprawy:</p><ul>{demoCase.sourceFacts.map((v,i)=><li key={i}>{v}</li>)}</ul>
       <p>Niepotwierdzone dane:</p><ul>{demoCase.unknowns.map((v,i)=><li key={i}>{v}</li>)}</ul>
       <p>Założenia i ograniczenia:</p><ul>{demoCase.assumptions.map((v,i)=><li key={i}>{v}</li>)}</ul>
      </details>
      <p className="field-hint">Możesz edytować okresy w kroku 2; zmodyfikowany plan będzie już Twoją symulacją, a nie odtworzeniem sprawy konkursowej.</p>
      <button type="button" className="secondary-button" onClick={()=>{setDemoCase(null);setForm(defaultForm);setLeaveEntries([]);setEntriesBirthKey('');setCoverage1(emptyCoverage());setCoverage2(emptyCoverage());setDemoInsuranceOwners([false,false]);setDebtDemoRecords([null,null]);go(1);}}>Wyczyść przykład i zacznij od nowa</button>
     </div>}
    {stage===1?<section className="form-section"><div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 1 Z 4</p><h2>Twoja sytuacja</h2><p>Podaj sytuację rodzinną oraz tytuł do ubezpieczenia chorobowego. Dane finansowe dotyczące zwolnienia uzupełnisz w kroku 2.</p></div><div className="section-decoration">01 / 04</div></div>
      <div className="family-card" style={{marginBottom:22}}>
        <label>Jakiej sytuacji dotyczy plan?
          <select value={form.special} onChange={e=>{setForm(f=>({...f,special:e.target.value as Special}));setCarePlan(null);setError('');}}>
           <option value="none">Urodzenie dziecka</option>
           <option value="adoption">Przysposobienie — adopcja</option>
           <option value="foster">Rodzina zastępcza niezawodowa</option>
           <option value="loss">Śmierć dziecka / rodzica — konsultacja ZUS</option>
           <option value="other">Wcześniactwo, hospitalizacja lub inna sytuacja — konsultacja ZUS</option>
          </select>
        </label>
      </div>
      {adminConfig.features.supportDirectory&&(form.special==='loss'||form.special==='other')&&<SupportDirectory initialTopic={initialSupportTopic(form.special)}/>}
      {adminConfig.features.officialLinks&&<OfficialRightsLinks input={{mode:form.special==='none'?'birth':form.special,employment1:form.person1.employment,employment2:form.person2.employment,secondIncluded:form.family==='two',averaged:variant==='averaged'}} compact/>}
      <ZusInsuranceImport secondAvailable={form.family==='two'}
        demoOwners={demoInsuranceOwners} onApply={importZusInsuranceDemo}
        onClear={clearZusInsuranceDemo}/>
      {!isCare&&!experimental&&<CaseExplorer onStart={startCase}/>}
      {!isCare&&experimental&&<p className="admin-demo-warning" role="note">Przykłady ZUS są sprawdzane na obowiązujących parametrach 2026. W trybie eksperymentalnym nie można ich porównywać z innymi limitami. Przywróć oficjalne wartości, aby przetestować przykłady konkursowe.</p>} 

      <form onSubmit={firstNext}>{isCare?<CareProfileForm kind={form.special==='adoption'?'adoption':'foster'} value={care} onChange={v=>{if(v.acceptanceDate!==care.acceptanceDate||v.courtFilingDate!==care.courtFilingDate)invalidateDebtDemo();setCare(v);}} children={form.children} setChildren={v=>setForm(f=>({...f,children:v}))}/>:<div className="family-card"><div className="family-top"><span className="mini-icon">⌁</span><h3>Informacje o dziecku</h3></div><div className="family-fields"><label>Data porodu<input type="date" value={form.birthDate} required onChange={e=>{invalidateDebtDemo();setForm(f=>({...f,birthDate:e.target.value}));}}/></label><label>Rodzaj daty<select value={form.actual?'actual':'planned'} onChange={e=>setForm(f=>({...f,actual:e.target.value==='actual'}))}><option value="planned">Przewidywana</option><option value="actual">Faktyczna data urodzenia</option></select></label><label>Liczba dzieci przy jednym porodzie<select value={form.children} onChange={e=>setForm(f=>({...f,children:Number(e.target.value)}))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n===5?'5 lub więcej':n}</option>)}</select></label></div></div>}
      <div className="family-card"><div className="family-top"><span className="mini-icon">⌁</span><h3>Sytuacja rodzinna i prawna</h3></div><div className="family-fields"><label>Czy uwzględniasz drugiego rodzica w planie?<select value={form.family} onChange={e=>setForm(f=>({...f,family:e.target.value as Family}))}><option value="two">Tak, uwzględniam drugiego rodzica</option><option value="one">{isCare?'Nie – planuję tylko dla jednego opiekuna':'Nie – planuję tylko dla osoby rodzącej'}</option><option value="uncertain">Nie wiem / status prawny jest niejasny</option></select></label>{form.family==='two'&&<label>Status drugiej osoby<select value={form.legalRole} onChange={e=>setForm(f=>({...f,legalRole:e.target.value as LegalRole}))}><option value="father">{isCare?'Drugi opiekun – potwierdzony status prawny':'Ojciec dziecka – ustalone ojcostwo'}</option><option value="legal_parent">Inny opiekun prawny – wymaga sprawdzenia dokumentów</option><option value="partner">Partnerka / partner bez potwierdzonego rodzicielstwa</option><option value="other">Inna / niejasna sytuacja</option></select></label>}</div><p className="field-hint">Rozwód i życie osobno nie wykluczają automatycznie praw rodzicielskich. W nietypowych sytuacjach aplikacja wskaże konieczność weryfikacji.</p></div>
      <div className="parents-grid"><ParentForm title={isCare?'Opiekun / wnioskodawca':'Osoba rodząca'} value={form.person1} onChange={v=>updatePerson('person1',v)}/>{form.family==='two'&&<ParentForm title="Druga osoba w planie" value={form.person2} onChange={v=>updatePerson('person2',v)}/>}</div>
      <ZusDebtCertificateDemo employment1={form.person1.employment} employment2={form.family==='two'?form.person2.employment:''}
        eventDate={debtEventDate} eventConfirmed={debtEventConfirmed}
        certificates={debtDemoRecords} onIssue={issueDebtDemo} onClear={clearDebtDemo}/>
      {error&&<p className="validation" role="alert">{error}</p>}<div className="form-footer"><p>Przetwarzanie formularza odbywa się lokalnie w przeglądarce.</p><button className="primary-button" type="submit">Dalej: zaplanuj urlopy <span>→</span></button></div></form></section>
    :stage===2&&isCare&&carePlan?<CareStage2
       plan={carePlan} entries={leaveEntries} setEntries={setLeaveEntries}
       secondEligible={secondEligible} variant={variant} setVariant={setVariant}
       applicationDate={averagedApplicationDate} setApplicationDate={setAveragedApplicationDate}
       usedDays={maternityUsedDays} setUsedDays={setMaternityUsedDays}
       person1={maternalEligibility} person2={secondParentEligibility} familyTwo={form.family==='two'}
       coverage1={coverage1} setCoverage1={setCoverage1} coverage2={coverage2} setCoverage2={setCoverage2}
       error={careError||careCalcError} calculation={careFlex}
       onBack={()=>go(1)} onNext={()=>{if(!Number.isInteger(maternityUsedDays)||maternityUsedDays<0||maternityUsedDays>carePlan.maternityDays){setCareError('Nieprawidłowe wykorzystane dni.');return;}
         if(!careFlex){setCareError(careCalcError||'Uzupełnij okresy.');return;}
         setCareError('');go(3);}}
      />
    :stage===2?<section className="form-section"><div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 2 Z 4</p><h2>Zaplanuj urlopy i zwolnienie w ciąży</h2><p>Podziel tygodnie między rodziców. Jeżeli byłaś, jesteś lub będziesz na e-ZLA w ciąży, sprawdź też dni i świadczenie chorobowe.</p></div><div className="section-decoration">02 / 04</div></div>
      <div className="planner-card"><h3>Weryfikacja prawa do świadczeń ZUS</h3>
        {demoInsuranceOwners.some(Boolean)&&<p className="zus-import-disclaimer">ZUS DEMO — dane syntetyczne z kroku 1. Nie są potwierdzeniem ubezpieczenia; wynik wymaga weryfikacji.</p>}
        <p>Poradnik sprawdza odrębnie prawo do zasiłku macierzyńskiego i chorobowego w ciąży. Wprowadź dane z eZUS i sprawdź status; samo ubezpieczenie „tak” nie wystarcza do decyzji.</p>
        <EntitlementBadge result={maternalEligibility}/>
        {form.family==='two'&&<EntitlementBadge result={secondParentEligibility}/>}
        {sicknessEligibility&&<EntitlementBadge result={sicknessEligibility}/>}
      </div>
      <CoverageQuestions title="osoba rodząca" coverage={coverage1} onChange={v=>{setCoverage1(v);setSickResult(null);}} forSickness={sickMode==='yes'}/>
      {form.family==='two'&&<CoverageQuestions title="drugi rodzic" coverage={coverage2} onChange={setCoverage2} forSickness={false}/>}
      <div className="stats-grid"><div className="stat-card"><span>Urlop macierzyński</span><strong>{l.maternityDays} dni</strong><small>{l.maternityWeeks} tygodni</small></div><div className="stat-card"><span>Urlop rodzicielski – łącznie</span><strong>{l.parentalDays} dni</strong><small>{l.parentalWeeks} tygodni</small></div><div className="stat-card"><span>Nieprzenoszalne na rodzica</span><strong>{l.individualDays} dni</strong><small>{l.individualWeeks} tygodni</small></div></div>
      <div className="planner-card"><h3>Wykorzystany urlop macierzyński</h3><p>Wpisz dni już wykorzystane z przysługujących {l.maternityDays} dni. Nie zmienia to puli urlopu rodzicielskiego.</p><label>Wykorzystano dni urlopu macierzyńskiego<input type="number" min="0" max={l.maternityDays} step="1" value={maternityUsedDays} onChange={e=>setMaternityUsedDays(Number(e.target.value))}/></label><p className="field-hint">Pozostało: {Math.max(0,maternityRemainingDays)} dni. Daty macierzyńskiego w osi czasu zakładają początek w dniu urodzenia. Jeżeli urlop zaczął się przed porodem albo został przejęty przez innego rodzica, sprawdź indywidualną historię w ZUS.</p></div>
      <LeavePeriodsEditor entries={leaveEntries} setEntries={setLeaveEntries} secondEligible={secondEligible}/>
      <div className="planner-card"><h3>Bilans okresów</h3>
        {flexPlan?<><div className="stats-grid"><div className="stat-card"><span>Już wykorzystano</span><strong>{flexPlan.usedDays} dni</strong></div><div className="stat-card"><span>Zaplanowano</span><strong>{flexPlan.plannedDays} dni</strong></div><div className="stat-card"><span>Pozostało w rodzinie</span><strong>{flexPlan.remainingFamilyDays} dni</strong></div></div>
        <p>Osoba rodząca: wykorzystano {flexPlan.usedByParent[0]} dni, zaplanowano {flexPlan.plannedByParent[0]} dni, można jeszcze przydzielić {Math.min(flexPlan.remainingByParent[0],flexPlan.remainingFamilyDays)} dni (limit indywidualny: {flexPlan.remainingByParent[0]}).</p>
        {secondEligible&&<p>Drugi rodzic: wykorzystano {flexPlan.usedByParent[1]} dni, zaplanowano {flexPlan.plannedByParent[1]} dni, można jeszcze przydzielić {Math.min(flexPlan.remainingByParent[1],flexPlan.remainingFamilyDays)} dni (limit indywidualny: {flexPlan.remainingByParent[1]}).</p>}
        <p className="field-hint">Okresy mogą się pokrywać pomiędzy rodzicami. Każdy dzień każdego rodzica zmniejsza wspólną pulę.</p>
        </>:<p className="validation" role="alert">{planError}</p>}</div>
      <div className="planner-card"><h3>Wariant wypłaty zasiłku macierzyńskiego</h3><p>Wybór wariantu wpływa na procent podstawy świadczenia, nie na liczbę dni.</p><div className="choice-grid"><label className={'choice-card '+(variant==='standard'?'selected':'')}><input type="radio" name="variant" value="standard" checked={variant==='standard'} onChange={()=>setVariant('standard')}/><strong>Standardowy: {formatRate(rules.maternityRatePercent)} + {formatRate(rules.parentalRatePercent)}</strong><small>{formatRate(rules.maternityRatePercent)} za okres macierzyński, {formatRate(rules.parentalRatePercent)} za rodzicielski.</small></label><label className={'choice-card '+(variant==='averaged'?'selected':'')}><input type="radio" name="variant" value="averaged" checked={variant==='averaged'} onChange={()=>setVariant('averaged')}/><strong>Uśredniony: {formatRate(rules.averagedRatePercent)}</strong><small>Wymaga odpowiedniego wniosku w terminie 21 dni po porodzie; {l.individualWeeks} tygodni wyłącznie drugiego rodzica – {formatRate(rules.parentalRatePercent)}.</small></label></div>{variant==='averaged'&&<div><label>Data złożenia odpowiedniego wniosku (nie planowana)<input type="date" value={averagedApplicationDate} onChange={e=>setAveragedApplicationDate(e.target.value)}/></label><p className="field-hint">{averagedAssessment==='deadline_missed'?'Termin 21 dni został przekroczony — nie stosujemy automatycznie 81,5%.':averagedAssessment==='eligible_for_review'?'Termin 21 dni wygląda na zachowany, ale zakres wniosku i prawo do świadczenia wymagają weryfikacji.':'Do potwierdzenia terminu 21 dni potrzebna jest faktyczna data urodzenia dziecka i data złożenia wniosku.'}</p></div>}</div>
      <div className="planner-card" aria-label="Zasiłek chorobowy w ciąży">
        <h3>Byłam, jestem lub będę na zwolnieniu w ciąży — co mi przysługuje?</h3>
        <p>Zasiłek chorobowy w ciąży: co do zasady 100% podstawy wymiaru i okres zasiłkowy do 270 dni. Dla pracownicy pierwsze 33 lub 14 dni choroby w roku kalendarzowym mogą być wynagrodzeniem chorobowym od pracodawcy, a nie zasiłkiem z FUS.</p>
        <div className="choice-grid"><label className={'choice-card '+(sickMode==='none'?'selected':'')}><input type="radio" name="sickMode" checked={sickMode==='none'} onChange={()=>{setSickMode('none');setSickResult(null);setSickError('');}}/><strong>Nie dotyczy mnie e-ZLA w ciąży</strong><small>Przejdź do planowania urlopów.</small></label><label className={'choice-card '+(sickMode==='yes'?'selected':'')}><input type="radio" name="sickMode" checked={sickMode==='yes'} onChange={()=>setSickMode('yes')}/><strong>Byłam / jestem / będę na e-ZLA w ciąży</strong><small>Sprawdź okres i należne świadczenie.</small></label></div>
        <EzlaViewerDemo appliedId={ezlaDemoApplied} onApply={applyEzlaDemo} onClear={clearEzlaDemo}/>
        {sickMode==='yes'&&<>
          <p className="field-hint">Tytuł do ubezpieczenia: {form.person1.employment?employmentLabels[form.person1.employment]:'nie wskazano'} · Ubezpieczenie chorobowe: {form.person1.insured==='tak'?'tak':form.person1.insured==='nie'?'nie':'do weryfikacji'}. Możesz poprawić te dane w kroku 1.</p>
          <div className="allocation-grid">
            <label>Początek e-ZLA<input type="date" value={sickFrom} onChange={e=>{setSickFrom(e.target.value);setSickResult(null);}}/></label>
            <label>Koniec e-ZLA<input type="date" value={sickTo} onChange={e=>{setSickTo(e.target.value);setSickResult(null);}}/></label>
            <label>Limit wynagrodzenia chorobowego pracownika<select value={employerLimit} onChange={e=>{setEmployerLimit(Number(e.target.value) as 14|33);setSickResult(null);}}><option value={33}>33 dni w roku</option><option value={14}>14 dni w roku (odpowiednie osoby po 50. roku życia)</option></select></label>
            <label>Dni wynagrodzenia chorobowego wykorzystane w tym roku<input type="number" min="0" max={employerLimit} value={employerDaysUsed} onChange={e=>{setEmployerDaysUsed(e.target.value);setSickResult(null);}}/></label>
            <label>Dni wykorzystane w obecnym okresie zasiłkowym<input type="number" min="0" max="270" value={sicknessDaysUsed} onChange={e=>{setSicknessDaysUsed(e.target.value);setSickResult(null);}}/></label>
            <label>Potwierdzona miesięczna podstawa wymiaru zasiłku (zł)<input type="number" min="0.01" step="0.01" placeholder="np. 5500,00" value={confirmedBase} onChange={e=>{setConfirmedBase(e.target.value);setSickResult(null);}}/></label>
          </div>
          <label className="used-check"><input type="checkbox" checked={sickEntitlement} onChange={e=>{setSickEntitlement(e.target.checked);setSickResult(null);}}/> Potwierdzam, że prawo do świadczenia zostało sprawdzone (ubezpieczenie, okres wyczekiwania i e-ZLA w ciąży).</label>
          <button type="button" className="secondary-button" onClick={calculateSickness}>Oblicz zasiłek chorobowy w ciąży</button>
          {sickError&&<p className="validation" role="alert">{sickError}</p>}
          {sickResult&&<div className="sickness-result" aria-live="polite"><h4>Wynik dla wskazanego okresu</h4><div className="stats-grid"><div className="stat-card"><span>Łącznie e-ZLA</span><strong>{sickResult.days} dni</strong></div><div className="stat-card"><span>Wynagrodzenie chorobowe</span><strong>{sickResult.employerDays} dni</strong><small>{sickResult.employerGross.toFixed(2)} zł brutto</small></div><div className="stat-card"><span>Zasiłek chorobowy</span><strong>{sickResult.benefitDays} dni</strong><small>{sickResult.benefitGross.toFixed(2)} zł brutto</small></div></div><p>Łącznie: {sickResult.totalGross.toFixed(2)} zł brutto przy potwierdzonej podstawie {Number(confirmedBase).toFixed(2)} zł. Kalkulacja nie zastępuje weryfikacji przez płatnika składek lub ZUS.</p></div>}
          <p className="field-hint">Automatyczny kalkulator obejmuje obecnie tylko standardowy przypadek umowy o pracę, bez przekroczenia roku kalendarzowego. Dla innych tytułów i wyjątków sprawdź <a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-chorobowy/z-ubezpieczenia-chorobowego/prawo-do-zasilku-i-okres-przyslugiwania" target="_blank" rel="noreferrer">zasady ZUS ↗</a>.</p>
        </>}
      </div>
      {anyDebtRisk&&<div className="notice"><span>!</span><div><h3>Sprawdź zadłużenie w ZUS</h3><p>Przy działalności gospodarczej dług składkowy może blokować wypłatę. Spłata lub zawarty i prawidłowo wykonywany układ ratalny wymagają oceny w ZUS. Sam wniosek o raty nie wystarcza.</p><ul>{debtDecisions.filter(d=>d.outcome!=='clear').map((d,i)=><li key={i}>{d.message}</li>)}</ul></div></div>}
      {error&&<p className="validation" role="alert">{error}</p>}<div className="step-actions"><button type="button" className="secondary-button" onClick={()=>go(1)}>← Popraw sytuację</button><button type="button" className="primary-button" onClick={calculate}>Pokaż mój plan <span>→</span></button></div></section>
    :stage===3&&isCare&&carePlan&&careFlex?<CareStage3 plan={carePlan} flex={careFlex} usedDays={maternityUsedDays}
       variant={variant} employment={form.person1.employment} appDate={averagedApplicationDate}
       person1={maternalEligibility} person2={secondParentEligibility} familyTwo={form.family==='two'}
       formsInput={formsInput}
       features={adminConfig.features}
       readinessInput={readinessInput} readinessChecked={activeChecklist}
       onReadinessToggle={toggleChecklist} onReadinessReset={clearChecklist}
       onBack={()=>go(2)} onNext={()=>go(4)} />
    :stage===3?<section className="form-section summary-section"><div className="section-head"><div><p className="section-kicker">PORADNIK · KROK 3 Z 4</p><h2>Twój plan urlopów i formalności</h2><p>{form.actual?'Harmonogram na podstawie daty urodzenia.':'Plan wstępny — daty wymagają aktualizacji po porodzie.'} To jest orientacyjny harmonogram dni, nie potwierdzenie prawa do wypłaty.</p></div><div className="section-decoration">03 / 04</div></div>
      {plan&&flexPlan?<><div className="planner-card"><h3>Wstępna ocena uprawnień ZUS</h3>
        <p className="field-hint">Sam wymiar urlopu w dniach nie oznacza automatycznie przyznania świadczenia.</p>
        <EntitlementBadge result={maternalEligibility}/>
        {form.family==='two'&&<EntitlementBadge result={secondParentEligibility}/>}
        {sicknessEligibility&&<EntitlementBadge result={sicknessEligibility}/>}
      </div><div className="stats-grid"><div className="stat-card"><span>Urlop macierzyński</span><strong>{maternityRemainingDays} dni</strong><small>Pozostało z {plan.maternityDays} dni macierzyńskiego</small></div><div className="stat-card"><span>Urlop rodzicielski – przydzielone</span><strong>{flexPlan.plannedDays} dni</strong><small>{plan.parentalWeeks} tygodni to pełna pula</small></div><div className="stat-card"><span>Pozostało nieprzydzielonych</span><strong>{flexPlan.remainingFamilyDays} dni</strong><small>Nie oznacza prawa do przeniesienia {l.individualWeeks} tygodni</small></div></div>
      <div className="result-tabs"><button type="button" className={resultTab==='days'?'active':''} onClick={()=>setResultTab('days')}>Urlopy i dni</button><button type="button" className={resultTab==='docs'?'active':''} onClick={()=>setResultTab('docs')}>Kalendarz i wnioski</button><button type="button" className={resultTab==='risks'?'active':''} onClick={()=>setResultTab('risks')}>Risk Radar</button></div>
      {resultTab==='days'?<div className="planner-card"><h3>Proponowana oś czasu</h3><p>Rzeczywiste i planowane okresy rodziców — dopuszczalne są okresy równoczesne.</p>
        <Timeline title="Urlop macierzyński / okres zasiłku — osoba rodząca" period={flexPlan.maternity}/>
        {flexPlan.entries.map(e=><Timeline key={e.id} title={(e.owner===1?'Osoba rodząca':'Drugi rodzic')+' · '+(e.used?'wykorzystano':'planowany')} period={{start:e.start,end:e.end,days:e.days}}/>)}
        <p>Wykorzystano: {flexPlan.usedDays} dni. Zaplanowano: {flexPlan.plannedDays} dni. Pozostało: {flexPlan.remainingFamilyDays} dni.</p>
        <p className="field-hint">Łączny wymiar standardowego urlopu rodzicielskiego to {plan.parentalDays} dni, w tym {l.individualWeeks} tygodni nieprzenoszalnych na każdego z uprawnionych rodziców. Osobie na B2B przysługuje ewentualnie zasiłek za okres odpowiadający urlopowi, a nie urlop pracowniczy.</p></div>
      :resultTab==='docs'?<>
        <DocumentRoadmap input={documentInput} rules={rules}/>
        <ApplicationFormsDemo input={formsInput}/>
        {adminConfig.features.civilRegistryDemo&&<CivilRegistryDemo input={{eventDate:form.birthDate,eventConfirmed:form.actual,children:form.children}}/>}
        {adminConfig.features.officialLinks&&<OfficialRightsLinks input={{mode:'birth',employment1:form.person1.employment,employment2:form.person2.employment,secondIncluded:form.family==='two',averaged:variant==='averaged'}} compact/>}
        {adminConfig.features.supportDirectory&&<SupportDirectory compact/>}
        <ApplicationReadiness input={readinessInput} checked={activeChecklist}
          onToggle={toggleChecklist} onReset={clearChecklist}/>
       </>
      :<div className="planner-card"><h3>Ostrzeżenia i weryfikacja</h3>{riskItems.length===0?<p>Nie zaznaczono dodatkowych ryzyk w formularzu. To nie oznacza potwierdzenia prawa przez ZUS.</p>:<ul className="risk-list">{riskItems.map((msg,i)=><li key={i}>{msg}</li>)}</ul>}<div className="notice"><span>ⓘ</span><div><h3>Możliwe działania przy zaległości na B2B</h3><p>Sprawdź saldo składek w eZUS; rozważ uregulowanie zadłużenia lub wystąpienie o układ ratalny. Prawo do konkretnego zasiłku i skutki ugody wymagają potwierdzenia w ZUS. Samo złożenie wniosku o raty nie oznacza spłaty.</p><a href={LOAN} target="_blank" rel="noreferrer">Informacje ZUS o ratach ↗</a></div></div></div>}
      <div className="notice"><span>ⓘ</span><div><h3>Jak rozumieć wyniki?</h3><p>To plan okresów w standardowym przypadku, nie decyzja o przyznaniu zasiłku. Wariant {variant==='standard'?formatRate(rules.maternityRatePercent)+' + '+formatRate(rules.parentalRatePercent):formatRate(rules.averagedRatePercent)} nie zmienia wymiaru dni. Sprawdź dokumenty i szczególne warunki w ZUS. Orientacyjne kwoty brutto pokazujemy osobno w kroku 4 (symulacja, nie decyzja ZUS).</p></div></div></>:<div className="notice" role="alert"><span>!</span><div><h3>Nie można ustalić planu</h3><p>{planError||'Sytuacja wymaga weryfikacji indywidualnej w ZUS.'}</p></div></div>}
      <div className="step-actions"><button className="secondary-button" onClick={()=>go(2)}>← Zmień podział dni</button><button className="secondary-button" onClick={()=>go(1)}>← Dane rodziny</button><button className="primary-button" onClick={()=>go(4)}>Dalej: symulacja wypłat →</button></div></section>
      :isCare&&carePlan?<PaymentSimulator careMode={true}
       maternityDays={carePlan.maternityDays} maternityUsedDays={maternityUsedDays} entries={careFlex?.entries||[]}
       initialBases={[form.person1.base,form.person2.base]} employment={[form.person1.employment,form.person2.employment]}
       insured={[form.person1.insured==='tak',form.person2.insured==='tak']} debts={[form.person1.debt,form.person2.debt]}
       variant={variant} averagedConfirmed={averagedAssessment==='eligible_for_review'} special={carePlan.review}
       sickResult={null} entitlementStatuses={[maternalEligibility.status,secondParentEligibility.status]} onBack={()=>go(3)}/>
      :<PaymentSimulator rules={rules} experimental={experimental} maternityDays={l.maternityDays} maternityUsedDays={maternityUsedDays} entries={flexPlan?.entries||[]} initialBases={[form.person1.base,form.person2.base]} employment={[form.person1.employment,form.person2.employment]} insured={[form.person1.insured==='tak',form.person2.insured==='tak']} debts={[form.person1.debt,form.person2.debt]} variant={variant} averagedConfirmed={averagedAssessment==='eligible_for_review'} special={special} sickResult={sickResult} demoCaseId={demoCase?.id} entitlementStatuses={[maternalEligibility.status,secondParentEligibility.status]} onBack={()=>go(3)}/>}
      <div className="bottom-info"><div><span className="bottom-icon">✧</span><div><h3>Przepisy, nie domysły</h3><p>Reguły standardowych okresów według ZUS i Kodeksu pracy; przypadki szczególne są oddzielone od kalkulacji.</p></div></div><a href={ZUS} target="_blank" rel="noreferrer">Oficjalne informacje ZUS ↗</a></div>
    </main><footer className="site-footer"><span>© 2026 Rodzina360 · HackNation</span><span>Prototyp nie jest oficjalną usługą ZUS</span></footer></div>;
}
const root=document.getElementById('root');
if(!root)throw new Error('Nie znaleziono #root');
createRoot(root).render(<React.StrictMode><App/></React.StrictMode>);
