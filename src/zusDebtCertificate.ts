/**
 * ZUS saldo składek — wyłącznie symulacja danych i wystawienia zaświadczenia.
 * Ustawa zasiłkowa art. 2a: przekroczenie (>) 1% minimalnego wynagrodzenia
 * w dniu powstania prawa może wstrzymać wypłatę do spłaty całej zaległości.
 * Nie stanowi dokumentu urzędowego, decyzji ZUS ani potwierdzenia salda.
 *
 * Wysokość wynagrodzeń w latach 2023–2027: akty prawne ELI,
 * zweryfikowane przy opracowywaniu symulacji (listopad 2026).
 */
export type DebtPreset='zero'|'below'|'equal'|'over'|'custom';
export type DebtConclusion='none'|'within_threshold'|'above_threshold';
export type DebtCategory='none'|'small'|'over';
export type ZusDebtCertificate={
  readonly demo:true;
  readonly owner:1|2;
  readonly entitlementDate:string;
  readonly amountGrosze:number;
  readonly minimumWageGrosze:number;
  readonly thresholdGrosze:number;
  readonly conclusion:DebtConclusion;
  readonly category:DebtCategory;
  readonly reference:string;
  readonly issuedOn:string;
  readonly warning:string;
};
export type WagePeriod={
  from:string;wagePLN:number;
  law:string;
};
export const WAGE_PERIODS:readonly WagePeriod[]=[
  {from:'2023-01-01',wagePLN:3490,law:'Dz.U. 2022 poz. 1952'},
  {from:'2023-07-01',wagePLN:3600,law:'Dz.U. 2022 poz. 1952'},
  {from:'2024-01-01',wagePLN:4242,law:'Dz.U. 2023 poz. 1893'},
  {from:'2024-07-01',wagePLN:4300,law:'Dz.U. 2023 poz. 1893'},
  {from:'2025-01-01',wagePLN:4666,law:'Dz.U. 2024 poz. 1362'},
  {from:'2026-01-01',wagePLN:4806,law:'Dz.U. 2025 poz. 1242'},
  {from:'2027-01-01',wagePLN:4950,law:'Dz.U. 2026 poz. 1213'}
] as const;
const iso=(s:string):boolean=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const [y,m,d]=s.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));
  return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
};
export const moneyPL=(gr:number):string=>new Intl.NumberFormat('pl-PL',{
  style:'currency',currency:'PLN'
}).format(gr/100);
export function minimumWageForDate(entitlementDate:string):WagePeriod|null{
  if(!iso(entitlementDate))return null;
  const matching=WAGE_PERIODS.filter(x=>x.from<=entitlementDate);
  if(entitlementDate>'2027-12-31')return null; // no speculative rules for 2028+
  return matching[matching.length-1]||null;
}
export const thresholdForDate=(entitlementDate:string):number|null=>{
  const w=minimumWageForDate(entitlementDate);
  return w?Math.round(w.wagePLN):null; // 1% of wages in PLN = wage in grosze
};
export function amountForPreset(preset:DebtPreset,thresholdGrosze:number,custom:string):number{
  switch(preset){
    case 'zero':return 0;
    case 'below':return Math.min(2500,Math.max(0,thresholdGrosze-1));
    case 'equal':return thresholdGrosze;
    case 'over':return thresholdGrosze+7500;
    case 'custom':{
      const normalized=custom.trim().replace(',','.');
      if(!/^(?:\d{1,8})(?:\.\d{1,2})?$/.test(normalized))throw new Error('Wprowadź poprawną kwotę PLN, np. 48,07 (maksymalnie 2 miejsca po przecinku).');
      const [zl,gr='']=normalized.split('.');
      const amount=Number(zl)*100+Number(gr.padEnd(2,'0'));
      if(!Number.isSafeInteger(amount)||amount<0||amount>999999999)throw new Error('Kwota testowa jest poza dopuszczalnym zakresem.');
      return amount;
    }
  }
}
export function issueZusDebtCertificate(input:{
  owner:1|2;
  entitlementDate:string;
  preset:DebtPreset;
  customAmount?:string;
  issuedOn?:string;
}):ZusDebtCertificate{
  const wage=minimumWageForDate(input.entitlementDate);
  if(!wage)throw new Error('Wybierz poprawną datę powstania prawa w latach 2023–2027. Dla innych lat nie założono wysokości płacy minimalnej.');
  const thresholdGrosze=thresholdForDate(input.entitlementDate)!;
  const amountGrosze=amountForPreset(input.preset,thresholdGrosze,input.customAmount||'');
  const conclusion:DebtConclusion=amountGrosze===0?'none':amountGrosze>thresholdGrosze?'above_threshold':'within_threshold';
  const category:DebtCategory=conclusion==='none'?'none':conclusion==='above_threshold'?'over':'small';
  return Object.freeze({
    demo:true,owner:input.owner,entitlementDate:input.entitlementDate,
    amountGrosze,minimumWageGrosze:wage.wagePLN*100,
    thresholdGrosze,conclusion,category,
    reference:wage.law,
    issuedOn:input.issuedOn&&iso(input.issuedOn)?input.issuedOn:input.entitlementDate,
    warning:conclusion==='above_threshold'
      ?'Kwota przekracza 1% minimalnego wynagrodzenia. W standardowej sytuacji prawo do zasiłku wymaga spłaty całości zadłużenia; przy braku spłaty przez 6 miesięcy mogą wystąpić skutki z art. 2a. Nie jest to decyzja ZUS.'
      :conclusion==='none'
        ?'W syntetycznym przykładzie saldo wynosi zero. Nie potwierdza to rzeczywistego braku zaległości ani prawa do wypłaty.'
        :'Kwota nie przekracza 1% minimalnego wynagrodzenia. Samo porównanie salda nie przesądza o prawie do świadczenia.'
  });
}
export function certificateMatches(c:ZusDebtCertificate|null,owner:1|2,eventDate:string,employment:string):boolean{
  return Boolean(c&&c.owner===owner&&c.entitlementDate===eventDate&&employment==='dzialalnosc');
}
const esc=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function renderZusDebtCertificateHtml(c:ZusDebtCertificate):string{
  const t=c.conclusion==='above_threshold'
    ?'Zadłużenie PRZEKRACZA próg 1%'
    :c.conclusion==='none'?'Brak zadłużenia (dane testowe)':'Zadłużenie NIE PRZEKRACZA progu 1%';
  const rows:[
  string,string][]=[
    ['Wariant','Osoba '+c.owner+' · działalność gospodarcza (DEMO)'],
    ['Data powstania prawa',c.entitlementDate],
    ['Syntetyczna wysokość zadłużenia',moneyPL(c.amountGrosze)],
    ['Minimalne wynagrodzenie',moneyPL(c.minimumWageGrosze)],
    ['Próg art. 2a: 1%',moneyPL(c.thresholdGrosze)],
    ['Podstawa stawki minimalnej',c.reference],
    ['Wynik porównania',t]
  ];
  const table=rows.map(([a,b])=>'<tr><th>'+esc(a)+'</th><td>'+esc(b)+'</td></tr>').join('');
  return '<!doctype html><html lang="pl"><head><meta charset="UTF-8"><title>Rodzina360 — ZUS DEMO — symulacja zaświadczenia</title>'+
  '<style>body{font:16px/1.6 Arial,sans-serif;margin:36px auto;max-width:760px;color:#233a45;padding:0 22px}h1{font-size:25px}.stamp{font-size:23px;font-weight:900;letter-spacing:.15em;color:#943f37;border:3px solid #943f37;padding:13px;text-align:center;transform:rotate(-2deg);margin:28px 0}.notice{padding:14px;background:#fff3e0;border:1px solid #edc585}.metadata{color:#576b73}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{text-align:left;border:1px solid #d8e2e2;padding:11px}th{width:42%;background:#f2f7f5}footer{margin-top:30px;border-top:1px solid #cad6d6;padding-top:16px;font-size:13px}button{margin-top:22px;padding:10px 15px}@media print{button{display:none}}</style></head><body>'+
  '<div class="stamp">DEMO — NIE JEST DOKUMENTEM ZUS</div>'+
  '<h1>Symulacja zaświadczenia o stanie zadłużenia w ZUS</h1>'+
  '<p class="metadata">Rodzina360 · HackNation 2026 · data modelowa: '+esc(c.issuedOn)+'</p>'+
  '<div class="notice">Dane w pełni syntetyczne. Nie kontaktowano się z ZUS i nie wystawiono zaświadczenia urzędowego. Nie podawaj tego wydruku jako dokumentu ZUS.</div>'+
  '<table>'+table+'</table>'+
  '<p>'+esc(c.warning)+'</p><footer>Art. 2a ustawy zasiłkowej; informacje o progach oparto na opublikowanych rozporządzeniach. Kwota, data i wynik są elementem symulacji, a nie stanem konta.</footer>'+
  '<button onclick="window.print()">Drukuj do PDF</button></body></html>';
}
