import assert from 'node:assert/strict';
import {createDocumentPlan,exportCalendar,officialSources} from './documentPlanner.ts';
const base={birthDate:'2027-01-30',actualBirth:true,employment1:'etat',employment2:'etat',secondEligible:true,variant:'averaged',sickness:false,debtRisk:false,
 entries:[{id:'a',owner:1,start:'2027-06-19',end:'2027-07-16',used:false,days:28,employerDeadline:'2027-05-29'},
 {id:'b',owner:2,start:'2027-06-19',end:'2027-08-13',used:false,days:56,employerDeadline:'2027-05-29'},
 {id:'old',owner:1,start:'2027-05-01',end:'2027-05-28',used:true,days:28,employerDeadline:null}]};
const items=createDocumentPlan(base);
assert.equal(items.find(x=>x.id==='averaged').date,'2027-02-20');
assert.equal(items.filter(x=>x.id.startsWith('leave-')).length,2);
assert.equal(items.filter(x=>x.id.startsWith('benefit-')).length,2);
assert.equal(items.find(x=>x.id==='leave-a').date,'2027-05-29');
assert.equal(items.find(x=>x.id==='leave-b').date,'2027-05-29');
assert.ok(!items.some(x=>x.id==='leave-old'));
assert.ok(items.every(x=>x.url.startsWith('https://')));
const ics=exportCalendar(items);assert.match(ics,/BEGIN:VCALENDAR/);assert.match(ics,/DTSTART;VALUE=DATE:20270220/);
assert.ok(!ics.includes('DTSTART;VALUE=DATE:20270501'));
const jdg=createDocumentPlan({...base,employment1:'dzialalnosc',employment2:'zlecenie',debtRisk:true,sickness:true});
assert.equal(jdg.filter(x=>x.id.startsWith('leave-')).length,0);
assert.ok(jdg.some(x=>x.id==='debt'));
assert.ok(jdg.some(x=>x.id==='sickness'));
assert.ok(jdg.some(x=>x.id==='maternity-jdg'));
assert.ok(jdg.some(x=>x.id==='benefit-a'));
const standard=createDocumentPlan({...base,variant:'standard'});
assert.ok(!standard.some(x=>x.id==='averaged'));
assert.match(officialSources.zusZam,/zus.pl/);
console.log('OK: application routes, ZAM/Z-3 forms, conditional deadlines, iCalendar, B2B and used leave');
