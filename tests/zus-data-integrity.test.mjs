// Verifies fixture integrity only. It does NOT verify awards, insurance or payments.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root = new URL('../knowledge/zus-cases/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
const initial = manifest.cases.filter(c => /^ZUS-0(0[1-9]|1[0-3])$/.test(c.id));
assert.equal(initial.length, 13, 'expected all 13 original cases');
const daysInclusive = (start, end) => {
  const a = Date.parse(start + 'T00:00:00Z'), b = Date.parse(end + 'T00:00:00Z');
  assert.ok(Number.isFinite(a) && Number.isFinite(b) && b >= a);
  return (b-a)/86400000 + 1;
};
const specs = [
  ['ZUS-001','parentalLeaveStart','parentalLeaveEnd','parentalLeaveDays'],
  ['ZUS-004','maternityStart','maternityEnd','maternityDays'],
  ['ZUS-005','claimStart','claimEnd','claimedDays'],
  ['ZUS-006','maternityStart','maternityEnd','maternityPaidDays'],
  ['ZUS-006','parentalStart','parentalEnd','parentalPaidDays'],
  ['ZUS-007','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
  ['ZUS-007','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
  ['ZUS-008','maternityReportedStart','maternityReportedEnd','maternityReportedDays'],
  ['ZUS-010','maternityClaimStart','maternityClaimEnd','maternityRequestedDays'],
  ['ZUS-010','supplementaryClaimStart','supplementaryClaimEnd','supplementaryRequestedDays'],
  ['ZUS-010','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
  ['ZUS-011','parentalClaimStart','parentalClaimEnd','parentalRequestedDays'],
  ['ZUS-012','sickLeaveReportedStart','sickLeaveReportedEnd','sickLeaveReportedDays'],
  ['ZUS-013','benefitReportedStart','benefitReportedEnd','benefitReportedCalendarDays']
];
const cases = new Map(initial.map(c => [c.id,JSON.parse(readFileSync(new URL(c.id+'/case.json', root),'utf8'))]));
for (const c of initial) {
  const fixture = cases.get(c.id);
  assert.equal(fixture.id,c.id);
  assert.ok(Array.isArray(fixture.evidence));
  assert.notEqual(fixture.status,'verified', 'none of these cases is fully verified yet');
}
for (const [id,a,b,expected] of specs) {
  const c=cases.get(id);
  assert.equal(daysInclusive(c.inputs[a],c.inputs[b]),c.expected[expected],id+': '+expected);
}
console.log('ZUS fixtures: 13 records and '+specs.length+' calendar-duration checks. This is NOT a ZUS award validation.');
