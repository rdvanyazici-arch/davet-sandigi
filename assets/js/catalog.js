/* ============ PUBLIC DATA: Supabase REST (publishable key, yalnızca SELECT) ============ */
var PUBLIC_PRICE_ERROR='Fiyat bilgisi şu an yüklenemedi';
var PUBLIC_URL_PATTERN=/^(https:\/\/|#|\/(?!\/)|tel:|mailto:)/;
var PUBLIC_TIMEOUT_MS=12000;
var MEDIA_COLS='storage_path,alt_text,width,height';
var PUBLIC_QUERIES={
 settings:{table:'site_settings_public',select:'whatsapp_number,instagram_url,phone,email,delivery_text,currency_code,default_min_quantity,default_quantity_step,quote_threshold,shipping_note,is_maintenance_mode',params:{id:'eq.1',limit:'1'}},
 categories:{table:'categories',select:'id,slug,name,description,sort_order,category_collections(collection_id,sort_order)',params:{is_active:'eq.true',archived_at:'is.null',order:'sort_order.asc,id.asc'}},
 collections:{table:'collections',select:'id,slug,name,short_description,icon_key,sort_order,media_assets!cover_media_id('+MEDIA_COLS+')',params:{is_active:'eq.true',archived_at:'is.null',order:'sort_order.asc,id.asc'}},
 products:{table:'products',select:'id,category_id,slug,sku,name,short_description,description,price,is_price_visible,is_quote_only,min_quantity,quantity_step,is_featured,sort_order,product_images(alt_text,sort_order,is_primary,media_assets('+MEDIA_COLS+')),product_collections(collection_id)',params:{is_active:'eq.true',archived_at:'is.null',order:'sort_order.asc,id.asc',limit:'500'}},
 banners:{table:'banners',select:'id,eyebrow,title,description,primary_button_text,primary_button_url,secondary_button_text,secondary_button_url,sort_order,starts_at,ends_at,media_assets!media_id('+MEDIA_COLS+')',params:{is_active:'eq.true',order:'sort_order.asc,id.asc'}},
 sections:{table:'content_sections',select:'section_key,eyebrow,title,body,button_text,button_url,content_json,media_assets!media_id('+MEDIA_COLS+')',params:{is_active:'eq.true'}},
 faqs:{table:'faqs',select:'id,question,answer,sort_order',params:{is_active:'eq.true',order:'sort_order.asc,id.asc'}},
 testimonials:{table:'testimonials',select:'id,customer_display_name,event_name,review_text,rating,sort_order,media_assets!media_id('+MEDIA_COLS+')',params:{is_published:'eq.true',consent_confirmed:'eq.true',order:'sort_order.asc,id.asc'}}
};
var catalogState={settings:'loading',catalog:'loading',banners:'loading',sections:'loading',faqs:'loading',testimonials:'loading'};
var publicBanners=[],publicSections={},publicFaqs=[],publicTestimonials=[],publicLoadToken=0;
var PUBLIC_SAMPLE_SETTINGS={
 whatsapp_number:['905399413902'],
 instagram_url:['https://www.instagram.com/davetsandigi'],
 phone:['+905399413902','905399413902'],
 email:['info@davetsandigi.com'],
 delivery_text:["türkiye'nin her yerine teslimat",'türkiye geneli teslimat']
};
var PUBLIC_SAMPLE_REVIEW_NAMES=['Elif & Burak','Zeynep Y.','Merve & Can','Ayşe & Mert','Selin & Kaan','Deniz & Ece'];

function publicRequest(q){
 var cfg=SUPABASE_CONFIG;
 if(!cfg||!cfg.url||!cfg.publishableKey)return Promise.reject(new Error('Supabase yapılandırması eksik.'));
 if(q.select.indexOf('*')>-1)return Promise.reject(new Error('Açık sütun listesi gerekli.'));
 var params=new URLSearchParams(q.params);params.set('select',q.select);
 var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort();},PUBLIC_TIMEOUT_MS);
 return fetch(cfg.url+'/rest/v1/'+q.table+'?'+params.toString(),{headers:{apikey:cfg.publishableKey,Accept:'application/json'},signal:ctl.signal})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
  .then(function(rows){if(!Array.isArray(rows))throw new Error('Beklenmeyen yanıt');return rows;})
  .finally(function(){clearTimeout(timer);});
}
function publicQuery(key){return publicRequest(PUBLIC_QUERIES[key]);}
/* analytics_enabled sutunu 20261021151427 migration'i uzak projeye uygulanmadan once yoktur.
   Once bayrakli sorgu denenir; sutun yoksa istek 400 doner ve bayraksiz sorguya dusulur,
   bu durumda analiz kapali kalir. Migration uygulandiginda ek bir kod degisikligi gerekmez. */
