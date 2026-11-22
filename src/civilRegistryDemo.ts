/** DEMO-only request for a copy of a birth record from USC.
 * This is NOT an official act, a real filing, a payment, or an integration with the civil registry.
 * Gov.pl, verified 22 Nov 2026:
 * https://www.gov.pl/web/gov/uzyskaj-odpis-aktu-stanu-cywilnego-urodzenia-malzenstwa-zgonu
 * https://www.gov.pl/web/cyfryzacja/rejestr-stanu-cywilnego
 */
export type CivilRegistryInput={eventDate:string;eventConfirmed:boolean;children:number};
export type CivilCopyKind='short'|'full';
export type CivilDelivery='electronic'|'office'|'post';
export type CivilPurpose='zus'|'private'|'other';
export type CivilRegistryDraft={
 kind:CivilCopyKind;delivery:CivilDelivery;purpose:CivilPurpose;otherPurpose:string;
 childNumber:number;applicant:string;childName:string;birthPlace:string;uscName:string;
 registered:boolean;detailsConfirmed:boolean;feeReviewed:boolean;demoAcknowledged:boolean;
};
export type CivilRegistryAssessment={
 ready:boolean;errors:string[];warnings:string[];feePLN:number;
 feeDescription:string;copyLabel:string;deliveryLabel:string;purposeLabel:string;
};
export type CivilRegistryReceipt={
 id:string;status:'NOT_SENT_DEMO';recipient:'USC';message:string;
};
export const CIVIL_REGISTRY_SERVICE='https://www.gov.pl/web/gov/uzyskaj-odpis-aktu-stanu-cywilnego-urodzenia-malzenstwa-zgonu';
export const CIVIL_REGISTRY_INFO='https://www.gov.pl/web/cyfryzacja/rejestr-stanu-cywilnego';
export const CIVIL_REGISTRY_DISCLAIMER='DEMO — symulacja złożenia wniosku. Nie wysyłamy danych do USC, nie pobieramy opłat, nie generujemy urzędowego odpisu ani urzędowego potwierdzenia złożenia.';
export const emptyCivilRegistryDraft=():CivilRegistryDraft=>({
 kind:'short',delivery:'electronic',purpose:'zus',otherPurpose:'',
 childNumber:1,applicant:'Rodzic DEMO',childName:'Dziecko DEMO',
 birthPlace:'Miejscowość DEMO',uscName:'USC DEMO',
 registered:false,detailsConfirmed:false,feeReviewed:false,demoAcknowledged:false
});
const validDate=(s:string):boolean=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const [y,m,d]=s.split('-').map(Number);
 const date=new Date(Date.UTC(y,m-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
};
const fieldOk=(s:string,min:number,max:number):boolean=>{
 const trimmed=s.trim();
 return trimmed.length>=min&&trimmed.length<=max&&!/[\r\n]/.test(trimmed);
};
export function assessCivilRegistryDraft(input:CivilRegistryInput,draft:CivilRegistryDraft):CivilRegistryAssessment{
 const errors:string[]=[];
 const warnings:string[]=[
  'Przy rejestracji urodzenia urząd wydaje jeden odpis skrócony bezpłatnie. Sprawdź, czy kolejny odpis jest potrzebny.',
  'Odpis elektroniczny jest ważny jako oryginalny dokument elektroniczny. Sam wydruk pliku nie zastępuje oryginału.'
 ];
 if(!validDate(input.eventDate))errors.push('Wprowadź poprawną datę urodzenia dziecka w planie.');
 if(!Number.isInteger(input.children)||input.children<1||input.children>20)
  errors.push('Nieprawidłowa liczba dzieci w planie.');
 if(!input.eventConfirmed)
  errors.push('Data porodu jest przewidywana. Potwierdź rzeczywiste urodzenie w kroku 1.');
 if(!draft.registered)
  errors.push('Potwierdź, że akt urodzenia został już zarejestrowany w USC (w scenariuszu DEMO).');
 if(!Number.isInteger(draft.childNumber)||draft.childNumber<1||draft.childNumber>input.children)
  errors.push('Wybierz dziecko z aktualnego planu.');
 if(!['short','full'].includes(draft.kind))errors.push('Wybierz rodzaj odpisu.');
 if(!['electronic','office','post'].includes(draft.delivery))errors.push('Wybierz formę odbioru.');
 if(!['zus','private','other'].includes(draft.purpose))errors.push('Wybierz cel uzyskania odpisu.');
 if(draft.purpose==='other'&&!fieldOk(draft.otherPurpose,6,160))
  errors.push('Opisz cel uzyskania odpisu (6–160 znaków).');
 if(!fieldOk(draft.applicant,3,100))errors.push('Podaj przykładowe imię i nazwisko wnioskodawcy (3–100 znaków).');
 if(!fieldOk(draft.childName,3,100))errors.push('Podaj przykładowe imię i nazwisko dziecka (3–100 znaków).');
 if(!fieldOk(draft.birthPlace,3,100))errors.push('Podaj przykładową miejscowość urodzenia (3–100 znaków).');
 if(!fieldOk(draft.uscName,3,120))errors.push('Wybierz przykładowy urząd stanu cywilnego (3–120 znaków).');
 if(!draft.detailsConfirmed)errors.push('Sprawdź dane wniosku DEMO i potwierdź ich zgodność.');
 if(!draft.feeReviewed)errors.push('Potwierdź zapoznanie się z zasadami opłaty i zwolnienia.');
 if(!draft.demoAcknowledged)errors.push('Potwierdź, że symulacja niczego nie wysyła ani nie opłaca.');
 const feePLN=draft.purpose==='zus'?0:draft.kind==='short'?22:33;
 const copyLabel=draft.kind==='short'?'Odpis skrócony aktu urodzenia':'Odpis zupełny aktu urodzenia';
 const deliveryLabel=draft.delivery==='electronic'?'Elektronicznie — e-Doręczenia':
  draft.delivery==='office'?'Papierowo — odbiór w USC':'Papierowo — pocztą';
 const purposeLabel=draft.purpose==='zus'?'Sprawa ZUS / ubezpieczenia społeczne':
  draft.purpose==='private'?'Cel prywatny':draft.otherPurpose.trim();
 const feeDescription=draft.purpose==='zus'?
  '0 zł — zwolnienie możliwe dla spraw ZUS, pod warunkiem prawidłowego wskazania celu i spełnienia wymogów. Potwierdza USC.':
  String(feePLN)+' zł — standardowa opłata skarbowa; sprawdź ewentualne ustawowe zwolnienie.';
 if(draft.purpose==='zus')warnings.push('Zwolnienie z opłaty dotyczy celu objętego ustawą; sam wybór opcji ZUS nie oznacza decyzji USC.');
 if(draft.delivery==='electronic')warnings.push('Dokument elektroniczny otrzymuje się na skrzynkę e-Doręczeń; wymagane jest użycie oficjalnej e-usługi.');
 return {ready:errors.length===0,errors,warnings,feePLN,feeDescription,copyLabel,deliveryLabel,purposeLabel};
}
export function makeCivilRegistryReceipt(input:CivilRegistryInput,draft:CivilRegistryDraft,sequence:number):CivilRegistryReceipt{
 const result=assessCivilRegistryDraft(input,draft);
 if(!result.ready)throw new Error(result.errors.join(' '));
 if(!Number.isSafeInteger(sequence)||sequence<1||sequence>9999)
  throw new Error('Nieprawidłowy numer symulacji.');
 return Object.freeze({
  id:'DEMO-USC-'+String(sequence).padStart(3,'0'),
  status:'NOT_SENT_DEMO' as const,recipient:'USC' as const,
  message:'Symulacja zakończona. NIE WYSŁANO wniosku do USC. NIE DOKONANO PŁATNOŚCI. Brak urzędowego potwierdzenia.'
 });
}
const escapeHtml=(x:string):string=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function renderCivilRegistryDraftHtml(input:CivilRegistryInput,draft:CivilRegistryDraft):string{
 const result=assessCivilRegistryDraft(input,draft);
 if(!result.ready)throw new Error(result.errors.join(' '));
 const row=(label:string,value:string)=>'<tr><th>'+escapeHtml(label)+'</th><td>'+escapeHtml(value)+'</td></tr>';
 const rows=[
  ['Rodzaj odpisu',result.copyLabel],
  ['Wnioskodawca — dane DEMO',draft.applicant.trim()],
  ['Dziecko — dane DEMO',draft.childName.trim()],
  ['Numer dziecka w planie',String(draft.childNumber)+' z '+String(input.children)],
  ['Data urodzenia w planie',input.eventDate],
  ['Miejscowość urodzenia — DEMO',draft.birthPlace.trim()],
  ['Adresat — DEMO',draft.uscName.trim()],
  ['Sposób odbioru',result.deliveryLabel],
  ['Cel',result.purposeLabel],
  ['Informacja o opłacie',result.feeDescription]
 ];
 return '<!doctype html><html lang="pl"><head><meta charset="UTF-8">'+
  '<title>Rodzina360 · DEMO · Wniosek o odpis aktu urodzenia</title>'+
  '<style>body{font:15px/1.6 Arial,sans-serif;color:#253b45;max-width:760px;margin:35px auto;padding:0 18px}header{border:3px solid #a1463e;color:#a1463e;background:#fff0ef;text-align:center;padding:16px;font-weight:900;font-size:21px;margin-bottom:20px}table{border-collapse:collapse;width:100%;margin:22px 0}th,td{border:1px solid #d3dcdc;padding:10px;text-align:left;vertical-align:top}th{width:36%;background:#f4f7f7}h1{font-size:23px}.warning{padding:14px;background:#fff4df;border:1px solid #e4c78a}footer{border-top:1px solid #ccc;padding-top:18px;margin-top:25px;font-size:12px}@media print{button{display:none}}</style></head><body>'+
  '<header>DEMO — NIE WYSŁANO — TO NIE JEST ODPIS USC</header>'+
  '<h1>Projekt wniosku o wydanie odpisu aktu urodzenia</h1>'+
  '<p>Dokument demonstracyjny Rodzina360, przeznaczony do podglądu przepływu, a nie do rzeczywistego złożenia.</p>'+
  '<table>'+rows.map(([name,value])=>row(name,value)).join('')+'</table>'+
  '<p class="warning">Nie wniesiono opłaty ani nie wysłano wniosku. Urząd nie potwierdził zwolnienia, rejestracji ani wydania odpisu. Dokument nie zawiera podpisu, pieczęci ani numeru urzędowego.</p>'+
  '<p>Oficjalny proces: <a href="'+CIVIL_REGISTRY_SERVICE+'">gov.pl — uzyskaj odpis aktu stanu cywilnego</a>.</p>'+
  '<footer>Rodzina360 · DEMO. Wniosek nie jest oryginalnym odpisem, nie należy go używać jako dokumentu urzędowego.</footer>'+
  '<button onclick="window.print()">Drukuj / zapisz jako PDF (tylko DEMO)</button></body></html>';
}