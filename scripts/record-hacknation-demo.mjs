// Records the actual React application with synthetic information only.
// Output is a silent 16:9 WebM; the workflow converts it to H.264 MP4.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const output = 'demo/rodzina360-recording.webm';
await fs.mkdir('demo', {recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const context = await browser.newContext({
 viewport:{width:1280,height:720},
 deviceScaleFactor:1,
 locale:'pl-PL',
 reducedMotion:'reduce',
 recordVideo:{dir:'demo',size:{width:1280,height:720}},
});
const page = await context.newPage();
page.setDefaultTimeout(25000);
const hold=async(ms=2000)=>page.waitForTimeout(ms);
const safe=async (title,fn)=>{try{await fn();}catch(e){console.warn(title+': '+String(e).slice(0,250));}};
const caption=async (headline,detail)=> {
 await page.evaluate(({headline,detail})=>{
   let e=document.getElementById('hacknation-video-caption');
   if(!e){
     e=document.createElement('div');e.id='hacknation-video-caption';
     e.style.cssText='position:fixed;left:24px;right:24px;bottom:19px;z-index:2147483645;pointer-events:none;display:flex;align-items:center;gap:18px;background:rgba(14,40,48,.94);border:1px solid rgba(125,225,201,.25);border-radius:16px;box-shadow:0 12px 32px #102a4333;padding:16px 22px;font:500 17px Arial,sans-serif;color:#fff;';
     document.body.append(e);
   }
   e.innerHTML='<span style="background:#17b49d;color:white;border-radius:9px;padding:11px 14px;font-weight:800;font-size:16px;letter-spacing:.04em">Rodzina360</span><span style="display:flex;flex-direction:column;gap:4px"><strong style="font-size:19px">'+headline+'</strong><small style="font-size:14px;color:#bed7d9">'+detail+'</small></span>';
 },{headline,detail});
};
const cover=async (html,show=true)=>{
 await page.evaluate(({html,show})=>{
   let el=document.getElementById('hacknation-video-cover');
   if(!el){el=document.createElement('div');el.id='hacknation-video-cover';el.style.cssText='position:fixed;inset:0;z-index:2147483646;background:linear-gradient(125deg,#073a44,#0b8881 68%,#39c6aa);display:flex;justify-content:center;align-items:center;text-align:left;padding:90px;box-sizing:border-box;color:white;font-family:Arial,sans-serif;';document.body.append(el);}
   el.innerHTML=html;el.style.display=show?'flex':'none';
 },{html,show});
};
const scrollTo=async locator=>{await locator.scrollIntoViewIfNeeded();await hold(600);};

try{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await cover('<div style="width:950px"><div style="font-size:22px;letter-spacing:4px;opacity:.88">HACKNATION 2026 · WYZWANIE ZUS</div><div style="font-size:92px;font-weight:800;letter-spacing:-4px;margin:24px 0">Rodzina<span style="color:#b4fff0">360</span></div><div style="font-size:34px;line-height:1.35">Planuj świadomie.<br/>Wybieraj korzystnie.</div><div style="font-size:19px;opacity:.85;margin-top:35px">Demonstracja działającej aplikacji · dane testowe</div></div>');
 await hold(6500);await cover('',false);
 await caption('Jeden plan dla całej rodziny','Urlopy, uprawnienia, formalności i symulacja wypłat.');
 await hold(5700);

 await caption('Krok 1. Twoja sytuacja','Wprowadzamy datę porodu i informacje o ubezpieczeniu obojga rodziców.');
 await scrollTo(page.getByLabel('Data porodu'));
 await page.getByLabel('Data porodu').fill('2026-12-01'); await hold(1000);
 await page.getByLabel('Rodzaj daty').selectOption('planned'); await hold(800);
 const parents=page.locator('.parent-card');
 await scrollTo(parents.first());
 await parents.nth(0).getByLabel('Tytuł do ubezpieczenia chorobowego').selectOption('etat');await hold(900);
 await parents.nth(0).getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?').selectOption('tak');await hold(900);
 await scrollTo(parents.nth(1));
 await parents.nth(1).getByLabel('Tytuł do ubezpieczenia chorobowego').selectOption('etat');await hold(900);
 await parents.nth(1).getByLabel('Czy podlegasz ubezpieczeniu chorobowemu?').selectOption('tak');await hold(900);
 await caption('Dane zostają w przeglądarce','Bez pobierania rzeczywistych danych z ZUS.');
 await page.getByRole('button',{name:/Dalej: zaplanuj urlopy/}).click();
 await hold(1200);

 await caption('Krok 2. Zaplanuj urlopy','Aplikacja rozdziela limity i pokazuje część indywidualną rodzica.');
 await scrollTo(page.locator('.stats-grid').first());
 await hold(6500);
 await caption('Sprawdź wariant wypłaty','Standardowy oraz uśredniony — termin wniosku ma znaczenie.');
 await safe('rate',async()=>{
   const c=page.getByRole('radio',{name:/Uśredniony: 81,5%/});
   await scrollTo(c);await c.check();await hold(2700);
   await page.getByRole('radio',{name:/Standardowy:/}).check();
 });
 await hold(1700);
 await caption('Oś czasu i podział opieki','Okresy rodzicielskie można rozplanować między dwoje rodziców.');
 await safe('leave editor',async()=>await scrollTo(page.locator('.planner-card').filter({hasText:'Okresy urlopu rodzicielskiego — wykorzystane i planowane'})));
 await hold(4300);
 await page.getByRole('button',{name:/Pokaż mój plan/}).click();
 await hold(1400);

 await caption('Krok 3. Plan rodziny','Jedno zestawienie wykorzystanych, zaplanowanych i pozostałych dni.');
 await scrollTo(page.getByRole('heading',{name:'Twój plan urlopów i formalności'}));
 await hold(5700);
 await page.getByRole('button',{name:'Kalendarz i wnioski'}).click();
 await caption('Kalendarz i wnioski','Terminy, lista dokumentów i możliwość eksportu do kalendarza.');
 await safe('docs',async()=>await scrollTo(page.getByRole('heading',{name:'Twoja lista formalności'})));
 await hold(7500);
 await page.getByRole('button',{name:'Risk Radar'}).click();
 await caption('Risk Radar','Ostrzeżenia o brakujących danych, terminach i ryzykach formalnych.');
 await safe('risks',async()=>await scrollTo(page.getByRole('heading',{name:'Ostrzeżenia i weryfikacja'})));
 await hold(7600);
 await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
 await hold(1200);

 await caption('Krok 4. Symulacja wypłat','Podstawa świadczenia musi być potwierdzona. Kwoty są orientacyjne.');
 await safe('payment form',async()=>await scrollTo(page.getByRole('heading',{name:'Podstawa do symulacji'})));
 await hold(5500);
 await safe('bases',async()=>{
   const inputs=page.locator('.allocation-grid input[type=number]');
   await inputs.nth(0).fill('6000'); await hold(900);
   await inputs.nth(1).fill('5200'); await hold(900);
   const checks=page.getByLabel('Podstawa została ustalona lub potwierdzona przez płatnika / ZUS');
   await checks.nth(0).check();await checks.nth(1).check();
   await page.getByRole('button',{name:/Przelicz moje świadczenia/}).click();
 });
 await hold(5700);
 await caption('Testowe przykłady ZUS','Aplikacja pozwala przejść gotowy scenariusz testowy.');
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await safe('example',async()=>{
   await page.getByRole('button',{name:/Przetestuj na przykładzie ZUS/}).click();
   await page.getByLabel('Wybierz przykład').selectOption('ZUS-007');
   await hold(1300);
   await page.getByRole('button',{name:/Wypełnij formularz i przejdź do kroku 2/}).click();
   await hold(1300);
   await page.getByRole('button',{name:/Pokaż mój plan/}).click();
   await hold(1000);
   await page.getByRole('button',{name:/Dalej: symulacja wypłat/}).click();
   await scrollTo(page.getByRole('heading',{name:/Wynik przykładu — baza testowa/}));
 });
 await hold(8500);
 await cover('<div style="width:980px"><div style="font-size:19px;letter-spacing:4px;opacity:.82">RODZINA360 · HACKNATION 2026</div><div style="font-size:69px;line-height:1.15;font-weight:800;margin:35px 0">Wasze dni.<br/><span style="color:#a5fae6">Wasz wspólny plan.</span></div><div style="font-size:27px;margin-bottom:37px">Planowanie urlopów i świadczeń z ZUS</div><div style="font-size:17px;opacity:.88">Aplikacja demonstracyjna. Wyniki nie są decyzją ZUS.<br/>Integracje publiczne mają charakter symulacyjny.</div></div>');
 await hold(8000);
} finally {
 const video=page.video();
 await context.close();
 await video?.saveAs(output);
 await browser.close();
 console.log('Video saved:',output);
}
