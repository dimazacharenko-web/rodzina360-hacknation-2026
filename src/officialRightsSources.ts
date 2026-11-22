/**
 * Selected official Polish sources about parental entitlements.
 * Links point to the issuing institution, never to local copies.
 * Reviewed against the public websites on 2026-11-22.
 * This module does not infer entitlement; it only recommends reading.
 */
export type OfficialInstitution='ZUS'|'MRPiPS'|'PIP';
export type OfficialMode='birth'|'adoption'|'foster'|'loss'|'other';
export type OfficialEmployment='etat'|'zlecenie'|'dzialalnosc'|'inne'|'';
export type OfficialTopic='all'|'benefits'|'leave'|'documents'|'insurance'|'special';
export type OfficialRightsInput={
 mode:OfficialMode;employment1:OfficialEmployment;employment2:OfficialEmployment;
 secondIncluded:boolean;averaged:boolean
};
export type OfficialSource={
 id:string;institution:OfficialInstitution;title:string;description:string;
 url:string;topic:Exclude<OfficialTopic,'all'>;employmentOnly:boolean;
 reviewedOn:string
};
export const OFFICIAL_SOURCE_LIBRARY:ReadonlyArray<OfficialSource>=[
 {id:'zus-eligibility',institution:'ZUS',title:'Zasiłek macierzyński — komu przysługuje',
  description:'Warunki prawa do zasiłku, okresy pobierania i wpływ ubezpieczenia oraz zadłużenia.',
  url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje',
  topic:'benefits',employmentOnly:false,reviewedOn:'2026-11-22'},
 {id:'zus-rate',institution:'ZUS',title:'Wysokość zasiłku macierzyńskiego',
  description:'Stawki świadczenia, w tym wariant uśredniony 81,5% i odpowiednie warunki.',
  url:'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
  topic:'benefits',employmentOnly:false,reviewedOn:'2026-11-22'},
 {id:'zus-docs',institution:'ZUS',title:'Dokumenty wymagane do wypłaty zasiłku',
  description:'Oficjalny wykaz dokumentów przy urodzeniu, adopcji i innych sytuacjach.',
  url:'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
  topic:'documents',employmentOnly:false,reviewedOn:'2026-11-22'},
 {id:'zus-forms',institution:'ZUS',title:'Aktualne formularze zasiłku macierzyńskiego',
  description:'Wnioski i oświadczenia publikowane przez ZUS; korzystaj z aktualnych wersji.',
  url:'https://www.zus.pl/pl/wzory-formularzy/zasilki/zasilek-macierzynski',
  topic:'documents',employmentOnly:false,reviewedOn:'2026-11-22'},
 {id:'zus-insurance',institution:'ZUS',title:'Podleganie ubezpieczeniom społecznym',
  description:'Zasady dla umowy zlecenia i działalności gospodarczej, w tym ubezpieczenie chorobowe.',
  url:'https://www.zus.pl/pracujacy/system-ubezpieczen-spolecznych-w-polsce/podleganie-ubezpieczeniom-spolecznym',
  topic:'insurance',employmentOnly:false,reviewedOn:'2026-11-22'},
 {id:'gov-parental',institution:'MRPiPS',title:'Urlop rodzicielski',
  description:'Oficjalne zasady podziału urlopu między pracowników-rodziców i łączenia go z pracą.',
  url:'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
  topic:'leave',employmentOnly:true,reviewedOn:'2026-11-22'},
 {id:'gov-maternity',institution:'MRPiPS',title:'Urlop macierzyński',
  description:'Prawa pracownicze, okres urlopu oraz szczególne przypadki jego wykorzystania.',
  url:'https://www.gov.pl/web/rodzina/urlop-macierzynski',
  topic:'leave',employmentOnly:true,reviewedOn:'2026-11-22'},
 {id:'gov-adoption',institution:'MRPiPS',title:'Urlop na warunkach urlopu macierzyńskiego (adopcyjny)',
  description:'Uprawnienia pracowników po przyjęciu dziecka na wychowanie lub przysposobieniu.',
  url:'https://www.gov.pl/web/rodzina/urlop-adopcyjny',
  topic:'special',employmentOnly:true,reviewedOn:'2026-11-22'},
 {id:'gov-rights',institution:'MRPiPS',title:'Uprawnienia związane z rodzicielstwem',
  description:'Przegląd praw związanych z rodzicielstwem, w tym ochrony pracowników.',
  url:'https://www.gov.pl/web/rodzina/uprawnienia-zwiazane-z-rodzicielstwem',
  topic:'leave',employmentOnly:true,reviewedOn:'2026-11-22'},
 {id:'pip-parental',institution:'PIP',title:'Rodzicielstwo — porady prawne PIP',
  description:'Pytania i odpowiedzi o urlopach, wnioskach i ochronie praw pracowniczych.',
  url:'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo',
  topic:'leave',employmentOnly:true,reviewedOn:'2026-11-22'},
 {id:'pip-foster',institution:'PIP',title:'Urlopy przy rodzinie zastępczej',
  description:'PIP wyjaśnia prawa pracowników przyjmujących dziecko jako rodzina zastępcza.',
  url:'https://www.pip.gov.pl/dla-pracodawcow/pytania-i-odpowiedzi/do-jakich-urlopow-maja-uprawnienie-rodzice-ktorzy-przyjeli-dziecko-na-wychowanie-jako-rodzina-zastepcza',
  topic:'special',employmentOnly:true,reviewedOn:'2026-11-22'}
];
export const INSTITUTION_LABELS:Record<OfficialInstitution,string>={
 ZUS:'Zakład Ubezpieczeń Społecznych',
 MRPiPS:'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
 PIP:'Państwowa Inspekcja Pracy'
};
export function hasEmployee(input:OfficialRightsInput):boolean{
 return input.employment1==='etat'||(input.secondIncluded&&input.employment2==='etat');
}
export function recommendedOfficialIds(input:OfficialRightsInput):string[]{
 const employee=hasEmployee(input);
 const ids=['zus-eligibility','zus-docs','zus-forms'];
 if(input.employment1==='dzialalnosc'||input.employment1==='zlecenie'||
    (input.secondIncluded&&['dzialalnosc','zlecenie'].includes(input.employment2)))
  ids.unshift('zus-insurance');
 if(input.averaged)ids.unshift('zus-rate');
 if(input.mode==='adoption'||input.mode==='foster'){
  ids.splice(1,0,'gov-adoption');
  if(employee||(!input.employment1&&!input.employment2))
   ids.push(input.mode==='foster'?'pip-foster':'pip-parental');
 }else{
  ids.push(input.mode==='loss'||input.mode==='other'?'gov-maternity':'gov-parental');
  if(employee||(!input.employment1&&!input.employment2))ids.push('pip-parental');
 }
 if(!employee&&input.employment1&&input.employment1!=='etat'&&
    (!input.secondIncluded||input.employment2!=='etat')){
  // Employment-only pages are still accessible in the full catalogue, but are not
  // offered as direct personal leave entitlements to a JDG or zlecenie user.
  return [...new Set(ids)].filter(id=>!OFFICIAL_SOURCE_LIBRARY.find(s=>s.id===id)?.employmentOnly);
 }
 return [...new Set(ids)];
}
export function officialSourcesFor(input:OfficialRightsInput,topic:OfficialTopic='all',
 institution:OfficialInstitution|'all'='all',showAll=false):OfficialSource[]{
 const recommended=recommendedOfficialIds(input);
 const selected=showAll?OFFICIAL_SOURCE_LIBRARY:recommended
  .map(id=>OFFICIAL_SOURCE_LIBRARY.find(source=>source.id===id))
  .filter((source):source is OfficialSource=>Boolean(source));
 return selected.filter(source=>(topic==='all'||source.topic===topic)&&
  (institution==='all'||source.institution===institution));
}