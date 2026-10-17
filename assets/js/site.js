/* ============ SETTINGS APPLY + CONTENT ============ */
function nl2br(s){return esc(s).replace(/\n/g,'<br>');}
var focusLayerStack=[];
function focusableElements(root){
 return Array.prototype.slice.call(root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(function(node){return!node.hidden&&node.getAttribute('aria-hidden')!=='true'&&node.getClientRects().length>0;});
}
function activateFocusLayer(root,close,opener){
 if(!root)return;
 focusLayerStack=focusLayerStack.filter(function(item){return item.root!==root;});
 if(!root.hasAttribute('role'))root.setAttribute('role','dialog');
 root.setAttribute('aria-modal','true');
  var layer={root:root,opener:opener||document.activeElement,close:close};focusLayerStack.push(layer);
 var items=focusableElements(root);if(items.length)items[0].focus();else{root.tabIndex=-1;root.focus();}
}
function deactivateFocusLayer(root){
 var index=-1;for(var i=focusLayerStack.length-1;i>=0;i--){if(focusLayerStack[i].root===root){index=i;break;}}
 if(index<0)return;
 var layer=focusLayerStack.splice(index,1)[0],top=focusLayerStack[focusLayerStack.length-1];
 if(top){
  if(layer.opener&&top.root.contains(layer.opener)&&layer.opener.isConnected&&!layer.opener.hidden)layer.opener.focus();
  else{var items=focusableElements(top.root);if(items.length)items[0].focus();}
  return;
 }
 if(layer.opener&&layer.opener.isConnected&&!layer.opener.hidden&&typeof layer.opener.focus==='function')layer.opener.focus();
}
function trapDialogKeys(event){
 var layer=focusLayerStack[focusLayerStack.length-1];if(!layer)return;
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();layer.close();return;}
 if(event.key!=='Tab')return;
 var items=focusableElements(layer.root);if(!items.length){event.preventDefault();layer.root.focus();return;}
 var first=items[0],last=items[items.length-1];
 if(event.shiftKey&&(document.activeElement===first||!layer.root.contains(document.activeElement))){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&(document.activeElement===last||!layer.root.contains(document.activeElement))){event.preventDefault();first.focus();}
}
document.addEventListener('keydown',trapDialogKeys,true);
var SEO_ORIGIN='https://davet-sandigi.vercel.app';
var SEO_DEFAULT_TITLE='Davet Sandığı | Ürünler ve Koleksiyonlar';
var SEO_DEFAULT_DESCRIPTION='Davet Sandığı ürün kataloğunu ve koleksiyonlarını inceleyin. Yayındaki ürünlerin detaylarına ulaşın; sipariş talebinizi WhatsApp üzerinden iletin.';
var SEO_DEFAULT_IMAGE=SEO_ORIGIN+'/assets/images/brand/social-card.png';
function seoMeta(selector,content){var node=$(selector);if(node)node.setAttribute('content',content||'');}
function seoCanonical(url){var node=$('link[rel="canonical"]');if(node)node.href=url;seoMeta('meta[property="og:url"]',url);}
function updateOrganizationSchema(){
 var node=$('#organization-schema');if(!node)return;
 var schema={'@context':'https://schema.org','@type':'Organization',name:'Davet Sandığı',url:SEO_ORIGIN+'/'};
 if(settings.instagram)schema.sameAs=[settings.instagram];
 node.textContent=JSON.stringify(schema);
}
function clearProductSchema(){var node=$('#product-schema');if(node)node.remove();}
function updateSeoRoute(kind,item){
 var title=SEO_DEFAULT_TITLE,description=SEO_DEFAULT_DESCRIPTION,url=SEO_ORIGIN+'/',image=SEO_DEFAULT_IMAGE,product=null;
 if(kind==='product'&&item){
  product=item;title=item.name+' | Davet Sandığı';
  description=String(item.desc||'Ürün detaylarını inceleyerek sipariş talebinizi oluşturun.').replace(/\s+/g,' ').slice(0,160);
  url=SEO_ORIGIN+'/?urun='+encodeURIComponent(item.slug);
  if(item.img)image=item.img.src;
 }else if(kind==='category'&&item){
  title=item.label+' | Davet Sandığı';description=String(item.desc||'Yayımdaki '+item.label+' ürünlerini inceleyin.').slice(0,160);
  url=SEO_ORIGIN+'/?kategori='+encodeURIComponent(item.slug);
 }
 document.title=title;seoMeta('meta[name="description"]',description);
 seoMeta('meta[property="og:title"]',title);seoMeta('meta[property="og:description"]',description);
 seoMeta('meta[name="twitter:title"]',title);seoMeta('meta[name="twitter:description"]',description);
 seoMeta('meta[property="og:image"]',image);seoMeta('meta[name="twitter:image"]',image);
 seoCanonical(url);clearProductSchema();
 if(product&&catalogState.catalog==='ready'&&product.priceMode==='price'&&Number.isFinite(product.price)&&product.price>=0){
  var node=document.createElement('script');node.type='application/ld+json';node.id='product-schema';
    node.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:product.name,sku:product.code||undefined,description:product.desc||undefined,image:(product.gallery||[]).map(function(image){return image.src;}),url:url,offers:{'@type':'Offer',url:url,priceCurrency:settings.currencyCode||'TRY',price:Number(product.price).toFixed(2)}});
  document.head.appendChild(node);
 }
}
function applySettings(){applyContact();renderBanners();renderSectionContent();renderReviews();renderFaq();}
function renderPublicContentStates(){applySettings();}
function setContact(sel,val,scheme){
 var e=$(sel);if(!e)return;
 if(val&&scheme&&e.tagName!=='A'){
  var link=document.createElement('a');link.id=e.id;e.removeAttribute('id');e.replaceWith(link);e=link;
 }
 e.textContent=val||'';
 if(e.tagName==='A'){
  if(val){e.href=scheme==='tel'?'tel:'+String(val).replace(/[^+0-9]/g,''):'mailto:'+val;}
  else e.removeAttribute('href');
 }
 e.hidden=!val;
 var box=e.closest('li,.tb-right');if(box)box.hidden=!val;
}
function setPublicLink(id,url,label){
 var link=$('#'+id);if(!link)return;
 link.hidden=!url;
 if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer';}
 else link.removeAttribute('href');
 if(label){var text=link.querySelector('span');if(text)text.textContent=label;else link.textContent=label;}
}
function applyContact(){
 var ok=!!waNumber(),wl=ok?waLink('Davet Sandığı için sipariş talebi oluşturmak istiyorum.'):'';
 ['hdr-wa','cta-wa','ft-wa','channel-wa'].forEach(function(id){
  var e=$('#'+id);if(!e)return;var custom=!!e.dataset.custom;
  e.hidden=!ok&&!custom;
  if(ok&&!custom)e.href=wl;else if(!custom)e.removeAttribute('href');
 });
 setPublicLink('hdr-ig',settings.instagram,'Instagram');
 setPublicLink('ft-ig',settings.instagram);
 setPublicLink('story-ig',settings.instagram,'Instagram’ı ziyaret edin');
 updateOrganizationSchema();
 setPublicLink('channel-ig',settings.instagram,'Instagram’ı ziyaret edin');
 var headerRequest=$('#hdr-wa span');if(headerRequest)headerRequest.textContent='WhatsApp’ta Sipariş Talebi';
 var ctaRequest=$('#cta-btnt');if(ctaRequest&&!$('#cta-wa').dataset.custom)ctaRequest.textContent='WhatsApp’ta Sipariş Talebi Oluştur';
 setContact('#tb-phone',settings.phone,'tel');setContact('#ft-phone',settings.phone,'tel');setContact('#ft-mail',settings.mail,'mailto');
 var address=$('#ft-addr');if(address&&address.closest('li'))address.closest('li').hidden=true;
 renderOrderContext();
 setSectionState('social-commerce',catalogState.settings==='loading'?'loading':catalogState.settings==='error'?'error':'ready');
}
function renderOrderContext(){
 var note=$('#cart-rule-note');if(!note)return;
 var parts=[settings.deliveryText,settings.shippingNote].filter(function(value){return!!String(value||'').trim();});
 parts.push('Kesin fiyat ve sipariş talebi WhatsApp görüşmesinde onaylanır.');
 note.textContent=parts.join(' ');
}
function contentState(group,hasItems){var st=catalogState[group];if(st==='loading'||st==='error')return st;return hasItems?'ready':'empty';}
function applyMediaTo(img,m,sizes){if(!img||!m)return;img.src=m.src;if(m.srcset){img.srcset=m.srcset;img.sizes=sizes||m.sizes||'100vw';}else{img.removeAttribute('srcset');img.removeAttribute('sizes');}img.alt=m.alt;if(m.width)img.width=m.width;if(m.height)img.height=m.height;img.hidden=false;img.loading='lazy';img.decoding='async';}
function clearPublicImage(img){if(!img)return;img.removeAttribute('src');img.alt='';img.hidden=true;}
function setT(sel,val){var e=$(sel);if(e&&val!=null)e.textContent=val;}
/* ---- BANNER SLIDER ---- */
var bnIndex=0,bnTimer=null;
var FALLBACK_BANNER={eyebrow:'',title:'Davet Sandığı',lead:'',b1t:'Ürünleri Keşfet',b1l:'#urunler',b2t:'Koleksiyonları İncele',b2l:'#koleksiyonlar',media:null};
function bannerList(){return publicBanners.length?publicBanners:[FALLBACK_BANNER];}
function titleFmt(t){return esc(t||'').replace(/\n/g,'<br>').replace(/\*(.+?)\*/g,'<em>$1</em>');}
function showBanner(b){
 setT('#hero-eyebrow',b.eyebrow||'');
 $('#hero-title').innerHTML=titleFmt(b.title);
 setT('#hero-lead',b.lead||'');
 var img=$('#hero-img'),m=b.media,first=bnIndex===0,mediaBox=img.closest('.hero-media');
 if(m){if(img.getAttribute('src')!==m.src)img.src=m.src;if(m.srcset){img.srcset=m.srcset;img.sizes='(max-width: 760px) 100vw, 55vw';}else{img.removeAttribute('srcset');img.removeAttribute('sizes');}img.alt=m.alt;if(m.width)img.width=m.width;if(m.height)img.height=m.height;img.hidden=false;}
 else{img.removeAttribute('src');img.removeAttribute('srcset');img.removeAttribute('sizes');img.alt='';img.hidden=true;}
 if(mediaBox)mediaBox.hidden=!m;
 img.loading=first?'eager':'lazy';img.setAttribute('fetchpriority',first?'high':'auto');img.decoding='async';
 var cta=$('#hero-cta');cta.innerHTML='';
 if(b.b1t&&b.b1l)cta.innerHTML+='<a href="'+qesc(b.b1l)+'" class="btn btn-primary">'+esc(b.b1t)+' '+ICON.arr+'</a>';
 if(b.b2t&&b.b2l)cta.innerHTML+='<a href="'+qesc(b.b2l)+'" class="btn btn-ghost">'+esc(b.b2t)+'</a>';
 var proof=$('#hero-proof');if(proof){proof.innerHTML='';proof.hidden=true;}
}
function renderBanners(){
 var st=catalogState.banners;setSectionState('hero-section',st==='ready'&&!publicBanners.length?'empty':st);
 var list=bannerList();if(bnIndex>=list.length)bnIndex=0;
 showBanner(list[bnIndex]);
 var multi=list.length>1,dots=$('#banner-dots');
 dots.hidden=!multi;$('#bn-prev').hidden=!multi;$('#bn-next').hidden=!multi;
 if(multi){dots.innerHTML='';list.forEach(function(b,i){var d=el('button',i===bnIndex?'active':'');d.type='button';d.setAttribute('aria-label','Banner '+(i+1)+' göster');d.setAttribute('aria-current',i===bnIndex?'true':'false');d.onclick=function(){bnIndex=i;renderBanners();bnAuto();};dots.appendChild(d);});}
 bnAuto();
}
function bnGo(d){var n=bannerList().length;if(n<2)return;bnIndex=(bnIndex+d+n)%n;renderBanners();}
function bnAuto(){if(bnTimer)clearInterval(bnTimer);if(bannerList().length>1)bnTimer=setInterval(function(){bnGo(1);},6500);}
var STEP_ICONS=['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 9 9 0 01-3.9-.9L3 20l1.2-4.1A8.4 8.4 0 1121 11.5z"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 12v8H4v-8"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7S10.5 3.5 8 4a2 2 0 000 4h4M12 7s1.5-3.5 4-3a2 2 0 010 4h-4"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 4h15v12H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="18.5" cy="18.5" r="1.8"/></svg>'];
var WHY_ICONS=['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l2.2 6.5L21 11l-6.8 2.5L12 20l-2.2-6.5L3 11l6.8-2.5z"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-4.5-9.5-8.8A5.2 5.2 0 0112 6a5.2 5.2 0 019.5 6.2C19 16.5 12 21 12 21z"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/></svg>',STEP_ICONS[3]];
function sectionItems(key,field){var s=publicSections[key],j=s&&s.content_json;return(j&&Array.isArray(j[field])?j[field]:[]).filter(function(i){return i&&i.title;});}
function renderItemSection(key,field,sectionId,boxSel,headSel,msgs,build){
 var box=$(boxSel),s=publicSections[key],items=sectionItems(key,field),st=contentState('sections',items.length>0);
 setSectionState(sectionId,st);if(!box)return;
 if(st!=='ready'){box.innerHTML=stateBox(st,msgs[st]);return;}
 if(s.eyebrow)setT(headSel+'-eb',s.eyebrow);if(s.title)setT(headSel+'-t',s.title);
 box.innerHTML=items.map(build).join('');observeReveal();
}
function renderProcess(){
 renderItemSection('process','steps','hakkimizda','#hakkimizda .steps','#howhead',{loading:'Süreç bilgisi yükleniyor…',empty:'Henüz yayımlanmış süreç bilgisi bulunmuyor.',error:'Süreç bilgisi şu an yüklenemedi.'},function(i,n){return'<div class="step reveal"><div class="step-ic">'+STEP_ICONS[n%STEP_ICONS.length]+'</div><span class="num">'+('0'+(n+1)).slice(-2)+'</span><h3>'+esc(i.title)+'</h3><p>'+esc(i.description||'')+'</p></div>';});
}
function renderWhy(){
 renderItemSection('why_us','items','neden-biz','#neden-biz .why-grid','#whyhead',{loading:'Bilgiler yükleniyor…',empty:'Henüz yayımlanmış bilgi bulunmuyor.',error:'Bu bölüm şu an yüklenemedi.'},function(i,n){return'<div class="why-card reveal"><div class="why-ic">'+WHY_ICONS[n%WHY_ICONS.length]+'</div><h3>'+esc(i.title)+'</h3><p>'+esc(i.description||'')+'</p></div>';});
}
function renderCta(){
 var s=publicSections.cta,st=contentState('sections',!!(s&&s.title)),a=$('#cta-wa');
 setSectionState('iletisim',st);delete a.dataset.custom;
 if(st==='ready'){
  setT('#ctahead-eb',s.eyebrow||'');setT('#ctahead-t',s.title);setT('#ctahead-p',s.body||'');
  var url=safeUrl(s.button_url);if(url&&!/wa\.me\//i.test(url)){a.href=url;a.dataset.custom='1';a.classList.remove('btn-wa');a.classList.add('btn-primary');if(s.button_text)setT('#cta-btnt',s.button_text);}
  else{a.classList.remove('btn-primary');a.classList.add('btn-wa');setT('#cta-btnt','WhatsApp’ta Sipariş Talebi Oluştur');}
  var m=mediaFrom(s.media_assets,'',s.title),mediaBox=$('#cta-img').parentNode;
  if(m){applyMediaTo($('#cta-img'),m,'(max-width: 1000px) 100vw, 40vw');mediaBox.hidden=false;}else{clearPublicImage($('#cta-img'));mediaBox.hidden=true;}
 }else{
  setT('#ctahead-eb',st==='loading'?'İletişim':'');
  setT('#ctahead-t',st==='loading'?'İçerik yükleniyor…':st==='error'?'İçerik şu an yüklenemedi.':'Henüz yayımlanmış içerik bulunmuyor.');
  setT('#ctahead-p','');clearPublicImage($('#cta-img'));$('#cta-img').parentNode.hidden=true;
 }
 applyContact();
}
function prepareCampaign(){
 var s=publicSections.campaign;
 if(catalogState.sections==='ready'&&s&&s.title&&s.body){settings.campaign={enabled:true,title:s.title,text:s.body,btnText:s.button_text||'',btnLink:safeUrl(s.button_url)&&!/wa\.me\//i.test(s.button_url)?safeUrl(s.button_url):'',media:mediaFrom(s.media_assets,'',s.title)};showCampaign();}
 else settings.campaign={enabled:false};
}
function renderSectionContent(){renderTopbar();renderProcess();renderWhy();renderStory();renderCta();prepareCampaign();}
function renderTopbar(){
 var ul=$('#topbar-list');if(!ul)return;ul.innerHTML='';
 var s=publicSections.topbar,items=(s&&s.content_json&&Array.isArray(s.content_json.items)?s.content_json.items:[]).filter(Boolean),st=contentState('sections',items.length>0);
 setSectionState('topbar',st);if(st!=='ready')return;
 items.forEach(function(t){var li=el('li');li.innerHTML=ICON.chk+' '+esc(t);ul.appendChild(li);});
}
function renderStory(){
 var s=publicSections.story,st=contentState('sections',!!(s&&(s.body||s.title))),txt=$('#story-text'),lead=$('#story-lead'),mediaBox=$('#story-img').parentNode;
 setSectionState('hikayemiz',st);
 if(lead){lead.textContent='';lead.style.display='none';}
 if(st!=='ready'){clearPublicImage($('#story-img'));mediaBox.hidden=true;if(txt)txt.textContent={loading:'Yükleniyor…',empty:'Henüz yayımlanmış içerik bulunmuyor.',error:'Bu bölüm şu an yüklenemedi.'}[st];return;}
 if($('#story-eyebrow'))$('#story-eyebrow').textContent=s.eyebrow||'Hakkımızda';
 if($('#story-title'))$('#story-title').textContent=s.title||'Hikayemiz';
 if(txt)txt.innerHTML=nl2br(s.body||'');
 var m=mediaFrom(s.media_assets,'',s.title);if(m){applyMediaTo($('#story-img'),m,'(max-width: 1000px) 100vw, 45vw');mediaBox.hidden=false;}else{clearPublicImage($('#story-img'));mediaBox.hidden=true;}
}
function renderReviews(){
 var g=$('#review-grid');if(!g)return;
 var st=contentState('testimonials',publicTestimonials.length>0),nb=$('#revhead-note');if(nb)nb.innerHTML='';
 setSectionState('yorumlar',st);
 if(st!=='ready'){g.innerHTML=stateBox(st,{loading:'Yorumlar yükleniyor…',empty:'Henüz yayınlanmış yorum bulunmuyor.',error:'Yorumlar şu an yüklenemedi.'}[st]);if($('#rev-prev'))$('#rev-prev').hidden=true;if($('#rev-next'))$('#rev-next').hidden=true;return;}
 g.innerHTML='';
 publicTestimonials.forEach(function(r){
  var c=el('figure','review-card ugc reveal');
  c.innerHTML=(r.media?'<div class="ugc-photo">'+mediaImg(r.media,{alt:r.name||'Müşteri fotoğrafı'})+'</div>':'')+
   '<div class="ugc-body"><div class="review-stars" role="img" aria-label="5 üzerinden '+r.rating+'">'+'★'.repeat(r.rating)+'☆'.repeat(5-r.rating)+'</div><blockquote>“'+esc(r.text)+'”</blockquote><figcaption><b>'+esc(r.name||'İsimsiz')+'</b><span>'+esc(r.event)+'</span></figcaption></div>';
  g.appendChild(c);
 });
 setTimeout(updateRevArrows,30);observeReveal();
}
function scrollRev(dir){var t=$('#review-grid');if(!t)return;var c=t.querySelector('.review-card');var w=c?c.getBoundingClientRect().width+24:320;t.scrollBy({left:dir*w,behavior:'smooth'});}
function updateRevArrows(){var t=$('#review-grid');if(!t)return;var over=t.scrollWidth>t.clientWidth+4;if($('#rev-prev'))$('#rev-prev').hidden=!over;if($('#rev-next'))$('#rev-next').hidden=!over;}
function faqText(value){return String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[’‘]/g,"'").replace(/[–—]/g,'-');}
function resolvedPublicFaq(f){
 var question=faqText(f.question),answer=faqText(f.answer),pair=question+'|'+answer;
 var legacy={
  "minimum siparis adedi nedir?|urunlerimiz minimum 25 adet ve 25'er artislarla siparis edilebilir. adet secimini sepet uzerinden yapabilirsiniz.":'minimum',
  '100 adet uzeri fiyat nasil belirlenir?|100 adedin uzerindeki siparislerde size ozel fiyat teklifi sunuyoruz. sepetinizi olusturup whatsapp\'tan iletisime gecmeniz yeterli.':'quote',
  'kargo ucreti ne kadar?|kargo ucreti siparis sirasinda belirtilir. belirli tutarin uzerindeki siparislerde kargo ucretsizdir.':'shipping',
  'teslimat suresi ne kadardir?|tasarim onayinin ardindan ortalama 5-7 is gunu icinde hazirlayip kargoya veriyoruz.':'delivery',
  'kisiye ozel tasarim yapiyor musunuz?|evet, isim, tarih ve konseptinize ozel tasarimlar hazirliyoruz. talebinizi whatsapp uzerinden iletebilirsiniz.':'unconfirmed'
 };
 var type=legacy[pair];if(!type)return{question:f.question,answer:f.answer};
 if(type==='unconfirmed')return null;
 if(type==='shipping')return settings.shippingNote?{question:f.question,answer:settings.shippingNote}:null;
 if(type==='delivery')return settings.deliveryText?{question:f.question,answer:settings.deliveryText}:null;
 if(type==='minimum')return{question:f.question,answer:'Minimum adet ve artış kuralı ürün detayında belirtilir.'};
 return{question:f.question,answer:'Özel fiyat teklifi gereken ürün veya adetler ürün ve sepet görünümünde belirtilir.'};
}
function renderFaq(){
 var l=$('#faq-list');if(!l)return;
 var st=contentState('faqs',publicFaqs.length>0),resolved=st==='ready'?publicFaqs.map(resolvedPublicFaq).filter(Boolean):[];
 if(st==='ready'&&!resolved.length)st='empty';
 setSectionState('sss',st);
 if(st!=='ready'){l.innerHTML=stateBox(st,{loading:'Sorular yükleniyor…',empty:'Şu anda yayımlanmış soru bulunmuyor.',error:'Sorular şu an yüklenemedi.'}[st]);return;}
 l.innerHTML='';
 resolved.forEach(function(f){
  var it=el('div','faq-item reveal');
  it.innerHTML='<button class="faq-q" type="button" aria-expanded="false"><span>'+esc(f.question)+'</span><b>+</b></button><div class="faq-a"><p>'+esc(f.answer)+'</p></div>';
  it.querySelector('.faq-q').addEventListener('click',function(){it.classList.toggle('open');var open=it.classList.contains('open');it.querySelector('.faq-q b').textContent=open?'–':'+';this.setAttribute('aria-expanded',open?'true':'false');});
  l.appendChild(it);
 });
 observeReveal();
}
/* ---- SEARCH ---- */
function openSearch(opener){$('#searchview').classList.add('open');document.body.style.overflow='hidden';activateFocusLayer($('#searchview'),closeSearch,opener);setTimeout(function(){$('#search-input').focus();},50);}
function closeSearch(){var view=$('#searchview');view.classList.remove('open');deactivateFocusLayer(view);document.body.style.overflow='';$('#search-input').value='';$('#search-grid').innerHTML='';$('#search-hint').style.display='';}
function runSearch(){
 var q=($('#search-input').value||'').trim().toLowerCase();var g=$('#search-grid'),h=$('#search-hint');g.innerHTML='';
 if(catalogState.catalog!=='ready'){h.style.display='';h.textContent=catalogState.catalog==='loading'?'Ürünler yükleniyor…':'Ürünler şu an yüklenemedi.';return;}
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
 var text=(settings.legal||{})[key]||'';
 $('#legal-body').textContent=text||'Bu metin henüz yayımlanmamıştır.';
 $('#legal-modal').classList.add('open');activateFocusLayer($('#legal-modal'),closeLegal);
}
function closeLegal(){$('#legal-modal').classList.remove('open');deactivateFocusLayer($('#legal-modal'));}
/* ---- COOKIE CONSENT ---- */
function initCookie(){if(!localStorage.getItem('ds_cookie_v1'))$('#cookie-bar').hidden=false;}
function setCookieChoice(v){localStorage.setItem('ds_cookie_v1',v);$('#cookie-bar').hidden=true;}
/* ---- CAMPAIGN POPUP ---- */
function showCampaign(force){
 var c=settings.campaign||{};
 if(!force){if(!c.enabled)return;if(sessionStorage.getItem('ds_camp_seen'))return;}
 var media=$('#camp-media');
 if(c.media){applyMediaTo($('#camp-img'),c.media,'min(440px, 100vw)');media.classList.remove('no-img');}else{media.classList.add('no-img');}
 $('#camp-title').textContent=c.title||'';
 $('#camp-text').textContent=c.text||'';
 var b=$('#camp-btn');
 if(c.btnText&&c.btnLink){b.style.display='';b.textContent=c.btnText;b.setAttribute('href',c.btnLink);}else{b.style.display='none';}
 $('#campaign-modal').classList.add('open');activateFocusLayer($('#campaign-modal'),closeCampaign);
 sessionStorage.setItem('ds_camp_seen','1');
}
function closeCampaign(){$('#campaign-modal').classList.remove('open');deactivateFocusLayer($('#campaign-modal'));}

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
document.addEventListener('input',function(e){if(e.target.matches('[data-cart-note]'))setCartNote(e.target.getAttribute('data-cart-note'),e.target.value);});
$('#open-cart').addEventListener('click',openCart);
$('#cart-fab').addEventListener('click',openCart);
$('#drawer-close').addEventListener('click',closeCart);
$('#overlay').addEventListener('click',closeCart);
$('#continue-btn').addEventListener('click',closeCart);
$('#checkout-btn').addEventListener('click',checkout);
$('#rc-close').addEventListener('click',closeOrder);
$('#rc-print').addEventListener('click',function(){window.print();});
$('#cv-back').addEventListener('click',closeCollection);
$('#cv-more').addEventListener('click',cvRenderMore);
$('#collview').addEventListener('scroll',function(){if($('#cv-more-wrap').hidden)return;if(this.scrollTop+this.clientHeight>=this.scrollHeight-450)cvRenderMore();});
$('#show-all-prod').addEventListener('click',openAllProducts);
$('#prod-more').addEventListener('click',renderMoreMain);
window.addEventListener('scroll',function(){var b=$('#prod-more');if(!b||b.hidden)return;var g=$('#prod-grid');if(g&&g.getBoundingClientRect().bottom<=window.innerHeight+300)renderMoreMain();});
$('#menu-toggle').addEventListener('click',function(){var open=$('#mainnav').classList.toggle('mob');this.setAttribute('aria-expanded',open?'true':'false');});
$all('#mainnav a').forEach(function(a){a.addEventListener('click',function(){$('#mainnav').classList.remove('mob');});});
$('#bn-prev').addEventListener('click',function(){bnGo(-1);});
$('#bn-next').addEventListener('click',function(){bnGo(1);});
$('#rev-prev').addEventListener('click',function(){scrollRev(-1);});
$('#rev-next').addEventListener('click',function(){scrollRev(1);});
window.addEventListener('resize',function(){updateRevArrows();});
$('#open-search').addEventListener('click',function(event){openSearch(event.currentTarget);});
$('#search-close').addEventListener('click',closeSearch);
$('#search-input').addEventListener('input',runSearch);
$('#legal-close').addEventListener('click',closeLegal);
$('#kvkk-link').addEventListener('click',function(e){e.preventDefault();openLegal('kvkk');});
document.addEventListener('click',function(e){var t=e.target.closest('[data-legal]');if(t){e.preventDefault();openLegal(t.getAttribute('data-legal'));}});
document.addEventListener('keydown',function(e){
 if(e.key==='Enter'||e.key===' '){var legal=e.target.closest('[data-legal][role="button"]');if(legal){e.preventDefault();openLegal(legal.dataset.legal);}}
});
/* open product detail on card click (ignore action buttons) */
document.addEventListener('click',function(e){
 if(e.target.closest('[data-add],[data-wish],.stepper,.prod-add,.wish'))return;
 var card=e.target.closest('.prod-card[data-pid]');
 if(card)openProduct(card.getAttribute('data-pid'),e.target.closest('.product-detail-trigger')||card.querySelector('.product-detail-trigger'));
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
document.addEventListener('click',function(e){if(e.target.closest('[data-retry]'))loadPublicSite();});
window.addEventListener('hashchange',function(){if(!openProductFromLocation())openCategoryFromLocation();});
syncCart();observeReveal();initCookie();
loadPublicSite();
