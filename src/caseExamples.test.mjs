import assert from 'node:assert/strict';
import {examples,auditExample} from './caseExamples.ts';
assert.equal(examples.length,6);
for(const example of examples){const result=auditExample(example);assert.equal(result.pass,true,example.id);assert.ok(result.checks.length>=1);}
const variants=examples.map(x=>x.id).sort();assert.deepEqual(variants,['ZUS-007','ZUS-014','ZUS-027','ZUS-034','ZUS-037','ZUS-045']);
const topup=examples.find(x=>x.id==='ZUS-034');assert.equal(auditExample(topup).checks.reduce((n,x)=>n+x.actualDays,0),364);
const employee=examples.find(x=>x.id==='ZUS-045');assert.equal(auditExample(employee).checks.reduce((n,x)=>n+x.actualDays,0),364);
const refusal=examples.find(x=>x.id==='ZUS-027');assert.match(refusal.expectedDecision,/Odmowa/);
const maternity=examples.find(x=>x.id==='ZUS-007');assert.equal(auditExample(maternity).checks.reduce((n,x)=>n+x.actualDays,0),364);
const business=examples.find(x=>x.id==='ZUS-014');assert.equal(auditExample(business).checks.reduce((n,x)=>n+x.actualDays,0),364);
const jdg=examples.find(x=>x.id==='ZUS-037');assert.equal(auditExample(jdg).checks.slice(0,3).reduce((s,x)=>s+x.actualDays,0),85);
console.log('OK: 6 przykładów ZUS — zakresy dat i limit 9 tygodni. Nie testowano decyzji o prawie do świadczenia.');
