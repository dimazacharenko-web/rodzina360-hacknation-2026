// Integrity checks for last 11 scanned cases. Not legal entitlement or payout validation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../knowledge/zus-cases/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const ids=Array.from({length:11},(_,i)=>'ZUS-'+String(76+i).padStart(3,'0'));
const cases=new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',root),'utf8'))]));
const length=(a,b)=>{const x=Date.parse(a+'T00:00:00Z'),y=Date.parse(b+'T00:00:00Z');assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&y>=x);return (y-x)/86400000+1;};
const intervals=[
['076','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
['077','employerZ3BenefitAggregateStart','employerZ3BenefitAggregateEnd','employerReportedAggregateDays'],
['078','employerZ3AggregateBenefitStart','employerZ3AggregateBenefitEnd','employerReportedAggregateDays'],
['079','aggregateMaternityParentalStart','aggregateMaternityParentalEnd','aggregateDays'],
['080','ZUSMaternityClaimStart','ZUSMaternityClaimEnd','ZUSClaimDays'],
['081','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
['081','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
['082','maternityStart','maternityEnd','maternityDays'],
['082','parentalStart','parentalEnd','parentalDays'],
['083','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
['083','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
['084','sicknessClaimStart','sicknessClaimEnd','sicknessClaimDays'],
['085','maternityStart','maternityEnd','maternityDays'],
['085','supplementaryMaternityStart','supplementaryMaternityEnd','supplementaryDays'],
['085','parentalStart','parentalEnd','parentalDays'],
['086','aggregateClaimStart','aggregateClaimEnd','aggregateClaimDays']
];
assert.equal(manifest.total_cases,manifest.cases.length);
for(const id of ids){const c=cases.get(id);assert.equal(c.id,id);assert.ok(c.evidence.length>=3);assert.ok(manifest.cases.some(x=>x.id===id));assert.equal(c.verification.actual_zus_payout_pln,null);assert.equal(c.verification.app_engine,'not_tested');}
for(const [n,a,b,k] of intervals){const c=cases.get('ZUS-'+n);assert.equal(length(c.inputs[a],c.inputs[b]),c.expected[k],n+': '+k);}
assert.equal(cases.get('ZUS-085').expected.caseCoverSaysPaid,true);
assert.ok(cases.get('ZUS-085').inputs.parentalEnd>'2026-11-21','future-end limitation must be retained');
assert.equal(cases.get('ZUS-080').inputs.employerPaidOnBirthDatePLN,150.11);
console.log('11 cases and '+intervals.length+' date checks consistent. Historical document outcomes only; no legal engine or PLN payout test.');
