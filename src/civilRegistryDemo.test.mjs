import assert from 'node:assert/strict';
import {
 emptyCivilRegistryDraft,assessCivilRegistryDraft,renderCivilRegistryDraftHtml,
 makeCivilRegistryReceipt,CIVIL_REGISTRY_DISCLAIMER,CIVIL_REGISTRY_SERVICE
} from './civilRegistryDemo.ts';

const input={eventDate:'2027-03-16',eventConfirmed:true,children:2};
const base=emptyCivilRegistryDraft();
assert.equal(base.kind,'short');
assert.equal(base.purpose,'zus');
assert.match(CIVIL_REGISTRY_DISCLAIMER,/Nie wysyłamy danych do USC/);
assert.ok(CIVIL_REGISTRY_SERVICE.startsWith('https://www.gov.pl/'));

const initial=assessCivilRegistryDraft(input,base);
assert.equal(initial.ready,false);
assert.equal(initial.feePLN,0);
assert.ok(initial.errors.some(x=>x.includes('zarejestrowany')));
assert.ok(initial.errors.some(x=>x.includes('opłaty')));
assert.throws(()=>makeCivilRegistryReceipt(input,base,1),/Potwierdź/);
assert.throws(()=>renderCivilRegistryDraftHtml(input,base),/Potwierdź/);

const ready={...base,registered:true,detailsConfirmed:true,feeReviewed:true,demoAcknowledged:true};
const zus=assessCivilRegistryDraft(input,ready);
assert.equal(zus.ready,true);
assert.equal(zus.errors.length,0);
assert.equal(zus.feePLN,0);
assert.match(zus.feeDescription,/Potwierdza USC/);
assert.equal(zus.deliveryLabel,'Elektronicznie — e-Doręczenia');

const privateShort=assessCivilRegistryDraft(input,{...ready,purpose:'private'});
assert.equal(privateShort.feePLN,22);
const privateFull=assessCivilRegistryDraft(input,{...ready,purpose:'private',kind:'full',delivery:'post',childNumber:2});
assert.equal(privateFull.feePLN,33);
assert.equal(privateFull.copyLabel,'Odpis zupełny aktu urodzenia');
assert.equal(privateFull.deliveryLabel,'Papierowo — pocztą');
assert.match(privateFull.feeDescription,/33 zł/);

assert.equal(assessCivilRegistryDraft({...input,eventConfirmed:false},ready).ready,false,
 'Expected date cannot authorize filing');
assert.equal(assessCivilRegistryDraft({...input,eventDate:'2027-02-30'},ready).ready,false,
 'Invalid calendar date is rejected');
assert.equal(assessCivilRegistryDraft({...input,children:1},{...ready,childNumber:2}).ready,false,
 'Cannot select second child when only one exists');
assert.equal(assessCivilRegistryDraft(input,{...ready,childNumber:0}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,childNumber:1.5}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,purpose:'other',otherPurpose:''}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,purpose:'other',otherPurpose:'Dokumenty do sprawy szkolnej'}).ready,true);
assert.equal(assessCivilRegistryDraft(input,{...ready,applicant:'A'}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,childName:'Dziecko\nTEST'}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,detailsConfirmed:false}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,feeReviewed:false}).ready,false);
assert.equal(assessCivilRegistryDraft(input,{...ready,demoAcknowledged:false}).ready,false);

const html=renderCivilRegistryDraftHtml(input,{...ready,kind:'full',purpose:'private',delivery:'office'});
for(const part of ['DEMO — NIE WYSŁANO','TO NIE JEST ODPIS USC','2027-03-16',
 'Odpis zupełny aktu urodzenia','33 zł','Nie wniesiono opłaty','gov.pl']) assert.ok(html.includes(part),part);
const escaped=renderCivilRegistryDraftHtml(input,{...ready,applicant:'<script>alert("x")</script>'});
assert.ok(!escaped.includes('<script>'));
assert.ok(escaped.includes('&lt;script&gt;'));
const receipt=makeCivilRegistryReceipt(input,ready,1);
assert.deepEqual(receipt,{
 id:'DEMO-USC-001',status:'NOT_SENT_DEMO',recipient:'USC',
 message:'Symulacja zakończona. NIE WYSŁANO wniosku do USC. NIE DOKONANO PŁATNOŚCI. Brak urzędowego potwierdzenia.'
});
assert.equal(Object.isFrozen(receipt),true);
for(const n of [0,-1,1.5,10000,NaN])
 assert.throws(()=>makeCivilRegistryReceipt(input,ready,n),/numer symulacji/);
console.log('OK: USC DEMO validations, fee rules, legal prerequisites, safe HTML and non-sending receipt');
