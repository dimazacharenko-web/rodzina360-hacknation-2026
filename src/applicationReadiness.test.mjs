import assert from 'node:assert/strict';
import {createApplicationChecklist,assessApplicationReadiness,readinessReport} from './applicationReadiness.ts';
import {createDocumentPlan} from './documentPlanner.ts';
import {calculateCarePlan,emptyCare} from './careRules.ts';
const future={birthDate:'2027-10-01',actualBirth:true,employment1:'etat',employment2:'',secondEligible:false,entries:[
 {id:'planned',owner:1,start:'2028-02-18',end:'2028-03-16',days:28,used:false,employerDeadline:'2028-01-28'}
 ],variant:'standard',sickness:false,debtRisk:false};
const tasks=createDocumentPlan(future);
const standard={
 mode:'birth',actualEvent:true,applicantEmployment:'etat',secondEmployment:'',secondIncluded:false,
 applicantEligibility:'possible',secondEligibility:undefined,
 insuranceStartVerified:true,secondInsuranceStartVerified:false,
 debtRisk:false,sickness:false,codeBConfirmed:false,variant:'standard',averagedAssessment:'unverified',tasks,care:null
};
const items=createApplicationChecklist(standard);
assert.ok(items.items.some(x=>x.id==='personal'));
assert.ok(items.items.some(x=>x.id==='birth-data'));
assert.ok(items.items.some(x=>x.id==='employer-z3'&&x.conditional));
assert.ok(items.items.some(x=>x.id==='task-leave-planned'));
assert.ok(items.items.some(x=>x.id==='task-benefit-planned'));
assert.ok(!items.items.some(x=>x.id==='payer-z3a'||x.id==='sickness-document'||x.id==='averaged-application'));
assert.equal(new Set(items.items.map(x=>x.id)).size,items.items.length,'Unique item ids');
assert.equal(items.findings.length,0);
const initial=assessApplicationReadiness(standard,{});
assert.equal(initial.status,'missing_confirmation');
assert.equal(initial.checked,0);
const checked=Object.fromEntries(initial.items.map(x=>[x.id,true]));
const completed=assessApplicationReadiness(standard,checked);
assert.equal(completed.status,'checked');
assert.equal(completed.missing.length,0);
assert.match(readinessReport(completed),/Potwierdzono/);
assert.match(readinessReport(initial),/BRAKUJĄCE POTWIERDZENIA/);
const predicted=assessApplicationReadiness({...standard,actualEvent:false},checked);
assert.equal(predicted.status,'needs_action');
assert.ok(predicted.findings.some(x=>x.id==='event-unconfirmed'));
const review=assessApplicationReadiness({...standard,applicantEligibility:'review'},checked);
assert.equal(review.status,'requires_review');
assert.ok(review.findings.some(x=>x.id==='insurance-review'));
const denied=assessApplicationReadiness({...standard,applicantEligibility:'blocked_standard'},checked);
assert.equal(denied.status,'needs_action');
const averaged=assessApplicationReadiness({...standard,variant:'averaged',averagedAssessment:'deadline_missed'},checked);
assert.equal(averaged.status,'needs_action');
assert.ok(averaged.items.some(x=>x.id==='averaged-application'));
const jdg=createApplicationChecklist({...standard,applicantEmployment:'dzialalnosc',debtRisk:true});
assert.ok(jdg.items.some(x=>x.id==='jdg-insurance'));
assert.ok(!jdg.items.some(x=>x.id==='employer-z3'));
assert.ok(jdg.findings.some(x=>x.id==='debt-risk'));
const zlecenie=createApplicationChecklist({...standard,applicantEmployment:'zlecenie'});
assert.ok(zlecenie.items.some(x=>x.id==='payer-z3a'&&x.conditional));
const sick=createApplicationChecklist({...standard,sickness:true,codeBConfirmed:false});
assert.ok(sick.items.some(x=>x.id==='sickness-document'));
assert.ok(sick.items.some(x=>x.id==='sickness-application'&&x.conditional));
assert.ok(sick.findings.some(x=>x.id==='sickness-unconfirmed'));
const two=createApplicationChecklist({...standard,secondIncluded:true,secondInsuranceStartVerified:false,secondEligibility:'review'});
assert.ok(two.items.some(x=>x.id==='second-parent'));
assert.ok(two.findings.some(x=>x.id==='second-insurance-date'));
const careInput={...emptyCare(),acceptanceDate:'2026-12-01',courtFilingDate:'2026-12-01',childBirthDates:['2024-01-01'],schoolDeferred:'no'};
const adoption=calculateCarePlan('adoption',careInput,1);
const adoptChecklist=createApplicationChecklist({...standard,mode:'adoption',actualEvent:true,tasks:[],care:adoption});
assert.ok(adoptChecklist.items.some(x=>x.title.includes('sądu')));
assert.ok(adoptChecklist.items.some(x=>x.id==='care-employer'));
assert.ok(!adoptChecklist.items.some(x=>x.id==='birth-data'||x.id==='sickness-document'));
const foster=calculateCarePlan('foster',{...careInput,schoolDeferred:'yes',childBirthDates:['2019-01-01'],courtFilingDate:''},1);
const fosterChecklist=createApplicationChecklist({...standard,mode:'foster',care:foster,tasks:[],applicantEmployment:'dzialalnosc'});
assert.ok(fosterChecklist.items.some(x=>x.title.includes('orzeczenie sądu')));
assert.ok(fosterChecklist.items.some(x=>x.id==='foster-school'));
assert.ok(!fosterChecklist.items.some(x=>x.id==='care-employer'));
assert.ok(fosterChecklist.items.some(x=>x.id==='jdg-insurance'));
console.log('OK: pre-submission checklist routes, deadlines, optional Z-3/Z-3a, e-ZLA, 81.5%, JDG, adoption and foster evidence');
