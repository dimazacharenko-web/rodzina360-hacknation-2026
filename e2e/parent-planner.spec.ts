import {test,expect,type Page} from '@playwright/test';

async function fillParent(page:Page,index:number,employment:string,insured='tak'){
 const card=page.locator('.parent-card').nth(index);
 await card.getByLabel('Tytuł do ubezpieczenia chorobowego').selectOption(employment);
 await card.getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?').selectOption(insured);
}
async function standardStart(page:Page,family:'two'|'one'='two'){
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 if(family==='one')await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'etat');
 if(family==='two')await fillParent(page,1,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('heading',{name:'Zaplanuj urlopy i zwolnienie w ciąży'})).toBeVisible();
}
async function showPlan(page:Page){
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await expect(page.getByRole('heading',{name:'Twój plan urlopów i formalności'})).toBeVisible();
}
test('Desktop/mobile: standard family flows through 4 steps, forms and simulation',async({page})=>{
 await standardStart(page);
 await expect(page.getByText('287 dni').first()).toBeVisible();
 await showPlan(page);
 await expect(page.getByText('Pozostało nieprzydzielonych')).toBeVisible();
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 await expect(page.getByRole('heading',{name:'Twoja lista formalności'})).toBeVisible();
 await expect(page.getByRole('button',{name:/Pobierz terminy do kalendarza/})).toBeVisible();
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByRole('heading',{name:'Ostrzeżenia i weryfikacja'})).toBeVisible();
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await expect(page.getByRole('heading',{name:'Symulacja wysokości świadczeń'})).toBeVisible();
 await expect(page.getByText('Wyniki są symulacją, a nie ostatecznymi danymi ZUS')).toBeVisible();
 await expect(page.getByRole('heading',{name:/Przetestuj 6 przykładów/})).toHaveCount(0);
});
test('Single parent has 224 parental days and 63 remain untransferable',async({page})=>{
 await standardStart(page,'one');
 await expect(page.getByText('Pozostało w rodzinie')).toBeVisible();
 await expect(page.getByText('63 dni').first()).toBeVisible();
 await showPlan(page);
 await expect(page.getByText('63 dni').first()).toBeVisible();
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/9-tygodniowej części/)).toBeVisible();
});
test('Previously used maternity/parental periods update balances',async({page})=>{
 await standardStart(page,'one');
 await page.getByLabel('Wykorzystano dni urlopu macierzyńskiego').fill('14');
 const editor=page.locator('.planner-card').filter({hasText:'Okresy urlopu rodzicielskiego — wykorzystane i planowane'});
 await editor.getByLabel('Status').first().selectOption('used');
 await expect(editor.getByRole('heading',{name:/Okres 1 · wykorzystany/})).toBeVisible();
 await expect(page.getByText('140 dni').first()).toBeVisible(); // limit recorded above
 await showPlan(page);
 await expect(page.getByText('126 dni').first()).toBeVisible();
});
test('Overlapping same-parent periods are rejected with explanation',async({page})=>{
 await standardStart(page,'one');
 const editor=page.locator('.planner-card').filter({hasText:'Okresy urlopu rodzicielskiego — wykorzystane i planowane'});
 await editor.getByRole('button',{name:/Dodaj kolejny okres/}).click();
 const cards=editor.locator('.family-card');
 const firstStart=await cards.first().getByLabel('Początek').inputValue();
 await cards.nth(1).getByLabel('Początek').fill(firstStart);
 const overlappingWeekEnd=new Date(Date.parse(firstStart+'T00:00:00Z')+6*86400000).toISOString().slice(0,10);
 await cards.nth(1).getByLabel('Koniec (włącznie)').fill(overlappingWeekEnd);
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await expect(page.getByRole('alert').last()).toContainText(/Nakładające się okresy/);
});
test('Late 81.5% request is warned, but day planning remains available',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await fillParent(page,0,'etat');
 await fillParent(page,1,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await page.getByRole('radio',{name:/Uśredniony: 81,5%/}).check();
 await page.getByLabel('Data złożenia odpowiedniego wniosku (nie planowana)').fill('2026-12-23');
 await expect(page.getByText(/Termin 21 dni został przekroczony/)).toBeVisible();
 await showPlan(page);
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/Nie potwierdzono spełnienia warunków wniosku/)).toBeVisible();
});
test('e-ZLA without required dates/confirmation shows a specific error',async({page})=>{
 await standardStart(page);
 await page.getByRole('radio',{name:/Byłam \/ jestem \/ będę na e-ZLA w ciąży/}).check();
 await page.getByRole('button',{name:/Oblicz zasiłek chorobowy w ciąży/}).click();
 await expect(page.getByRole('alert')).toContainText(/Potwierdź ubezpieczenie chorobowe/);
});
test('JDG arrears are a risk, not automatic restriction on planning days',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 await page.getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS').selectOption('over');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await showPlan(page);
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/zadłużenie powyżej 1% minimalnego wynagrodzenia/).first()).toBeVisible();
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await page.getByRole('button',{name:/Przelicz moje świadczenia/}).click();
 await expect(page.getByText(/JDG: stan zadłużenia/)).toBeVisible();
});
for(const id of ['ZUS-007','ZUS-014','ZUS-027','ZUS-034','ZUS-037','ZUS-045']){
 test('ZUS example '+id+' autopopulates and reaches step 4',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/Przetestuj na przykładzie ZUS/}).click();
  await page.getByLabel('Wybierz przykład').selectOption(id);
  await page.getByRole('button',{name:/Wypełnij formularz i przejdź do kroku 2/}).click();
  await expect(page.getByRole('heading',{name:/Przykład ZUS: /})).toContainText(id);
  await expect(page.getByRole('heading',{name:'Zaplanuj urlopy i zwolnienie w ciąży'})).toBeVisible();
  await showPlan(page);
  await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
  await expect(page.getByRole('heading',{name:'Symulacja wysokości świadczeń'})).toBeVisible();
  await expect(page.getByRole('heading',{name:/Wynik przykładu — baza testowa/})).toBeVisible();
  await expect(page.getByText('Kontrola scenariusza '+id)).toBeVisible();
 });
}

