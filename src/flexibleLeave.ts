import {limits,plusDays,type Period} from './leaveRules.ts';
import type {LegalRules} from './legalConfig.ts';

export type Owner=1|2;
export type LeaveEntry={id:string;owner:Owner;start:string;end:string;used:boolean};
export type EvaluatedEntry=LeaveEntry & {days:number;employerDeadline:string|null};
export type FlexibleResult={
 entries:EvaluatedEntry[];usedDays:number;plannedDays:number;
 usedByParent:[number,number];plannedByParent:[number,number];
 totalDays:number;remainingFamilyDays:number;remainingByParent:[number,number];
 parentalMaxDays:number;maternity:Period;warnings:string[];
};
const ms=86400000;
function day(iso:string):number{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))throw new Error('Wpisz datę w formacie RRRR-MM-DD.');
 const [y,m,d]=iso.split('-').map(Number);
 const v=Date.UTC(y,m-1,d),parsed=new Date(v);
 if(parsed.getUTCFullYear()!==y||parsed.getUTCMonth()!==m-1||parsed.getUTCDate()!==d)throw new Error('Nieprawidłowa data.');
 return v/ms;
}
export function daysInclusive(from:string,to:string):number{
 const n=day(to)-day(from)+1;
 if(n<=0)throw new Error('Koniec okresu nie może być przed początkiem.');
 return n;
}
export function initialEntries(birthDate:string,children:number,secondEligible:boolean,rules?:LegalRules):LeaveEntry[]{
 const l=limits(children,rules),afterMaternity=plusDays(birthDate,l.maternityDays);
 const first={id:'p1-initial',owner:1 as const,start:afterMaternity,end:plusDays(afterMaternity,l.maxOneParentWeeks*7-1),used:false};
 if(!secondEligible)return [first];
 const secondStart=plusDays(first.end,1);
 return [first,{id:'p2-initial',owner:2 as const,start:secondStart,end:plusDays(secondStart,l.individualDays-1),used:false}];
}
export function calculateFlexiblePlan(
 birthDate:string,children:number,entries:LeaveEntry[],secondEligible:boolean,rules?:LegalRules
):FlexibleResult{
 const l=limits(children,rules);
 if(entries.length>5)throw Error('Urlop rodzicielski można podzielić łącznie na maksymalnie 5 części.');
 if(!entries.length)throw Error('Dodaj co najmniej jeden okres urlopu rodzicielskiego.');
 const birth=day(birthDate),endOfYear=day(String(Number(birthDate.slice(0,4))+6)+'-12-31');
 const items:EvaluatedEntry[]=entries.map((e,i)=>{
  if(e.owner!==1&&e.owner!==2)throw Error('Nieprawidłowy rodzic w okresie '+(i+1));
  if(e.owner===2&&!secondEligible)throw Error('Nie można przydzielić okresu drugiej osobie bez potwierdzonego statusu.');
  const days=daysInclusive(e.start,e.end);
  if(day(e.start)<birth)throw Error('Okres rodzicielski nie może się zaczynać przed porodem.');
  if(day(e.end)>endOfYear)throw Error('Okres kończy się po roku kalendarzowym, w którym dziecko kończy 6 lat.');
  if(!e.used&&days%7!==0)throw Error('Planowany okres '+(i+1)+' powinien obejmować całe tygodnie. Niepełny ostatni tydzień wymaga indywidualnej weryfikacji.');
  return {...e,days,employerDeadline:e.used?null:plusDays(e.start,-21)};
 });
 for(const owner of [1,2] as const){
  const by=items.filter(e=>e.owner===owner).sort((a,b)=>a.start.localeCompare(b.start));
  for(let i=1;i<by.length;i++)if(day(by[i].start)<=day(by[i-1].end))
    throw Error('Nakładające się okresy tego samego rodzica: '+(owner===1?'osoba rodząca':'drugi rodzic')+'.');
 }
 const usedByParent:[number,number]=[0,0],plannedByParent:[number,number]=[0,0];
 for(const e of items)(e.used?usedByParent:plannedByParent)[e.owner-1]+=e.days;
 const totals=usedByParent.map((v,i)=>v+plannedByParent[i]);
 const cap=l.maxOneParentWeeks*7;
 if(totals[0]>cap||totals[1]>cap)throw Error('Przekroczono limit jednego rodzica. Co najmniej '+l.individualWeeks+' tygodni drugiego rodzica jest nieprzenoszalne.');
 const totalDays=totals[0]+totals[1];
 if(totalDays>l.parentalDays)throw Error('Przekroczono wspólny limit '+l.parentalDays+' dni.');
 const warnings:string[]=[];
 if(items.some(e=>e.used&&e.days%7!==0))warnings.push('Wcześniej wykorzystane okresy niepełnotygodniowe wymagają potwierdzenia dokumentami ZUS lub pracodawcy.');
 if(items.some(e=>day(e.start)<day(plusDays(birthDate,l.maternityDays))))warnings.push('Jeden z okresów rodzicielskich nakłada się na macierzyński. Wymaga sprawdzenia warunków dla konkretnych rodziców.');
 return {entries:items,usedDays:usedByParent[0]+usedByParent[1],
  plannedDays:plannedByParent[0]+plannedByParent[1],usedByParent,plannedByParent,
  totalDays,remainingFamilyDays:l.parentalDays-totalDays,
  remainingByParent:[cap-totals[0],cap-totals[1]],
  parentalMaxDays:l.parentalDays,
  maternity:{start:birthDate,end:plusDays(birthDate,l.maternityDays-1),days:l.maternityDays},warnings};
}
