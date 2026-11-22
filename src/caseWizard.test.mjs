import assert from 'node:assert/strict';
import {paymentCases,auditPaymentCase} from './paymentFixtures.ts';
import {examples,auditExample} from './caseExamples.ts';
import {makeWizardCase} from './caseWizard.ts';
import {calculateFlexiblePlan} from './flexibleLeave.ts';
import {calculateMoney} from './paymentEngine.ts';
const a=paymentCases.map(c=>c.id).sort(),b=examples.map(c=>c.id).sort();
assert.deepEqual(a,b,'Krok 1 i krok 4 muszą zawierać te same sprawy ZUS');
assert.equal(a.length,6);
for(const item of paymentCases){
 const id=item.id,loaded=makeWizardCase(id);
 assert.equal(loaded.id,id);
 assert.ok(loaded.sourceFacts.length>0);
 assert.ok(loaded.unknowns.length>0);
 assert.ok(loaded.birthDate.length===10);
 assert.equal(loaded.entries.length,item.sample.parentalEntries.length);
 const computed=calculateFlexiblePlan(loaded.birthDate,1,loaded.entries,false);
 assert.equal(computed.plannedDays+item.sample.maternityDays,item.expectedDays,id+' full scenario');
 assert.equal(auditExample(examples.find(e=>e.id===id)).pass,true,id+' date evidence');
 const money=auditPaymentCase(item);
 assert.equal(money.periodOK,true,id);
 assert.equal(money.blockedOK,true,id);
 if(item.decision==='denied'){
  const payment=calculateMoney(item.sample);
  assert.equal(payment.futureGross,0,'Nie wolno prezentować odmownego świadczenia jako należnego');
 }
 console.log('PASS '+id+': krok 1 → 2 → 3 → 4, okresy i decyzja');
}
assert.equal(makeWizardCase('ZUS-045').birthDateVerified,true);
assert.equal(makeWizardCase('ZUS-007').birthDateVerified,false,'Start macierzyńskiego ≠ dowód daty urodzenia');
console.log('OK: Six four-stage ZUS tutorial fixtures; PLN outcomes synthetic, not ZUS-verified');
