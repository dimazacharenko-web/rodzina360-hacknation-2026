/** Rodzina360 — symulacja kwot brutto, nie decyzja ZUS.
 * Podstawą jest MIESIĘCZNA podstawa wymiaru zasiłku, już ustalona przez płatnika,
 * nie wynagrodzenie brutto / przychód JDG. Dzienna kwota = podstawa / 30.
 * Zasady stawek: ZUS "Wysokość zasiłku macierzyńskiego" (2026).
 */
import {daysInclusive} from './flexibleLeave.ts';
import {OFFICIAL_RULES,type LegalRules,legalRulesChanged} from './legalConfig.ts';
export type RateVariant='standard'|'averaged';
export type MoneyPeriod={id:string;owner:1|2;type:'maternity'|'parental';days:number;used:boolean;rate:number;dailyGross:number;gross:number;start?:string;end?:string};
export type PersonMoneyStatus='simulated'|'not_calculated'|'requires_zus';
export type MoneyParent={owner:1|2;base:number|null;status:PersonMoneyStatus;reason:string|null;periods:MoneyPeriod[];futureGross:number;historicalGross:number};
export type MoneyInput={
 maternityDays:number;maternityUsedDays:number;
 parentalEntries:{id:string;owner:1|2;start:string;end:string;used:boolean;days:number}[];
 bases:[number|null,number|null];insured:[boolean,boolean];
 employment:['etat'|'zlecenie'|'dzialalnosc'|'inne'|'','etat'|'zlecenie'|'dzialalnosc'|'inne'|''];
 debts:['none'|'small'|'over'|'installments'|'application'|'unknown','none'|'small'|'over'|'installments'|'application'|'unknown'];
 variant:RateVariant;averagedConfirmed:boolean;special:boolean;
 rules?:LegalRules;
 entitlementStatuses?:['possible'|'review'|'blocked_standard','possible'|'review'|'blocked_standard'];
};
export type MoneyResult={parents:[MoneyParent,MoneyParent];futureGross:number;historicalGross:number;warnings:string[];estimated:true};
function isMoney(v:number|null):v is number{return typeof v==='number'&&Number.isFinite(v)&&v>0&&Math.abs(v*100-Math.round(v*100))<1e-6;}
function cents(x:number){return Math.round((x+Number.EPSILON)*100);}
function amount(base:number,days:number,rate:number){ // za dzień: kwota dzienna od podstawy / 30 z zaokrągleniem do grosza
 const daily=cents(base/30*rate)/100;
 return {daily,gross:cents(daily*days)/100};
}
export function calculateMoney(input:MoneyInput):MoneyResult{
 if(!Number.isInteger(input.maternityDays)||input.maternityDays<0)throw Error('Nieprawidłowy wymiar macierzyńskiego.');
 if(!Number.isInteger(input.maternityUsedDays)||input.maternityUsedDays<0||input.maternityUsedDays>input.maternityDays)throw Error('Nieprawidłowe wykorzystane dni macierzyńskiego.');
 const rules=input.rules??OFFICIAL_RULES;
 const warnings=['Symulacja brutto na podstawie podanej miesięcznej podstawy zasiłku; nie wyliczamy podstawy z przychodów, PIT ani potrąceń.'];
 if(input.rules&&legalRulesChanged(input.rules))warnings.push('EKSPERYMENT ADMIN DEMO: stawki świadczeń zostały zmienione do testów i nie są oficjalnymi parametrami ZUS.');
 if(input.variant==='averaged'&&!input.averagedConfirmed)warnings.push('Stawka uśredniona '+rules.averagedRatePercent+'% nie została potwierdzona właściwym wnioskiem. Poniższy wynik jest wyłącznie wariantem hipotetycznym.');
 if(input.special)warnings.push('Sytuacja szczególna wymaga indywidualnego rozliczenia w ZUS. Nie symulujemy kwoty.');
 const result=([1,2] as const).map(owner=>{
  const idx=owner-1,base=input.bases[idx],entries=input.parentalEntries.filter(e=>e.owner===owner);
  const eligible=input.insured[idx]&&input.employment[idx]!==''&&input.employment[idx]!=='inne';
  const debtRisk=input.employment[idx]==='dzialalnosc'&&input.debts[idx]!=='none'&&input.debts[idx]!=='small';
  let reason:string|null=null;
  if(!eligible)reason='Brak potwierdzonego ubezpieczenia i tytułu — nie można określić prawa do wypłaty.';
  else if(debtRisk)reason='JDG: stan zadłużenia lub układu ratalnego wymaga decyzji ZUS. Nie traktuj symulacji jako należnej wypłaty.';
  else if(input.special)reason='Szczególna sytuacja prawna — wymagana weryfikacja ZUS.';
  else if(input.entitlementStatuses?.[idx]==='blocked_standard')reason='Wstępna weryfikacja prawa wykazała brak podstaw do świadczenia w zwykłym trybie. Nie pokazujemy tej kwoty jako należnej.';
  else if(!isMoney(base))reason='Brak potwierdzonej miesięcznej podstawy wymiaru zasiłku. Wpisz ją, aby zobaczyć symulację.';
  const periods:MoneyPeriod[]=[];
  if(isMoney(base)&&eligible&&!input.special){
   const maternityRate=(input.variant==='averaged'?rules.averagedRatePercent:rules.maternityRatePercent)/100;
   if(owner===1){
    for(const [used,days] of [[true,input.maternityUsedDays],[false,input.maternityDays-input.maternityUsedDays]] as const)
     if(days>0){const m=amount(base,days,maternityRate);periods.push({id:used?'maternity-used':'maternity-future',owner,type:'maternity',days,rate:maternityRate,used,dailyGross:m.daily,gross:m.gross});}
   }
   for(const e of entries){
    if(!Number.isInteger(e.days)||e.days<1||daysInclusive(e.start,e.end)!==e.days)throw Error('Niespójny okres urlopu rodzicielskiego: '+e.id);
    // Uśrednienie dotyczy tu tylko osoby rodzącej, pod warunkiem skutecznego wniosku.
    const rate=(owner===1&&input.variant==='averaged'?rules.averagedRatePercent:rules.parentalRatePercent)/100;
    const m=amount(base,e.days,rate);
    periods.push({id:e.id,owner,type:'parental',days:e.days,rate,used:e.used,dailyGross:m.daily,gross:m.gross,start:e.start,end:e.end});
   }
  }
  const futureGross=cents(periods.filter(p=>!p.used).reduce((s,p)=>s+p.gross,0))/100;
  const historicalGross=cents(periods.filter(p=>p.used).reduce((s,p)=>s+p.gross,0))/100;
  return {owner,base:isMoney(base)?base:null,
   status:(reason?'requires_zus':'simulated') as PersonMoneyStatus,reason,periods,futureGross,historicalGross};
 }) as [MoneyParent,MoneyParent];
 if(result[0].periods.length&&input.variant==='averaged')warnings.push('Stawkę '+rules.averagedRatePercent+'% dla osoby rodzącej stosujemy tylko w wariancie spełniającym warunki art. 31; nieprzenoszalna część drugiej osoby jest liczona według stawki '+rules.parentalRatePercent+'%.');
 if(input.entitlementStatuses?.some(x=>x==='review'))warnings.push('Prawo do zasiłku wymaga indywidualnej weryfikacji. Nawet przy potwierdzonej podstawie kwoty pozostają wyłącznie hipotetyczną symulacją.');
 if(result.some(p=>p.reason))warnings.push('Niektóre kwoty są ukryte lub warunkowe. ZUS może ustalić inne prawo do świadczenia i inną podstawę.');
 return {parents:result,futureGross:cents(result.reduce((s,p)=>s+(p.status==='simulated'?p.futureGross:0),0))/100,
 historicalGross:cents(result.reduce((s,p)=>s+(p.status==='simulated'?p.historicalGross:0),0))/100,warnings,estimated:true};
}
export function moneyPL(v:number){return v.toLocaleString('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2});}
