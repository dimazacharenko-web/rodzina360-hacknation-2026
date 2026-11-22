/** Konkursowe sprawy ZUS: wyłącznie nieidentyfikujące okresy i wynik decyzji.
 * W większości PDF brak faktycznej kwoty wypłaty — NIE ma porównania PLN z decyzją.
 * Podstawa 6000 zł służy wyłącznie jako syntetyczna liczba kontrolna.
 */
import {calculateMoney,type MoneyInput} from './paymentEngine.ts';
import {daysInclusive} from './flexibleLeave.ts';
export type ScenarioCase={id:string;title:string;source:string;expectedDays:number;rateExample:string;decision:'granted'|'denied'|'unconfirmed';sample:MoneyInput;note:string};
const base=(maternityDays:number,entries:MoneyInput['parentalEntries'],extra:Partial<MoneyInput>={}):MoneyInput=>({
 maternityDays,maternityUsedDays:0,parentalEntries:entries,bases:[6000,6000],
 insured:[true,true],employment:['etat','etat'],debts:['none','none'],variant:'standard',averagedConfirmed:false,special:false,...extra});
const pr=(id:string,owner:1|2,start:string,end:string)=>({id,owner,start,end,days:daysInclusive(start,end),used:false});
export const paymentCases:ScenarioCase[]=[
 {id:'ZUS-007',title:'Macierzyński 140 dni + rodzicielski 224 dni',
  source:'Alicja Ta (okresy z ZAM)',expectedDays:364,rateExample:'100% / 70%',
  decision:'unconfirmed',sample:base(140,[pr('parental-mother',1,'2026-04-02','2026-11-11')],{bases:[6000,null],insured:[true,false]}),
  note:'Daty 13.11.2025–01.04.2026 (140 dni) i 02.04–11.11.2026 (224 dni) z wniosku; brak kwoty świadczenia.'},
 {id:'ZUS-014',title:'JDG — macierzyński i rodzicielski',
  source:'Anna No (wypłaty potwierdzone, kwoty niepodane)',expectedDays:364,rateExample:'100% / 70%',
  decision:'granted',sample:base(140,[pr('parental-mother',1,'2024-07-05','2025-02-13')],{bases:[6000,null],employment:['dzialalnosc',''],insured:[true,false]}),
  note:'ZUS potwierdził wypłatę, lecz nie podano wypłaconych PLN; baza 6000 zł jest przykładowa, NIE wynika z akt.'},
 {id:'ZUS-034',title:'JDG — wniosek o wyrównanie do 1000 zł',
  source:'Janina Poz (ZAM i wniosek o podwyższenie; brak decyzji o wyrównaniu)',expectedDays:364,rateExample:'100% / 70%',
  decision:'unconfirmed',sample:base(140,[pr('parental-mother',1,'2024-06-11','2025-01-20')],{bases:[6000,null],employment:['dzialalnosc',''],insured:[true,false]}),
  note:'Wniosek o podwyższenie do 1000 zł to nie potwierdzenie wypłaty. Kwota jest syntetyczna, indywidualna podstawa nieznana.'},
 {id:'ZUS-045',title:'Pracownica — 140 dni + 224 dni',
  source:'Julia No (wniosek ZAM pracownicy, bez decyzji o kwocie)',expectedDays:364,rateExample:'100% / 70%',
  decision:'unconfirmed',sample:base(140,[pr('parental-mother',1,'2025-06-23','2026-02-01')],{bases:[6000,null],employment:['etat',''],insured:[true,false]}),
  note:'W dokumencie potwierdzono 140 + 224 dni we wniosku. Pensja i rzeczywiste wypłaty ZUS nie zostały zweryfikowane.'},
 {id:'ZUS-027',title:'Odmowa — brak ubezpieczenia w dniu porodu',
  source:'Ewa Łód (decyzja odmowna)',expectedDays:364,rateExample:'Nie wyliczać należnej wypłaty',
  decision:'denied',sample:base(140,[pr('parental-mother',1,'2025-10-30','2026-06-10')],{bases:[6000,null],insured:[false,false]}),
  note:'Decyzja odmawia prawa w tym konkretnym przypadku. Kalkulator nie może prezentować świadczenia jako należnego.'},
 {id:'ZUS-037',title:'JDG — chorobowe i macierzyński',
  source:'Joanna Rze (wypłaty potwierdzone, kwoty niepodane)',expectedDays:364,rateExample:'100% / 70%',
  decision:'granted',sample:base(140,[pr('parental-mother',1,'2026-09-15','2027-04-26')],{bases:[6000,null],employment:['dzialalnosc',''],insured:[true,false]}),
  note:'Łączny okres macierzyńskiego 28.04.2026–26.04.2027 = 364 dni. Podział na 140 i 224 dni jest MODELOWY; rzeczywistych kwot w aktach nie ma.'}
];
export function auditPaymentCase(c:ScenarioCase){
 const r=calculateMoney(c.sample);
 const actual=c.sample.maternityDays+c.sample.parentalEntries.reduce((s,e)=>s+e.days,0);
 const periodOK=actual===c.expectedDays;
 const blockedOK=c.decision==='denied'?r.parents[0].status!=='simulated':true;
 return {id:c.id,periodOK,blockedOK,actualDays:actual,expectedDays:c.expectedDays,
  status:c.decision==='denied'?'ZUS: odmowa; nie symulujemy należnej wypłaty':c.decision==='granted'?'ZUS: przyznano; kwota faktyczna nieudostępniona':'ZUS: wniosek, przyznanie niepotwierdzone',
  amount:r.futureGross,derivedAmountIsSynthetic:true};
}
