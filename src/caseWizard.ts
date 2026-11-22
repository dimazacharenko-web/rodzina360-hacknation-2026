/** Konkursowe przypadki — tylko potwierdzone daty i jawne założenia demonstracyjne.
 * Nie zastępuje weryfikacji prawa ZUS ani źródłowych PDF.
 */
import {paymentCases} from './paymentFixtures.ts';
import {plusDays} from './leaveRules.ts';
import type {LeaveEntry} from './flexibleLeave.ts';

export type WizardCase={
 id:string;title:string;birthDate:string;birthDateVerified:boolean;
 entries:LeaveEntry[];motherEmployment:''|'etat'|'zlecenie'|'dzialalnosc';
 motherInsured:''|'tak'|'nie'|'nie_wiem';
 fatherIncluded:boolean;fatherEmployment:''|'etat'|'zlecenie'|'dzialalnosc';
 fatherInsured:''|'tak'|'nie'|'nie_wiem';
 sourceFacts:string[];unknowns:string[];assumptions:string[];decision:'denied'|'granted'|'unconfirmed';
 sickness?:{from:string;to:string};maternityDaysInSource:boolean;
};
export function makeWizardCase(id:string):WizardCase{
 const c=paymentCases.find(c=>c.id===id);
 if(!c)throw Error('Nieznany przykład konkursowy: '+id);
 const firstAny=c.sample.parentalEntries[0];
 // Tylko 4 sprawy mają datę porodu z akt; w pozostałych data jest sztucznym
 // punktem odniesienia do wizualizacji harmonogramu, NIE datą porodu w aktach.
 const knownBirth:Record<string,string>={'ZUS-007':'2025-11-13','ZUS-014':'2024-02-16','ZUS-027':'2025-06-12','ZUS-034':'2024-01-23','ZUS-037':'2026-04-28','ZUS-045':'2025-02-03'};
 const birthDateVerified=id==='ZUS-027'||id==='ZUS-045';
 const birthDate=knownBirth[id]??plusDays(firstAny.start,-140);
 const fatherIncluded=c.sample.parentalEntries.some(e=>e.owner===2);
 const unknowns:string[]=[];
 if(!birthDateVerified)unknowns.push('Faktyczna data porodu nie została potwierdzona. Jako datę odniesienia w harmonogramie przyjęto początek wykazanego okresu macierzyńskiego: '+birthDate+'.');
 unknowns.push('Dokładna miesięczna podstawa wymiaru zasiłku nie jest podana w użytych danych.');
 const motherEmployment:WizardCase['motherEmployment']=id==='ZUS-014'||id==='ZUS-034'||id==='ZUS-037'?'dzialalnosc':id==='ZUS-045'?'etat':'';
 const motherInsured:WizardCase['motherInsured']=id==='ZUS-014'||id==='ZUS-037'?'tak':id==='ZUS-027'?'nie':'nie_wiem';
 const fatherInsured:WizardCase['fatherInsured']=fatherIncluded?'nie_wiem':'';
 if(motherEmployment==='')unknowns.push('Tytuł ubezpieczenia osoby rodzącej nie jest udokumentowany w danych, które wykorzystano do automatycznego wypełnienia.');
 if(motherInsured==='nie_wiem')unknowns.push('Status ubezpieczenia osoby rodzącej wymaga potwierdzenia w ZUS.');
 if(fatherIncluded)unknowns.push('Tytuł i status ubezpieczenia ojca nie zostały potwierdzone; pokazujemy wyłącznie okres z wniosku.');
 const assumptions=['W przykładzie symulacja nie ustala indywidualnego prawa do zasiłku.'];
 if(id==='ZUS-037')assumptions.push('Podział 364 dni na 140 macierzyńskiego + 224 rodzicielskiego jest modelem, a nie odtworzeniem decyzji ZUS.');
 if(!birthDateVerified)assumptions.push('Data początkowa modelowa wymaga uzupełnienia.');
 if(id==='ZUS-027')assumptions.push('Przykład pokazuje okresy wniosku; ZUS odmówił wypłaty.');
 const entries:LeaveEntry[]=c.sample.parentalEntries.map((e,i)=>({id:id+'-p'+i,owner:e.owner,start:e.start,end:e.end,used:false}));
 const sourceFacts=['Sprawa '+id+': '+c.source+'.','Rozpatrywany okres: '+c.expectedDays+' dni.','Wynik źródłowy: '+(c.decision==='denied'?'odmowa':c.decision==='granted'?'przyznano / wypłacono (bez podanej kwoty)':'wniosek; decyzja niepotwierdzona')+'.'];
 if(birthDateVerified)sourceFacts.push('Potwierdzona data urodzenia: '+birthDate+'.');
 else sourceFacts.push('Początek okresu macierzyńskiego z dokumentów: '+birthDate+' (nie potwierdza to daty urodzenia).');
 return {id,title:c.title,birthDate,birthDateVerified,entries,motherEmployment,motherInsured,
  fatherIncluded,fatherEmployment:'',fatherInsured,unknowns,sourceFacts,assumptions,decision:c.decision,
  sickness:id==='ZUS-037'?{from:'2026-02-02',to:'2026-04-27'}:undefined,
  maternityDaysInSource:true};
}