var PUBLIC_SETTINGS_OPTIONAL='analytics_enabled';
function publicSettingsRequest(){
 var base=PUBLIC_QUERIES.settings;
 return publicRequest({table:base.table,select:base.select+','+PUBLIC_SETTINGS_OPTIONAL,params:base.params})
  .catch(function(){return publicRequest(base);});
}
function qesc(s){return esc(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function safeUrl(u){u=String(u||'').trim();return PUBLIC_URL_PATTERN.test(u)?u:'';}
function publicSetting(key,value){
 var v=String(value==null?'':value).trim();if(!v)return'';
 var normalized=v.toLocaleLowerCase('tr-TR').replace(/\/$/,'').replace(/[’‘]/g,"'");
 if(key==='phone'||key==='whatsapp_number')normalized=v.replace(/\D/g,'');
 if(key==='email')normalized=v.toLowerCase();
 if((PUBLIC_SAMPLE_SETTINGS[key]||[]).indexOf(normalized)>-1)return'';
 if(key==='delivery_text'&&/5\s*[-–]\s*7\s*is gunu|turkiye.?nin her yerine|turkiye geneli teslimat/.test(normalized.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')))return'';
 if(key==='shipping_note'&&/(?:^|\D)(?:150|2[.,]?500)\s*tl|ucretsiz kargo/.test(normalized.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')))return'';
 if(key==='whatsapp_number')return/^[1-9][0-9]{9,14}$/.test(v)?v:'';
 if(key==='phone')return/^[+0-9 ()-]{7,24}$/.test(v)?v:'';
 if(key==='email')return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:'';
 if(key==='instagram_url'){
  try{var url=new URL(v);if(url.protocol!=='https:'||!/(^|\.)instagram\.com$/i.test(url.hostname))return'';if(url.pathname.replace(/\/$/,'').toLocaleLowerCase('tr-TR')==='/davetsandigi')return'';return url.href;}
  catch(e){return'';}
 }
 return v;
}
function mediaFrom(raw,altOverride,fallbackAlt){
 var m=Array.isArray(raw)?raw[0]:raw;
 if(!m||!m.storage_path||!SUPABASE_CONFIG.url)return null;
 var alt=String(altOverride||m.alt_text||fallbackAlt||'').trim();
 var path=String(m.storage_path).split('/').map(encodeURIComponent).join('/'),width=Number(m.width)||0,height=Number(m.height)||0;
 var src=SUPABASE_CONFIG.url+'/storage/v1/object/public/site-media/'+path;
 var candidates=[480,960].filter(function(candidate){return width>candidate;}).map(function(candidate){return SUPABASE_CONFIG.url+'/storage/v1/render/image/public/site-media/'+path+'?width='+candidate+'&quality=82 '+candidate+'w';});
 if(width)candidates.push(src+' '+width+'w');
 candidates.sort(function(a,b){return Number(a.match(/ (\d+)w$/)[1])-Number(b.match(/ (\d+)w$/)[1]);});
 return{src:src,srcset:candidates.join(', '),sizes:'(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw',alt:alt||'Davet Sandığı görseli',width:width,height:height};
}
function mediaImg(m,opts){
 var o=opts||{};
 if(!m)return'<div class="img-missing" role="img" aria-label="'+qesc(o.alt||'Görsel yok')+'">Görsel yok</div>';
 var responsive=m.srcset?' srcset="'+qesc(m.srcset)+'" sizes="'+qesc(o.sizes||m.sizes||'100vw')+'"':'';
 return'<img src="'+qesc(m.src)+'"'+responsive+' alt="'+qesc(m.alt)+'"'+(m.width?' width="'+m.width+'"':'')+(m.height?' height="'+m.height+'"':'')+' loading="'+(o.eager?'eager':'lazy')+'" decoding="async">';
}
function mapCategory(r){return{id:String(r.id),slug:r.slug||'',label:r.name||'',desc:r.description||'',occ:(r.category_collections||[]).map(function(x){return String(x.collection_id);})};}
function mapCollection(r){return{id:String(r.id),slug:r.slug||'',label:r.name||'',sub:r.short_description||'',glyph:r.icon_key||'',cover:mediaFrom(r.media_assets,'',r.name)};}
function mapProduct(r){
 var imgs=(r.product_images||[]).slice().sort(function(a,b){return(b.is_primary?1:0)-(a.is_primary?1:0)||(a.sort_order-b.sort_order);}).map(function(i){return mediaFrom(i.media_assets,i.alt_text,r.name);}).filter(Boolean);
 var mode='error',price=null;
 if(r.is_quote_only)mode='quote';
 else if(r.is_price_visible===false)mode='hidden';
 else if(r.price!==null&&r.price!==''&&r.price!==undefined&&isFinite(Number(r.price))&&Number(r.price)>=0){mode='price';price=Number(r.price);}
 var rawMinimum=Number(r.min_quantity),rawStep=Number(r.quantity_step);
 var minQuantity=Number.isInteger(rawMinimum)&&rawMinimum>0?rawMinimum:25;
 var quantityStep=Number.isInteger(rawStep)&&rawStep>0?rawStep:25;
 return{id:String(r.id),slug:r.slug||'',code:r.sku||'',name:r.name||'',cat:r.category_id==null?'':String(r.category_id),occ:(r.product_collections||[]).map(function(x){return String(x.collection_id);}),price:price,priceMode:mode,minQuantity:minQuantity,quantityStep:quantityStep,img:imgs[0]||null,gallery:imgs,featured:!!r.is_featured,desc:r.description||r.short_description||''};
}
function priceText(p){
 if(!p)return PUBLIC_PRICE_ERROR;
 if(p.priceMode==='quote')return'Özel fiyat teklifi';
 if(p.priceMode==='hidden')return'Fiyat için iletişime geçin';
 if(p.priceMode==='price')return fmt(p.price);
 return PUBLIC_PRICE_ERROR;
}
function setSectionState(id,state){var s=document.getElementById(id);if(s)s.setAttribute('data-state',state);}
function stateBox(kind,msg,retry){return'<div class="sec-state '+kind+'" role="status">'+esc(msg)+(retry?' <button class="btn btn-ghost" data-retry type="button">Tekrar Dene</button>':'')+'</div>';}

/* Public sayfa yerel örnek verilerle değil yalnızca Supabase verisiyle çalışır. */
(function resetPublicDefaults(){
 settings={whatsapp:'',instagram:'',phone:'',mail:'',deliveryText:'',currencyCode:'TRY',minQty:1,stepQty:1,quoteThreshold:0,shippingNote:'',analyticsEnabled:false,maintenance:false,legal:{},campaign:{enabled:false}};
 products=[];categories=[];occasions=[];
})();

function applyPublicSettings(rows){
 var r=rows[0];
 if(!r){catalogState.settings='empty';return;}
 settings.whatsapp=publicSetting('whatsapp_number',r.whatsapp_number);
 settings.instagram=publicSetting('instagram_url',r.instagram_url);
 settings.phone=publicSetting('phone',r.phone);settings.mail=publicSetting('email',r.email);
 settings.deliveryText=publicSetting('delivery_text',r.delivery_text);
 settings.currencyCode=/^[A-Z]{3}$/.test(String(r.currency_code||''))?String(r.currency_code):'TRY';
 var minimum=Number(r.default_min_quantity),step=Number(r.default_quantity_step),threshold=Number(r.quote_threshold);
 settings.minQty=Number.isInteger(minimum)&&minimum>0?minimum:1;
 settings.stepQty=Number.isInteger(step)&&step>0?step:1;
 settings.quoteThreshold=Number.isInteger(threshold)&&threshold>0?threshold:0;
 settings.shippingNote=publicSetting('shipping_note',r.shipping_note);
 settings.analyticsEnabled=r.analytics_enabled===true;
 settings.maintenance=r.is_maintenance_mode===true;
 /* Bakim modunda vitrin kapali oldugu icin olay sayaci da calismaz. */
 if(window.dsAnalytics)window.dsAnalytics.configure(settings.analyticsEnabled&&!settings.maintenance);
}
function pruneStoredSelections(){
 var known={};products.forEach(function(p){known[p.id]=1;});
 var nextWish=wish.filter(function(id){return known[String(id)];});
 if(nextWish.length!==wish.length){wish=nextWish;save('ds_wish_v1',wish);}
 return cart.filter(function(i){return!known[String(i.product_id||i.id)];}).length;
}
function applyPublicCatalog(r){
 categories=r[0].map(mapCategory);occasions=r[1].map(mapCollection);
 products=r[2].map(mapProduct).filter(function(p){return p.id&&p.name;});
 var removed=pruneStoredSelections();
 activeFilter=products.some(function(p){return p.featured;})?'featured':'all';
 renderCollections();renderFilter();renderProducts();
 if(typeof syncCart==='function')syncCart();
 if(removed&&typeof toast==='function')toast('Sepetinizde artık yayında olmayan ürün var.');
 if(!openProductFromLocation()&&!openCollectionFromLocation())openCategoryFromLocation();
}
function productLinkSlug(){
 var m=location.hash.match(/^#urun[\/=](.+)$/);
 if(m){try{return decodeURIComponent(m[1]);}catch(e){return'';}}
 return new URLSearchParams(location.search).get('urun')||'';
}
function openProductFromLocation(){
 var slug=productLinkSlug();if(!slug||catalogState.catalog!=='ready')return;
 var p=products.filter(function(x){return x.slug===slug;})[0];
 if(p){if(typeof updateSeoRoute==='function')updateSeoRoute('product',p);openProduct(p.id);return true;}
 if(typeof toast==='function')toast('Bu ürün şu an yayında değil.');
 return true;
}
function openCategoryFromLocation(){
 var slug=new URLSearchParams(location.search).get('kategori');if(!slug||catalogState.catalog!=='ready')return false;
 var category=categories.filter(function(item){return item.slug===slug;})[0];
 if(!category){if(typeof toast==='function')toast('Bu kategori şu an yayında değil.');return true;}
 activeFilter=String(category.id);renderFilter();renderProducts();
 if(typeof updateSeoRoute==='function')updateSeoRoute('category',category);
 return true;
}
function collectionRoute(){var q=new URLSearchParams(location.search),collection=q.get('koleksiyon')||'',category=q.get('kategori')||'';return{collection:collection,category:category};}
function openCollectionFromLocation(){
 var route=collectionRoute();if(!route.collection||catalogState.catalog!=='ready')return false;
 var collection=occasions.filter(function(item){return item.slug===route.collection;})[0];
 if(!collection){if(typeof toast==='function')toast('Bu koleksiyon şu an yayında değil.');return true;}
 openCollection(collection.id,null,route.category||'');return true;
}
function publicFail(group){
 if(group==='catalog'){products=[];categories=[];occasions=[];renderCollections();renderFilter();renderProducts();if(typeof syncCart==='function')syncCart();return;}
 if(group==='settings'&&typeof applyContact==='function'){applyContact();if(typeof renderFaq==='function')renderFaq();if(typeof syncCart==='function')syncCart();return;}
 if(group==='banners'){publicBanners=[];if(typeof renderBanners==='function')renderBanners();return;}
 if(group==='sections'){publicSections={};if(typeof renderSectionContent==='function')renderSectionContent();return;}
 if(group==='faqs'){publicFaqs=[];if(typeof renderFaq==='function')renderFaq();return;}
 if(group==='testimonials'){publicTestimonials=[];if(typeof renderReviews==='function')renderReviews();}
}
function loadPublicSite(){
 var token=++publicLoadToken;
 Object.keys(catalogState).forEach(function(g){catalogState[g]='loading';});
 renderCollections();renderFilter();renderProducts();
 if(typeof renderPublicContentStates==='function')renderPublicContentStates();
 function run(group,promise,onOk){
  promise.then(function(v){
   if(token!==publicLoadToken)return;
   catalogState[group]='ready';
   try{onOk(v);}catch(e){catalogState[group]='error';publicFail(group);}
  },function(){
   if(token!==publicLoadToken)return;
   catalogState[group]='error';publicFail(group);
  });
 }
 run('catalog',Promise.all([publicQuery('categories'),publicQuery('collections'),publicQuery('products')]),applyPublicCatalog);
 run('settings',publicSettingsRequest(),function(rows){applyPublicSettings(rows);if(typeof applyMaintenance==='function')applyMaintenance();if(typeof applyContact==='function')applyContact();if(typeof renderFaq==='function')renderFaq();if(typeof syncCart==='function')syncCart();});
 run('banners',publicQuery('banners'),function(rows){
  var now=Date.now();
  publicBanners=rows.filter(function(b){return(!b.starts_at||new Date(b.starts_at).getTime()<=now)&&(!b.ends_at||new Date(b.ends_at).getTime()>now);}).map(function(b){return{eyebrow:b.eyebrow||'',title:b.title||'',lead:b.description||'',b1t:b.primary_button_text||'',b1l:safeUrl(b.primary_button_url),b2t:b.secondary_button_text||'',b2l:safeUrl(b.secondary_button_url),media:mediaFrom(b.media_assets,'',b.title)};});
  if(typeof renderBanners==='function')renderBanners();
 });
 run('sections',publicQuery('sections'),function(rows){
  publicSections={};rows.forEach(function(s){publicSections[s.section_key]=s;});
  if(typeof renderSectionContent==='function')renderSectionContent();
 });
 run('faqs',publicQuery('faqs'),function(rows){publicFaqs=rows;if(typeof renderFaq==='function')renderFaq();});
 run('testimonials',publicQuery('testimonials'),function(rows){
  publicTestimonials=rows.filter(function(t){return PUBLIC_SAMPLE_REVIEW_NAMES.indexOf(String(t.customer_display_name||''))<0;}).map(function(t){return{name:t.customer_display_name||'',event:t.event_name||'',text:t.review_text||'',rating:Math.min(5,Math.max(1,Number(t.rating)||5)),media:mediaFrom(t.media_assets,'',t.customer_display_name||'Müşteri fotoğrafı')};});
  if(typeof renderReviews==='function')renderReviews();
 });
}

/* ============ RENDER: COLLECTIONS ============ */
function renderCollections(){
 var g=$('#coll-grid'),fc=$('#footer-coll'),st=catalogState.catalog;
 fc.innerHTML='';
 if(st!=='ready'||!occasions.length){
  var kind=st==='loading'?'loading':st==='error'?'error':'empty';
  g.innerHTML=stateBox(kind,st==='loading'?'Koleksiyonlar yükleniyor…':st==='error'?'Koleksiyonlar şu an yüklenemedi.':'Şu anda yayında koleksiyon bulunmuyor.',st==='error');
  setSectionState('koleksiyonlar',st==='ready'?'empty':st);
  return;
 }
 g.innerHTML='';setSectionState('koleksiyonlar','ready');
 occasions.forEach(function(o){
  var card=el('button','coll-card reveal');
  card.type='button';
  card.innerHTML='<div class="coll-thumb"><span class="coll-ic">'+glyphSvg(o.glyph)+'</span>'+(o.cover?mediaImg(o.cover,{alt:o.label,sizes:'(max-width: 760px) 100vw, 25vw'}):'')+'</div>'+
   '<div class="coll-body"><h3>'+esc(o.label)+'</h3><p>'+esc(o.sub||'')+'</p><span class="coll-more">Koleksiyonu Gör '+ICON.arr+'</span></div>';
  card.addEventListener('click',function(event){openCollection(o.id,event.currentTarget);});
  g.appendChild(card);
 });
 occasions.forEach(function(o){var li=el('li');li.innerHTML='<a href="#koleksiyonlar" data-occ="'+qesc(o.id)+'">'+esc(o.label)+'</a>';li.firstChild.addEventListener('click',function(e){e.preventDefault();openCollection(o.id,e.currentTarget);});fc.appendChild(li);});
 observeReveal();
}

/* ============ RENDER: PRODUCTS ============ */
var activeFilter='featured';
function renderFilter(){
 var f=$('#filterbar');f.innerHTML='';
 var tabs=catalogState.catalog!=='ready'?[]:[{id:'featured',label:'Öne Çıkanlar'},{id:'all',label:'Tümü'}].concat(categories.map(function(c){return{id:c.id,label:c.label};}));
 tabs.forEach(function(t){
  var b=el('button',t.id==activeFilter?'active':'',t.label);b.type='button';b.setAttribute('aria-pressed',t.id==activeFilter?'true':'false');
  b.addEventListener('click',function(){
   activeFilter=t.id;renderFilter();renderProducts();
   if(t.id!=='featured'&&t.id!=='all'){
    var category=categories.filter(function(c){return c.id===t.id;})[0];
    if(category&&category.slug){var url=new URL(location.href);url.search='';url.searchParams.set('kategori',category.slug);history.replaceState(null,'',url.pathname+url.search);updateSeoRoute('category',category);}
   }else{history.replaceState(null,'',location.pathname);updateSeoRoute('home');}
  });
  f.appendChild(b);
 });
}
function visibleProducts(){return catalogState.catalog==='ready'?products:[];}
var PG_PAGE=8,pgList=[],pgShown=0;
function renderProducts(){
 var grid=$('#prod-grid'),st=catalogState.catalog,cta=$('#prod-more')?$('#prod-more').parentNode:null;grid.innerHTML='';
 if(st!=='ready'){
  pgList=[];pgShown=0;if(cta)cta.style.display='none';if($('#prod-more'))$('#prod-more').hidden=true;
  grid.innerHTML=stateBox(st==='loading'?'loading':'error',st==='loading'?'Ürünler yükleniyor…':'Ürünler şu an yüklenemedi.',st==='error');
  setSectionState('urunler',st);return;
 }
 if(!products.length){pgList=[];pgShown=0;if(cta)cta.style.display='none';grid.innerHTML=stateBox('empty','Şu anda yayında ürün bulunmuyor.');setSectionState('urunler','empty');return;}
 setSectionState('urunler','ready');if(cta)cta.style.display='';
 var list=visibleProducts();
 if(activeFilter=='featured')list=list.filter(function(p){return p.featured;});
 else if(activeFilter!='all')list=list.filter(function(p){return p.cat==activeFilter;});
 var sab=$('#show-all-prod');
 if(sab){var acat=(activeFilter!=='all'&&activeFilter!=='featured')?categories.filter(function(c){return c.id===activeFilter;})[0]:null;sab.innerHTML=(acat?('Tüm '+acat.label):'Tüm Ürünleri Gör')+' '+ICON.arr;}
 pgList=list;pgShown=0;
 if(!list.length){grid.appendChild(el('div','prod-empty','Bu kategoride ürün bulunmuyor.'));if($('#prod-more'))$('#prod-more').hidden=true;return;}
 renderMoreMain();
}
function renderMoreMain(){
 var grid=$('#prod-grid'),next=pgList.slice(pgShown,pgShown+PG_PAGE);
 next.forEach(function(p){grid.appendChild(productCard(p));});
 pgShown+=next.length;
 var more=pgShown<pgList.length,btn=$('#prod-more');
 if(btn){btn.hidden=!more;if(more)btn.innerHTML='Daha Fazla Ürün ('+pgShown+'/'+pgList.length+') '+ICON.arr;}
 observeReveal();
}
function productCard(p){
 var c=el('article','prod-card reveal');c.setAttribute('data-pid',p.id);
 var isWish=wish.indexOf(p.id)>-1;
 c.innerHTML='<div class="prod-thumb">'+(p.featured?'<span class="prod-badge">Öne Çıkan</span>':'')+
  '<button class="wish'+(isWish?' on':'')+'" data-wish="'+qesc(p.id)+'" aria-label="'+(isWish?'Favorilerden çıkar: ':'Favorilere ekle: ')+qesc(p.name)+'" aria-pressed="'+(isWish?'true':'false')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-8.8A5.2 5.2 0 0112 6a5.2 5.2 0 019.5 6.2C19 16.5 12 21 12 21z"/></svg></button>'+
  mediaImg(p.img,{alt:p.name,sizes:'(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 25vw'})+'</div>'+
  '<div class="prod-body"><span class="prod-code">'+esc(p.code)+' · '+esc(catLabel(p.cat))+'</span>'+
  '<h3><button class="product-detail-trigger" type="button" aria-label="Ürün detaylarını görüntüle: '+qesc(p.name)+'">'+esc(p.name)+'</button></h3><p class="p-desc">'+esc(p.desc||'')+'</p>'+
  '<div class="prod-foot"><span class="prod-price">'+esc(priceText(p))+'</span>'+
  '<button class="prod-add" data-add="'+qesc(p.id)+'">'+ICON.cart+' Sepete Ekle</button></div></div>';
 return c;
}

/* ============ COLLECTION VIEW ============ */
function setCollectionRoute(collection,category){
 if(!window.history||!history.replaceState)return;
 var url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('koleksiyon',collection.slug);if(category&&category.slug)url.searchParams.set('kategori',category.slug);history.replaceState(null,'',url.pathname+url.search);
}
function openCollection(occId,opener,categorySlug){
 var o=occasions.filter(function(x){return x.id==occId;})[0];if(!o)return;
 $('#cv-title').textContent=o.label+' Koleksiyonu';
 showCollectionCover(o.cover,o.label);
 if($('#cv-eyebrow'))$('#cv-eyebrow').textContent='Koleksiyon';
 $('#cv-banner-title').textContent=o.label;$('#cv-banner-sub').textContent=o.sub||'';
 var list=visibleProducts().filter(function(p){return(p.occ||[]).indexOf(String(occId))>-1;});
 cvOpenCollection(o,list,categorySlug||'');
 setCollectionRoute(o,categorySlug?categories.filter(function(c){return c.slug===categorySlug;})[0]:null);
 if(typeof updateSeoRoute==='function')updateSeoRoute('collection',o);
 openCollview(opener);
}
function showCollectionCover(image,label){
 var node=$('#cv-banner-image');if(!node)return;
 if(!image){node.removeAttribute('src');node.removeAttribute('srcset');node.removeAttribute('sizes');node.alt='';node.hidden=true;return;}
 node.src=image.src;if(image.srcset)node.srcset=image.srcset;else node.removeAttribute('srcset');
 if(image.sizes)node.sizes=image.sizes;else node.removeAttribute('sizes');
 node.alt=image.alt||label||'Koleksiyon kapağı';if(image.width)node.width=image.width;if(image.height)node.height=image.height;
 node.loading='lazy';node.decoding='async';node.hidden=false;
}
/* ---- collection view: category filter + paging (load-more + infinite scroll) ---- */
var cvList=[],cvShown=0,CV_PAGE=8,cvBase=[],cvCat='all',cvEmpty='Ürün bulunmuyor.';
var cvCollection=null;
function cvOpenCollection(collection,list,categorySlug){
 cvCollection=collection;cvBase=list||[];cvEmpty='Bu koleksiyonda henüz ürün yok.';
 var linked=categories.filter(function(category){return(category.occ||[]).indexOf(String(collection.id))>-1;});
 var chosen=categorySlug&&linked.filter(function(category){return category.slug===categorySlug;})[0];
 if(chosen){cvShowCategory(chosen);return;}
 cvCat='index';var bar=$('#cv-filter');bar.hidden=true;bar.innerHTML='';$('#cv-more-wrap').hidden=true;
 var grid=$('#cv-grid');grid.innerHTML='';
 var all=el('button','cv-category-card cv-category-all');all.type='button';all.innerHTML='<small>Koleksiyon</small><strong>Tümünü Gör</strong><span>Bu koleksiyondaki tüm ürünleri inceleyin '+ICON.arr+'</span>';all.onclick=function(){cvShowCategory(null);};grid.appendChild(all);
 linked.forEach(function(category){var count=cvBase.filter(function(p){return p.cat===category.id;}).length,card=el('button','cv-category-card');card.type='button';card.innerHTML='<small>Kategori</small><strong>'+esc(category.label)+'</strong><span>'+esc(category.desc||'Ürünleri inceleyin')+'</span><b>'+count+' ürün '+ICON.arr+'</b>';card.onclick=function(){cvShowCategory(category);};grid.appendChild(card);});
 if(!linked.length)grid.appendChild(el('div','prod-empty','Bu koleksiyona henüz kategori bağlanmadı.'));
}
function cvShowCategory(category){
 cvCat=category?category.id:'all';setCollectionRoute(cvCollection,category);
 $('#cv-title').textContent=category?cvCollection.label+' · '+category.label:cvCollection.label+' Koleksiyonu';
 if($('#cv-eyebrow'))$('#cv-eyebrow').textContent=category?'Kategori':'Koleksiyon';
 $('#cv-banner-title').textContent=category?category.label:cvCollection.label;
 $('#cv-banner-sub').textContent=category?(category.desc||cvCollection.sub||''):cvCollection.sub||'';
 if(typeof updateSeoRoute==='function')updateSeoRoute(category?'category':'collection',category||cvCollection);
 renderCvFilter();cvApplyFilter();
}
function cvOpen(list,emptyMsg){cvBase=list||[];cvCat='all';cvEmpty=emptyMsg||'Ürün bulunmuyor.';renderCvFilter();cvApplyFilter();}
function renderCvFilter(){
 var bar=$('#cv-filter');if(!bar)return;
 var cats=categories.filter(function(c){return cvCollection&&(c.occ||[]).indexOf(String(cvCollection.id))>-1;});
 bar.hidden=false;bar.innerHTML='';
 [{id:'index',label:'Kategoriler'},{id:'all',label:'Tümünü Gör'}].concat(cats.map(function(c){return{id:c.id,label:c.label,category:c};})).forEach(function(t){
  var b=el('button',t.id===cvCat?'active':'',t.label);b.type='button';b.setAttribute('aria-pressed',t.id===cvCat?'true':'false');b.onclick=function(){if(t.id==='index'){cvOpenCollection(cvCollection,cvBase,'');setCollectionRoute(cvCollection,null);}else cvShowCategory(t.category||null);};bar.appendChild(b);
 });
}
function cvApplyFilter(){var list=cvCat==='all'?cvBase:cvBase.filter(function(p){return p.cat===cvCat;});cvSetList(list,cvEmpty);}
function cvSetList(list,emptyMsg){
 cvList=list||[];cvShown=0;
 var grid=$('#cv-grid');grid.innerHTML='';
 if(!cvList.length){grid.appendChild(el('div','prod-empty',emptyMsg||'Ürün bulunmuyor.'));$('#cv-more-wrap').hidden=true;return;}
 cvRenderMore();
}
function cvRenderMore(){
 var grid=$('#cv-grid'),next=cvList.slice(cvShown,cvShown+CV_PAGE);
 next.forEach(function(p){var c=productCard(p);c.classList.add('in');grid.appendChild(c);});
 cvShown+=next.length;
 var more=cvShown<cvList.length;
 $('#cv-more-wrap').hidden=!more;
 if(more)$('#cv-more').innerHTML='Daha Fazla Ürün ('+cvShown+'/'+cvList.length+') '+ICON.arr;
}
function openCollview(opener){$('#collview').classList.add('open');document.body.style.overflow='hidden';$('#collview').scrollTop=0;window.scrollTo(0,0);activateFocusLayer($('#collview'),closeCollection,opener);}
function closeCollection(){$('#collview').classList.remove('open');deactivateFocusLayer($('#collview'));document.body.style.overflow='';cvCollection=null;if(history.replaceState)history.replaceState(null,'',location.pathname);if(typeof updateSeoRoute==='function')updateSeoRoute('home');}
function openAllProducts(event){
 var list=visibleProducts();
 var cat=(activeFilter!=='all'&&activeFilter!=='featured')?categories.filter(function(c){return c.id===activeFilter;})[0]:null;
 var title,sub,ban;
 if(cat){list=list.filter(function(p){return p.cat===cat.id;});title=cat.label;sub='Bu kategorideki tüm ürünler';}
 else{title='Tüm Ürünler';sub='Koleksiyonumuzun tamamı';}
 ban=(list[0]||{}).img||null;
 $('#cv-title').textContent=cat?(cat.label+' — Tüm Ürünler'):'Tüm Ürünler';
 if($('#cv-eyebrow'))$('#cv-eyebrow').textContent=cat?'Kategori':'Ürünler';
 showCollectionCover(ban,(list[0]&&list[0].name)||title);
 $('#cv-banner-title').textContent=title;$('#cv-banner-sub').textContent=sub;
 cvOpen(list,'Bu kategoride ürün bulunmuyor.');
 openCollview(event&&event.currentTarget);
}

/* ============ PRODUCT MODAL ============ */
var pmState={imgs:[],idx:0,id:null},pmQty=25;
function openProduct(id,opener){
 var p=prodById(id);if(!p||catalogState.catalog!=='ready')return;
 pmState.id=id;pmState.imgs=(p.gallery||[]).slice();pmState.idx=0;pmQty=productMin(p);
 $('#pm-badge').textContent=catLabel(p.cat);
 $('#pm-code').textContent=p.code+' · '+catLabel(p.cat);
 $('#pm-name').textContent=p.name;
 $('#pm-desc').textContent=p.desc||'';
 if(p.slug&&window.history&&history.replaceState)history.replaceState(null,'','#urun/'+encodeURIComponent(p.slug));
 if(typeof updateSeoRoute==='function')updateSeoRoute('product',p);
 $('#pm-qty').textContent=pmQty;
 $('#pm-note').textContent='Minimum '+productMin(p)+' adet, '+productStep(p)+'’er artışlarla.';
 renderPmGallery();pmUpdateQuote();
 $('#product-modal').classList.add('open');document.body.style.overflow='hidden';activateFocusLayer($('#product-modal'),closeProduct,opener);
 if(window.dsAnalytics)window.dsAnalytics.track('product_view',id);
}
function pmUpdateQuote(){
 var p=prodById(pmState.id);if(!p)return;var q=isQuote(pmQty);
 if($('#pm-quote'))$('#pm-quote').hidden=!q;
 if($('#pm-price'))$('#pm-price').innerHTML=q?'<span class="pm-quoteprice">Özel fiyat teklifi</span>':p.priceMode==='price'?esc(fmt(p.price))+' <small>/ adet</small>':esc(priceText(p));
}
function renderPmGallery(){
 var imgs=pmState.imgs,multi=imgs.length>1,cur=imgs[pmState.idx],main=$('#pm-main');
 if(cur){main.src=cur.src;if(cur.srcset){main.srcset=cur.srcset;main.sizes=cur.sizes||'100vw';}else{main.removeAttribute('srcset');main.removeAttribute('sizes');}main.alt=cur.alt;if(cur.width)main.width=cur.width;if(cur.height)main.height=cur.height;main.hidden=false;}else{main.removeAttribute('src');main.removeAttribute('srcset');main.removeAttribute('sizes');main.alt='Ürün görseli yok';main.hidden=true;}
 $('#pm-counter').textContent=(pmState.idx+1)+' / '+Math.max(imgs.length,1);
 $('#pm-counter').style.display=multi?'':'none';
 $('#pm-prev').style.display=multi?'':'none';$('#pm-next').style.display=multi?'':'none';
 var th=$('#pm-thumbs');th.innerHTML='';th.style.display=multi?'':'none';
 imgs.forEach(function(im,i){var b=el('button','pm-thumb'+(i==pmState.idx?' active':''));b.type='button';b.setAttribute('aria-label',(i+1)+'. görsel: '+im.alt);b.innerHTML=mediaImg(im,{alt:im.alt,sizes:'62px'});b.onclick=function(){pmState.idx=i;renderPmGallery();};th.appendChild(b);});
}
function pmNav(d){var n=pmState.imgs.length;if(!n)return;pmState.idx=(pmState.idx+d+n)%n;renderPmGallery();}
function pmSetQty(d){var p=prodById(pmState.id);if(!p)return;pmQty+=d*productStep(p);if(pmQty<productMin(p))pmQty=productMin(p);$('#pm-qty').textContent=pmQty;pmUpdateQuote();}
function closeProduct(){$('#product-modal').classList.remove('open');deactivateFocusLayer($('#product-modal'));document.body.style.overflow='';if(/^#urun[\/=]/.test(location.hash)&&history.replaceState)history.replaceState(null,'',location.pathname+location.search);if(typeof updateSeoRoute==='function')updateSeoRoute('home');}

/* ============ WISHLIST ============ */
function toggleWish(id){var i=wish.indexOf(id);if(i>-1)wish.splice(i,1);else wish.push(id);save('ds_wish_v1',wish);
 var p=prodById(id),isSaved=wish.indexOf(id)>-1;
 $all('[data-wish="'+id+'"]').forEach(function(b){b.classList.toggle('on',isSaved);b.setAttribute('aria-pressed',isSaved?'true':'false');b.setAttribute('aria-label',(isSaved?'Favorilerden çıkar: ':'Favorilere ekle: ')+(p?p.name:'ürün'));});}
