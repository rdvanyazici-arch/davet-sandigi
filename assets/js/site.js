/* ============ SETTINGS APPLY + CONTENT ============ */
function nl2br(s){return esc(s).replace(/\n/g,'<br>');}
function applySettings(){
 $('#ft-phone').textContent=settings.phone||'';$('#tb-phone').textContent=settings.phone||'';
 $('#ft-mail').textContent=settings.mail||'';$('#ft-addr').textContent=settings.addr||'';
 var wl=waLink('Merhaba, Davet Sandığı hakkında teklif/bilgi almak istiyorum.');
 ['hdr-wa','cta-wa','ft-wa','story-wa'].forEach(function(id){var e=$('#'+id);if(e)e.href=wl;});
 var ig=$('#ft-ig');if(ig)ig.href=settings.instagram||'#';
 renderBanners();renderTopbar();renderStory();renderReviews();renderFaq();applyHome();
}
function setT(sel,val){var e=$(sel);if(e&&val!=null)e.textContent=val;}
/* ---- BANNER SLIDER ---- */
var bnIndex=0,bnTimer=null;
function bannerList(){return(settings.banners&&settings.banners.length)?settings.banners:[JSON.parse(JSON.stringify(DEF_BANNER))];}
function titleFmt(t){return esc(t||'').replace(/\n/g,'<br>').replace(/\*(.+?)\*/g,'<em>$1</em>');}
function showBanner(b){
 setT('#hero-eyebrow',b.eyebrow);
 $('#hero-title').innerHTML=titleFmt(b.title);
 setT('#hero-lead',b.lead);
 $('#hero-img').src=imgSrc(b.img||'hero');
 var cta=$('#hero-cta');cta.innerHTML='';
 if(b.b1t)cta.innerHTML+='<a href="'+esc(b.b1l||'#')+'" class="btn btn-primary">'+esc(b.b1t)+' '+ICON.arr+'</a>';
 if(b.b2t)cta.innerHTML+='<a href="'+esc(b.b2l||'#')+'" class="btn btn-ghost">'+esc(b.b2t)+'</a>';
}
function renderBanners(){
 var list=bannerList();if(bnIndex>=list.length)bnIndex=0;
 showBanner(list[bnIndex]);
 var multi=list.length>1,dots=$('#banner-dots');
 dots.hidden=!multi;$('#bn-prev').hidden=!multi;$('#bn-next').hidden=!multi;
 if(multi){dots.innerHTML='';list.forEach(function(b,i){var d=el('button',i===bnIndex?'active':'');d.onclick=function(){bnIndex=i;renderBanners();bnAuto();};dots.appendChild(d);});}
 bnAuto();
}
function bnGo(d){var n=bannerList().length;if(n<2)return;bnIndex=(bnIndex+d+n)%n;renderBanners();}
function bnAuto(){if(bnTimer)clearInterval(bnTimer);if(bannerList().length>1)bnTimer=setInterval(function(){bnGo(1);},6500);}
function applyHome(){
 var h=settings.home||{};
 var hp=$('#hero-proof');if(hp&&h.proof)hp.innerHTML=h.proof.map(function(p){return'<div><b>'+esc(p.b)+'</b><span>'+esc(p.s)+'</span></div>';}).join('');
 var ch=h.collHead||{};setT('#collhead-eb',ch.eb);setT('#collhead-t',ch.t);setT('#collhead-s',ch.s);
 var ph=h.prodHead||{};setT('#prodhead-eb',ph.eb);setT('#prodhead-t',ph.t);setT('#prodhead-s',ph.s);
 var hh=h.howHead||{};setT('#howhead-eb',hh.eb);setT('#howhead-t',hh.t);
 (h.steps||[]).forEach(function(s,i){setT('#step'+(i+1)+'t',s.t);setT('#step'+(i+1)+'d',s.d);});
 var wh=h.whyHead||{};setT('#whyhead-eb',wh.eb);setT('#whyhead-t',wh.t);
 (h.why||[]).forEach(function(w,i){setT('#why'+(i+1)+'t',w.t);setT('#why'+(i+1)+'d',w.d);});
 var ct=h.cta||{};setT('#ctahead-eb',ct.eb);setT('#ctahead-t',ct.t);setT('#ctahead-p',ct.p);setT('#cta-btnt',ct.btn);
 if(ct.img&&$('#cta-img'))$('#cta-img').src=imgSrc(ct.img);
}
function renderTopbar(){
 var ul=$('#topbar-list');if(!ul)return;ul.innerHTML='';
 (settings.topbar||[]).forEach(function(t){var li=el('li');li.innerHTML=ICON.chk+' '+esc(t);ul.appendChild(li);});
}
function renderStory(){
 var s=settings.story||{};
 if($('#story-eyebrow'))$('#story-eyebrow').textContent='Hakkımızda';
 if($('#story-title'))$('#story-title').textContent=s.title||'Hikayemiz';
 if($('#story-lead'))$('#story-lead').textContent=s.lead||'';
 if($('#story-text'))$('#story-text').innerHTML=nl2br(s.text||'');
}
function renderReviews(){
 var g=$('#review-grid');if(!g)return;g.innerHTML='';
 (settings.reviews||[]).forEach(function(r){
  var c=el('figure','review-card ugc reveal');
  c.innerHTML=(r.img?'<div class="ugc-photo"><img src="'+imgSrc(r.img)+'" alt="'+esc(r.name)+'"></div>':'')+
   '<div class="ugc-body"><div class="review-stars">★★★★★</div><blockquote>“'+esc(r.text)+'”</blockquote><figcaption><b>'+esc(r.name)+'</b><span>'+esc(r.event)+'</span></figcaption></div>';
  g.appendChild(c);
 });
 var rh=settings.revHead||{};setT('#revhead-eb',rh.eb);setT('#revhead-t',rh.t);setT('#revhead-s',rh.s);
 var nb=$('#revhead-note');if(nb){nb.innerHTML=rh.note?'<span>'+esc(rh.note)+'</span><a class="btn btn-primary" id="ugc-wa">'+ICON.wa+' Fotoğraf Gönder</a>':'';var uw=$('#ugc-wa');if(uw)uw.href=waLink('Merhaba, Davet Sandığı için ürün fotoğrafımı paylaşmak istiyorum.');}
 setTimeout(updateRevArrows,30);observeReveal();
}
function scrollRev(dir){var t=$('#review-grid');if(!t)return;var c=t.querySelector('.review-card');var w=c?c.getBoundingClientRect().width+24:320;t.scrollBy({left:dir*w,behavior:'smooth'});}
function updateRevArrows(){var t=$('#review-grid');if(!t)return;var over=t.scrollWidth>t.clientWidth+4;if($('#rev-prev'))$('#rev-prev').hidden=!over;if($('#rev-next'))$('#rev-next').hidden=!over;}
function renderFaq(){
 var l=$('#faq-list');if(!l)return;l.innerHTML='';
 (settings.faq||[]).forEach(function(f){
  var it=el('div','faq-item reveal');
  it.innerHTML='<button class="faq-q"><span>'+esc(f.q)+'</span><b>+</b></button><div class="faq-a"><p>'+esc(f.a)+'</p></div>';
  it.querySelector('.faq-q').addEventListener('click',function(){it.classList.toggle('open');it.querySelector('.faq-q b').textContent=it.classList.contains('open')?'–':'+';});
  l.appendChild(it);
 });
 observeReveal();
}
/* ---- SEARCH ---- */
function openSearch(){$('#searchview').classList.add('open');document.body.style.overflow='hidden';setTimeout(function(){$('#search-input').focus();},50);}
function closeSearch(){$('#searchview').classList.remove('open');document.body.style.overflow='';$('#search-input').value='';$('#search-grid').innerHTML='';$('#search-hint').style.display='';}
function runSearch(){
 var q=($('#search-input').value||'').trim().toLowerCase();var g=$('#search-grid'),h=$('#search-hint');g.innerHTML='';
 if(q.length<2){h.style.display='';h.textContent='En az 2 harf yazın…';return;}
 var res=visibleProducts().filter(function(p){
  return p.name.toLowerCase().indexOf(q)>-1||(p.desc||'').toLowerCase().indexOf(q)>-1||(p.code||'').toLowerCase().indexOf(q)>-1||catLabel(p.cat).toLowerCase().indexOf(q)>-1||(p.occ||[]).some(function(o){return occLabel(o).toLowerCase().indexOf(q)>-1;});
 });
 if(!res.length){h.style.display='';h.textContent='“'+q+'” için sonuç bulunamadı.';return;}
 h.style.display='none';res.forEach(function(p){var c=productCard(p);c.classList.add('in');g.appendChild(c);});
}
/* ---- LEGAL ---- */
function openLegal(key){
 var titles={privacy:'Gizlilik Politikası',kvkk:'KVKK Aydınlatma Metni',cookie:'Çerez Politikası',mesafeli:'Sipariş & Mesafeli Satış Koşulları'};
 $('#legal-title').textContent=titles[key]||'Bilgilendirme';
 $('#legal-body').innerHTML=nl2br((settings.legal||{})[key]||'');
 $('#legal-modal').classList.add('open');
}
/* ---- COOKIE CONSENT ---- */
function initCookie(){if(!localStorage.getItem('ds_cookie_v1'))$('#cookie-bar').hidden=false;}
function setCookieChoice(v){localStorage.setItem('ds_cookie_v1',v);$('#cookie-bar').hidden=true;}
/* ---- CAMPAIGN POPUP ---- */
function showCampaign(force){
 var c=settings.campaign||{};
 if(!force){if(!c.enabled)return;if(sessionStorage.getItem('ds_camp_seen'))return;}
 var media=$('#camp-media');
 if(c.img){$('#camp-img').src=imgSrc(c.img);media.classList.remove('no-img');}else{media.classList.add('no-img');}
 $('#camp-title').textContent=c.title||'';
 $('#camp-text').textContent=c.text||'';
 var b=$('#camp-btn');
 if(c.btnText){b.style.display='';b.textContent=c.btnText;b.setAttribute('href',c.btnLink||'#');}else{b.style.display='none';}
 $('#campaign-modal').classList.add('open');
 sessionStorage.setItem('ds_camp_seen','1');
}
function closeCampaign(){$('#campaign-modal').classList.remove('open');}

