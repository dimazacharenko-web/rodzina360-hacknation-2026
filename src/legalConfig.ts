/**
 * Central policy parameters. Immutable official defaults are based on:
 * ZUS: https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc
 * MRPiPS: https://www.gov.pl/web/rodzina/urlop-macierzynski
 * MRPiPS: https://www.gov.pl/web/rodzina/urlop-rodzicielski
 * Reviewed 2026-11-22.
 *
 * Operator overrides are LOCAL DEMO ONLY, not promulgated legislation, ZUS
 * configuration, a server-side policy or an authenticated administrative action.
 */
export type LegalRules={
 maternityRatePercent:number;
 parentalRatePercent:number;
 averagedRatePercent:number;
 maternityWeeks:[number,number,number,number,number];
 parentalWeeksSingle:number;
 parentalWeeksMultiple:number;
 reservedParentWeeks:number;
};
export type DemoFeatures={
 officialLinks:boolean;
 supportDirectory:boolean;
 civilRegistryDemo:boolean;
};
export type AdminConfig={
 schemaVersion:1;
 effectiveFrom:string;
 revision:string;
 changeReason:string;
 rules:LegalRules;
 features:DemoFeatures;
};
export const CONFIG_STORAGE_KEY='rodzina360-admin-demo-policy-v1';
export const OFFICIAL_RULES:Readonly<LegalRules>=Object.freeze({
 maternityRatePercent:100,
 parentalRatePercent:70,
 averagedRatePercent:81.5,
 maternityWeeks:Object.freeze([20,31,33,35,37]) as unknown as [number,number,number,number,number],
 parentalWeeksSingle:41,
 parentalWeeksMultiple:43,
 reservedParentWeeks:9
});
export const OFFICIAL_FEATURES:Readonly<DemoFeatures>=Object.freeze({
 officialLinks:true,supportDirectory:true,civilRegistryDemo:true
});
export const DEFAULT_ADMIN_CONFIG:Readonly<AdminConfig>=Object.freeze({
 schemaVersion:1,effectiveFrom:'2026-11-22',
 revision:'PL-2026-BASE',changeReason:'Domyślne parametry na podstawie aktualnych źródeł urzędowych.',
 rules:OFFICIAL_RULES as LegalRules,features:OFFICIAL_FEATURES as DemoFeatures
});
export function newAdminConfig():AdminConfig{
 return {
  schemaVersion:1,effectiveFrom:DEFAULT_ADMIN_CONFIG.effectiveFrom,
  revision:DEFAULT_ADMIN_CONFIG.revision,
  changeReason:DEFAULT_ADMIN_CONFIG.changeReason,
  rules:{...OFFICIAL_RULES,maternityWeeks:[...OFFICIAL_RULES.maternityWeeks] as LegalRules['maternityWeeks']},
  features:{...OFFICIAL_FEATURES}
 };
}
const validDate=(s:string):boolean=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const [y,m,d]=s.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
};
const validPercent=(v:unknown):v is number=>
 typeof v==='number'&&Number.isFinite(v)&&v>0&&v<=100&&Math.abs(v*10-Math.round(v*10))<1e-7;
const validWeeks=(v:unknown):v is number=>
 typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=60;
