import assert from 'node:assert/strict';
import {
 OFFICIAL_SOURCE_LIBRARY,INSTITUTION_LABELS,hasEmployee,
 recommendedOfficialIds,officialSourcesFor
} from './officialRightsSources.ts';

const base={
 mode:'birth',employment1:'etat',employment2:'',secondIncluded:false,averaged:false
};
assert.equal(OFFICIAL_SOURCE_LIBRARY.length,11);
assert.equal(new Set(OFFICIAL_SOURCE_LIBRARY.map(x=>x.id)).size,OFFICIAL_SOURCE_LIBRARY.length);
assert.deepEqual(Object.keys(INSTITUTION_LABELS).sort(),['MRPiPS','PIP','ZUS']);
for(const x of OFFICIAL_SOURCE_LIBRARY){
 assert.match(x.id,/^[a-z0-9-]+$/);
 assert.equal(x.reviewedOn,'2026-11-22');
 assert.ok(x.title.length>8&&x.description.length>25);
 assert.ok(x.topic&&typeof x.employmentOnly==='boolean');
 const u=new URL(x.url);
 assert.equal(u.protocol,'https:');
 assert.equal(u.username,'');
 assert.equal(u.password,'');
 assert.equal(u.search,'','No sensitive data or tracking query strings');
 if(x.institution==='ZUS')assert.equal(u.hostname,'www.zus.pl');
 if(x.institution==='MRPiPS')assert.equal(u.hostname,'www.gov.pl');
 if(x.institution==='PIP')assert.equal(u.hostname,'www.pip.gov.pl');
}
const sources=officialSourcesFor(base);
assert.ok(sources.some(s=>s.institution==='ZUS'));
assert.ok(sources.some(s=>s.institution==='MRPiPS'));
assert.ok(sources.some(s=>s.institution==='PIP'));
assert.ok(sources.some(s=>s.id==='gov-parental'));
assert.ok(sources.some(s=>s.id==='pip-parental'));
assert.equal(hasEmployee(base),true);
assert.equal(officialSourcesFor(base,'all','all',true).length,11);

const jdg={...base,employment1:'dzialalnosc'};
assert.equal(hasEmployee(jdg),false);
const jdgDocs=officialSourcesFor(jdg);
assert.ok(jdgDocs.some(s=>s.id==='zus-insurance'));
assert.ok(jdgDocs.some(s=>s.id==='zus-eligibility'));
assert.ok(jdgDocs.every(s=>!s.employmentOnly),
 'Never infer employment-only leave as a JDG or contract right');
assert.ok(officialSourcesFor(jdg,'all','PIP',true).some(s=>s.id==='pip-parental'),
 'Full catalogue still offers access to labour law for any user');
assert.equal(hasEmployee({...jdg,employment2:'etat',secondIncluded:false}),false);
assert.equal(hasEmployee({...jdg,employment2:'etat',secondIncluded:true}),true);
assert.ok(officialSourcesFor({...jdg,employment2:'etat',secondIncluded:true})
 .some(s=>s.institution==='PIP'));

const adoption=officialSourcesFor({...base,mode:'adoption'});
assert.ok(adoption.some(s=>s.id==='gov-adoption'));
assert.ok(adoption.some(s=>s.id==='pip-parental'));
const foster=officialSourcesFor({...base,mode:'foster'});
assert.ok(foster.some(s=>s.id==='pip-foster'));
assert.ok(foster.some(s=>s.id==='gov-adoption'));
const loss=officialSourcesFor({...base,mode:'loss'});
assert.ok(loss.some(s=>s.id==='gov-maternity'));
assert.ok(!loss.some(s=>s.id==='gov-parental'));
assert.ok(recommendedOfficialIds({...base,averaged:true}).includes('zus-rate'));
assert.ok(!recommendedOfficialIds(base).includes('zus-rate'));

const pips=officialSourcesFor(base,'all','PIP',true);
assert.equal(pips.length,2);
assert.ok(pips.every(s=>s.institution==='PIP'));
const leaves=officialSourcesFor(base,'leave','all',true);
assert.ok(leaves.some(s=>s.id==='gov-parental'));
assert.ok(leaves.every(s=>s.topic==='leave'));
assert.deepEqual(officialSourcesFor(base,'insurance','PIP',true),[]);
assert.equal(officialSourcesFor(base,'documents','ZUS',true).length,2);
assert.equal(new Set(recommendedOfficialIds(base)).size,recommendedOfficialIds(base).length);

console.log('OK: official source integrity, all institutions, context, JDG limits and filters');
