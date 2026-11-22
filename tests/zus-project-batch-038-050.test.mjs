// Fixture integrity only. Does not establish legal entitlement or actual payout amounts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../knowledge/zus-cases/',import.meta.url);
const index=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
assert.equal(index.total_cases,index.cases.length);
const ids=Array.from({length:13},(_,i)=>'ZUS-'+String(i+38).padStart(3,'0'));
const fixtures=new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',root),'utf8'))]));
const diff=(from,to)=>{const a=Date.parse(from+'T00:00:00Z'),b=Date.parse(to+'T00:00:00Z');assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&b>=a);return (b-a)/86400000+1;};
const spans=[
['038','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
['038','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
['040','maternityReportedStart','maternityReportedEnd','maternityReportedDays'],
['042','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
['043','paternityClaimStart','paternityClaimEnd','paternityClaimDays'],
['045','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
['045','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
['046','sicknessReportedStart','sicknessReportedEnd','sicknessReportedDays'],
['048','sicknessClaimStart','sicknessClaimEnd','sicknessClaimDays'],
['049','benefitRequestedStart','benefitRequestedEnd','benefitRequestedDays'],
['050','aggregateReportedStart','aggregateReportedEnd','aggregateReportedCalendarDays']
];
for(const id of ids){
 const c=fixtures.get(id);
 assert.equal(c.id,id);
 assert.ok(index.cases.some(v=>v.id===id));
 assert.ok(c.evidence.length>0);
 assert.equal(c.verification.amount_pln,null);
 assert.equal(c.verification.app_engine,'not_tested');
}
for(const [num,start,end,key] of spans){
 const c=fixtures.get('ZUS-'+num);
 assert.equal(diff(c.inputs[start],c.inputs[end]),c.expected[key],num+': '+key);
}
console.log('13 new fixtures registered; '+spans.length+' date arithmetic assertions. No award-amount/app-engine validation claimed.');
