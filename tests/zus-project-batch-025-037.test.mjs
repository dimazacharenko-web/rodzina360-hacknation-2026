// Source-fixture consistency only: NOT a ZUS legal entitlement or financial calculation test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../knowledge/zus-cases/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',base),'utf8'));
const ids=Array.from({length:13},(_,i)=>'ZUS-'+String(i+25).padStart(3,'0'));
const cases=new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',base),'utf8'))]));
const inclusive=(a,b)=>{const x=Date.parse(a+'T00:00:00Z'),y=Date.parse(b+'T00:00:00Z');assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&y>=x);return (y-x)/86400000+1;};
const spans=[
 ['025','paternityRequestedStart','paternityRequestedEnd','paternityRequestedDays'],
 ['026','maternityRequestedStart','maternityRequestedEnd','maternityRequestedCalendarDays'],
 ['027','maternityClaimStart','maternityClaimEnd','claimedCalendarDays'],
 ['028','maternityReportedStart','maternityReportedEnd','maternityReportedDays'],
 ['029','benefitEquivalentClaimStart','benefitEquivalentClaimEnd','benefitEquivalentRequestedDays'],
 ['030','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
 ['031','paternityPaidStart','paternityPaidEnd','paternityPaidDays'],
 ['032','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
 ['033','paternityClaimStart','paternityClaimEnd','paternityClaimDays'],
 ['034','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['034','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
 ['035','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['035','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
 ['037','maternityClaimStart','maternityClaimEnd','maternityClaimDays']
];
assert.equal(manifest.total_cases,manifest.cases.length);
for(const id of ids){const c=cases.get(id);assert.equal(c.id,id);assert.ok(c.evidence.length>0);assert.equal(c.verification.app_engine,'not_tested');assert.equal(c.verification.financial_amount_pln,null);assert.ok(manifest.cases.some(x=>x.id===id));}
for(const [n,a,b,k] of spans){const c=cases.get('ZUS-'+n);assert.equal(inclusive(c.inputs[a],c.inputs[b]),c.expected[k],n+' '+k);}
const illness=cases.get('ZUS-037');for(let i=0;i<3;i++){const span=illness.inputs.sicknessClaimIntervals[i];assert.equal(inclusive(span[0],span[1]),illness.expected.sicknessClaimDays[i]);}
// Explicit anomaly guards: checking data provenance is not interpreting entitlement.
assert.equal(cases.get('ZUS-026').expected.maternityRequestedCalendarDays,57);
assert.equal(cases.get('ZUS-032').expected.parentalClaimDays,46);
console.log('13 source fixtures: '+spans.length+' date-range assertions + 3 sickness intervals; two date anomalies preserved; no financial award claims.');
