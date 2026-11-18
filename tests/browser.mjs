import { chromium, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const base=process.env.BASE_URL || 'http://127.0.0.1:8765';
const output=path.resolve('test-results');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={base,checks:[],errors:[]};
const ok=(name,data={})=>{report.checks.push({name,...data});console.log('PASS '+name);};
try {
  const desktop=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await desktop.newPage();
  const consoleErrors=[], failed=[];
  page.on('pageerror',e=>consoleErrors.push(e.message));
  page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base))failed.push(r.url()+': '+r.status());});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(output,'pagina-desktop.png'),fullPage:true});
  const pages=['/','/privacidade.html','/afiliados.html','/contato.html','/guias/comparar-precos.html','/guias/compra-consciente.html','/guias/conferir-anuncio.html','/404.html'];
  const checked=new Set();
  for(const route of pages){
    const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
    assert.equal(await page.locator('h1').count(),1);
    const links=await page.locator('[href],[src]').evaluateAll(els=>els.map(el=>el.getAttribute('href')||el.getAttribute('src')));
    for(const link of links.filter(l=>l.startsWith('/')&&!l.startsWith('//'))){
      const target=new URL(link,base);const relative=target.pathname;
      if(!checked.has(relative)){assert.equal((await page.request.get(base+relative)).status(),200,relative);checked.add(relative);}
    }
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],route+' accessibility');
    ok('Página e acessibilidade: '+route);
  }
  assert.deepEqual(consoleErrors,[]);assert.deepEqual(failed,[]);ok('Sem erros de console ou recursos locais ausentes');
  for(const viewport of [{width:360,height:740},{width:390,height:844},{width:320,height:568},{width:768,height:1024}]){
    await page.setViewportSize(viewport);await page.goto(base,{waitUntil:'networkidle'});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow '+viewport.width);
    const box=await page.locator('[data-whatsapp="hero"]').boundingBox();assert(box.y+box.height<viewport.height,'CTA above fold '+viewport.width);
    if(viewport.width===390) await page.screenshot({path:path.join(output,'pagina-mobile.png'),fullPage:true});
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
    ok('Layout sem rolagem horizontal e CTA visível: '+viewport.width+'×'+viewport.height);
  }
  for(const ua of [devices['Pixel 7'],devices['iPhone 13'],{...devices['iPhone 13'],userAgent:devices['iPhone 13'].userAgent+' [FBAN/FBIOS;FBAV/500.0.0;]'}]){
    const context=await browser.newContext(ua);const p=await context.newPage();await p.goto(base);
    assert.equal(await p.locator('[data-whatsapp="hero"]').getAttribute('href'),'https://chat.whatsapp.com/GuXAktbMUMv31Ya7Q9BM5v');
    await p.locator('[data-whatsapp="hero"]').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));
    await p.locator('[data-whatsapp="hero"]').click();assert.equal(await p.locator('#consent-banner').isVisible(),false);
    await context.close();
  }ok('Convite HTTPS nos perfis Android, iPhone e navegador interno simulado');
  const noJS=await browser.newContext({javaScriptEnabled:false});const np=await noJS.newPage();await np.goto(base);assert.equal(await np.locator('[data-whatsapp="hero"]').getAttribute('target'),'_blank');assert(await np.locator('[data-whatsapp="hero"]').isVisible());await noJS.close();ok('Convite acessível sem JavaScript');
  await page.goto(base+'/?utm_source=instagram&utm_medium=paid_social&utm_campaign=novembro&email=private%40example.com');
  assert.equal(await page.locator('script[src*="googletagmanager"],script[src*="facebook.net"],script[src*="googlesyndication"]').count(),0);
  await page.getByRole('button',{name:'Preferências de cookies'}).click();assert(await page.locator('#no-integrations').isVisible());await page.getByRole('button',{name:'Fechar preferências'}).click();ok('Produção sem rastreadores ou anúncios');
  // Synthetic identifiers are isolated in browser routes; never written to the website configuration.
  const cfg=JSON.parse(await readFile('site.config.json','utf8'));
  const testConfig={...cfg,ga4Id:'G-TEST123456',metaPixelId:'123456789012345',adsense:{enabled:true,publisherId:'ca-pub-0000000000000000',slotId:'0000000000',consentIntegrationReady:true}};
  const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const vendor=[];
  await p.route('**/assets/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.ACO_CONFIG='+JSON.stringify(testConfig)}));
  await p.route(/https:\/\/(www\.googletagmanager\.com|connect\.facebook\.net|pagead2\.googlesyndication\.com)\//,r=>{vendor.push(r.request().url());return r.fulfill({contentType:'text/javascript',body:'/* test stub: no data is transmitted */'});});
  await p.goto(base+'/?utm_source=instagram&utm_medium=paid_social&utm_campaign=novembro&email=private%40example.com#sensitive');
  assert.equal(vendor.length,0);assert(await p.locator('#consent-banner').isVisible());
  await p.getByRole('button',{name:'Personalizar',exact:true}).click();await p.locator('input[name=analytics]').check();await p.getByRole('button',{name:'Salvar preferências'}).click();await p.waitForTimeout(200);
  assert.equal(vendor.length,1);assert(vendor[0].includes('googletagmanager'));assert(!p.url().includes('email'));assert(!p.url().includes('sensitive'));
  let queue=await p.evaluate(()=>window.dataLayer.map(a=>Array.from(a)));assert.equal(queue.filter(a=>a[0]==='event'&&a[1]==='page_view').length,1);assert.equal(queue.find(a=>a[1]==='page_view')[2].campaign_source,'instagram');
  assert.equal(await p.locator('[data-ad-area]').isVisible(),false);ok('Consentimento granular, UTMs e remoção de parâmetros não permitidos');
  await p.locator('[data-whatsapp="hero"]').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await p.locator('[data-whatsapp="hero"]').click();
  queue=await p.evaluate(()=>window.dataLayer.map(a=>Array.from(a)));assert.equal(queue.filter(a=>a[1]==='whatsapp_invite_click').length,1);assert.equal(queue.filter(a=>a[1]==='page_view').length,1);ok('Clique GA4 único, separado de entrada na comunidade');
  await p.getByRole('button',{name:'Preferências de cookies'}).click();await p.locator('input[name=marketing]').check();await p.locator('input[name=ads]').check();await p.getByRole('button',{name:'Salvar preferências'}).click();await p.waitForTimeout(200);
  assert.equal(vendor.length,3);assert(await p.locator('[data-ad-area]').isVisible());
  let meta=await p.evaluate(()=>window.fbq.queue.map(a=>Array.from(a)));assert.equal(meta.filter(a=>a[1]==='PageView').length,1);
  await p.waitForTimeout(800);await p.locator('[data-whatsapp="hero"]').click();meta=await p.evaluate(()=>window.fbq.queue.map(a=>Array.from(a)));assert.equal(meta.filter(a=>a[1]==='WhatsAppInviteClick').length,1);
  assert.equal(await p.locator('ins.adsbygoogle').count(),1);ok('Meta PageView/clique e bloco publicitário após permissão, sem duplicação');
  const prior=vendor.length;await p.getByRole('button',{name:'Preferências de cookies'}).click();await p.locator('#consent-dialog').getByRole('button',{name:'Recusar opcionais'}).click();await p.waitForLoadState('load');await p.waitForTimeout(300);
  assert.equal(vendor.length,prior);assert.equal(await p.locator('script#aco-ga,script#aco-meta,script#aco-ads').count(),0);ok('Revogação persistida: nenhum rastreador após recarregar');
  await ctx.close();await desktop.close();
} catch(error){report.errors.push(error.stack);console.error(error);process.exitCode=1;}
finally{await browser.close();await writeFile(path.join(output,'testes.json'),JSON.stringify(report,null,2));}