export function legalRulesChanged(r:LegalRules):boolean{
 return r.maternityRatePercent!==OFFICIAL_RULES.maternityRatePercent||
  r.parentalRatePercent!==OFFICIAL_RULES.parentalRatePercent||
  r.averagedRatePercent!==OFFICIAL_RULES.averagedRatePercent||
  r.parentalWeeksSingle!==OFFICIAL_RULES.parentalWeeksSingle||
  r.parentalWeeksMultiple!==OFFICIAL_RULES.parentalWeeksMultiple||
  r.reservedParentWeeks!==OFFICIAL_RULES.reservedParentWeeks||
  r.maternityWeeks.some((v,i)=>v!==OFFICIAL_RULES.maternityWeeks[i]);
}
export function isDemoOverride(config:AdminConfig):boolean{
 return legalRulesChanged(config.rules)||
  (Object.keys(OFFICIAL_FEATURES) as (keyof DemoFeatures)[]).some(k=>config.features[k]!==OFFICIAL_FEATURES[k]);
}
export function validateAdminConfig(config:unknown):string[]{
 const errors:string[]=[];
 if(!config||typeof config!=='object'||Array.isArray(config))return ['Niepoprawny format konfiguracji.'];
 const d=config as Record<string,unknown>;
 if(d.schemaVersion!==1)errors.push('Nieobsługiwana wersja schematu. Wymagana: 1.');
 if(typeof d.effectiveFrom!=='string'||!validDate(d.effectiveFrom))
  errors.push('Podaj prawidłową datę scenariusza (RRRR-MM-DD).');
 if(typeof d.revision!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.-]{2,39}$/.test(d.revision))
  errors.push('Identyfikator wersji: 3–40 znaków, litery, cyfry, myślnik lub kropka.');
 if(typeof d.changeReason!=='string'||d.changeReason.trim().length<10||d.changeReason.length>240)
  errors.push('Uzasadnienie zmiany musi zawierać 10–240 znaków.');
 const rules=d.rules as Record<string,unknown>|null|undefined;
 if(!rules||typeof rules!=='object'||Array.isArray(rules)){
  errors.push('Brakuje obiektu parametrów świadczeń.');
 }else{
  for(const [key,label] of [
   ['maternityRatePercent','Stawka macierzyńskiego'],
   ['parentalRatePercent','Stawka rodzicielskiego'],
   ['averagedRatePercent','Stawka uśredniona']
  ]){
   if(!validPercent(rules[key]))errors.push(label+': wybierz wartość od 0,1 do 100% (co 0,1 p.p.).');
  }
  if(!Array.isArray(rules.maternityWeeks)||rules.maternityWeeks.length!==5||
    !rules.maternityWeeks.every(validWeeks)||
    rules.maternityWeeks.some((v:number,i:number,all:number[])=>i>0&&v<all[i-1]))
   errors.push('Wymiary macierzyńskiego: 5 niemalejących liczb całkowitych od 1 do 60 tygodni.');
  if(!validWeeks(rules.parentalWeeksSingle)||!validWeeks(rules.parentalWeeksMultiple))
   errors.push('Łączne limity rodzicielskiego: od 1 do 60 tygodni.');
  else if((rules.parentalWeeksMultiple as number)<(rules.parentalWeeksSingle as number))
   errors.push('Limit dla porodów mnogich nie może być niższy niż dla jednego dziecka.');
  if(!validWeeks(rules.reservedParentWeeks))
   errors.push('Nieprzenoszalny wymiar: od 1 do 60 tygodni.');
  else if(validWeeks(rules.parentalWeeksSingle)&&validWeeks(rules.parentalWeeksMultiple)&&
    ((rules.reservedParentWeeks as number)>=(rules.parentalWeeksSingle as number)||
     (rules.reservedParentWeeks as number)>=(rules.parentalWeeksMultiple as number)))
   errors.push('Nieprzenoszalne tygodnie muszą być mniejsze niż łączny limit rodzicielskiego.');
 }
 const features=d.features as Record<string,unknown>|null|undefined;
 if(!features||typeof features!=='object'||Array.isArray(features)||
  (Object.keys(OFFICIAL_FEATURES) as (keyof DemoFeatures)[]).some(k=>typeof features[k]!=='boolean'))
  errors.push('Wymagane przełączniki funkcji (true/false).');
 if(!errors.length&&isDemoOverride(d as unknown as AdminConfig)){
  if(d.revision===DEFAULT_ADMIN_CONFIG.revision)
   errors.push('Nadaj nowy identyfikator wersji (np. DEMO-001), by odróżnić eksperyment od oficjalnej bazy.');
  if(d.changeReason===DEFAULT_ADMIN_CONFIG.changeReason)
   errors.push('Opisz powód eksperymentu, nie używaj uzasadnienia dla domyślnych parametrów.');
 }
 return errors;
}
/** Always normalize imported data. Unknown fields cannot create new runtime features. */
export function parseAdminConfig(raw:unknown):AdminConfig{
 const errors=validateAdminConfig(raw);
 if(errors.length)throw Error(errors.join(' '));
 const data=raw as AdminConfig;
 return {
  schemaVersion:1,effectiveFrom:data.effectiveFrom,revision:data.revision,
  changeReason:data.changeReason.trim(),
  rules:{
   maternityRatePercent:data.rules.maternityRatePercent,
   parentalRatePercent:data.rules.parentalRatePercent,
   averagedRatePercent:data.rules.averagedRatePercent,
   maternityWeeks:[...data.rules.maternityWeeks] as LegalRules['maternityWeeks'],
   parentalWeeksSingle:data.rules.parentalWeeksSingle,
   parentalWeeksMultiple:data.rules.parentalWeeksMultiple,
   reservedParentWeeks:data.rules.reservedParentWeeks
  },
  features:{
   officialLinks:data.features.officialLinks,
   supportDirectory:data.features.supportDirectory,
   civilRegistryDemo:data.features.civilRegistryDemo
  }
 };
}
export function loadAdminDemoConfig(storage:{getItem:(key:string)=>string|null}):AdminConfig{
 try{
  const raw=storage.getItem(CONFIG_STORAGE_KEY);
  return raw?parseAdminConfig(JSON.parse(raw)):newAdminConfig();
 }catch{return newAdminConfig();}
}
export function saveAdminDemoConfig(storage:{setItem:(key:string,value:string)=>void},
 config:AdminConfig):AdminConfig{
 const normalized=parseAdminConfig(config);
 storage.setItem(CONFIG_STORAGE_KEY,JSON.stringify(normalized));
 return normalized;
}
export const formatRate=(v:number):string=>
 v.toLocaleString('pl-PL',{minimumFractionDigits:0,maximumFractionDigits:1})+'%';
