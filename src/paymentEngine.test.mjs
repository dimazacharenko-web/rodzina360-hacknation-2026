import assert from 'node:assert/strict';
import {calculateMoney} from './paymentEngine.ts';
import {paymentCases,auditPaymentCase} from './paymentFixtures.ts';
assert.equal(paymentCases.length,6);
const expected=new Map([['ZUS-007',59360],['ZUS-014',59360],['ZUS-034',59360],['ZUS-037',59360],['ZUS-045',59360]]);
for(const fixture of paymentCases){
 const r=auditPaymentCase(fixture);
 assert.equal(r.periodOK,true,fixture.id+' days');
 assert.equal(r.blockedOK,true,fixture.id+' blocked');
 if(expected.has(fixture.id))assert.equal(r.amount,expected.get(fixture.id),fixture.id+' synthetic amount');
 else assert.equal(r.amount,0,fixture.id+' must not show payable amount');
 assert.equal(r.derivedAmountIsSynthetic,true);
}
const mother=paymentCases.find(p=>p.id==='ZUS-007').sample;
const avg=calculateMoney({...mother,variant:'averaged',averagedConfirmed:true});
assert.equal(avg.parents[0].periods[0].rate,.815);
assert.equal(avg.parents[0].periods[1].rate,.815);
assert.equal(avg.futureGross, (140+224)*163);
const used=calculateMoney({...mother,maternityUsedDays:70,
 parentalEntries:mother.parentalEntries.map(p=>({...p,used:true}))});
assert.equal(used.parents[0].futureGross,14000);
assert.equal(used.parents[0].historicalGross,14000+31360);
const fatherPeriod={id:'father',owner:2,start:'2026-09-29',end:'2026-11-30',days:63,used:false};
const fatherAverage=calculateMoney({...mother,parentalEntries:[fatherPeriod],variant:'averaged',averagedConfirmed:true,insured:[true,true],bases:[6000,6000],employment:['etat','etat']});
assert.equal(fatherAverage.parents[1].periods[0].rate,.70);
const debt=calculateMoney({...mother,employment:['dzialalnosc',''],debts:['over','none']});
assert.equal(debt.parents[0].status,'requires_zus');
assert.equal(debt.futureGross,0);
const missing=calculateMoney({...mother,bases:[null,null]});
assert.equal(missing.futureGross,0);
assert.equal(missing.parents[0].status,'requires_zus');
const special=calculateMoney({...mother,special:true});
assert.equal(special.futureGross,0);
const blockedScreening=calculateMoney({...mother,entitlementStatuses:['blocked_standard','review']});
assert.equal(blockedScreening.parents[0].status,'requires_zus');
assert.equal(blockedScreening.futureGross,0,'Brak prawa w trybie standardowym nie może być przedstawiony jako wypłata');
const reviewScreening=calculateMoney({...mother,entitlementStatuses:['review','review']});
assert.ok(reviewScreening.warnings.some(x=>/hipotetyczn/.test(x)),'Niepotwierdzony stan ubezpieczenia musi zostać oznaczony');
console.log('OK: six ZUS scenario dates and synthetic payments, one documented denial, used leaves, 81.5% and 70%, JDG debt and missing basis');
