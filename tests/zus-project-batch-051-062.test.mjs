// Data integrity of ZUS-051..ZUS-062 source fixtures. NOT a ZUS entitlement or payment test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../knowledge/zus-cases/', import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const ids=Array.from({length:12},(_,i)=>'ZUS-'+String(i+51).padStart(3,'0'));
const cases=new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',root),'utf8'))]));
const days=(a,b)=>{let x=Date.parse(a+'T00:00:00Z'),y=Date.parse(b+'T00:00:00Z');assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&y>=x);return (y-x)/86400000+1;};
const ranges=[
 ['051','awardStart','awardEnd','documentedAwardDays'],
 ['052','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['052','parentalClaimStart','parentalClaimEnd','parentalClaimDays'],
 ['053','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['054','paternityBenefitStart','paternityBenefitEnd','paternityBenefitDays'],
 ['055','maternityLeaveStart','maternityLeaveEnd','maternityLeaveDays'],
 ['055','parentalLeaveStart','parentalLeaveEnd','parentalLeaveDays'],
 ['056','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['057','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['058','maternityClaimStart','maternityClaimEnd','maternityClaimDays'],
 ['059','parentalBenefitStart','parentalBenefitEnd','parentalBenefitDays'],
 ['060','maternityStart','maternityEnd','maternityDays'],
 ['060','supplementaryStart','supplementaryEnd','supplementaryRequestedDays'],
 ['060','parentalStart','parentalEnd','parentalRequestedDays'],
 ['061','maternityLeaveStart','maternityLeaveEnd','maternityLeaveDays'],
 ['062','parentalClaimStart','parentalClaimEnd','parentalClaimDays']
];
assert.equal(manifest.total_cases,manifest.cases.length);
for(const id of ids){const c=cases.get(id);assert.equal(c.id,id);assert.ok(c.evidence.length>=2);assert.equal(c.verification.benefit_payment_amount_pln,null);assert.equal(c.verification.app_engine,'not_tested');assert.ok(manifest.cases.some(x=>x.id===id));}
for(const [n,a,b,key] of ranges){const c=cases.get('ZUS-'+n);assert.equal(days(c.inputs[a],c.inputs[b]),c.expected[key],n+': '+key);}
assert.equal(cases.get('ZUS-060').expected.dateInconsistency,true);
assert.equal(cases.get('ZUS-062').expected.clarificationRequired,true);
console.log('ZUS-051..062: '+ids.length+' fixtures and '+ranges.length+' date-span assertions consistent. No benefit PLN or app entitlement tested.');
