import assert from 'node:assert/strict';
import {
 buildFormTemplates,emptyFormDraft,validateFormDraft,makeDemoSubmission,
 renderFormDraftHtml,FORMS_DEMO_DISCLAIMER,OFFICIAL_ZAM
} from './applicationFormsDemo.ts';

const input={
 mode:'birth',eventDate:'2027-01-15',eventConfirmed:true,childCount:1,
 employment1:'etat',employment2:'etat',insured1:true,insured2:true,
 maternityStart:'2027-01-15',maternityEnd:'2027-06-03',
 periods:[
  {id:'p1',owner:1,start:'2027-06-04',end:'2028-01-13',used:false},
  {id:'p2',owner:2,start:'2028-01-14',end:'2028-03-16',used:false},
  {id:'used',owner:1,start:'2027-01-15',end:'2027-02-11',used:true}
 ],
 variant:'standard'
};
const forms=buildFormTemplates(input);
assert.equal(forms.length,5,'one birth notice, two parental employer leave requests and two ZAM worksheets');
assert.ok(forms.some(t=>t.kind==='birth_notice'&&t.owner===1));
assert.ok(!forms.some(t=>t.kind==='care_leave'),'No special care request for birth');
assert.ok(!forms.some(t=>t.kind==='parental_leave'&&t.id.includes('used')));
assert.equal(forms.filter(t=>t.kind==='parental_leave').length,2);
assert.equal(forms.filter(t=>t.kind==='zam_worksheet').length,2);
assert.ok(forms.find(t=>t.kind==='birth_notice').warning.includes('nie składa'));
assert.ok(forms.find(t=>t.kind==='zam_worksheet').sourceUrl===OFFICIAL_ZAM);
assert.ok(forms.every(x=>x.mode==='birth'&&x.variant==='standard'));
assert.deepEqual(new Set(forms.map(x=>x.id)).size,forms.length);
assert.equal(forms.find(x=>x.owner===2&&x.kind==='parental_leave').from,'2028-01-14');
const defaultData=emptyFormDraft();
assert.match(defaultData.applicant,/DEMO/);
const chosen=forms.find(t=>t.kind==='parental_leave');
const first=validateFormDraft(chosen,defaultData);
assert.equal(first.ready,false);
assert.equal(first.errors.length,3);
assert.ok(first.errors.some(x=>x.includes('załączników')));
const readyData={...defaultData,childDetailsConfirmed:true,attachmentsChecked:true,demoAcknowledged:true};
const validation=validateFormDraft(chosen,readyData);
assert.equal(validation.ready,true);
assert.equal(validation.errors.length,0);
assert.ok(validation.warnings.some(x=>x.includes('21 dni')));
const emptyEmployer=validateFormDraft(chosen,{...readyData,employer:''});
assert.equal(emptyEmployer.ready,false);
assert.ok(emptyEmployer.errors.some(x=>x.includes('pracodawcy')));
const zam=forms.find(t=>t.kind==='zam_worksheet');
assert.equal(validateFormDraft(zam,{...readyData,employer:''}).ready,true,
 'Employer name not required for ZUS worksheet');
const html=renderFormDraftHtml(chosen,readyData);
assert.match(html,/DEMO · NIE WYSŁANO · NIE JEST DOKUMENTEM ZUS/);
assert.match(html,/2027-06-04/);
assert.match(html,/2028-01-13/);
assert.match(html,/Rodzic DEMO/);
assert.match(html,/Drukuj \/ zapisz jako PDF/);
assert.match(html,/Bez numeru PESEL/,'Demo print explains lack of real identifiers');
const zamHtml=renderFormDraftHtml(zam,readyData);
assert.match(zamHtml,/Arkusz danych do ZAM/);
assert.match(zamHtml,/https:\/\/www.zus.pl/);
assert.match(zamHtml,/100%\/70%/);
const escaped=renderFormDraftHtml(chosen,{...readyData,applicant:'<img src=x onerror=alert(1)>'});
assert.ok(!escaped.includes('<img'));
assert.ok(escaped.includes('&lt;img'));
assert.throws(()=>renderFormDraftHtml(chosen,defaultData),/Potwierdź/);
assert.throws(()=>makeDemoSubmission(chosen,defaultData,1),/Potwierdź/);
const submitted=makeDemoSubmission(chosen,readyData,3);
assert.deepEqual(submitted,{
 id:'DEMO-WYS-003',formId:chosen.id,recipient:'employer',status:'NOT_SENT_DEMO',
 message:'Symulacja zakończona. NIE WYSŁANO do pracodawcy. Brak potwierdzenia wpływu.'
});
assert.equal(Object.isFrozen(submitted),true);
const subZam=makeDemoSubmission(zam,readyData,1);
assert.equal(subZam.recipient,'zus');
assert.match(subZam.message,/NIE WYSŁANO do ZUS/);
for(const n of [0,-1,1.5,NaN,10000])assert.throws(()=>makeDemoSubmission(zam,readyData,n),/numer symulacji/);
assert.match(FORMS_DEMO_DISCLAIMER,/NIE przekazuje dokumentów/);
assert.equal(buildFormTemplates({...input,employment1:'dzialalnosc',employment2:'',insured2:false,periods:[]}).filter(x=>x.recipient==='employer').length,0,
 'JDG never gets employee leave application');
assert.equal(buildFormTemplates({...input,employment1:'zlecenie',employment2:'',insured2:false,periods:[]}).filter(x=>x.recipient==='employer').length,0);
assert.equal(buildFormTemplates({...input,employment1:'',insured1:false,employment2:'',insured2:false,periods:[]}).length,0);
assert.equal(buildFormTemplates({...input,eventDate:''}).length,0);
assert.equal(buildFormTemplates({...input,eventDate:'2027-02-30'}).length,0);
assert.equal(buildFormTemplates({...input,maternityEnd:'2026-01-01'}).length,0);
const care=buildFormTemplates({...input,
 mode:'adoption',eventDate:'2026-12-01',maternityStart:'2026-12-01',maternityEnd:'2027-04-19',periods:[]});
assert.ok(care.some(x=>x.kind==='care_leave'));
assert.ok(care.some(x=>x.attachmentHints.some(y=>y.includes('sądu'))));
assert.ok(!care.some(x=>x.kind==='birth_notice'));
const foster=buildFormTemplates({...input,mode:'foster',periods:[]});
assert.ok(foster.some(x=>x.kind==='care_leave'));
assert.ok(foster.some(x=>x.attachmentHints.some(y=>y.includes('niezawodowej'))));
const averaged=buildFormTemplates({...input,variant:'averaged'});
assert.ok(averaged.find(x=>x.kind==='zam_worksheet').warning.includes('81,5%'));
assert.match(renderFormDraftHtml(averaged.find(x=>x.kind==='zam_worksheet'),readyData),/81,5%/);
console.log('OK: birth/care employer leave designs, ZAM worksheets, dual parents, JDG routing, safe HTML and mock submission');
