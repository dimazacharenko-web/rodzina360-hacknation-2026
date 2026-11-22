/**
 * Static, sourced directory of Polish support organisations for families in difficult situations.
 * Scope: information/referral only. No tracking, contact forms, crisis triage or data submissions.
 * Every target is an official organisation or government site, reviewed 2026-11-22.
 * Re-check availability, contacts and service terms on the source website.
 */
export type SupportTopic='all'|'child_loss'|'pregnancy_loss'|'serious_diagnosis'|'prematurity'|'family_grief';
export type SupportKind='all'|'psychological'|'legal'|'peer'|'medical';
export type SupportEntry={
 id:string;name:string;organisationType:'fundacja'|'program';
 summary:string;topics:Exclude<SupportTopic,'all'>[];kinds:Exclude<SupportKind,'all'>[];
 url:string;contact?:string;hours?:string;location:string;note?:string;verifiedOn:string;
};
export const SUPPORT_TOPICS:ReadonlyArray<{id:SupportTopic;label:string}>=[
 {id:'all',label:'Wszystkie sytuacje'},
 {id:'child_loss',label:'Śmierć dziecka'},
 {id:'pregnancy_loss',label:'Poronienie / martwe urodzenie'},
 {id:'serious_diagnosis',label:'Ciężka diagnoza prenatalna'},
 {id:'prematurity',label:'Wcześniactwo / pobyt w szpitalu'},
 {id:'family_grief',label:'Żałoba w rodzinie (także u dzieci)'}
];
export const SUPPORT_KINDS:ReadonlyArray<{id:SupportKind;label:string}>=[
 {id:'all',label:'Każdy rodzaj wsparcia'},
 {id:'psychological',label:'Psychologiczne'},
 {id:'legal',label:'Prawne i formalne'},
 {id:'peer',label:'Grupy i wzajemne wsparcie'},
 {id:'medical',label:'Medyczne / okołoporodowe'}
];
export const SUPPORT_RESOURCES:ReadonlyArray<SupportEntry>=[
 {
  id:'nagle-sami',name:'Fundacja Nagle Sami',organisationType:'fundacja',
  summary:'Rozmowa z osobą przygotowaną do wspierania w żałobie, również po śmierci dziecka i utracie ciąży.',
  topics:['child_loss','pregnancy_loss','family_grief'],kinds:['psychological','peer'],
  url:'https://naglesami.org.pl/telefon-wsparcia-zaloba/',
  contact:'800 108 108 — bezpłatny telefon wsparcia',hours:'pon.–pt., 14:00–20:00',
  location:'Cała Polska (telefon)',verifiedOn:'2026-11-22'
 },
 {
  id:'ernesta',name:'Fundacja Ernesta',organisationType:'fundacja',
  summary:'Pomoc psychologiczna i prawna m.in. po poronieniu, martwym urodzeniu oraz przy trudnych sytuacjach okołoporodowych.',
  topics:['pregnancy_loss','child_loss','serious_diagnosis','prematurity'],
  kinds:['psychological','legal'],
  url:'https://fundacjaernesta.pl/jak-pomagamy/',
  contact:'pomoc.psychologiczna@fundacjaernesta.pl; pomoc.prawna@fundacjaernesta.pl',
  location:'Kontakt online — sprawdź sposób przyjęć na stronie',
  note:'Fundacja informuje, że jej pomoc jest bezpłatna. Dostępność poszczególnych form wsparcia wymaga potwierdzenia.',
  verifiedOn:'2026-11-22'
 },
 {
  id:'razem-na-maksa',name:'Fundacja Razem na MAKSA',organisationType:'fundacja',
  summary:'Internetowe kręgi wzajemnego wsparcia dla rodziców po śmierci dziecka, także dostępne z różnych miejsc Polski.',
  topics:['child_loss','pregnancy_loss','family_grief'],kinds:['peer','psychological'],
  url:'https://razemnamaksa.pl/internetowe-kregi-wsparcia-smierc-dziecka/',
  location:'Spotkania online — ogólnopolsko',
  note:'Terminy i możliwość zapisów potwierdź bezpośrednio u organizatora.',
  verifiedOn:'2026-11-22'
 },
 {
  id:'gajusz',name:'Fundacja Gajusz — hospicjum perinatalne',organisationType:'fundacja',
  summary:'Wsparcie dla rodzin po rozpoznaniu ciężkiej, nieuleczalnej choroby dziecka w okresie prenatalnym; konsultacje medyczne.',
  topics:['serious_diagnosis'],kinds:['medical','psychological'],
  url:'https://gajusz.org.pl/jak-pomagamy/hospicjum-perinatalne/pomoc/',
  location:'Łódź (możliwość konsultacji także spoza województwa)',
  note:'Wymagane odpowiednie skierowanie od lekarza współpracującego z NFZ. Warunki przyjęcia sprawdź w placówce.',
  verifiedOn:'2026-11-22'
 },
 {
  id:'wczesniak',name:'Fundacja Wcześniak Rodzice-Rodzicom',organisationType:'fundacja',
  summary:'Informacje, poradnik i wskazówki dotyczące grup wsparcia dla rodziców wcześniaków oraz opieki po pobycie w szpitalu.',
  topics:['prematurity'],kinds:['peer','medical'],
  url:'https://wczesniak.pl/grupy-wsparcia/',
  location:'Polska — informacje o grupach w różnych miejscach',
  note:'Nie wszystkie wymienione grupy internetowe są prowadzone przez Fundację.',
  verifiedOn:'2026-11-22'
 },
 {
  id:'tumbo',name:'Tumbo Pomaga — Fundacja Hospicyjna',organisationType:'program',
  summary:'Poradniki i wsparcie dzieci oraz młodzieży w żałobie, ich opiekunów i nauczycieli, gdy zmarła bliska osoba.',
  topics:['family_grief','child_loss'],kinds:['psychological','peer'],
  url:'https://tumbopomaga.pl/',
  contact:'800 111 123 — Tumbolinia',hours:'pon.–pt., 9:00–11:00',
  location:'Polska — informacje i kontakt telefoniczny',
  verifiedOn:'2026-11-22'
 }
];
export const CRISIS_SUPPORT={
 name:'Centrum Wsparcia dla osób dorosłych w kryzysie psychicznym',
 phone:'800 70 2222',hours:'całą dobę, 7 dni w tygodniu',
 url:'https://www.gov.pl/web/zdrowie/pomoc-psychologiczna',
 emergency:'112',
 verifiedOn:'2026-11-22'
} as const;
const normalize=(s:string)=>s.toLocaleLowerCase('pl').normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').trim();
export function filterSupportResources(topic:SupportTopic='all',kind:SupportKind='all',search=''):SupportEntry[]{
 const query=normalize(search).slice(0,120);
 return SUPPORT_RESOURCES.filter(r=>
  (topic==='all'||r.topics.includes(topic))&&
  (kind==='all'||r.kinds.includes(kind))&&
  (!query||normalize([r.name,r.summary,r.location,r.contact||''].join(' ')).includes(query))
 );
}
export function initialSupportTopic(special:'none'|'adoption'|'foster'|'loss'|'other'):SupportTopic{
 if(special==='loss')return 'child_loss';
 if(special==='other')return 'prematurity';
 return 'all';
}