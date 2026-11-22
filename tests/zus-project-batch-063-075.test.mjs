// ZUS-063..075: fixture arithmetic and provenance only. Not legal or payment validation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../knowledge/zus-cases/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const ids=Array.from({length:13},(_,i)=>'ZUS-'+String(i+63).padStart(3,'0'));
const cases=new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',root),'utf8'))]));
const inclusive=(a,b)=>{const x=Date.parse(a+'T00:00:00Z'),y=Date.parse(b+'T00:00:00Z');assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&y>=x);return (y-x)/86400000+1;};
const spans=[
 ['063','maternityApplicationStart','maternityApplicationEnd','maternityRequestedDays'],
 ['064','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
 ['064','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
 ['066','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
 ['067','paternityClaimStart','paternityClaimEnd','paternityClaimDays'],
 ['068','paternityClaimStart','paternityClaimEnd','paternityRequestedDays'],
 ['069','paternityClaimStart','paternityClaimEnd','paternityRequestedDays'],
 ['070','sicknessReportedStart','sicknessReportedEnd','sicknessReportedDays'],
 ['071','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
 ['072','maternityBenefitReportedStart','maternityBenefitReportedEnd','maternityReportedDays'],
 ['073','maternityBenefitReportedStart','maternityBenefitReportedEnd','aggregateBenefitReportedDays'],
 ['074','maternityBenefitReportedStart','maternityBenefitReportedEnd','aggregateBenefitReportedDays'],
 ['075','parentalClaimStart','parentalClaimEnd','parentalRequestedDays']
];
assert.equal(manifest.total_cases,manifest.cases.length);
for(const id of ids){const c=cases.get(id);assert.equal(c.id,id);assert.ok(c.evidence.length>=3);assert.equal(c.verification.payment_amount_pln,null);assert.equal(c.verification.app_engine,'not_tested');assert.ok(manifest.cases.some(row=>row.id===id));}
for(const [num,a,b,k] of spans){const c=cases.get('ZUS-'+num);assert.equal(inclusive(c.inputs[a],c.inputs[b]),c.expected[k],num+' '+k);}
assert.equal(cases.get('ZUS-067').expected.benefitEntitlement,'denied');
assert.equal(cases.get('ZUS-075').expected.denialReason,'exceeds_maximum_five_parental_leave_parts');
assert.equal(cases.get('ZUS-071').expected.dateDiscrepancy,true);
console.log('13 source cases and '+spans.length+' date checks consistent; two formal denials registered. No financial or engine pass claims.');
