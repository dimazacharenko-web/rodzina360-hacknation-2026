// Integrity checks for the latest 12 PDF sources / 11 distinct ZUS cases.
// These checks verify fixture structure and date arithmetic, NOT benefit entitlement.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base = new URL('../knowledge/zus-cases/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json',base),'utf8'));
const ids = Array.from({length:11},(_,i)=>'ZUS-'+String(i+14).padStart(3,'0'));
const cases = new Map(ids.map(id=>[id,JSON.parse(readFileSync(new URL(id+'/case.json',base),'utf8'))]));
assert.equal(manifest.total_cases,manifest.cases.length);
const count = (a,b) => {const start=Date.parse(a+'T00:00:00Z'),end=Date.parse(b+'T00:00:00Z');assert.ok(Number.isFinite(start)&&Number.isFinite(end)&&end>=start);return (end-start)/86400000+1;};
const periods = [
 ['ZUS-014','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
 ['ZUS-014','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
 ['ZUS-015','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
 ['ZUS-016','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
 ['ZUS-017','maternityPaidStart','maternityPaidEnd','maternityPaidDays'],
 ['ZUS-021','sickLeaveClaimStart','sickLeaveClaimEnd','sickLeaveClaimDays'],
 ['ZUS-022','paternityPaidStart','paternityPaidEnd','paternityPaidDays'],
 ['ZUS-023','parentalClaimStart','parentalClaimEnd','parentalRequestedDays']
];
for (const id of ids) {
 const c=cases.get(id);assert.equal(c.id,id);assert.ok(c.evidence.length>0);
 assert.equal(c.verification.app_engine,'not_tested');
 assert.ok(manifest.cases.some(x=>x.id===id));
}
for(const [id,start,end,expected] of periods) {
 const c=cases.get(id);
 assert.equal(count(c.inputs[start],c.inputs[end]),c.expected[expected],id+': '+expected);
}
assert.equal(cases.get('ZUS-022').source_filenames.length,2);
console.log('OK: 11 cases, 12 linked source PDF names, '+periods.length+' inclusive-date arithmetic checks. NOT a ZUS decision or app-engine test.');