/* ============ EVENTS ============ */
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-add],[data-wish],[data-inc],[data-dec],[data-rm]');
 if(!t)return;
 if(t.hasAttribute('data-add'))addToCart(t.getAttribute('data-add'));
 else if(t.hasAttribute('data-wish'))toggleWish(t.getAttribute('data-wish'));
 else if(t.hasAttribute('data-inc'))setQty(t.getAttribute('data-inc'),1);
 else if(t.hasAttribute('data-dec'))setQty(t.getAttribute('data-dec'),-1);
 else if(t.hasAttribute('data-rm'))removeCart(t.getAttribute('data-rm'));
});
$('#open-cart').addEventListener('click',openCart);
$('#cart-fab').addEventListener('click',openCart);
$('#drawer-close').addEventListener('click',closeCart);
$('#overlay').addEventListener('click',closeCart);
$('#continue-btn').addEventListener('click',closeCart);
$('#checkout-btn').addEventListener('click',checkout);
$('#rc-close').addEventListener('click',function(){$('#order-modal').classList.remove('open');});
$('#rc-print').addEventListener('click',function(){window.print();});
$('#cv-back').addEventListener('click',closeCollection);
$('#cv-more').addEventListener('click',cvRenderMore);
$('#collview').addEventListener('scroll',function(){if($('#cv-more-wrap').hidden)return;if(this.scrollTop+this.clientHeight>=this.scrollHeight-450)cvRenderMore();});
$('#show-all-prod').addEventListener('click',openAllProducts);
$('#prod-more').addEventListener('click',renderMoreMain);
window.addEventListener('scroll',function(){var b=$('#prod-more');if(!b||b.hidden)return;var g=$('#prod-grid');if(g&&g.getBoundingClientRect().bottom<=window.innerHeight+300)renderMoreMain();});
$('#menu-toggle').addEventListener('click',function(){$('#mainnav').classList.toggle('mob');});
$all('#mainnav a').forEach(function(a){a.addEventListener('click',function(){$('#mainnav').classList.remove('mob');});});
$('#bn-prev').addEventListener('click',function(){bnGo(-1);});
$('#bn-next').addEventListener('click',function(){bnGo(1);});
$('#rev-prev').addEventListener('click',function(){scrollRev(-1);});
$('#rev-next').addEventListener('click',function(){scrollRev(1);});
window.addEventListener('resize',function(){updateRevArrows();});
$('#open-search').addEventListener('click',openSearch);
$('#search-close').addEventListener('click',closeSearch);
$('#search-input').addEventListener('input',runSearch);
$('#legal-close').addEventListener('click',function(){$('#legal-modal').classList.remove('open');});
$('#kvkk-link').addEventListener('click',function(e){e.preventDefault();openLegal('kvkk');});
document.addEventListener('click',function(e){var t=e.target.closest('[data-legal]');if(t){e.preventDefault();openLegal(t.getAttribute('data-legal'));}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeSearch();closeProduct();closeCampaign();$('#legal-modal').classList.remove('open');$('#order-modal').classList.remove('open');}});
/* open product detail on card click (ignore action buttons) */
document.addEventListener('click',function(e){
 if(e.target.closest('[data-add],[data-wish],.stepper,.prod-add,.wish'))return;
 var card=e.target.closest('.prod-card[data-pid]');
 if(card)openProduct(card.getAttribute('data-pid'));
});
$('#pm-close').addEventListener('click',closeProduct);
$('#pm-prev').addEventListener('click',function(){pmNav(-1);});
$('#pm-next').addEventListener('click',function(){pmNav(1);});
$('#pm-dec').addEventListener('click',function(){pmSetQty(-1);});
$('#pm-inc').addEventListener('click',function(){pmSetQty(1);});
$('#pm-add').addEventListener('click',function(){addToCart(pmState.id,pmQty);});
$('#product-modal').addEventListener('click',function(e){if(e.target===this)closeProduct();});
$('#cookie-accept').addEventListener('click',function(){setCookieChoice('accepted');});
$('#cookie-reject').addEventListener('click',function(){setCookieChoice('rejected');});
$('#camp-close').addEventListener('click',closeCampaign);
$('#camp-btn').addEventListener('click',closeCampaign);
$('#campaign-modal').addEventListener('click',function(e){if(e.target===this)closeCampaign();});

/* ============ REVEAL ============ */
var io;
function observeReveal(){
 if(!('IntersectionObserver'in window)){$all('.reveal').forEach(function(e){e.classList.add('in');});return;}
 if(!io)io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.12});
 $all('.reveal:not(.in)').forEach(function(e){io.observe(e);});
}
function refreshSite(){renderCollections();renderFilter();renderProducts();applySettings();}

/* ============ INIT ============ */
$('#year').textContent=new Date().getFullYear();
renderCollections();renderFilter();renderProducts();applySettings();syncCart();observeReveal();initCookie();showCampaign();
startLegacyFirebase(function(available){
 if(!available)return;
 fbAuth.onAuthStateChanged(function(u){fbUser=u||null;});
 loadFromCloud();
});
