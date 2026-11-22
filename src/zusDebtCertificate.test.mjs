import assert from 'node:assert/strict';
import {
  WAGE_PERIODS,minimumWageForDate,thresholdForDate,
  amountForPreset,issueZusDebtCertificate,certificateMatches,
  renderZusDebtCertificateHtml,moneyPL
} from './zusDebtCertificate.ts';
import {assessEligibility,emptyCoverage} from './entitlementCheck.ts';

assert.equal(WAGE_PERIODS.length,7);
const thresholds=[
 ['2023-01-01',3490],['2023-06-30',3490],['2023-07-01',3600],
 ['2024-01-01',4242],['2024-06-30',4242],['2024-07-01',4300],
 ['2025-01-01',4666],['2026-01-01',4806],['2026-12-31',4806],
 ['2027-01-01',4950],['2027-12-31',4950]
];
for(const [d,v] of thresholds){
 assert.equal(thresholdForDate(d),v,d+' 1% threshold in grosze');
 assert.equal(minimumWageForDate(d).wagePLN,v/1);
}
for(const date of ['2022-12-31','2028-01-01','2026-02-30','','2026-13-01','2026-00-01']){
 assert.equal(thresholdForDate(date),null,date+' must not invent a wage');
 assert.throws(()=>issueZusDebtCertificate({owner:1,entitlementDate:date,preset:'zero'}),/datę powstania prawa/);
}
assert.equal(moneyPL(4806).includes('48,06'),true);
assert.equal(amountForPreset('zero',4806,''),0);
assert.equal(amountForPreset('below',4806,''),2500);
assert.equal(amountForPreset('equal',4806,''),4806);
assert.equal(amountForPreset('over',4806,''),12306);
assert.equal(amountForPreset('custom',4806,'48,06'),4806);
assert.equal(amountForPreset('custom',4806,'48.07'),4807);
assert.equal(amountForPreset('custom',4806,'0'),0);
assert.equal(amountForPreset('custom',4806,'0,1'),10);
for(const bad of ['-1','abc','1.234','1e3','1 000,00','','1,2,3','100000000']){
 assert.throws(()=>amountForPreset('custom',4806,bad),/kwotę|zakresem/,bad);
}
for(const [preset,expectCategory,expectConclusion] of [
 ['zero','none','none'],['below','small','within_threshold'],
 ['equal','small','within_threshold'],['over','over','above_threshold'],
 ['custom','over','above_threshold']
]){
 const cert=issueZusDebtCertificate({
  owner:1,entitlementDate:'2026-12-01',preset,
  ...(preset==='custom'?{customAmount:'48,07'}:{})
 });
 assert.equal(cert.demo,true);
 assert.equal(cert.category,expectCategory);
 assert.equal(cert.conclusion,expectConclusion);
 assert.equal(cert.thresholdGrosze,4806);
 assert.equal(cert.minimumWageGrosze,480600);
 assert.equal(cert.entitlementDate,'2026-12-01');
 assert.equal(cert.reference,'Dz.U. 2025 poz. 1242');
 assert.equal(Object.isFrozen(cert),true);
 assert.equal(certificateMatches(cert,1,'2026-12-01','dzialalnosc'),true);
 assert.equal(certificateMatches(cert,2,'2026-12-01','dzialalnosc'),false);
 assert.equal(certificateMatches(cert,1,'2027-01-01','dzialalnosc'),false);
 assert.equal(certificateMatches(cert,1,'2026-12-01','etat'),false);
 assert.equal(Object.hasOwn(cert,'pesel'),false);
 assert.equal(Object.hasOwn(cert,'zusSeal'),false);
 assert.equal(Object.hasOwn(cert,'signature'),false);
 const html=renderZusDebtCertificateHtml(cert);
 assert.match(html,/DEMO — NIE JEST DOKUMENTEM ZUS/);
 assert.match(html,/Dane w pełni syntetyczne/);
 assert.match(html,/48,06/);
 assert.match(html,/Art. 2a/);
 assert.doesNotMatch(html,/PESEL/);
}
const threshold=issueZusDebtCertificate({owner:2,entitlementDate:'2027-01-01',preset:'equal'});
assert.equal(threshold.thresholdGrosze,4950);
assert.equal(threshold.amountGrosze,4950);
assert.equal(threshold.conclusion,'within_threshold','Exactly 1% is not exceeding 1%');
const above=issueZusDebtCertificate({owner:1,entitlementDate:'2026-12-01',preset:'over'});
const eligibility=(demoDebtSource,category)=>assessEligibility({
 kind:'maternity',employment:'dzialalnosc',insured:'tak',debt:category,
 coverage:{...emptyCoverage(),startDate:'2025-01-01'},
 eventDate:'2026-12-01',eventConfirmed:true,demoDebtSource
});
assert.equal(eligibility(true,'none').status,'review','Mock zero cannot prove no debt');
assert.equal(eligibility(true,'small').status,'review','Mock below threshold cannot prove eligibility');
assert.equal(eligibility(true,'over').status,'blocked_standard','Mock excess keeps risk blocking');
assert.equal(eligibility(false,'none').status,'possible','Ordinary previously entered data unchanged');
assert.match(eligibility(true,above.category).details.join(' '),/symulowanego zaświadczenia/);
console.log('OK: ZUS debt DEMO legal thresholds 2023–2027, exact 1%, amounts, certificates, risk screening and no-real-data safeguards');
