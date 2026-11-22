import assert from 'node:assert/strict';
import {zusInsuranceDemoRecords,getZusInsuranceDemoRecord,ZUS_INSURANCE_DEMO_DISCLAIMER} from './zusInsuranceDemo.ts';
import {assessEligibility,emptyCoverage} from './entitlementCheck.ts';

assert.equal(zusInsuranceDemoRecords.length,4);
assert.equal(new Set(zusInsuranceDemoRecords.map(x=>x.id)).size,4);
assert.match(ZUS_INSURANCE_DEMO_DISCLAIMER,/syntetyczne/i);
assert.match(ZUS_INSURANCE_DEMO_DISCLAIMER,/Nie pobrano informacji z ZUS/i);
for(const record of zusInsuranceDemoRecords){
 assert.equal(record.synthetic,true,record.id+' must be mock data');
 assert.ok(['tak','nie'].includes(record.insured));
 assert.ok(['etat','zlecenie','dzialalnosc'].includes(record.employment));
 assert.match(record.startDate,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(Object.hasOwn(record,'pesel'),false,'No personal identifiers');
 assert.equal(Object.hasOwn(record,'access_token'),false,'No tokens');
 assert.equal(Object.hasOwn(record,'base'),false,'Do not import imagined financial bases');
 assert.strictEqual(getZusInsuranceDemoRecord(record.id),record);
 const result=assessEligibility({
  kind:'maternity',employment:record.employment,insured:record.insured,
  coverage:{...emptyCoverage(),startDate:record.startDate,endDate:record.endDate,
    postInsuranceException:'none'},
  eventDate:'2026-12-01',eventConfirmed:true,debt:record.debt,demoSource:true
 });
 assert.notEqual(result.status,'possible','A synthetic case cannot confirm entitlement');
 assert.match(result.details.join(' '),/syntetyczn/i);
}
const employee=zusInsuranceDemoRecords.find(x=>x.id==='employee');
assert.ok(employee);
const genuine=assessEligibility({kind:'maternity',employment:employee.employment,insured:employee.insured,
 coverage:{...emptyCoverage(),startDate:employee.startDate},eventDate:'2026-12-01',eventConfirmed:true,debt:'none'});
assert.equal(genuine.status,'possible','Normal self-declared inputs retain existing preliminary path');
const noInsurance=getZusInsuranceDemoRecord('no_insurance');
assert.equal(noInsurance.insured,'nie');
const debt=getZusInsuranceDemoRecord('jdg_debt');
assert.equal(debt.debt,'over');
const debtResult=assessEligibility({kind:'maternity',employment:debt.employment,insured:debt.insured,
 coverage:{...emptyCoverage(),startDate:debt.startDate},eventDate:'2026-12-01',eventConfirmed:true,debt:debt.debt,demoSource:true});
assert.equal(debtResult.status,'blocked_standard','Existing JDG debt warning must not be overridden');
assert.throws(()=>getZusInsuranceDemoRecord('missing-case'),/Nieznany scenariusz/);
console.log('OK: 4 synthetic ZUS insurance fixtures, provenance, non-real amounts, debt and entitlement safety');