test('Entitlement: evidence-backed maternity becomes possible without waiting, then blocked after coverage ends',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await fillParent(page,0,'etat');
 await fillParent(page,1,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 const history=page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'});
 await expect(history).toBeVisible();
 await history.getByLabel('Od kiedy obowiązuje obecne ubezpieczenie chorobowe?').fill('2026-11-30');
 const summary=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(summary.getByRole('heading',{name:'Zasiłek macierzyński'}).locator('..')).toContainText('Wstępnie możliwe prawo');
 await history.getByLabel('Data ustania ubezpieczenia (pozostaw puste, jeżeli trwa)').fill('2026-11-30');
 await history.getByLabel('Jeśli ubezpieczenie ustało przed porodem — czy wystąpiła sytuacja szczególna?').selectOption('none');
 await expect(summary.getByRole('heading',{name:'Zasiłek macierzyński'}).locator('..')).toContainText('Brak podstaw do świadczenia w zwykłym trybie');
 await history.getByLabel('Jeśli ubezpieczenie ustało przed porodem — czy wystąpiła sytuacja szczególna?').selectOption('liquidation');
 await expect(summary.getByRole('heading',{name:'Zasiłek macierzyński'}).locator('..')).toContainText('Wymaga indywidualnej weryfikacji');
});
test('Entitlement: pregnancy sickness needs 30 days and confirmed e-ZLA B',async({page})=>{
 await standardStart(page,'one');
 await page.getByRole('radio',{name:/Byłam \/ jestem \/ będę na e-ZLA w ciąży/}).check();
 const history=page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'});
 await history.getByLabel('Od kiedy obowiązuje obecne ubezpieczenie chorobowe?').fill('2026-11-01');
 await history.getByLabel('Wyjątek od 30/90 dni wyczekiwania').selectOption('none');
 await history.getByLabel('Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?').selectOption('yes');
 await page.getByLabel('Początek e-ZLA').fill('2026-11-21');
 const badge=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'}).getByRole('heading',{name:'Zasiłek chorobowy w ciąży'}).locator('..');
 await expect(badge).toContainText('Brak podstaw do świadczenia w zwykłym trybie');
 await page.getByLabel('Początek e-ZLA').fill('2026-12-01');
 await expect(badge).toContainText('Wstępnie możliwe prawo');
 await history.getByLabel('Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?').selectOption('unknown');
 await expect(badge).toContainText('Wymaga indywidualnej weryfikacji');
});

async function startCare(page:Page,kind:'adoption'|'foster',birth:string,accepted='2026-12-01'){
 await page.goto('/');
 await page.getByLabel('Jakiej sytuacji dotyczy plan?').selectOption(kind);
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await page.getByLabel('Data przyjęcia dziecka na wychowanie').fill(accepted);
 await page.getByLabel('Data urodzenia dziecka').fill(birth);
 if(kind==='adoption')await page.getByLabel('Data wystąpienia do sądu o przysposobienie').fill(accepted);
 else await page.getByLabel('Odroczenie obowiązku szkolnego dziecka').selectOption('no');
 await fillParent(page,0,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
}
test('Adoption: court filing, 140 + 287 days, documents, calendar, step 4 gross payout',async({page})=>{
 await startCare(page,'adoption','2024-01-01');
 await expect(page.getByRole('heading',{name:'Urlopy po przyjęciu dziecka'})).toBeVisible();
 await expect(page.getByText('140 dni').first()).toBeVisible();
 await expect(page.getByText('287 dni').first()).toBeVisible();
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await expect(page.getByRole('heading',{name:'Twój plan i dokumenty'})).toBeVisible();
 await expect(page.getByText(/Zaświadczenie sądu \/ kopia wniosku/).first()).toBeVisible();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:/Pobierz terminy do kalendarza/}).click();
 expect((await download).suggestedFilename()).toMatch(/.ics$/);
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await expect(page.getByRole('heading',{name:'Symulacja zasiłku po przyjęciu dziecka'})).toBeVisible();
 await expect(page.getByText(/Osoba rodząca/)).toHaveCount(0);
 await page.getByLabel('Opiekun 1 — miesięczna podstawa zasiłku (zł)').fill('6000');
 await page.getByLabel(/Podstawa została ustalona lub potwierdzona/).first().check();
 await page.getByRole('button',{name:/Przelicz moje świadczenia/}).click();
 await expect(page.getByText('Na warunkach macierzyńskiego')).toBeVisible();
});
test('Foster: seven-year age boundary gives 9 weeks, 38 parental, no false payment after age',async({page})=>{
 await startCare(page,'foster','2020-01-01');
 await expect(page.getByRole('heading',{name:'Urlopy po przyjęciu dziecka'})).toBeVisible();
 await expect(page.getByText('63 dni').first()).toBeVisible();
 await expect(page.getByText('266 dni').first()).toBeVisible();
 await expect(page.getByText(/Minimum gwarantowane/)).toBeVisible();
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await expect(page.getByRole('heading',{name:'Twój plan i dokumenty'})).toBeVisible();
 await expect(page.getByText(/orzeczenie sądu albo umowa ze starostą/).first()).toBeVisible();
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await expect(page.getByRole('heading',{name:'Symulacja zasiłku po przyjęciu dziecka'})).toBeVisible();
});
test('Foster: professional family excluded, delayed school limit 10 and court condition for adoption',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Jakiej sytuacji dotyczy plan?').selectOption('foster');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await page.getByLabel('Data przyjęcia dziecka na wychowanie').fill('2026-12-01');
 await page.getByLabel('Data urodzenia dziecka').fill('2019-01-01');
 await page.getByLabel('Odroczenie obowiązku szkolnego dziecka').selectOption('yes');
 await fillParent(page,0,'etat');
 await page.getByLabel('Rodzaj rodziny zastępczej').selectOption('professional');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('alert')).toContainText(/niezawodow/);
 await page.getByLabel('Rodzaj rodziny zastępczej').selectOption('nonprofessional');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('heading',{name:'Urlopy po przyjęciu dziecka'})).toBeVisible();
 await expect(page.getByText('10 lat').first()).toBeVisible();
});
test('Adoption: child above 14 and missing court filing cannot continue',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Jakiej sytuacji dotyczy plan?').selectOption('adoption');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await page.getByLabel('Data przyjęcia dziecka na wychowanie').fill('2026-12-01');
 await page.getByLabel('Data urodzenia dziecka').fill('2010-01-01');
 await page.getByLabel('Data wystąpienia do sądu o przysposobienie').fill('2026-12-01');
 await fillParent(page,0,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('alert')).toContainText(/limit wieku/);
});

