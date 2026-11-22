/**
 * Standardowy przypadek urodzenia dziecka, stan zasad: 2026-11-21.
 * Źródła: Kodeks pracy art. 180 i 182(1a), art. 182(1d),
 * ustawa zasiłkowa art. 31; ZUS Poradnik dla rodziców (2026),
 * HackNation Załącznik: maksymalny czas trwania zasiłków.
 * Liczymy okresy, nie przesądzamy indywidualnego prawa do świadczenia.
 */
import {OFFICIAL_RULES,type LegalRules} from './legalConfig.ts';
export const maternityWeeks: Record<number, number> = {1:20, 2:31, 3:33, 4:35, 5:37};
export function limits(children: number,rules:LegalRules=OFFICIAL_RULES as LegalRules) {
  if (!Number.isInteger(children) || children < 1 || children > 5) throw new Error('Liczba dzieci musi wynosić od 1 do 5 (5 oznacza 5 lub więcej).');
  const maternity = rules.maternityWeeks[children-1];
  const parental = children === 1 ? rules.parentalWeeksSingle : rules.parentalWeeksMultiple;
  const individualWeeks=rules.reservedParentWeeks;
  return {maternityWeeks:maternity, maternityDays:maternity*7, parentalWeeks:parental, parentalDays:parental*7, individualWeeks, individualDays:individualWeeks*7, maxOneParentWeeks:parental-individualWeeks};
}
function dateAsUTC(iso:string): Date {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Podaj prawidłową datę w formacie RRRR-MM-DD.');
  const [y,m,d]=iso.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d) throw new Error('Nieprawidłowa data.');
  return dt;
}
export function plusDays(iso:string,days:number):string {
  const dt=dateAsUTC(iso);
  dt.setUTCDate(dt.getUTCDate()+days);
  return dt.toISOString().slice(0,10);
}
export function polishDate(iso:string) {
  return dateAsUTC(iso).toLocaleDateString('pl-PL',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'});
}
export type PlanInput = {birthDate:string; children:number; parent1Weeks:number; parent2Weeks:number; secondParentEligible:boolean};
export type Period={start:string;end:string;days:number};
export type LeavePlan = ReturnType<typeof limits> & {
  parentalPlannedDays:number; parentalUnusedDays:number; parent1Days:number;parent2Days:number;
  maternity:Period;parent1Parental:Period|null;parent2Parental:Period|null;
  averagedApplicationDeadline:string;
  parent1EmployerDeadline:string|null;parent2EmployerDeadline:string|null;
};
function period(start:string,days:number):Period {return {start,end:plusDays(start,days-1),days};}
export function calculateLeavePlan(input:PlanInput,rules?:LegalRules):LeavePlan {
  const l=limits(input.children,rules);
  const a=input.parent1Weeks, b=input.parent2Weeks;
  if (![a,b].every(v=>Number.isInteger(v)&&v>=0)) throw new Error('Liczba tygodni musi być całkowita i nieujemna.');
  if(!input.secondParentEligible && b!==0) throw new Error('Nie można przydzielić dni osobie bez potwierdzonego statusu uprawnionego rodzica.');
  if(a>l.maxOneParentWeeks || b>l.maxOneParentWeeks) throw new Error(`Każdy rodzic może w tym wariancie wykorzystać maksymalnie ${l.maxOneParentWeeks} tygodnie. Pozostałe ${l.individualWeeks} tygodni jest nieprzenoszalne.`);
  if(a+b>l.parentalWeeks) throw new Error('Przekroczono łączny wymiar urlopu rodzicielskiego.');
  const mat=period(input.birthDate,l.maternityDays);
  const afterMaternity=plusDays(mat.end,1);
  const first = a ? period(afterMaternity,a*7):null;
  const secondStart=first?plusDays(first.end,1):afterMaternity;
  const second = b ? period(secondStart,b*7):null;
  return {...l, maternity:mat,parent1Parental:first,parent2Parental:second,
    parent1Days:a*7,parent2Days:b*7,parentalPlannedDays:(a+b)*7,
    parentalUnusedDays:(l.parentalWeeks-a-b)*7,
    averagedApplicationDeadline:plusDays(input.birthDate,21),
    parent1EmployerDeadline:first?plusDays(first.start,-21):null,
    parent2EmployerDeadline:second?plusDays(second.start,-21):null};
}
