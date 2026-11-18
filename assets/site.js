(() => {
  'use strict';
  const c = window.ACO_CONFIG || {};
  const available = { analytics:/^G-[A-Z0-9]{6,20}$/.test(c.ga4Id || ''), marketing:/^\d{5,25}$/.test(c.metaPixelId || ''), ads: !!(c.adsense?.enabled && c.adsense?.consentIntegrationReady && /^ca-pub-\d{16}$/.test(c.adsense?.publisherId || '') && /^\d{6,20}$/.test(c.adsense?.slotId || '')) };
  const key = 'aco-consent-v1';
  const signature = JSON.stringify([c.ga4Id,c.metaPixelId,c.adsense]);
  const maxAge = 180 * 86400000;
  const denied = {analytics:false,marketing:false,ads:false};
  let stored;
  try { stored = JSON.parse(localStorage.getItem(key)); } catch {}
  const validStored = !!(stored && stored.version === 1 && stored.signature === signature && typeof stored.at === 'number' && Date.now()-stored.at >= 0 && Date.now()-stored.at < maxAge);
  let consent = validStored ? Object.fromEntries(Object.keys(denied).map(k=>[k,stored[k]===true && available[k]])) : {...denied};
  const banner = document.getElementById('consent-banner');
  const dialog = document.getElementById('consent-dialog');
  const form = document.getElementById('consent-form');
  let gaStarted=false, metaStarted=false, adsStarted=false;
  const sourceUrl = new URL(location.href);
  const campaign = {};
  for (const [utm,field] of Object.entries({utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name',utm_content:'campaign_content',utm_term:'campaign_term',utm_id:'campaign_id'})) {
    const v=sourceUrl.searchParams.get(utm);
    if(v && /^[a-zA-Z0-9_-]{1,100}$/.test(v)) campaign[field]=v;
  }
  const cleanLocation = location.origin + location.pathname;
  let referrer='';
  try { referrer=new URL(document.referrer).origin; } catch {}
  function cleanForTrackers() {
    // Never forward arbitrary query strings or fragments to third-party tags.
    const clean=new URL(cleanLocation);
    for(const [field,v] of Object.entries(campaign)) {
      const k={campaign_source:'utm_source',campaign_medium:'utm_medium',campaign_name:'utm_campaign',campaign_content:'utm_content',campaign_term:'utm_term',campaign_id:'utm_id'}[field];
      clean.searchParams.set(k,v);
    }
    try { history.replaceState(history.state,'',clean.href); } catch {}
  }
  function script(id,src) {
    if(document.getElementById(id)) return;
    const el=document.createElement('script');el.id=id;el.async=true;el.src=src;
    el.addEventListener('error',()=>{if(id==='aco-ads') document.querySelectorAll('[data-ad-area]').forEach(a=>a.hidden=true);});
    document.head.append(el);
  }
  function start() {
    if(Object.keys(consent).some(k=>consent[k]&&available[k])) cleanForTrackers();
    if(consent.analytics && available.analytics && !gaStarted) {
      gaStarted=true;
      window.dataLayer=window.dataLayer || [];
      window.gtag=function(){window.dataLayer.push(arguments);};
      window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('js',new Date());
      window.gtag('config',c.ga4Id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,page_location:cleanLocation,page_referrer:referrer,...campaign});
      window.gtag('event','page_view',{page_title:document.title,page_location:cleanLocation,page_referrer:referrer,...campaign});
      script('aco-ga',`https://www.googletagmanager.com/gtag/js?id=${c.ga4Id}`);
    }
    if(consent.marketing && available.marketing && !metaStarted) {
      metaStarted=true;
      if(!window.fbq) { const fb=function(){fb.callMethod?fb.callMethod.apply(fb,arguments):fb.queue.push(arguments);};fb.queue=[];fb.loaded=true;fb.version='2.0';fb.push=fb;window.fbq=fb;window._fbq=fb; }
      window.fbq('consent','grant');
      window.fbq('set','autoConfig',false,c.metaPixelId);
      window.fbq('init',c.metaPixelId);
      window.fbq('track','PageView');
      script('aco-meta','https://connect.facebook.net/en_US/fbevents.js');
    }
    if(consent.ads && available.ads && !adsStarted && document.querySelector('[data-ad-slot]')) {
      adsStarted=true;
      document.querySelectorAll('[data-ad-slot]').forEach(slot=>{
        slot.closest('[data-ad-area]').hidden=false;
        const ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';ins.dataset.adClient=c.adsense.publisherId;ins.dataset.adSlot=c.adsense.slotId;ins.dataset.adFormat='auto';ins.dataset.fullWidthResponsive='true';slot.append(ins);
        (window.adsbygoogle=window.adsbygoogle||[]).push({});
      });
      script('aco-ads',`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.adsense.publisherId}`);
    }
  }
  function clearKnownCookies() {
    const domains=[location.hostname,'.'+location.hostname];
    const parts=location.hostname.split('.');
    while(parts.length>2){parts.shift();domains.push('.'+parts.join('.'));}
    for(const item of document.cookie.split(';')) {
      const name=item.split('=')[0].trim();
      if(!/^(_ga($|_)|_gid$|_gat|_fbp$|_fbc$|_gcl_)/.test(name)) continue;
      document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      for(const domain of domains) document.cookie=`${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
  function save(next) {
    const before=consent;
    consent=Object.fromEntries(Object.keys(denied).map(k=>[k,next[k]===true && available[k]]));
    try {localStorage.setItem(key,JSON.stringify({...consent,version:1,at:Date.now(),signature}));} catch {}
    banner.hidden=true;dialog.close();
    const revoked=Object.keys(consent).some(k=>before[k]&&!consent[k]);
    if(revoked) {
      if(window.gtag){window['ga-disable-'+c.ga4Id]=true;window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
      if(window.fbq) window.fbq('consent','revoke');
      clearKnownCookies();
      // Reload removes previously loaded vendor code; the saved choices govern the next page.
      location.reload();return;
    }
    start();
  }
  function settings() {
    for(const k of Object.keys(denied)){form.elements[k].disabled=!available[k];form.elements[k].checked=consent[k];}
    document.getElementById('no-integrations').hidden=Object.values(available).some(Boolean);
    if(!dialog.open) dialog.showModal();
  }
  document.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.consent==='settings') settings();
    else save(button.dataset.consent==='accept'?available:denied);
  }));
  document.querySelector('[data-close-consent]').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',e=>{e.preventDefault();save(Object.fromEntries(Object.keys(denied).map(k=>[k,form.elements[k].checked])));});
  let lastClick=-Infinity;
  document.querySelectorAll('[data-whatsapp]').forEach(link=>link.addEventListener('click',()=>{
    const now=performance.now();if(now-lastClick<750)return;lastClick=now;
    const data={link_placement:link.dataset.whatsapp,link_domain:'chat.whatsapp.com',page_location:cleanLocation,...campaign};
    if(consent.analytics && gaStarted) window.gtag('event','whatsapp_invite_click',data);
    if(consent.marketing && metaStarted) window.fbq('trackCustom','WhatsAppInviteClick',{link_placement:link.dataset.whatsapp});
    // A normal HTTPS link opens immediately; analytics never blocks navigation.
  }));
  banner.hidden=validStored || !Object.values(available).some(Boolean);
  start();
})();
