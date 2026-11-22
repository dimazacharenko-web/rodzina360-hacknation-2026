import assert from 'node:assert/strict';
import {
 OFFICIAL_RULES,DEFAULT_ADMIN_CONFIG,CONFIG_STORAGE_KEY,
 newAdminConfig,validateAdminConfig,parseAdminConfig,loadAdminDemoConfig,
 saveAdminDemoConfig,legalRulesChanged,isDemoOverride,formatRate
} from './legalConfig.ts';
import {limits,calculateLeavePlan} from './leaveRules.ts';
import {initialEntries,calculateFlexiblePlan} from './flexibleLeave.ts';
import {calculateMoney} from './paymentEngine.ts';
import {createDocumentPlan} from './documentPlanner.ts';

const base=newAdminConfig();
assert.deepEqual(validateAdminConfig(base),[]);
assert.equal(isDemoOverride(base),false);
assert.equal(legalRulesChanged(base.rules),false);
assert.equal(base.schemaVersion,1);
assert.equal(base.rules.maternityRatePercent,100);
assert.equal(base.rules.parentalRatePercent,70);
assert.equal(base.rules.averagedRatePercent,81.5);
assert.deepEqual(base.rules.maternityWeeks,[20,31,33,35,37]);
assert.equal(base.rules.parentalWeeksSingle,41);
assert.equal(base.rules.parentalWeeksMultiple,43);
assert.equal(base.rules.reservedParentWeeks,9);
assert.deepEqual(limits(1),limits(1,base.rules));

base.rules.maternityWeeks[0]=21;
assert.equal(OFFICIAL_RULES.maternityWeeks[0],20,'Official defaults cannot be mutated');
base.rules.maternityRatePercent=90;
base.rules.parentalRatePercent=75;
base.rules.averagedRatePercent=82.5;
base.rules.parentalWeeksSingle=42;
base.rules.parentalWeeksMultiple=44;
base.features.officialLinks=false;
base.revision='DEMO-2027-001';
base.changeReason='Test nowelizacji; dane wyłącznie demonstracyjne.';
base.effectiveFrom='2027-01-01';
assert.deepEqual(validateAdminConfig(base),[]);
assert.equal(isDemoOverride(base),true);
assert.equal(legalRulesChanged(base.rules),true);
assert.equal(formatRate(82.5),'82,5%');

const one=limits(1,base.rules),two=limits(2,base.rules);
assert.equal(one.maternityDays,147);
assert.equal(two.maternityDays,31*7);
assert.equal(one.parentalDays,294);
assert.equal(two.parentalDays,308);
assert.equal(one.individualDays,63);
assert.equal(one.maxOneParentWeeks,33);

const plan=calculateLeavePlan({
 birthDate:'2027-01-01',children:1,parent1Weeks:33,parent2Weeks:0,secondParentEligible:false
},base.rules);
assert.equal(plan.maternityDays,147);
assert.equal(plan.parent1Parental?.days,231);
assert.equal(plan.parentalUnusedDays,63);

const entries=initialEntries('2027-01-01',1,false,base.rules);
const flex=calculateFlexiblePlan('2027-01-01',1,entries,false,base.rules);
assert.equal(flex.maternity.days,147);
assert.equal(flex.plannedDays,231);
assert.equal(flex.remainingFamilyDays,63);
assert.equal(flex.remainingByParent[0],0);

const configuredMoney=calculateMoney({
 maternityDays:one.maternityDays,maternityUsedDays:0,
 parentalEntries:flex.entries.map(e=>({id:e.id,owner:e.owner,start:e.start,end:e.end,days:e.days,used:e.used})),
 bases:[6000,null],insured:[true,false],employment:['etat',''],debts:['none','none'],
 variant:'standard',averagedConfirmed:false,special:false,rules:base.rules
});
assert.equal(configuredMoney.parents[0].status,'simulated');
assert.equal(configuredMoney.parents[0].futureGross,61110);
assert.equal(configuredMoney.parents[0].periods[0].rate,0.9);
assert.equal(configuredMoney.parents[0].periods[1].rate,0.75);
assert.ok(configuredMoney.warnings.some(x=>x.includes('EKSPERYMENT ADMIN DEMO')));

