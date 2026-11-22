import assert from 'node:assert/strict';
import {
 pueDemoAccount,simulatePueInquiry,validatePueInquiry,
 PUE_INQUIRY_TOPICS,PUE_DEMO_DISCLAIMER,PUE_INQUIRY_DISCLAIMER
} from './pueEzUSDemo.ts';
import {zusInsuranceDemoRecords} from './zusInsuranceDemo.ts';
import {ezlaDemoRecords,summarizeEzlaRecord} from './ezlaDemo.ts';

assert.match(PUE_DEMO_DISCLAIMER,/bez połączenia z ZUS/);
assert.match(PUE_INQUIRY_DISCLAIMER,/nie jest wysyłana do ZUS/);
for(const record of zusInsuranceDemoRecords){
 const account=pueDemoAccount(record.id);
 assert.equal(account.synthetic,true);
 assert.equal(account.scenarioId,record.id);
 assert.equal(account.insured,record.insured==='tak');
 assert.equal(account.employment,record.employment);
 assert.equal(account.coverageFrom,record.startDate);
 assert.equal(account.coverageTo,record.endDate||null);
 assert.equal(Object.isFrozen(account),true);
 for(const forbidden of ['pesel','password','token','name','apiKey']){
  assert.equal(Object.hasOwn(account,forbidden),false,'No '+forbidden+' in synthetic account');
 }
 if(account.contributionBasePLN!==null)assert.ok(account.contributionBasePLN>=0);
}
assert.equal(pueDemoAccount('no_insurance').insured,false);
assert.equal(pueDemoAccount('no_insurance').contributionBasePLN,null);
assert.equal(pueDemoAccount('jdg_debt').employment,'dzialalnosc');
assert.match(pueDemoAccount('jdg_debt').debtOverview,/próg 1%/);
assert.equal(ezlaDemoRecords.length,4);
assert.equal(summarizeEzlaRecord(ezlaDemoRecords.find(r=>r.id==='cancelled')).canUseForSimulation,false);

assert.equal(PUE_INQUIRY_TOPICS.length,5);
assert.equal(new Set(PUE_INQUIRY_TOPICS.map(t=>t.id)).size,5);
assert.match(validatePueInquiry('  short  '),/10 znaków/);
assert.equal(validatePueInquiry('  Jak sprawdzić ubezpieczenie?  '),null);
assert.match(validatePueInquiry('x'.repeat(1001)),/1000 znaków/);
assert.equal(validatePueInquiry('x'.repeat(1000)),null);
for(const topic of PUE_INQUIRY_TOPICS){
 const query=simulatePueInquiry({
  topic:topic.id,question:'  Proszę sprawdzić te dane DEMO  ',sequence:1
 });
 assert.equal(query.id,'DEMO-ZAP-001');
 assert.equal(query.status,'not_sent_demo');
 assert.equal(query.synthetic,true);
 assert.equal(query.topic,topic.id);
 assert.equal(query.question,'Proszę sprawdzić te dane DEMO');
 assert.ok(query.guidance.length>35);
 assert.equal(Object.isFrozen(query),true);
 assert.equal(Object.hasOwn(query,'sentAt'),false);
 assert.equal(Object.hasOwn(query,'delivered'),false);
 assert.equal(Object.hasOwn(query,'replyFromZUS'),false);
}
assert.equal(simulatePueInquiry({topic:'insurance',question:'Co z moim ubezpieczeniem?',sequence:18}).id,'DEMO-ZAP-018');
for(const wrong of [0,-1,1.5,NaN,10000])assert.throws(()=>simulatePueInquiry({
 topic:'insurance',question:'Czy moje składki są prawidłowe?',sequence:wrong
}),/numer zgłoszenia/);
assert.throws(()=>simulatePueInquiry({
 topic:'fake_topic',question:'Czy moje składki są prawidłowe?',sequence:1
}),/Nieznany temat/);
assert.throws(()=>simulatePueInquiry({
 topic:'insurance',question:' Krótkie ',sequence:1
}),/10 znaków/);
console.log('OK: PUE/eZUS synthetic account lookup, contribution base, unsent inquiry, validation, no credentials or official reply');
