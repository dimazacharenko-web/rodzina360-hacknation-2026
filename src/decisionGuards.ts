/** Rodzina360 — guardrails for standard ZUS scenarios.
 * Indicative results only; individual entitlement is assessed by ZUS.
 */
export type DebtAnswer='none'|'small'|'over'|'installments'|'application'|'unknown';
export type DebtOutcome='clear'|'review'|'blocked';
export function assessJdgDebt(debt:DebtAnswer):{outcome:DebtOutcome;message:string} {
 switch(debt){
  case 'none':return {outcome:'clear',message:'Brak zadeklarowanego zadłużenia.'};
  case 'small':return {outcome:'review',message:'Sprawdź rzeczywistą kwotę zadłużenia na dzień powstania prawa: próg to 1% obowiązującego minimalnego wynagrodzenia.'};
  case 'over':return {outcome:'blocked',message:'Zadłużenie ponad 1% minimalnego wynagrodzenia może wstrzymać prawo do zasiłku. Sprawdź saldo na dzień powstania prawa, spłatę oraz termin sześciu miesięcy.'};
  case 'installments':return {outcome:'review',message:'Sprawdź, czy podpisano układ ratalny, raty są terminowe i nie ma nieobjętych umową zaległości. Prawidłowo realizowany układ może umożliwić traktowanie zadłużenia jako nieistniejącego.'};
  case 'application':return {outcome:'blocked',message:'Sam wniosek o rozłożenie zadłużenia na raty nie jest zawartym układem ratalnym.'};
  case 'unknown':return {outcome:'review',message:'Brak weryfikacji zadłużenia ZUS. Wynik nie potwierdza prawa do zasiłku.'};
 }
}
export function parseDateStrict(value:string):number|null {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const date=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(date)&&new Date(date).toISOString().slice(0,10)===value?date:null;
}
export type AveragedRateOutcome='eligible_for_review'|'deadline_missed'|'unverified';
export function assessAveragedRate(birthDate:string,applicationDate:string,birthConfirmed:boolean):AveragedRateOutcome {
 const birth=parseDateStrict(birthDate), application=parseDateStrict(applicationDate);
 if(!birthConfirmed||birth===null||application===null||application<birth)return 'unverified';
 return application<=birth+21*86400000?'eligible_for_review':'deadline_missed';
}
export function validateWeeks(first:number,second:number,familyLimit:number,usedFirst=0,usedSecond=0):string|null {
 if(![first,second,usedFirst,usedSecond].every(x=>Number.isSafeInteger(x)&&x>=0))return 'Tygodnie muszą być nieujemnymi liczbami całkowitymi.';
 if(!Number.isSafeInteger(familyLimit)||familyLimit<18)return 'Niepoprawny limit rodzinny.';
 if(first+usedFirst>familyLimit-9||second+usedSecond>familyLimit-9)return 'Naruszono limit jednego rodzica (9 tygodni drugiego jest nieprzenoszalne).';
 if(first+second+usedFirst+usedSecond>familyLimit)return 'Przekroczono łączny limit urlopu rodzicielskiego.';
 return null;
}