test('Completeness checklist: missing items, confirmations persist across tabs, downloadable report',async({page})=>{
 await standardStart(page,'one');
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const check=page.getByRole('region',{name:'Kontrola kompletności wniosku'});
 await expect(check.getByRole('heading',{name:'Kontrola kompletności wniosku'})).toBeVisible();
 await expect(check.getByRole('status')).toContainText('potwierdzono 0 z');
 await expect(check.getByRole('progressbar',{name:'Postęp kompletowania wniosku'})).toHaveAttribute('value','0');
 await expect(check.getByText(/przewidywaną, a nie faktyczną datę porodu/)).toBeVisible();
 await check.getByRole('checkbox').first().check();
 await expect(check.getByRole('status')).toContainText('potwierdzono 1 z');
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 await expect(page.getByRole('region',{name:'Kontrola kompletności wniosku'}).getByRole('checkbox').first()).toBeChecked();
 await check.getByRole('button',{name:/Pokaż, czego brakuje/}).click();
 await expect(check.getByRole('checkbox').first()).not.toBeChecked();
 const dl=page.waitForEvent('download');
 await check.getByRole('button',{name:/Pobierz raport kontroli/}).click();
 expect((await dl).suggestedFilename()).toBe('Rodzina360-kontrola-wniosku.txt');
 await check.getByRole('button',{name:'Pokaż wszystkie punkty'}).click();
 await check.getByRole('button',{name:'Wyczyść potwierdzenia'}).click();
 await expect(check.getByRole('status')).toContainText('potwierdzono 0 z');
});
test('Completeness checklist: adoption court attachment is separate from standard birth documents',async({page})=>{
 await startCare(page,'adoption','2024-01-01');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 const check=page.getByRole('region',{name:'Kontrola kompletności wniosku'});
 await expect(check).toBeVisible();
 await expect(check.getByText(/Przygotuj: Zaświadczenie sądu/)).toBeVisible();
 await expect(check.getByText(/Sprawdź wniosek o urlop na warunkach macierzyńskiego/)).toBeVisible();
 await expect(check.getByText(/Sprawdź dane faktycznego urodzenia dziecka/)).toHaveCount(0);
 await expect(check.getByRole('status')).toContainText('potwierdzono 0 z');
});
test('Completeness checklist: JDG debt and unknown insurance prevent false ready result',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2027-12-01');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 await page.getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS').selectOption('over');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const check=page.getByRole('region',{name:'Kontrola kompletności wniosku'});
 await expect(check.getByText(/ryzyko zadłużenia JDG/)).toBeVisible();
 await expect(check.getByText(/brak podstaw do wypłaty w zwykłym trybie/)).toBeVisible();
 await expect(check.getByRole('status')).toContainText('Wniosek nie jest jeszcze gotowy do samokontroli');
});

test('mObywatel demo: simulated login, explicitly no credentials, and logout keep user inputs',async({page})=>{
 const identityRequests:string[]=[];
 page.on('request',request=>{
  const hostname=new URL(request.url()).hostname.toLowerCase();
  if(/(^|\.)(mobywatel\.gov\.pl|login\.gov\.pl|pz\.gov\.pl)$/.test(hostname))identityRequests.push(request.url());
 });
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2027-06-15');
 await page.getByRole('button',{name:/Zaloguj przez mObywatel/}).click();
 const dialog=page.getByRole('dialog',{name:'Logowanie przez mObywatel — DEMO'});
 await expect(dialog).toBeVisible();
 await expect(dialog).toContainText('nie następuje uwierzytelnienie');
 await expect(dialog.locator('input')).toHaveCount(0);
 await expect(dialog.locator('form')).toHaveCount(0);
 await dialog.getByRole('button',{name:/Przejdź do potwierdzenia DEMO/}).click();
 await expect(dialog.getByText('Potwierdzenie tożsamości — symulacja')).toBeVisible();
 await dialog.getByRole('button',{name:'Zasymuluj potwierdzenie'}).click();
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('status',{name:'Status symulacji mObywatel'})).toBeVisible();
 await expect(page.getByText(/Sesja demonstracyjna: Rodzic demonstracyjny/)).toBeVisible();
 await expect(page.getByLabel('Data porodu')).toHaveValue('2027-06-15');
 await expect(identityRequests).toEqual([]);
 await page.getByRole('button',{name:'Zakończ sesję'}).click();
 await expect(page.getByRole('button',{name:/Zaloguj przez mObywatel/})).toBeVisible();
 await expect(page.getByLabel('Data porodu')).toHaveValue('2027-06-15');
 await expect(page.getByText(/Sesja demonstracyjna: Rodzic demonstracyjny/)).toHaveCount(0);
});
test('mObywatel demo: cancellation, Escape key, session disappears after page reload',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Zaloguj przez mObywatel/}).click();
 const dialog=page.getByRole('dialog',{name:'Logowanie przez mObywatel — DEMO'});
 await dialog.getByRole('button',{name:'Anuluj'}).click();
 await expect(dialog).toHaveCount(0);
 await page.getByRole('button',{name:/Zaloguj przez mObywatel/}).click();
 await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);
 await page.getByRole('button',{name:/Zaloguj przez mObywatel/}).click();
 await dialog.getByRole('button',{name:/Przejdź do potwierdzenia DEMO/}).click();
 await dialog.getByRole('button',{name:'Zasymuluj potwierdzenie'}).click();
 await expect(page.getByRole('status',{name:'Status symulacji mObywatel'})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('status',{name:'Status symulacji mObywatel'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:/Zaloguj przez mObywatel/})).toBeVisible();
});

