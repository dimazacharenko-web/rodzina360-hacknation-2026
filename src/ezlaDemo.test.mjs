import assert from 'node:assert/strict';
import {
 EZLA_DEMO_DISCLAIMER,ezlaDemoRecords,getEzlaDemoRecord,
 summarizeEzlaRecord,ezlaDemoToSicknessInput
} from './ezlaDemo.ts';
import {assessEligibility,emptyCoverage} from './entitlementCheck.ts';
import {assessApplicationReadiness} from './applicationReadiness.ts';

assert.equal(ezlaDemoRecords.length,4);
assert.equal(new Set(ezlaDemoRecords.map(r=>r.id)).size,4);
assert.match(EZLA_DEMO_DISCLAIMER,/syntetyczne/);
assert.match(EZLA_DEMO_DISCLAIMER,/Nie odczytano/);

for(const record of ezlaDemoRecords){
 assert.equal(record.synthetic,true);
 assert.equal(record.reason,'choroba');
 assert.ok(record.number.startsWith('DEMO-EZLA-'));
 assert.equal(Object.hasOwn(record,'pesel'),false);
 assert.equal(Object.hasOwn(record,'password'),false);
 assert.equal(Object.hasOwn(record,'icd10'),false);
 assert.equal(Object.hasOwn(record,'doctorPersonalData'),false);
 assert.equal(getEzlaDemoRecord(record.id),record);
 const summary=summarizeEzlaRecord(record);
 assert.ok(summary.days>0);
 assert.ok(summary.days<366);
 assert.ok(summary.codeLabel);
 assert.ok(summary.warning.length>20);
}
assert.throws(()=>getEzlaDemoRecord('outside-list'),/Nieznane/);
const preg=getEzlaDemoRecord('pregnancy_b');
const pregSum=summarizeEzlaRecord(preg);
assert.equal(pregSum.days,20);
assert.equal(pregSum.statusLabel,'Wystawione (DEMO)');
assert.equal(pregSum.codeLabel,'B — ciąża');
assert.equal(pregSum.canUseForSimulation,true);
assert.deepEqual(ezlaDemoToSicknessInput(preg),{
 from:'2026-11-04',to:'2026-11-23',ezlaCodeB:'yes',demoSource:true
});
const illness=getEzlaDemoRecord('general_illness');
assert.equal(summarizeEzlaRecord(illness).days,10);
assert.equal(summarizeEzlaRecord(illness).codeLabel,'Brak kodu B');
assert.deepEqual(ezlaDemoToSicknessInput(illness),{
 from:'2026-10-07',to:'2026-10-16',ezlaCodeB:'no',demoSource:true
});
const pregnancyNoB=getEzlaDemoRecord('pregnancy_no_b');
assert.equal(pregnancyNoB.pregnancyContext,true);
assert.equal(ezlaDemoToSicknessInput(pregnancyNoB).ezlaCodeB,'no');
assert.match(summarizeEzlaRecord(pregnancyNoB).warning,/osobne zaświadczenie/);
const cancelled=getEzlaDemoRecord('cancelled');
assert.equal(summarizeEzlaRecord(cancelled).statusLabel,'Anulowane (DEMO)');
assert.equal(summarizeEzlaRecord(cancelled).canUseForSimulation,false);
assert.throws(()=>ezlaDemoToSicknessInput(cancelled),/anulowanego/);
for(const invalid of [
 {...preg,from:'2026-11-24',to:'2026-11-23'},
 {...preg,from:'2026-02-30'},
 {...preg,issuedOn:'not-a-date'}
])assert.throws(()=>summarizeEzlaRecord(invalid),/data/i);

const eligibleParams={kind:'pregnancy_sickness',employment:'etat',insured:'tak',
 coverage:{...emptyCoverage(),startDate:'2025-01-01',ezlaCodeB:'yes',waitingException:'none'},
 eventDate:preg.from,eventConfirmed:true,debt:'none'};
const real=assessEligibility(eligibleParams);
assert.equal(real.status,'possible');
const simulated=assessEligibility({...eligibleParams,demoEzlaSource:true});
assert.equal(simulated.status,'review','DEMO code B does not establish an entitlement');
assert.match(simulated.details.join(' '),/syntetycznego podglądu DEMO/);
assert.ok(simulated.actions.some(x=>x.includes('odrębne zaświadczenie')));
assert.equal(assessEligibility({...eligibleParams,kind:'maternity',demoEzlaSource:true}).status,'possible',
 'Sickness-specific mock must not change maternity entitlement');
assert.equal(assessEligibility({...eligibleParams,employment:'zlecenie',insured:'nie',demoEzlaSource:true}).status,'blocked_standard',
 'Uninsured person remains blocked, not merely review');
const checklistInput={
 mode:'birth',actualEvent:true,applicantEmployment:'etat',secondEmployment:'',
 secondIncluded:false,applicantEligibility:'possible',
 insuranceStartVerified:true,secondInsuranceStartVerified:false,
 debtRisk:false,sickness:true,codeBConfirmed:false,ezlaDemoSource:true,
 variant:'standard',averagedAssessment:'unverified',tasks:[],care:null
};
const readiness=assessApplicationReadiness(checklistInput,{});
assert.ok(readiness.findings.some(x=>x.id==='sickness-demo'&&x.severity==='review'));
assert.ok(readiness.findings.some(x=>x.id==='sickness-unconfirmed'));
const genuineChecklist=assessApplicationReadiness({
 ...checklistInput,ezlaDemoSource:false,codeBConfirmed:true
},{});
assert.ok(!genuineChecklist.findings.some(x=>x.id==='sickness-demo'||x.id==='sickness-unconfirmed'));
console.log('OK: 4 e-ZLA DEMO records; 20/10-day periods, code B/without B, cancellation, invalid dates, synthetic entitlement and document checks');
