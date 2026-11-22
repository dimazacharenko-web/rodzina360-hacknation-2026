import assert from 'node:assert/strict';
import {
 SUPPORT_RESOURCES,SUPPORT_KINDS,SUPPORT_TOPICS,CRISIS_SUPPORT,
 filterSupportResources,initialSupportTopic
} from './supportDirectory.ts';

assert.equal(SUPPORT_RESOURCES.length,6);
assert.equal(new Set(SUPPORT_RESOURCES.map(r=>r.id)).size,SUPPORT_RESOURCES.length);
assert.ok(SUPPORT_TOPICS.some(x=>x.id==='child_loss'));
assert.ok(SUPPORT_KINDS.some(x=>x.id==='legal'));
assert.equal(initialSupportTopic('loss'),'child_loss');
assert.equal(initialSupportTopic('other'),'prematurity');
assert.equal(initialSupportTopic('adoption'),'all');
assert.equal(initialSupportTopic('none'),'all');

for(const entry of SUPPORT_RESOURCES){
 assert.ok(entry.name.length>3&&entry.summary.length>20);
 assert.equal(entry.verifiedOn,'2026-11-22');
 assert.ok(entry.topics.length>0&&entry.kinds.length>0);
 const target=new URL(entry.url);
 assert.equal(target.protocol,'https:');
 assert.ok(!target.username&&!target.password);
 assert.ok(!target.hostname.includes('github.com'));
 for(const topic of entry.topics)assert.ok(SUPPORT_TOPICS.some(o=>o.id===topic));
 for(const kind of entry.kinds)assert.ok(SUPPORT_KINDS.some(o=>o.id===kind));
}

const all=filterSupportResources();
assert.equal(all.length,SUPPORT_RESOURCES.length);
const childLoss=filterSupportResources('child_loss');
assert.ok(childLoss.some(x=>x.id==='nagle-sami'));
assert.ok(childLoss.some(x=>x.id==='razem-na-maksa'));
assert.ok(!childLoss.some(x=>x.id==='wczesniak'));
assert.ok(childLoss.every(x=>x.topics.includes('child_loss')));

const pregnancy=filterSupportResources('pregnancy_loss','legal');
assert.deepEqual(pregnancy.map(x=>x.id),['ernesta']);
const premature=filterSupportResources('prematurity','peer');
assert.deepEqual(premature.map(x=>x.id),['wczesniak']);
assert.equal(filterSupportResources('child_loss','medical').length,0);
assert.equal(filterSupportResources('serious_diagnosis','medical').some(x=>x.id==='gajusz'),true);
assert.ok(filterSupportResources('family_grief').some(x=>x.id==='tumbo'));
assert.deepEqual(filterSupportResources('all','all','WCZESNIAK').map(x=>x.id),['wczesniak'],
 'Search must be accent- and case-insensitive');
assert.deepEqual(filterSupportResources('all','all','Rodzice-Rodzicom').map(x=>x.id),['wczesniak']);
assert.deepEqual(filterSupportResources('all','all','nie-ma-takiej-organizacji'),[]);
assert.deepEqual(filterSupportResources('pregnancy_loss','all','prawna').map(x=>x.id),['ernesta']);
assert.equal(SUPPORT_RESOURCES.length,6,'Filtering must not mutate the source directory');
assert.equal(CRISIS_SUPPORT.phone,'800 70 2222');
assert.equal(CRISIS_SUPPORT.emergency,'112');
assert.ok(CRISIS_SUPPORT.url.startsWith('https://www.gov.pl/'));
console.log('OK: source integrity, sensitive situation filters, accent search and crisis references');