test('ZUS insurance import DEMO: no insurance populates form, periods and blocks entitlement',async({page})=>{
 const zusApiRequests:string[]=[];
 page.on('request',request=>{
  const host=new URL(request.url()).hostname.toLowerCase();
  if(host==='zus.pl'||host.endsWith('.zus.pl'))zusApiRequests.push(request.url());
 });
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 const widget=page.getByRole('region',{name:'Dane o ubezpieczeniu — ZUS DEMO'});
 await expect(widget.getByText(/dane syntetyczne/)).toBeVisible();
 await widget.getByRole('button',{name:/Pobierz przykładowe dane z ZUS/}).click();
 await widget.getByLabel('Scenariusz ubezpieczenia ZUS — DEMO').selectOption('no_insurance');
 await widget.getByRole('button',{name:'Zasymuluj pobranie danych'}).click();
 const preview=widget.getByRole('group',{name:'Podgląd danych ZUS DEMO'});
 await expect(preview).toContainText('Brak (DEMO)');
 await expect(preview).toContainText('2026-03-31');
 await widget.getByRole('button',{name:/Przenieś dane DEMO do formularza/}).click();
 const card=page.locator('.parent-card').first();
 await expect(card.getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('zlecenie');
 await expect(card.getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?')).toHaveValue('nie');
 await expect(widget.getByText(/Dane testowe wykorzystane w formularzu/)).toBeVisible();
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 const coverage=page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'});
 await expect(coverage.getByLabel('Od kiedy obowiązuje obecne ubezpieczenie chorobowe?')).toHaveValue('2025-02-01');
 await expect(coverage.getByLabel('Data ustania ubezpieczenia (pozostaw puste, jeżeli trwa)')).toHaveValue('2026-03-31');
 const eligibility=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(eligibility).toContainText('Brak podstaw do świadczenia w zwykłym trybie');
 await expect(eligibility).toContainText('syntetyczne');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/ZUS DEMO: zastosowano syntetyczne dane/)).toBeVisible();
 expect(zusApiRequests).toEqual([]);
});
test('ZUS insurance import DEMO: employee sample remains unverified and manual reset erases samples',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 const widget=page.getByRole('region',{name:'Dane o ubezpieczeniu — ZUS DEMO'});
 await widget.getByRole('button',{name:/Pobierz przykładowe dane z ZUS/}).click();
 await widget.getByRole('button',{name:'Zasymuluj pobranie danych'}).click();
 await widget.getByRole('button',{name:/Przenieś dane DEMO do formularza/}).click();
 await expect(page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 const eligibility=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(eligibility).toContainText('Wymaga indywidualnej weryfikacji');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 await expect(page.getByRole('region',{name:'Kontrola kompletności wniosku'})).toContainText('Brakuje potwierdzonej daty początku ubezpieczenia');
 await page.getByRole('button',{name:/Zmień podział dni/}).click();
 await page.getByRole('button',{name:/Popraw sytuację/}).click();
 const widgetAgain=page.getByRole('region',{name:'Dane o ubezpieczeniu — ZUS DEMO'});
 await widgetAgain.getByRole('button',{name:'Wyczyść dane DEMO i wpisz własne'}).click();
 await expect(page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('');
 await expect(page.locator('.parent-card').first().getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?')).toHaveValue('');
 await widgetAgain.getByRole('button',{name:/Wpiszę dane samodzielnie/}).click();
 await page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego').selectOption('zlecenie');
 await expect(page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('zlecenie');
});
test('ZUS insurance import DEMO: second parent import does not overwrite first parent',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await fillParent(page,0,'etat');
 const widget=page.getByRole('region',{name:'Dane o ubezpieczeniu — ZUS DEMO'});
 await widget.getByRole('button',{name:/Pobierz przykładowe dane z ZUS/}).click();
 await widget.getByLabel('Osoba do uzupełnienia').selectOption('2');
 await widget.getByLabel('Scenariusz ubezpieczenia ZUS — DEMO').selectOption('voluntary');
 await widget.getByRole('button',{name:'Zasymuluj pobranie danych'}).click();
 await widget.getByRole('button',{name:/Przenieś dane DEMO do formularza/}).click();
 await expect(page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('etat');
 await expect(page.locator('.parent-card').nth(1).getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('zlecenie');
 await expect(page.locator('.parent-card').nth(1).getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?')).toHaveValue('tak');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 const second=page.getByRole('region',{name:'Historia ubezpieczenia – drugi rodzic'});
 await expect(second.getByLabel('Od kiedy obowiązuje obecne ubezpieczenie chorobowe?')).toHaveValue('2026-08-01');
 await expect(page.getByText(/Dane o ubezpieczeniu pochodzą z syntetycznego scenariusza/)).toBeVisible();
});

test('ZUS debt certificate DEMO: JDG 2026 excess produces 123.06 PLN, blocked right and downloadable mock document',async({page})=>{
 const zosRequests:string[]=[];
 page.on('request',req=>{
  const host=new URL(req.url()).hostname.toLowerCase();
  if(host==='zus.pl'||host.endsWith('.zus.pl'))zosRequests.push(req.url());
 });
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 const region=page.getByRole('region',{name:'Zaświadczenie o zadłużeniu ZUS — DEMO'});
 await expect(region).toBeVisible();
 await expect(region).toContainText('48,06');
 await region.getByRole('button',{name:'Zasymuluj wystawienie zaświadczenia'}).click();
 const preview=region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'});
 await expect(preview).toContainText('DEMO · NIE JEST DOKUMENTEM ZUS');
 await expect(preview).toContainText('123,06');
 await expect(preview).toContainText('Powyżej progu');
 await expect(page.locator('.parent-card').first().getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('over');
 const event=page.waitForEvent('download');
 await preview.getByRole('button',{name:/Pobierz zaświadczenie DEMO/}).click();
 expect((await event).suggestedFilename()).toBe('Rodzina360-ZUS-DEMO-zadluzenie-2026-12-01-osoba1.html');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('note').filter({hasText:'Zaświadczenie o zadłużeniu · ZUS DEMO'})).toContainText('123,06');
 const benefit=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(benefit).toContainText('Brak podstaw do świadczenia w zwykłym trybie');
 await expect(benefit).toContainText('symulowanego zaświadczenia');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/Zaświadczenie ZUS DEMO — osoba 1/)).toBeVisible();
 expect(zosRequests).toEqual([]);
});
test('ZUS debt certificate DEMO: 2026 exact 1% threshold is not excessive, custom 48.07 is',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 const region=page.getByRole('region',{name:'Zaświadczenie o zadłużeniu ZUS — DEMO'});
 await region.getByLabel('Testowa kwota zadłużenia na ten dzień').selectOption('equal');
 await region.getByRole('button',{name:'Zasymuluj wystawienie zaświadczenia'}).click();
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toContainText('Nie przekracza progu');
 await expect(page.locator('.parent-card').first().getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('small');
 await region.getByLabel('Testowa kwota zadłużenia na ten dzień').selectOption('custom');
 await region.getByLabel('Własna kwota testowa w PLN').fill('48,07');
 await region.getByRole('button',{name:'Zasymuluj wystawienie zaświadczenia'}).click();
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toContainText('48,07');
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toContainText('Powyżej progu');
 await expect(page.locator('.parent-card').first().getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('over');
 await region.getByRole('button',{name:'Wyczyść zaświadczenie DEMO'}).click();
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toHaveCount(0);
 await expect(page.locator('.parent-card').first().getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('unknown');
});
test('ZUS debt certificate DEMO: future 2027 threshold, date change invalidates certificate',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2027-06-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 const region=page.getByRole('region',{name:'Zaświadczenie o zadłużeniu ZUS — DEMO'});
 await expect(region).toContainText('49,50');
 await region.getByLabel('Testowa kwota zadłużenia na ten dzień').selectOption('equal');
 await region.getByRole('button',{name:'Zasymuluj wystawienie zaświadczenia'}).click();
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toContainText('49,50');
 await page.getByLabel('Data porodu').fill('2026-07-01');
 await expect(region).toContainText('48,06');
 await expect(region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'})).toHaveCount(0);
 await expect(page.locator('.parent-card').first().getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('unknown');
});
test('ZUS debt certificate DEMO: second JDG parent simulation leaves first parent intact',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await fillParent(page,0,'etat');
 await fillParent(page,1,'dzialalnosc');
 const region=page.getByRole('region',{name:'Zaświadczenie o zadłużeniu ZUS — DEMO'});
 await region.getByRole('button',{name:'Zasymuluj wystawienie zaświadczenia'}).click();
 const preview=region.getByRole('group',{name:'Podgląd zaświadczenia ZUS DEMO'});
 await expect(preview).toContainText('Osoba 2');
 await expect(page.locator('.parent-card').first().getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('etat');
 await expect(page.locator('.parent-card').nth(1).getByLabel('Stan zadłużenia z tytułu składek społecznych w ZUS')).toHaveValue('over');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('note').filter({hasText:'Zaświadczenie o zadłużeniu · ZUS DEMO'})).toContainText('Osoba 2');
});

test('e-ZLA DEMO: preview with code B imports dates but does not confirm benefit or payment',async({page})=>{
 await standardStart(page,'one');
 const viewer=page.getByRole('region',{name:'Podgląd e-ZLA — ZUS DEMO'});
 await expect(viewer).toBeVisible();
 await expect(viewer).toContainText('syntetyczne e-ZLA');
 await viewer.getByRole('button',{name:/Pokaż szczegóły e-ZLA/}).click();
 const details=viewer.getByRole('group',{name:'Szczegóły wybranego e-ZLA DEMO'});
 await expect(details).toContainText('DEMO-EZLA-001');
 await expect(details).toContainText('B — ciąża');
 await expect(details).toContainText('20 dni');
 await details.getByRole('button',{name:/Przenieś okres e-ZLA DEMO/}).click();
 await expect(page.getByLabel('Początek e-ZLA')).toHaveValue('2026-11-04');
 await expect(page.getByLabel('Koniec e-ZLA')).toHaveValue('2026-11-23');
 const history=page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'});
 await expect(history.getByLabel('Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?')).toHaveValue('yes');
 const badge=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(badge).toContainText('syntetycznego podglądu DEMO');
 await page.getByRole('button',{name:'Oblicz zasiłek chorobowy w ciąży'}).click();
 await expect(page.getByRole('alert')).toContainText('syntetyczne e-ZLA DEMO');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await expect(page.getByText(/e-ZLA DEMO: w symulacji użyto/)).toBeVisible();
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 await expect(page.getByRole('region',{name:'Kontrola kompletności wniosku'})).toContainText('syntetycznego podglądu DEMO');
});
test('e-ZLA DEMO: cancelled record cannot import; illness without code B can be cleared',async({page})=>{
 await standardStart(page,'one');
 const viewer=page.getByRole('region',{name:'Podgląd e-ZLA — ZUS DEMO'});
 await viewer.getByRole('button',{name:/DEMO-EZLA-004/}).click();
 await viewer.getByRole('button',{name:/Pokaż szczegóły e-ZLA/}).click();
 const details=viewer.getByRole('group',{name:'Szczegóły wybranego e-ZLA DEMO'});
 await expect(details).toContainText('Anulowane (DEMO)');
 await expect(details.getByRole('button',{name:/Przenieś okres e-ZLA DEMO/})).toBeDisabled();
 await viewer.getByRole('button',{name:/DEMO-EZLA-002/}).click();
 await viewer.getByRole('button',{name:/Pokaż szczegóły e-ZLA/}).click();
 const general=viewer.getByRole('group',{name:'Szczegóły wybranego e-ZLA DEMO'});
 await expect(general).toContainText('Brak kodu B');
 await general.getByRole('button',{name:/Przenieś okres e-ZLA DEMO/}).click();
 await expect(page.getByLabel('Początek e-ZLA')).toHaveValue('2026-10-07');
 await expect(page.getByLabel('Koniec e-ZLA')).toHaveValue('2026-10-16');
 await expect(page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'})
   .getByLabel('Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?')).toHaveValue('no');
 await viewer.getByRole('button',{name:'Wyczyść dane e-ZLA DEMO i wpisz ręcznie'}).click();
 await expect(page.getByLabel('Początek e-ZLA')).toHaveValue('');
 await expect(page.getByLabel('Koniec e-ZLA')).toHaveValue('');
 await expect(page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'})
   .getByLabel('Czy e-ZLA potwierdza niezdolność do pracy w ciąży (kod B)?')).toHaveValue('unknown');
});

test('PUE/eZUS DEMO: open test account, inspect insurance and transfer synthetic absence to planner',async({page})=>{
 const governmentRequests:string[]=[];
 page.on('request',request=>{
  const host=new URL(request.url()).hostname.toLowerCase();
  if(host==='zus.pl'||host.endsWith('.zus.pl'))governmentRequests.push(request.url());
 });
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 const summary=page.locator('#pue-ezus-demo > summary');
 await summary.click();
 const hub=page.getByRole('region',{name:'PUE/eZUS — centrum DEMO'});
 await expect(hub).toContainText('symulacja bez połączenia z ZUS');
 await hub.getByRole('button',{name:'Zasymuluj połączenie z PUE/eZUS'}).click();
 await expect(hub.getByText(/Tryb DEMO aktywny — brak rzeczywistego połączenia/)).toBeVisible();
 await hub.getByLabel('Przykładowy stan konta').selectOption('no_insurance');
 const account=hub.getByRole('group',{name:'Dane konta ubezpieczonego PUE DEMO'});
 await expect(account).toContainText('2026-03-31');
 await expect(account).toContainText('Brak · DEMO');
 await expect(account).toContainText('Brak danych DEMO');
 await hub.getByRole('button',{name:/Przenieś dane konta DEMO do ankiety/}).click();
 const person=page.locator('.parent-card').first();
 await expect(person.getByLabel('Tytuł do ubezpieczenia chorobowego')).toHaveValue('zlecenie');
 await expect(person.getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?')).toHaveValue('nie');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByRole('region',{name:'PUE/eZUS — centrum DEMO'})).toBeVisible();
 const history=page.getByRole('region',{name:'Historia ubezpieczenia – osoba rodząca'});
 await expect(history.getByLabel('Data ustania ubezpieczenia (pozostaw puste, jeżeli trwa)')).toHaveValue('2026-03-31');
 const eligibility=page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'});
 await expect(eligibility).toContainText('Brak podstaw do świadczenia w zwykłym trybie');
 expect(governmentRequests).toEqual([]);
});
test('PUE/eZUS DEMO: e-ZLA account preview and cancelled record cannot be imported',async({page})=>{
 await page.goto('/');
 await page.locator('#pue-ezus-demo > summary').click();
 const hub=page.getByRole('region',{name:'PUE/eZUS — centrum DEMO'});
 await hub.getByRole('button',{name:'Zasymuluj połączenie z PUE/eZUS'}).click();
 await hub.getByRole('button',{name:'Zaświadczenia e-ZLA'}).click();
 await hub.getByLabel('Wybierz zaświadczenie testowe').selectOption('cancelled');
 await expect(hub.getByRole('group',{name:'Podgląd zaświadczeń e-ZLA PUE DEMO'})).toContainText('Anulowane (DEMO)');
 await expect(hub.getByRole('button',{name:/Przenieś e-ZLA DEMO do kalkulatora/})).toBeDisabled();
 await hub.getByLabel('Wybierz zaświadczenie testowe').selectOption('pregnancy_b');
 await expect(hub.getByRole('group',{name:'Podgląd zaświadczeń e-ZLA PUE DEMO'})).toContainText('B — ciąża');
 await hub.getByRole('button',{name:/Przenieś e-ZLA DEMO do kalkulatora/}).click();
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByLabel('Początek e-ZLA')).toHaveValue('2026-11-04');
 await expect(page.getByLabel('Koniec e-ZLA')).toHaveValue('2026-11-23');
 await expect(page.locator('.planner-card').filter({hasText:'Weryfikacja prawa do świadczeń ZUS'})).toContainText('syntetycznego podglądu DEMO');
});
test('PUE/eZUS DEMO: inquiries are local drafts not sent, with topic-specific guidance and no real network',async({page})=>{
 const governmentRequests:string[]=[];
 page.on('request',request=>{
  const host=new URL(request.url()).hostname.toLowerCase();
  if(host==='zus.pl'||host.endsWith('.zus.pl'))governmentRequests.push(request.url());
 });
 await page.goto('/');
 await page.locator('#pue-ezus-demo > summary').click();
 const hub=page.getByRole('region',{name:'PUE/eZUS — centrum DEMO'});
 await hub.getByRole('button',{name:'Zasymuluj połączenie z PUE/eZUS'}).click();
 await hub.getByRole('button',{name:'Zadaj pytanie · DEMO'}).click();
 const query=hub.getByLabel('Treść pytania — DEMO');
 await query.fill('Krótko');
 await hub.getByRole('button',{name:'Zasymuluj wysłanie pytania'}).click();
 await expect(hub.getByRole('alert')).toContainText('co najmniej 10 znaków');
 await hub.getByLabel('Temat pytania').selectOption('insurance');
 await query.fill('Dlaczego okres ubezpieczenia nie zgadza się z moimi dokumentami?');
 await hub.getByRole('button',{name:'Zasymuluj wysłanie pytania'}).click();
 await expect(hub.getByText(/DEMO-ZAP-001 · NIE WYSŁANO DO ZUS/)).toBeVisible();
 await expect(hub.getByText(/Podpowiedź Rodzina360 — DEMO, nie odpowiedź ZUS/)).toBeVisible();
 await hub.getByLabel('Temat pytania').selectOption('sickness');
 await query.fill('Jak sprawdzić kod B na wystawionym e-ZLA?');
 await hub.getByRole('button',{name:'Zasymuluj wysłanie pytania'}).click();
 await expect(hub.getByText(/DEMO-ZAP-002 · NIE WYSŁANO DO ZUS/)).toBeVisible();
 await expect(hub.getByText(/Sprawdź w eZUS okres i status rzeczywistego e-ZLA/)).toBeVisible();
 expect(governmentRequests).toEqual([]);
 await hub.getByRole('button',{name:'Zakończ symulację PUE/eZUS'}).click();
 await expect(hub.getByText(/DEMO-ZAP-001 · NIE WYSŁANO DO ZUS/)).toHaveCount(0);
 await expect(hub.getByRole('button',{name:'Zasymuluj połączenie z PUE/eZUS'})).toBeVisible();
});

test('Wnioski DEMO: employer parental leave request is prefilled, previewed, downloaded and never sent',async({page})=>{
 const remoteRequests:string[]=[];
 page.on('request',r=>{const host=new URL(r.url()).hostname.toLowerCase();if(host==='zus.pl'||host.endsWith('.zus.pl'))remoteRequests.push(r.url());});
 await standardStart(page,'one');
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const region=page.getByRole('region',{name:'Wnioski o urlopy i świadczenia — DEMO'});
 await expect(region).toBeVisible();
 await expect(region).toContainText('Symulacja wysłania NIE przekazuje dokumentów');
 const choice=region.getByLabel('Dokument do przygotowania');
 await choice.selectOption('parental-p1-initial-0');
 await expect(region.getByRole('group',{name:'Parametry wybranego wniosku DEMO'})).toContainText('2026-12-01');
 await expect(region).toContainText('21 dni przed rozpoczęciem urlopu');
 await expect(region.getByRole('button',{name:'Zasymuluj wysłanie do pracodawcy'})).toBeDisabled();
 await region.getByRole('button',{name:'Pokaż podgląd projektu wniosku'}).click();
 const preview=region.getByRole('group',{name:'Podgląd przygotowanego projektu DEMO'});
 await expect(preview).toContainText('DEMO — NIE WYSŁANO');
 await expect(preview).toContainText('wniosku pracownika');
 await region.getByRole('checkbox').nth(0).check();
 await region.getByRole('checkbox').nth(1).check();
 await region.getByRole('checkbox').nth(2).check();
 await expect(region.getByRole('button',{name:'Zasymuluj wysłanie do pracodawcy'})).toBeEnabled();
 const download=page.waitForEvent('download');
 await region.getByRole('button',{name:'Pobierz projekt (.html)'}).click();
 expect((await download).suggestedFilename()).toBe('Rodzina360-WNIOSEK-DEMO-parental-p1-initial-0.html');
 await region.getByRole('button',{name:'Zasymuluj wysłanie do pracodawcy'}).click();
 await expect(region.getByRole('status',{name:'Wynik symulacji wysłania wniosku'})).toContainText('DEMO-WYS-001 · NIE WYSŁANO');
 await expect(region.getByRole('status',{name:'Wynik symulacji wysłania wniosku'})).toContainText('Brak potwierdzenia wpływu');
 expect(remoteRequests).toEqual([]);
});
test('Wnioski DEMO: JDG gets only a ZAM worksheet and a mock ZUS dispatch, not employee leave',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'dzialalnosc');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const region=page.getByRole('region',{name:'Wnioski o urlopy i świadczenia — DEMO'});
 const choices=region.getByLabel('Dokument do przygotowania');
 await expect(choices.locator('option')).toHaveCount(1);
 await choices.selectOption('zus-zam-1');
 await expect(region).toContainText('To NIE jest odtworzenie ani złożenie formularza urzędowego');
 await expect(region.getByRole('link',{name:'Pobierz aktualny ZAM na zus.pl'})).toHaveAttribute('href',/zus\.pl/);
 await expect(region.getByRole('button',{name:'Zasymuluj wysłanie do ZUS'})).toBeDisabled();
 for(const c of await region.getByRole('checkbox').all())await c.check();
 await region.getByRole('button',{name:'Zasymuluj wysłanie do ZUS'}).click();
 await expect(region.getByRole('status',{name:'Wynik symulacji wysłania wniosku'})).toContainText('NIE WYSŁANO do ZUS');
});
test('Wnioski DEMO: adoption generates original care leave request and court documents',async({page})=>{
 await startCare(page,'adoption','2024-01-01');
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 const region=page.getByRole('region',{name:'Wnioski o urlopy i świadczenia — DEMO'});
 await expect(region).toBeVisible();
 await region.getByLabel('Dokument do przygotowania').selectOption('employer-care-leave');
 await expect(region.getByRole('group',{name:'Parametry wybranego wniosku DEMO'})).toContainText('Adopcja');
 await expect(region).toContainText('wniosku do sądu o przysposobienie');
 await expect(region.getByText('Informacja o urodzeniu dziecka dla pracodawcy')).toHaveCount(0);
 await region.getByRole('button',{name:'Pokaż podgląd projektu wniosku'}).click();
 await expect(region.getByRole('group',{name:'Podgląd przygotowanego projektu DEMO'})).toContainText('urlopu');
});


test('USC DEMO: predicted birth cannot be simulated as a submitted request',async({page})=>{
 await standardStart(page,'one');
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const region=page.getByRole('region',{name:'Odpis aktu urodzenia — symulacja USC'});
 await expect(region).toBeVisible();
 await expect(region).toContainText('przewidywana data porodu');
 await expect(region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'})).toBeDisabled();
 for(const checkbox of await region.getByRole('checkbox').all())await checkbox.check();
 await expect(region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'})).toBeDisabled();
 await region.getByRole('button',{name:'Pokaż podgląd wniosku USC'}).click();
 await expect(region.getByRole('group',{name:'Podgląd wniosku USC DEMO'})).toContainText('DEMO — NIE WYSŁANO');
});
test('USC DEMO: short/full fee, official reference, HTML draft, mock submission and reset',async({page})=>{
 const outbound:string[]=[];
 page.on('request',r=>{const host=new URL(r.url()).hostname.toLowerCase();
  if(host==='gov.pl'||host.endsWith('.gov.pl')||host==='zus.pl'||host.endsWith('.zus.pl'))outbound.push(r.url());
 });
 await page.goto('/');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Rodzaj daty').selectOption('actual');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const region=page.getByRole('region',{name:'Odpis aktu urodzenia — symulacja USC'});
 await expect(region).toBeVisible();
 await expect(region.getByRole('link',{name:/Oficjalny wniosek na gov.pl/})).toHaveAttribute('href',/gov\.pl/);
 await expect(region).toContainText('0 zł — zwolnienie możliwe dla spraw ZUS');
 await region.getByLabel('Cel odpisu USC').selectOption('private');
 await expect(region).toContainText('22 zł — standardowa opłata');
 await region.getByLabel('Rodzaj odpisu USC').selectOption('full');
 await region.getByLabel('Sposób odbioru odpisu USC').selectOption('post');
 await expect(region).toContainText('33 zł — standardowa opłata');
 await expect(region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'})).toBeDisabled();
 for(const checkbox of await region.getByRole('checkbox').all())await checkbox.check();
 await expect(region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'})).toBeEnabled();
 const download=page.waitForEvent('download');
 await region.getByRole('button',{name:'Pobierz projekt USC (.html)'}).click();
 expect((await download).suggestedFilename()).toBe('Rodzina360-USC-ODPIS-DEMO-full-dziecko-1.html');
 await region.getByRole('button',{name:'Pokaż podgląd wniosku USC'}).click();
 await expect(region.getByRole('group',{name:'Podgląd wniosku USC DEMO'})).toContainText(/odpis zupełny aktu urodzenia/i);
 await region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'}).click();
 await expect(region.getByRole('status',{name:'Wynik symulacji USC'})).toContainText('DEMO-USC-001 · NOT_SENT_DEMO');
 await expect(region.getByRole('status',{name:'Wynik symulacji USC'})).toContainText('NIE DOKONANO PŁATNOŚCI');
 expect(outbound).toEqual([]);
 await region.getByLabel('Rodzaj odpisu USC').selectOption('short');
 await expect(region.getByRole('status',{name:'Wynik symulacji USC'})).toHaveCount(0);
 await expect(region.getByRole('button',{name:'Zasymuluj złożenie wniosku w USC'})).toBeDisabled();
});


test('Support directory: organisations appear without ZUS or birth-date data after selecting a loss',async({page})=>{
 const outgoing:string[]=[];
 page.on('request',request=>{
  const host=new URL(request.url()).hostname.toLowerCase();
  if(['naglesami.org.pl','fundacjaernesta.pl','razemnamaksa.pl','wczesniak.pl','tumbopomaga.pl','gajusz.org.pl']
   .some(domain=>host===domain||host.endsWith('.'+domain)))outgoing.push(request.url());
 });
 await page.goto('/');
 await page.getByLabel('Jakiej sytuacji dotyczy plan?').selectOption('loss');
 const support=page.getByRole('region',{name:'Wsparcie w trudnych sytuacjach'});
 await expect(support).toBeVisible();
 await expect(support).toContainText('Nie musisz podawać imienia');
 await expect(support).toContainText('Fundacja Nagle Sami');
 await expect(support).toContainText('Fundacja Razem na MAKSA');
 await expect(support).toContainText('800 70 2222');
 await expect(support.getByRole('link',{name:'Oficjalna strona: Fundacja Nagle Sami'}))
  .toHaveAttribute('href',/naglesami\.org\.pl/);
 await support.getByLabel('Rodzaj pomocy — wsparcie rodzin').selectOption('legal');
 await expect(support).toContainText('Fundacja Ernesta');
 await expect(support.getByText('Znaleziono 1 z 6 źródeł.')).toBeVisible();
 await support.getByLabel('Sytuacja — wsparcie rodzin').selectOption('prematurity');
 await support.getByLabel('Rodzaj pomocy — wsparcie rodzin').selectOption('peer');
 await expect(support).toContainText('Fundacja Wcześniak Rodzice-Rodzicom');
 await expect(support).not.toContainText('Fundacja Nagle Sami');
 await support.getByLabel('Szukaj organizacji').fill('niewystepuje');
 await expect(support).toContainText('Brak źródeł pasujących');
 await support.getByRole('button',{name:'Pokaż wszystkie źródła'}).click();
 await expect(support).toContainText('Znaleziono 6 z 6 źródeł.');
 expect(outgoing).toEqual([]);
});

test('Support directory: birth plan documents also expose verified national support links',async({page})=>{
 await standardStart(page,'one');
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const support=page.getByRole('region',{name:'Wsparcie w trudnych sytuacjach'});
 await expect(support).toBeVisible();
 await expect(support).toContainText('Tumbo Pomaga');
 await support.getByLabel('Szukaj organizacji').fill('Wczesniak');
 await expect(support.getByText('Znaleziono 1 z 6 źródeł.')).toBeVisible();
 await expect(support).toContainText('Fundacja Wcześniak Rodzice-Rodzicom');
});


test('Official rights: core three institutions appear with working outbound links and filters',async({page})=>{
 const outbound:string[]=[];
 page.on('request',r=>{
  const host=new URL(r.url()).hostname.toLowerCase();
  if(['www.zus.pl','www.gov.pl','www.pip.gov.pl'].includes(host))outbound.push(r.url());
 });
 await page.goto('/');
 const region=page.getByRole('region',{name:'Oficjalne informacje o prawach rodzicielskich'});
 await expect(region).toBeVisible();
 await expect(region).toContainText('Zakład Ubezpieczeń Społecznych');
 await expect(region).toContainText('Ministerstwo Rodziny, Pracy i Polityki Społecznej');
 await expect(region).toContainText('Państwowa Inspekcja Pracy');
 await expect(region.getByRole('link',{name:'Otwórz oficjalne źródło: Urlop rodzicielski'}))
  .toHaveAttribute('href','https://www.gov.pl/web/rodzina/urlop-rodzicielski');
 await expect(region.getByRole('link',{name:'Otwórz oficjalne źródło: Rodzicielstwo — porady prawne PIP'}))
  .toHaveAttribute('href','https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo');
 await region.getByRole('button',{name:/Wszystkie oficjalne źródła/}).click();
 await expect(region).toContainText('Wyświetlono 11 źródeł.');
 await region.getByLabel('Instytucja oficjalnych źródeł').selectOption('PIP');
 await expect(region).toContainText('Wyświetlono 2 źródeł.');
 await expect(region).not.toContainText('Zasiłek macierzyński — komu przysługuje');
 await region.getByLabel('Temat oficjalnych źródeł').selectOption('insurance');
 await expect(region).toContainText('Brak źródeł odpowiadających wybranemu filtrowi');
 await region.getByRole('button',{name:'Wyczyść filtry'}).click();
 await expect(region).toContainText('Wyświetlono 11 źródeł.');
 expect(outbound).toEqual([]);
});

test('Official rights: JDG sees benefit and insurance links instead of employee leave claims',async({page})=>{
 await page.goto('/');
 await page.locator('.parent-card').first()
  .getByLabel('Tytuł do ubezpieczenia chorobowego').selectOption('dzialalnosc');
 const region=page.getByRole('region',{name:'Oficjalne informacje o prawach rodzicielskich'});
 await expect(region).toContainText('Przy umowie zlecenia lub JDG');
 await expect(region).toContainText('Podleganie ubezpieczeniom społecznym');
 await expect(region).not.toContainText('Rodzicielstwo — porady prawne PIP');
 await region.getByRole('button',{name:/Wszystkie oficjalne źródła/}).click();
 await expect(region).toContainText('Rodzicielstwo — porady prawne PIP');
 await expect(region.getByRole('link',{name:'Otwórz oficjalne źródło: Zasiłek macierzyński — komu przysługuje'}))
  .toHaveAttribute('href',/zus\.pl/);
});

test('Official rights: current leave plan contains official links for the family',async({page})=>{
 await standardStart(page,'one');
 await showPlan(page);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 const region=page.getByRole('region',{name:'Oficjalne informacje o prawach rodzicielskich'});
 await expect(region).toBeVisible();
 await expect(region).toContainText('Urlop rodzicielski');
 await expect(region).toContainText('Rodzicielstwo — porady prawne PIP');
});


test('Admin DEMO: edited limits and rates change the actual birth planner and money simulator',async({page})=>{
 await page.goto('/');
 const panel=page.getByRole('region',{name:'Panel administracyjny — DEMO'});
 await expect(panel).toBeVisible();
 await panel.getByRole('button',{name:'Otwórz panel administracyjny'}).click();
 await expect(panel).toContainText('DEMO bez logowania administratora');
 await expect(panel).toContainText('Kwota przykładowa');
 await panel.getByLabel('Macierzyński — stawka standardowa (%)').fill('90');
 await panel.getByLabel('Rodzicielski — stawka standardowa (%)').fill('75');
 await panel.getByLabel('Macierzyński 1 dzieci — tygodnie').fill('21');
 await panel.getByLabel('Rodzicielski — jedno dziecko (tygodnie)').fill('42');
 await expect(panel.getByLabel('Wersja parametrów')).toHaveValue('DEMO-001');
 await expect(panel.getByRole('group',{name:'Podgląd skutków zmiany'})).toContainText(/61[\s\u00a0\u202f]110/);
 await panel.getByRole('button',{name:'Zastosuj do symulacji DEMO'}).click();
 await expect(page.getByRole('alert').filter({hasText:'EKSPERYMENT ADMIN DEMO'}).first()).toBeVisible();
 await expect(panel).toContainText('Aktywna wersja: DEMO-001');
 await page.getByLabel('Data porodu').fill('2026-12-01');
 await page.getByLabel('Czy uwzględniasz drugiego rodzica w planie?').selectOption('one');
 await fillParent(page,0,'etat');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await expect(page.getByText('147 dni').first()).toBeVisible();
 await expect(page.getByText('294 dni').first()).toBeVisible();
 await expect(page.getByText('Standardowy: 90% + 75%')).toBeVisible();
 await showPlan(page);
 await expect(page.getByText('147 dni').first()).toBeVisible();
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await page.getByPlaceholder('np. 6000,00').first().fill('6000');
 await page.getByText('Podstawa została ustalona lub potwierdzona przez płatnika / ZUS').first().click();
 await page.getByRole('button',{name:/Przelicz moje świadczenia/}).click();
 await expect(page.getByText('90%',{exact:true}).first()).toBeVisible();
 await expect(page.getByText('75%',{exact:true}).first()).toBeVisible();
 await page.reload();
 const reloaded=page.getByRole('region',{name:'Panel administracyjny — DEMO'});
 await expect(reloaded).toContainText('Aktywna wersja: DEMO-001');
 await reloaded.getByRole('button',{name:'Otwórz panel administracyjny'}).click();
 await reloaded.getByRole('button',{name:'Przywróć oficjalne wartości'}).click();
 await expect(reloaded).toContainText('Aktywna wersja: PL-2026-BASE');
 await expect(page.getByRole('alert').filter({hasText:'EKSPERYMENT ADMIN DEMO'})).toHaveCount(0);
 await page.reload();
 await expect(page.getByRole('region',{name:'Panel administracyjny — DEMO'})).toContainText('Aktywna wersja: PL-2026-BASE');
});

test('Admin DEMO: rejects invalid policy values and switches optional features without sending data',async({page})=>{
 await page.goto('/');
 const panel=page.getByRole('region',{name:'Panel administracyjny — DEMO'});
 await panel.getByRole('button',{name:'Otwórz panel administracyjny'}).click();
 await panel.getByLabel('Rodzicielski — jedno dziecko (tygodnie)').fill('1');
 await expect(panel).toContainText('Nieprzenoszalne tygodnie muszą być mniejsze');
 await expect(panel.getByRole('button',{name:'Zastosuj do symulacji DEMO'})).toBeDisabled();
 await panel.getByLabel('Rodzicielski — jedno dziecko (tygodnie)').fill('41');
 await panel.getByLabel('Katalog organizacji wsparcia').uncheck();
 await panel.getByLabel('Oficjalne linki ZUS / MRPiPS / PIP').uncheck();
 await panel.getByRole('button',{name:'Zastosuj do symulacji DEMO'}).click();
 await expect(page.getByRole('region',{name:'Oficjalne informacje o prawach rodzicielskich'})).toHaveCount(0);
 await page.getByLabel('Jakiej sytuacji dotyczy plan?').selectOption('loss');
 await expect(page.getByRole('region',{name:'Wsparcie w trudnych sytuacjach'})).toHaveCount(0);
 const download=page.waitForEvent('download');
 await panel.getByRole('button',{name:'Eksportuj konfigurację (.json)'}).click();
 expect((await download).suggestedFilename()).toBe('Rodzina360-PARAMETRY-ADMIN-DEMO.json');
 await panel.getByRole('button',{name:'Przywróć oficjalne wartości'}).click();
 await expect(page.getByRole('region',{name:'Wsparcie w trudnych sytuacjach'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Oficjalne informacje o prawach rodzicielskich'})).toBeVisible();
});