const averagedMoney=calculateMoney({
 maternityDays:7,maternityUsedDays:0,parentalEntries:[],
 bases:[6000,null],insured:[true,false],employment:['etat',''],debts:['none','none'],
 variant:'averaged',averagedConfirmed:true,special:false,rules:base.rules
});
assert.equal(averagedMoney.parents[0].periods[0].rate,0.825);

const docs=createDocumentPlan({
 birthDate:'2027-01-01',actualBirth:true,employment1:'etat',employment2:'',
 secondEligible:false,entries:flex.entries,variant:'averaged',sickness:false,debtRisk:false
},base.rules);
const averageTask=docs.find(d=>d.id==='averaged');
assert.ok(averageTask);
assert.match(averageTask.title,/82,5%/);
assert.match(averageTask.details,/9 tygodni/);

const storage=new Map();
const fake={
 getItem:key=>storage.has(key)?storage.get(key):null,
 setItem:(key,value)=>{storage.set(key,value);}
};
const written=saveAdminDemoConfig(fake,base);
assert.equal(storage.has(CONFIG_STORAGE_KEY),true);
assert.deepEqual(loadAdminDemoConfig(fake),written);
storage.set(CONFIG_STORAGE_KEY,'{broken');
assert.deepEqual(loadAdminDemoConfig(fake),newAdminConfig());
storage.set(CONFIG_STORAGE_KEY,JSON.stringify({schemaVersion:999}));
assert.deepEqual(loadAdminDemoConfig(fake),newAdminConfig());

const copy=parseAdminConfig({...base,unexpected:'ignored',rules:{...base.rules,evil:'test'}});
assert.equal(Object.hasOwn(copy,'unexpected'),false);
assert.equal(Object.hasOwn(copy.rules,'evil'),false);
assert.equal(copy.rules.maternityRatePercent,90);
assert.deepEqual(validateAdminConfig({...base,revision:DEFAULT_ADMIN_CONFIG.revision}).some(x=>x.includes('identyfikator wersji')),true);
assert.deepEqual(validateAdminConfig({...base,changeReason:DEFAULT_ADMIN_CONFIG.changeReason}).some(x=>x.includes('powód eksperymentu')),true);
for(const value of [0,-2,100.1,Infinity,NaN,80.55]){
 assert.ok(validateAdminConfig({...base,rules:{...base.rules,maternityRatePercent:value}}).length>0);
}
for(const value of [0,61,1.2,NaN]){
 assert.ok(validateAdminConfig({...base,rules:{...base.rules,parentalWeeksSingle:value}}).length>0);
}
assert.ok(validateAdminConfig({...base,rules:{...base.rules,reservedParentWeeks:42}}).length>0);
assert.ok(validateAdminConfig({...base,rules:{...base.rules,maternityWeeks:[21,20,33,35,37]}}).length>0);
assert.ok(validateAdminConfig({...base,rules:{...base.rules,maternityWeeks:[21,31,33]}}).length>0);
assert.ok(validateAdminConfig({...base,features:{...base.features,officialLinks:'false'}}).length>0);
assert.ok(validateAdminConfig({...base,effectiveFrom:'2027-02-30'}).length>0);
assert.ok(validateAdminConfig({...base,schemaVersion:2}).length>0);
assert.throws(()=>parseAdminConfig({}),/wersja/);
assert.throws(()=>saveAdminDemoConfig(fake,{...base,rules:{...base.rules,parentalWeeksSingle:999}}),/limity/);
assert.equal(OFFICIAL_RULES.parentalWeeksSingle,41,'Current ZUS defaults remain intact');

console.log('OK: versioned admin legal config, constraints, preview engines, persistence and reset');
