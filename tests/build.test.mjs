import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, cp, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
test('Domínio, convite e integrações inativas na entrega',async()=>{
 const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
 assert.equal((await readFile(path.join(root,'dist/CNAME'),'utf8')).trim(),'zenmovel.com.br');
 assert.equal(config.siteUrl,'https://zenmovel.com.br/');
 assert.equal(config.whatsappUrl,'https://chat.whatsapp.com/GuXAktbMUMv31Ya7Q9BM5v');
 assert.equal(config.ga4Id,'');assert.equal(config.metaPixelId,'');assert.equal(config.adsense.enabled,false);
 const html=await readFile(path.join(root,'dist/index.html'),'utf8');
 assert(html.includes('rel="canonical" href="https://zenmovel.com.br/"'));
 assert(!/http-equiv="refresh"/i.test(html));assert(!html.includes('Pedir Chip'));
 assert(!(await readFile(path.join(root,'dist/ads.txt'),'utf8')).includes('pub-'));
});
test('Build publica apenas os arquivos destinados ao site',async()=>{
 const files=await readdir(path.join(root,'dist'));
 assert(!files.includes('src'));assert(!files.includes('node_modules'));assert(!files.includes('app.html'));
 for(const file of ['index.html','privacidade.html','afiliados.html','contato.html','404.html','sitemap.xml','robots.txt']) assert(files.includes(file));
 assert.equal((await readFile(path.join(root,'dist/sitemap.xml'),'utf8')).match(/<url>/g).length,7);
});
test('Build bloqueia troca acidental de domínio e anúncios incompletos',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'aco-config-test-'));
 try {
  await cp(path.join(root,'scripts'),path.join(temp,'scripts'),{recursive:true});
  await cp(path.join(root,'CNAME'),path.join(temp,'CNAME'));
  const original=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
  for(const change of [{siteUrl:'https://example.org/'},{adsense:{enabled:true,publisherId:'',slotId:'',consentIntegrationReady:false}},{ga4Id:'invalid'}]){
   await writeFile(path.join(temp,'site.config.json'),JSON.stringify({...original,...change}));
   const result=spawnSync(process.execPath,[path.join(temp,'scripts/build.mjs')],{encoding:'utf8'});
   assert.notEqual(result.status,0);assert.match(result.stderr,/domínio HTTPS|AdSense exige|ID GA4 inválido/);
  }
 } finally {await rm(temp,{recursive:true,force:true});}
});
