// Documentary audit completeness checks — these are NOT financial or legal-engine tests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../knowledge/zus-cases/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const ids=Array.from({length:11},(_,i)=>'ZUS-'+String(i+14).padStart(3,'0'));
const expectedOutcomes={
  'ZUS-014':'granted_and_paid_all_benefits',
  'ZUS-016':'grant_referenced_in_ZUS_register_no_full_decision',
  'ZUS-017':'payment_confirmed_for_period',
  'ZUS-021':'insurance_exclusion_decision_confirmed_benefit_refusal_in_case_header_only',
  'ZUS-022':'payment_confirmed_for_period'
};
assert.equal(manifest.total_cases,manifest.cases.length);
for (const id of ids) {
 const c=JSON.parse(readFileSync(new URL(id+'/case.json',root),'utf8'));
 const index=manifest.cases.find(x=>x.id===id);
 assert.ok(index,id+' missing from manifest');
 assert.ok(c.full_source_audit,id+' missing audit');
 assert.equal(index.documentary_outcome,c.full_source_audit.status);
 assert.ok(Array.isArray(c.full_source_audit.source_pages)&&c.full_source_audit.source_pages.length>0);
 assert.equal(c.full_source_audit.benefit_payment_amount_pln,null);
 assert.equal(c.full_source_audit.app_result_comparison,'not_performed');
 if (expectedOutcomes[id]) assert.equal(c.full_source_audit.status,expectedOutcomes[id]);
}
const duplicate=JSON.parse(readFileSync(new URL('ZUS-022/case.json',root),'utf8'));
assert.equal(duplicate.source_filenames.length,2);
console.log('11 full-source documentary audit records checked. No beneficiary PLN payouts or app-engine validations are claimed.');
