/* Phase 7c: Supabase page content modules and the admin overview. Replaces the legacy localStorage renderers. */
var pagesState={client:null,promise:null,assets:[],banners:[],sections:{},faqs:[],testimonials:[]};
var PAGES_URL_PATTERN=/^(https:\/\/|#|\/(?!\/)|tel:|mailto:)/;

function pagesEsc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
function pagesError(error){return adminErrorText(error);}
function pagesClient(){
 return new Promise(function(resolve,reject){
  if(pagesState.client){resolve(pagesState.client);return;}
  if(adminAuthClient){pagesState.client=adminAuthClient;resolve(adminAuthClient);return;}
  startSupabaseClient(function(client,error){if(error||!client)reject(new Error(error||'Supabase bağlantısı kurulamadı.'));else{pagesState.client=client;resolve(client);}});
 });
}
function pagesAsset(id){return pagesState.assets.filter(function(asset){return Number(asset.id)===Number(id);})[0]||null;}
function pagesImage(id){
 var asset=pagesAsset(id);
 if(!asset||!pagesState.client)return{url:'',alt:''};
 return{url:pagesState.client.storage.from('site-media').getPublicUrl(asset.storage_path).data.publicUrl,alt:asset.alt_text||''};
}
function pagesAssetOptions(selected){
 return'<option value="">Görsel seçilmedi</option>'+pagesState.assets.map(function(asset){
  return'<option value="'+asset.id+'"'+(Number(selected)===Number(asset.id)?' selected':'')+'>'+pagesEsc(asset.original_name)+' — '+pagesEsc(asset.alt_text||'Alt metin yok')+'</option>';
 }).join('');
}
function pagesLoad(force){
 if(pagesState.promise&&!force)return pagesState.promise;
 var run=(async function(){
  var client=await pagesClient();
  var results=await Promise.all([
   client.from('media_assets').select('id,storage_path,original_name,alt_text,usage_type').eq('status','active').is('archived_at',null).order('created_at',{ascending:false}),
   client.from('banners').select('*').order('sort_order'),
   client.from('content_sections').select('*'),
   client.from('faqs').select('*').order('sort_order'),
   client.from('testimonials').select('*').order('sort_order')
  ]);
  results.forEach(function(result){if(result.error)throw result.error;});
  pagesState.assets=results[0].data||[];pagesState.banners=results[1].data||[];pagesState.faqs=results[3].data||[];pagesState.testimonials=results[4].data||[];
  pagesState.sections={};(results[2].data||[]).forEach(function(row){pagesState.sections[row.section_key]=row;});
  return pagesState;
 })();
 pagesState.promise=run;
 return run.then(function(value){if(pagesState.promise===run)pagesState.promise=null;return value;},function(error){if(pagesState.promise===run)pagesState.promise=null;throw error;});
}
function pagesField(root,name){var node=root.querySelector('[data-f="'+name+'"]');return node?node.value.trim():'';}
function pagesNull(value){return value===''?null:value;}
function pagesNumber(value,fallback){var number=Number(value);return value===''||isNaN(number)?fallback:number;}
function pagesToIso(value){if(!value)return null;var date=new Date(value);return isNaN(date.getTime())?'invalid':date.toISOString();}
function pagesToLocal(value){
 if(!value)return'';var date=new Date(value);if(isNaN(date.getTime()))return'';
 var pad=function(n){return String(n).padStart(2,'0');};
 return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
}
function pagesDate(value){try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(e){return value||'—';}}
function pagesUrlError(label,url){return url&&!PAGES_URL_PATTERN.test(url)?label+' https://, #, /, tel: veya mailto: ile başlamalıdır.':'';}
function pagesButtonError(label,text,url){
 if(!!text!==!!url)return label+' yazısı ve bağlantısı birlikte girilmelidir.';
 return pagesUrlError(label+' bağlantısı',url);
}
function pagesMediaError(mediaId){
 if(!mediaId)return'';var asset=pagesAsset(mediaId);
 if(!asset)return'Seçilen görsel kütüphanede aktif değil.';
 return asset.alt_text&&asset.alt_text.trim()?'':'Seçilen görselin alt metni eksik; önce Görsel Kütüphanesi’nden tamamlayın.';
}

/* ---- preview ---- */
function pagesPreviewMarkup(kind,p){
 var image=pagesImage(p.media_id),media=image.url?'<img src="'+pagesEsc(image.url)+'" alt="'+pagesEsc(image.alt)+'">':'<div class="pg-noimg">Görsel seçilmedi</div>';
 var button=function(text){return text?'<span class="pg-btn">'+pagesEsc(text)+'</span>':'';};
 var list=function(items){return'<div class="pg-cards">'+items.map(function(item,index){return'<article><b>'+(index+1)+'</b><h4>'+pagesEsc(item.title)+'</h4><p>'+pagesEsc(item.description)+'</p></article>';}).join('')+'</div>';};
 if(kind==='legal')return'<section class="pg-section legal-preview"><div class="admin-note">'+(p.content_json&&p.content_json.legal_review_approved?'Hukuk danışmanı onayı işaretlendi.':'Hukuk danışmanı onayı bekliyor; bu yalnızca taslak önizlemesidir.')+'</div><h3>'+pagesEsc(p.title||'Yasal metin başlığı')+'</h3><div class="legal-preview-body">'+pagesEsc(p.body||'')+'</div></section>';
 if(kind==='banner')return'<section class="pg-hero">'+media+'<div class="pg-body"><small>'+pagesEsc(p.eyebrow||'')+'</small><h3>'+pagesEsc(p.title)+'</h3><p>'+pagesEsc(p.description||'')+'</p><div class="pg-btns">'+button(p.primary_button_text)+button(p.secondary_button_text)+'</div></div></section><p class="pg-meta">Yayın aralığı: '+(p.starts_at?pagesDate(p.starts_at):'hemen')+' → '+(p.ends_at?pagesDate(p.ends_at):'süresiz')+'</p>';
 if(kind==='topbar')return'<div class="pg-topbar">'+(p.content_json.items.length?p.content_json.items.map(function(item){return'<span>'+pagesEsc(item)+'</span>';}).join(''):'<span>Madde yok</span>')+'</div>';
 if(kind==='process'||kind==='why_us'){var items=p.content_json.steps||p.content_json.items||[];return'<section class="pg-section"><small>'+pagesEsc(p.eyebrow||'')+'</small><h3>'+pagesEsc(p.title)+'</h3>'+(items.length?list(items):'<p class="pg-meta">Madde eklenmedi.</p>')+'</section>';}
 if(kind==='story')return'<section class="pg-story">'+media+'<div class="pg-body"><small>'+pagesEsc(p.eyebrow||'')+'</small><h3>'+pagesEsc(p.title)+'</h3><p>'+pagesEsc(p.body||'')+'</p></div></section>';
 if(kind==='cta')return'<section class="pg-cta">'+media+'<div class="pg-body"><small>'+pagesEsc(p.eyebrow||'')+'</small><h3>'+pagesEsc(p.title)+'</h3><p>'+pagesEsc(p.body||'')+'</p>'+button(p.button_text)+'</div></section>';
 if(kind==='campaign')return'<section class="pg-popup">'+media+'<div class="pg-body"><small>Davet Sandığı</small><h3>'+pagesEsc(p.title)+'</h3><p>'+pagesEsc(p.body||'')+'</p>'+button(p.button_text)+'</div></section>';
 if(kind==='faq')return'<section class="pg-section"><details open><summary>'+pagesEsc(p.question)+'</summary><p>'+pagesEsc(p.answer)+'</p></details></section>';
 if(kind==='testimonial')return'<section class="pg-review">'+(image.url?media:'')+'<div class="pg-body"><span class="pg-stars" aria-label="'+p.rating+' yıldız">'+'★'.repeat(p.rating)+'☆'.repeat(5-p.rating)+'</span><p>“'+pagesEsc(p.review_text||'Yorum metni eklenmedi.')+'”</p><strong>'+pagesEsc(p.customer_display_name||'İsim belirtilmedi')+'</strong><small>'+pagesEsc(p.event_name||'')+'</small></div></section>';
 return'';
}
function pagesPreview(kind,payload,onApprove){
 var controller=adminOpenDialog({overlayClass:'taxonomy-preview-modal',dialogClass:'taxonomy-preview-dialog',labelledBy:'pages-preview-title',html:'<button class="pm-close" type="button" aria-label="Önizlemeyi kapat">✕</button><h2 id="pages-preview-title">Mobil ve Masaüstü Önizleme</h2><div class="product-preview-modes"><button class="a-btn primary" data-pg-mode="desktop" type="button">Masaüstü</button><button class="a-btn" data-pg-mode="mobile" type="button">Mobil</button></div><div class="pg-canvas desktop">'+pagesPreviewMarkup(kind,payload)+'</div><button class="admin-save" data-pg-approve type="button">Önizlemeyi Onayla</button>'}),modal=controller.root;
 var canvas=modal.querySelector('.pg-canvas');
 $all('[data-pg-mode]',modal).forEach(function(button){button.onclick=function(){$all('[data-pg-mode]',modal).forEach(function(item){item.classList.toggle('primary',item===button);});canvas.className='pg-canvas '+button.dataset.pgMode;};});
 modal.querySelector('.pm-close').onclick=function(){controller.close(false);};
 modal.querySelector('[data-pg-approve]').onclick=function(){onApprove();controller.close(true);};
}

/* ---- shared preview/approve/save wiring ---- */
function pagesActionsHtml(live){
 return'<div class="admin-note" data-pg-status role="status" aria-live="polite">Taslak doğrudan kaydedilebilir; yayın için önizleme onayı gerekir.</div><div class="taxonomy-form-actions"><button class="a-btn" data-pg-preview type="button">Önizle</button>'+(live?'':'<button class="a-btn primary" data-pg-draft type="button"'+(ADMIN_DRAFT_REQUIRES_PREVIEW?' disabled':'')+'>Taslak Kaydet</button>')+'<button class="admin-save" data-pg-publish type="button" disabled>'+(live?'Güncelle':'Yayınla')+'</button>'+(live?'<button class="a-btn media-danger" data-pg-off type="button">Yayından Kaldır</button>':'')+'<button class="a-btn" data-pg-cancel type="button">İptal</button></div>';
}
function pagesWire(root,config){
 var approved='',status=root.querySelector('[data-pg-status]'),draft=root.querySelector('[data-pg-draft]'),publish=root.querySelector('[data-pg-publish]');
 function say(message,isError){status.textContent=message||'';status.classList.toggle('media-error',!!isError);}
 function setEnabled(enabled){if(draft)draft.disabled=ADMIN_DRAFT_REQUIRES_PREVIEW?!enabled:false;publish.disabled=!enabled;}
 function reset(){approved='';setEnabled(false);adminSetDirty('page-content',true);say('Taslak kaydedilebilir; yayın için önizlemeyi yeniden onaylayın.',false);}
 root.addEventListener('input',reset);root.addEventListener('change',reset);root.addEventListener('pages-change',reset);
 root.querySelector('[data-pg-preview]').onclick=function(){
  var payload=config.collect(root),error=config.validate(payload,false);if(error){say(error,true);return;}
  pagesPreview(config.kind,payload,function(){approved=JSON.stringify(payload);setEnabled(true);say('Önizleme onaylandı.',false);});
 };
 async function commit(isPublish){
  var payload=config.collect(root),error=config.validate(payload,isPublish);if(error){say(error,true);return;}
  if((isPublish||ADMIN_DRAFT_REQUIRES_PREVIEW)&&approved!==JSON.stringify(payload)){say('Yayınlamadan önce güncel önizlemeyi onaylayın.',true);return;}
  setEnabled(false);say(isPublish?'Yayınlanıyor…':'Taslak kaydediliyor…',false);
  try{await config.save(payload,isPublish);adminClearDirty('page-content');}catch(saveError){say((isPublish?'Yayınlama':'Taslak kaydı')+' başarısız: '+pagesError(saveError)+'. Mevcut canlı içerik değiştirilmedi.',true);setEnabled(true);}
 }
 if(draft)draft.onclick=function(){commit(false);};publish.onclick=function(){commit(true);};
 root.querySelector('[data-pg-cancel]').onclick=async function(){if(await adminConfirmLeave('page-content'))config.cancel();};
 var off=root.querySelector('[data-pg-off]');if(off)off.onclick=config.unpublish;
}

/* ---- list modules: banners, FAQ, testimonials ---- */
function bannerState(row){
 var now=Date.now();
 if(!row.is_active)return{text:'Taslak',live:false};
 if(row.starts_at&&new Date(row.starts_at).getTime()>now)return{text:'Zamanlanmış',live:false};
 if(row.ends_at&&new Date(row.ends_at).getTime()<=now)return{text:'Süresi doldu',live:false};
 return{text:'Yayında',live:true};
}
var PAGES_MODULES={
 banner:{
  box:'#banner-admin',table:'banners',liveField:'is_active',kind:'banner',title:'Banner',newLabel:'＋ Yeni Banner',
  note:'Ana sayfa hero alanı. Yayın aralığı boşsa banner hemen ve süresiz yayınlanır. Birden çok aktif banner varsa sıra numarasına göre döner.',
  rows:function(){return pagesState.banners;},
  label:function(row){return row.title||'Başlıksız banner';},
  meta:function(row){return'Sıra '+row.sort_order+' · '+(row.starts_at?pagesDate(row.starts_at):'hemen')+' → '+(row.ends_at?pagesDate(row.ends_at):'süresiz');},
  status:function(row){return bannerState(row);},
  blank:{eyebrow:'',title:'',description:'',primary_button_text:'',primary_button_url:'',secondary_button_text:'',secondary_button_url:'',media_id:null,sort_order:0,starts_at:null,ends_at:null},
  form:function(row){return'<div class="admin-grid-2"><label>Üst etiket<input data-f="eyebrow" maxlength="80" value="'+pagesEsc(row.eyebrow)+'"></label><label>Sıra<input data-f="sort_order" type="number" step="1" value="'+Number(row.sort_order||0)+'"></label></div><label>Başlık<input data-f="title" required maxlength="140" value="'+pagesEsc(row.title)+'"></label><label>Alt metin<textarea data-f="description" rows="3" maxlength="400">'+pagesEsc(row.description)+'</textarea></label><div class="admin-grid-2"><label>1. buton yazısı<input data-f="primary_button_text" maxlength="40" value="'+pagesEsc(row.primary_button_text)+'"></label><label>1. buton bağlantısı<input data-f="primary_button_url" placeholder="#urunler veya https://…" value="'+pagesEsc(row.primary_button_url)+'"></label><label>2. buton yazısı<input data-f="secondary_button_text" maxlength="40" value="'+pagesEsc(row.secondary_button_text)+'"></label><label>2. buton bağlantısı<input data-f="secondary_button_url" value="'+pagesEsc(row.secondary_button_url)+'"></label></div><label>Görsel (yayın için zorunlu)'+adminMediaPickerField({id:'media_id',value:row.media_id||'',label:'Banner Görseli Seç',usage:'banner'})+'</label><div class="admin-grid-2"><label>Yayın başlangıcı (isteğe bağlı)<input data-f="starts_at" type="datetime-local" value="'+pagesToLocal(row.starts_at)+'"></label><label>Yayın bitişi (isteğe bağlı)<input data-f="ends_at" type="datetime-local" value="'+pagesToLocal(row.ends_at)+'"></label></div>';},
  collect:function(root){return{eyebrow:pagesNull(pagesField(root,'eyebrow')),title:pagesField(root,'title'),description:pagesNull(pagesField(root,'description')),primary_button_text:pagesNull(pagesField(root,'primary_button_text')),primary_button_url:pagesNull(pagesField(root,'primary_button_url')),secondary_button_text:pagesNull(pagesField(root,'secondary_button_text')),secondary_button_url:pagesNull(pagesField(root,'secondary_button_url')),media_id:pagesField(root,'media_id')?Number(pagesField(root,'media_id')):null,sort_order:pagesNumber(pagesField(root,'sort_order'),0),starts_at:pagesToIso(pagesField(root,'starts_at')),ends_at:pagesToIso(pagesField(root,'ends_at'))};},
  validate:function(p,publish){
   if(!p.title)return'Banner başlığı zorunludur.';
   if(p.starts_at==='invalid'||p.ends_at==='invalid')return'Geçerli bir tarih girin.';
   if(p.starts_at&&p.ends_at&&new Date(p.starts_at)>=new Date(p.ends_at))return'Bitiş tarihi başlangıçtan sonra olmalıdır.';
   var error=pagesButtonError('1. buton',p.primary_button_text,p.primary_button_url)||pagesButtonError('2. buton',p.secondary_button_text,p.secondary_button_url);if(error)return error;
   if(publish&&!p.media_id)return'Yayınlamak için hero görseli zorunludur.';
   return pagesMediaError(p.media_id);
  }
 },
 faq:{
  box:'#faq-admin',table:'faqs',liveField:'is_active',kind:'faq',title:'Soru',newLabel:'＋ Yeni Soru',
  note:'Sıkça sorulan sorular. Yayından kaldırılan soru ziyaretçilere görünmez.',
  rows:function(){return pagesState.faqs;},
  label:function(row){return row.question;},
  meta:function(row){return'Sıra '+row.sort_order;},
  status:function(row){return{text:row.is_active?'Yayında':'Taslak',live:row.is_active};},
  blank:{question:'',answer:'',sort_order:0},
  form:function(row){return'<label>Soru<input data-f="question" required maxlength="300" value="'+pagesEsc(row.question)+'"></label><label>Cevap<textarea data-f="answer" rows="4" maxlength="2000">'+pagesEsc(row.answer)+'</textarea></label><label>Sıra<input data-f="sort_order" type="number" step="1" value="'+Number(row.sort_order||0)+'"></label>';},
  collect:function(root){return{question:pagesField(root,'question'),answer:pagesField(root,'answer'),sort_order:pagesNumber(pagesField(root,'sort_order'),0)};},
  validate:function(p){return!p.question?'Soru zorunludur.':!p.answer?'Cevap zorunludur.':'';}
 },
 testimonial:{
  box:'#reviews-admin',table:'testimonials',liveField:'is_published',kind:'testimonial',title:'Yorum',newLabel:'＋ Yeni Yorum',
  note:'Yalnızca gerçek ve paylaşım izni alınmış yorumlar yayınlanabilir. İzin teyit edilmeden “Yayınla” çalışmaz.',
  rows:function(){return pagesState.testimonials;},
  label:function(row){return(row.customer_display_name||'İsim belirtilmedi')+(row.event_name?' · '+row.event_name:'');},
  meta:function(row){return row.rating+'/5 · '+(row.consent_confirmed?'İzin teyit edildi':'İzin bekleniyor')+' · Sıra '+row.sort_order;},
  status:function(row){return{text:row.is_published?'Yayında':'Taslak',live:row.is_published};},
  blank:{customer_display_name:'',event_name:'',review_text:'',rating:5,media_id:null,consent_confirmed:false,sort_order:0},
  form:function(row){return'<div class="admin-grid-2"><label>Görünen isim<input data-f="customer_display_name" maxlength="80" value="'+pagesEsc(row.customer_display_name)+'"></label><label>Etkinlik<input data-f="event_name" maxlength="80" value="'+pagesEsc(row.event_name)+'"></label></div><label>Yorum<textarea data-f="review_text" rows="4" maxlength="1000">'+pagesEsc(row.review_text)+'</textarea></label><div class="admin-grid-3"><label>Puan<select data-f="rating">'+[5,4,3,2,1].map(function(n){return'<option value="'+n+'"'+(Number(row.rating)===n?' selected':'')+'>'+n+'</option>';}).join('')+'</select></label><label>Sıra<input data-f="sort_order" type="number" step="1" value="'+Number(row.sort_order||0)+'"></label><label>Fotoğraf (isteğe bağlı)'+adminMediaPickerField({id:'media_id',value:row.media_id||'',label:'Yorum Görseli Seç',usage:'testimonial'})+'</label></div><label class="taxonomy-check"><input data-f="consent" type="checkbox"'+(row.consent_confirmed?' checked':'')+'> Müşteriden yorumu ve görseli paylaşma izni alındı</label>';},
  collect:function(root){var consent=root.querySelector('[data-f="consent"]');return{customer_display_name:pagesNull(pagesField(root,'customer_display_name')),event_name:pagesNull(pagesField(root,'event_name')),review_text:pagesNull(pagesField(root,'review_text')),rating:Number(pagesField(root,'rating')),media_id:pagesField(root,'media_id')?Number(pagesField(root,'media_id')):null,consent_confirmed:!!(consent&&consent.checked),sort_order:pagesNumber(pagesField(root,'sort_order'),0)};},
  validate:function(p,publish){
   if(!(p.rating>=1&&p.rating<=5))return'Puan 1 ile 5 arasında olmalıdır.';
   if(publish&&!p.consent_confirmed)return'Paylaşım izni teyit edilmeden yorum yayınlanamaz.';
   if(publish&&!p.review_text)return'Yayınlamak için yorum metni zorunludur.';
   return pagesMediaError(p.media_id);
  }
 }
};

function pagesRenderList(name){
 var cfg=PAGES_MODULES[name],box=$(cfg.box);if(!box)return;
 box.innerHTML='<div class="taxonomy-loading">'+cfg.title+' kayıtları yükleniyor…</div>';
 pagesLoad().then(function(){pagesDrawList(name);}).catch(function(error){
  box.innerHTML='<div class="taxonomy-empty media-error">Kayıtlar yüklenemedi: '+pagesEsc(pagesError(error))+'</div><button class="a-btn" data-pg-retry type="button">Tekrar Dene</button>';
  box.querySelector('[data-pg-retry]').onclick=function(){pagesRenderList(name);};
 });
}
function pagesDrawList(name){
 var cfg=PAGES_MODULES[name],box=$(cfg.box),rows=cfg.rows();
 box.innerHTML='<p class="admin-note">'+pagesEsc(cfg.note)+'</p><div class="admin-toolbar"><button class="a-btn primary" data-pg-new type="button">'+cfg.newLabel+'</button><button class="a-btn" data-pg-refresh type="button">Yenile</button></div><div data-pg-form></div><div data-pg-list></div>';
 var list=box.querySelector('[data-pg-list]'),formBox=box.querySelector('[data-pg-form]');
 list.innerHTML=rows.length?rows.map(function(row,index){var state=cfg.status(row),sortable=name==='banner'||name==='faq';return'<article class="arow taxonomy-row" data-pg-sort-id="'+row.id+'"'+(sortable?' draggable="true"':'')+'><div class="ai"><b>'+pagesEsc(cfg.label(row))+'</b><small>'+pagesEsc(cfg.meta(row))+'</small><span class="badge '+(state.live?'feat':'hid')+'">'+state.text+'</span></div><div class="taxonomy-actions">'+(sortable?'<button class="a-btn" data-pg-move="up" type="button" aria-label="Yukarı taşı"'+(index===0?' disabled':'')+'>↑</button><button class="a-btn" data-pg-move="down" type="button" aria-label="Aşağı taşı"'+(index===rows.length-1?' disabled':'')+'>↓</button>':'')+'<button class="a-btn" data-pg-edit="'+row.id+'" type="button">Düzenle</button>'+(row[cfg.liveField]?'<button class="a-btn media-danger" data-pg-off="'+row.id+'" type="button">Yayından Kaldır</button>':'')+'</div></article>';}).join(''):'<div class="taxonomy-empty">Henüz kayıt yok. Yeni kayıt ekleyerek başlayın.</div>';
 box.querySelector('[data-pg-new]').onclick=function(){pagesOpenForm(name,null,formBox);};
 box.querySelector('[data-pg-refresh]').onclick=function(){pagesLoad(true).then(function(){pagesDrawList(name);}).catch(function(error){pagesRenderList(name);});};
 $all('[data-pg-edit]',list).forEach(function(button){button.onclick=function(){pagesOpenForm(name,Number(button.dataset.pgEdit),formBox);formBox.scrollIntoView({block:'nearest'});};});
 $all('[data-pg-off]',list).forEach(function(button){button.onclick=function(){pagesSetLive(name,Number(button.dataset.pgOff),false);};});
 if(name==='banner'||name==='faq'){
  async function saveOrder(ids){var client=await pagesClient(),failures=[];await Promise.all(ids.map(async function(id,index){var result=await client.from(cfg.table).update({sort_order:index}).eq('id',id);if(result.error)failures.push(id);}));if(failures.length)throw new Error('Sırası güncellenemeyen kayıtlar: '+failures.join(', '));await pagesLoad(true);pagesDrawList(name);}
  adminEnableSortable(list,'[data-pg-sort-id]',saveOrder);
  $all('[data-pg-move]',list).forEach(function(button){button.onclick=function(){var row=button.closest('[data-pg-sort-id]'),sibling=button.dataset.pgMove==='up'?row.previousElementSibling:row.nextElementSibling;if(!sibling)return;if(button.dataset.pgMove==='up')list.insertBefore(row,sibling);else list.insertBefore(sibling,row);saveOrder($all('[data-pg-sort-id]',list).map(function(item){return Number(item.dataset.pgSortId);})).catch(function(error){errorDialog({title:'Sıralama kaydedilemedi',error:error});});};});
 }
}
async function pagesSetLive(name,id,value){
 var cfg=PAGES_MODULES[name];
 if(!value&&!(await confirmDialog({title:'Yayından kaldır',message:'Ziyaretçiler bu kaydı artık görmeyecek; kayıt silinmeyecek.',confirmText:'Yayından Kaldır'})))return;
 try{
  var client=await pagesClient(),patch={};patch[cfg.liveField]=value;
  var result=await client.from(cfg.table).update(patch).eq('id',id).select('id').single();if(result.error)throw result.error;
  toast(value?'Kayıt yayınlandı.':'Kayıt yayından kaldırıldı.');await pagesLoad(true);pagesDrawList(name);
 }catch(error){errorDialog({title:'İşlem tamamlanamadı',error:error});}
}
function pagesOpenForm(name,id,formBox){
 var cfg=PAGES_MODULES[name],row=id?cfg.rows().filter(function(item){return Number(item.id)===Number(id);})[0]:null,live=!!(row&&row[cfg.liveField]);
 formBox.innerHTML='<form class="taxonomy-form" novalidate><h3>'+(row?cfg.title+' Düzenle':'Yeni '+cfg.title)+'</h3>'+cfg.form(row||cfg.blank)+pagesActionsHtml(live)+'</form>';
 var form=formBox.querySelector('form');form.onsubmit=function(event){event.preventDefault();};
 adminBindMediaPickerFields(form);
 pagesWire(form,{
  kind:cfg.kind,collect:cfg.collect,validate:cfg.validate,
  cancel:function(){formBox.innerHTML='';},
  unpublish:function(){pagesSetLive(name,row.id,false);},
  save:async function(payload,publish){
   var client=await pagesClient(),data=Object.assign({},payload);data[cfg.liveField]=publish;
   var query=row?client.from(cfg.table).update(data).eq('id',row.id):client.from(cfg.table).insert(data);
   var result=await query.select('id').single();if(result.error)throw result.error;
   toast(publish?'Kayıt yayınlandı.':'Taslak kaydedildi.');await pagesLoad(true);pagesDrawList(name);
  }
 });
}

/* ---- single-record sections ---- */
var PAGES_SECTIONS={
 topbar:{label:'Üst Bant',help:'Sayfanın üstünde dönen kısa duyurular. Her satır ayrı bir maddedir; en fazla 6 madde.',lines:true},
 story:{label:'Hikâyemiz',eyebrow:true,title:true,body:true,media:true},
 process:{label:'Nasıl Çalışır? (Süreç Adımları)',eyebrow:true,title:true,list:'steps',max:6,itemLabel:'Adım'},
 why_us:{label:'Neden Davet Sandığı?',eyebrow:true,title:true,list:'items',max:6,itemLabel:'Madde'},
 cta:{label:'Alt Çağrı (CTA) Bandı',eyebrow:true,title:true,body:true,button:true,media:true},
 campaign:{label:'Kampanya Pop-up',help:'Siteye ilk girişte açılır; ziyaretçiye oturum başına bir kez gösterilir. Yayında değilse hiç görünmez.',title:true,body:true,button:true,media:true},
 legal_privacy:{label:'Gizlilik Politikası',title:true,body:true,legal:true},
 legal_kvkk:{label:'KVKK Aydınlatma Metni',title:true,body:true,legal:true},
 legal_local_storage:{label:'Çerez ve Yerel Depolama Bilgisi',title:true,body:true,legal:true},
 legal_data_sharing:{label:'WhatsApp ve Instagram’a Veri Aktarımı',title:true,body:true,legal:true},
 legal_order_process:{label:'Sipariş Talebi ve Satış Süreci',title:true,body:true,legal:true},
 legal_returns:{label:'İptal, İade ve Kişiye Özel Ürünler',title:true,body:true,legal:true},
 legal_shipping:{label:'Kargo ve Teslimat',title:true,body:true,legal:true},
 legal_media_permissions:{label:'Yorum ve Görsel Paylaşım İzni',title:true,body:true,legal:true}
};
function pagesListRowHtml(item,label,index){
 return'<div class="admin-step-card pg-list-row"><b class="admin-step-label">'+label+' '+index+'</b><input data-li="title" maxlength="80" aria-label="'+label+' başlığı" value="'+pagesEsc(item.title)+'"><textarea class="admin-input-top" data-li="description" rows="2" maxlength="300" aria-label="'+label+' açıklaması">'+pagesEsc(item.description)+'</textarea><button class="a-btn media-danger" data-li-remove type="button">Kaldır</button></div>';
}
function pagesSectionForm(key,row){
 var cfg=PAGES_SECTIONS[key],json=(row&&row.content_json)||{},html=cfg.help?'<p class="admin-note">'+pagesEsc(cfg.help)+'</p>':'';
 if(cfg.eyebrow)html+='<label>Üst etiket<input data-f="eyebrow" maxlength="80" value="'+pagesEsc(row&&row.eyebrow)+'"></label>';
 if(cfg.title)html+='<label>Başlık<input data-f="title" maxlength="140" value="'+pagesEsc(row&&row.title)+'"></label>';
 if(cfg.body)html+='<label>Metin<textarea data-f="body" rows="'+(cfg.legal?14:5)+'" maxlength="'+(cfg.legal?30000:2000)+'">'+pagesEsc(row&&row.body)+'</textarea></label>';
 if(cfg.legal)html+='<label class="taxonomy-check"><input data-f="legal_approved" type="checkbox"'+(row&&row.content_json&&row.content_json.legal_review_approved?' checked':'')+'> Hukuk danışmanı bu son metin sürümünü inceledi ve yayına onayladı</label><p class="admin-note">Taslak kaydı daima yayından kapalıdır. Yayın için baştaki “Hukuk danışmanı onayı bekliyor” notunu ve [TAMAMLANACAK] alanlarını kaldırın; yalnız hukukçu onaylı son sürüm için onay kutusunu işaretleyin.</p>';
 if(cfg.lines)html+='<label>Üst bant maddeleri (her satır bir madde)<textarea data-f="lines" rows="5">'+pagesEsc((json.items||[]).join('\n'))+'</textarea></label>';
 if(cfg.list){var items=json[cfg.list]||[];html+='<div data-list data-label="'+cfg.itemLabel+'">'+items.map(function(item,i){return pagesListRowHtml(item,cfg.itemLabel,i+1);}).join('')+'</div><button class="a-btn" data-li-add type="button">＋ '+cfg.itemLabel+' Ekle</button>';}
 if(cfg.button)html+='<div class="admin-grid-2"><label>Buton yazısı<input data-f="button_text" maxlength="40" value="'+pagesEsc(row&&row.button_text)+'"></label><label>Buton bağlantısı<input data-f="button_url" placeholder="https://wa.me/… veya #urunler" value="'+pagesEsc(row&&row.button_url)+'"></label></div>';
 if(cfg.media)html+='<label>Görsel'+adminMediaPickerField({id:'media_id',value:row&&row.media_id||'',label:'Bölüm Görseli Seç',usage:key==='campaign'?'campaign':'story'})+'</label>';
 return html;
}
function pagesSectionCollect(key,card){
 var cfg=PAGES_SECTIONS[key],json={};
 if(cfg.lines)json={items:pagesField(card,'lines').split('\n').map(function(line){return line.trim();}).filter(Boolean)};
 if(cfg.list){json[cfg.list]=$all('.pg-list-row',card).map(function(rowNode){return{title:rowNode.querySelector('[data-li="title"]').value.trim(),description:rowNode.querySelector('[data-li="description"]').value.trim()};});}
 if(cfg.legal){var approval=card.querySelector('[data-f="legal_approved"]');json={legal_document:true,legal_review_approved:!!(approval&&approval.checked),legal_status:approval&&approval.checked?'lawyer_approved':'draft'};}
 var media=pagesField(card,'media_id');
 return{eyebrow:pagesNull(pagesField(card,'eyebrow')),title:pagesNull(pagesField(card,'title')),body:pagesNull(pagesField(card,'body')),button_text:pagesNull(pagesField(card,'button_text')),button_url:pagesNull(pagesField(card,'button_url')),media_id:media?Number(media):null,content_json:json};
}
function pagesSectionValidate(key,p,publish){
 var cfg=PAGES_SECTIONS[key],items=p.content_json.items||p.content_json.steps||[];
 if(cfg.legal){
  if(!p.title||!p.body)return'Başlık ve metin zorunludur.';
  if(publish&&!p.content_json.legal_review_approved)return'Hukuk danışmanı son sürümü onaylamadan bu metin yayımlanamaz.';
  if(publish&&/Hukuk danışmanı onayı bekliyor|\[TAMAMLANACAK\]/i.test(p.body))return'Yayın öncesi hukuk danışmanı uyarısını ve tamamlanacak alanları kaldırın.';
  return'';
 }
 if(cfg.lines){if(items.length>6)return'Üst bantta en fazla 6 madde olabilir.';if(items.some(function(item){return item.length>120;}))return'Her madde en fazla 120 karakter olabilir.';if(publish&&!items.length)return'Yayınlamak için en az bir madde girin.';}
 if(cfg.list){if(items.length>cfg.max)return'En fazla '+cfg.max+' '+cfg.itemLabel.toLowerCase()+' eklenebilir.';if(items.some(function(item){return!item.title||!item.description;}))return'Her '+cfg.itemLabel.toLowerCase()+' için başlık ve açıklama girin.';if(publish&&!items.length)return'Yayınlamak için en az bir '+cfg.itemLabel.toLowerCase()+' ekleyin.';}
 if(publish&&cfg.title&&!p.title)return'Yayınlamak için başlık zorunludur.';
 if(publish&&key==='campaign'&&!p.body)return'Kampanya pop-up’ı için metin zorunludur.';
 if(cfg.button){var error=pagesButtonError('Buton',p.button_text,p.button_url);if(error)return error;}
 return cfg.media?pagesMediaError(p.media_id):'';
}
function pagesRenderSections(boxSelector,keys,intro){
 var box=$(boxSelector);if(!box)return;box.innerHTML='<div class="taxonomy-loading">İçerik bölümleri yükleniyor…</div>';
 pagesLoad().then(function(){pagesDrawSections(box,keys,intro);}).catch(function(error){
  box.innerHTML='<div class="taxonomy-empty media-error">İçerik bölümleri yüklenemedi: '+pagesEsc(pagesError(error))+'</div><button class="a-btn" data-pg-retry type="button">Tekrar Dene</button>';
  box.querySelector('[data-pg-retry]').onclick=function(){pagesRenderSections(boxSelector,keys,intro);};
 });
}
function pagesDrawSections(box,keys,intro){
 box.innerHTML=(intro?'<p class="admin-note">'+pagesEsc(intro)+'</p>':'');
 keys.forEach(function(key){
  var cfg=PAGES_SECTIONS[key],row=pagesState.sections[key]||null,legalApproved=!!(row&&row.content_json&&row.content_json.legal_review_approved&&!/Hukuk danışmanı onayı bekliyor|\[TAMAMLANACAK\]/i.test(row.body||'')),live=!!(row&&row.is_active&&(!cfg.legal||legalApproved)),badge=cfg.legal?(live?'Hukukçu onaylı · yayında':row?'Taslak · yayında değil':'Henüz yok · taslak bekleniyor'):(live?'Yayında':row?'Taslak':'Henüz yok'),card=el('form','taxonomy-form');card.setAttribute('novalidate','');card.dataset.section=key;
  card.innerHTML='<h3>'+cfg.label+' <span class="badge '+(live?'feat':'hid')+'">'+badge+'</span></h3>'+pagesSectionForm(key,row)+pagesActionsHtml(live);
  card.onsubmit=function(event){event.preventDefault();};box.appendChild(card);
  adminBindMediaPickerFields(card);
  var listBox=card.querySelector('[data-list]'),add=card.querySelector('[data-li-add]');
  function relabel(){$all('.pg-list-row',card).forEach(function(rowNode,i){rowNode.querySelector('.admin-step-label').textContent=cfg.itemLabel+' '+(i+1);});}
  if(listBox){
   add.onclick=function(){if($all('.pg-list-row',card).length>=cfg.max)return;listBox.insertAdjacentHTML('beforeend',pagesListRowHtml({title:'',description:''},cfg.itemLabel,0));relabel();card.dispatchEvent(new Event('pages-change'));};
   listBox.addEventListener('click',function(event){var remove=event.target.closest('[data-li-remove]');if(remove){remove.closest('.pg-list-row').remove();relabel();card.dispatchEvent(new Event('pages-change'));}});
  }
  pagesWire(card,{
   kind:key,
   collect:function(){var payload=pagesSectionCollect(key,card);payload.section_key=key;return payload;},
   validate:function(payload,publish){return pagesSectionValidate(key,payload,publish);},
   cancel:function(){pagesDrawSections(box,keys,intro);},
   unpublish:function(){pagesSectionSetLive(row,false,function(){pagesDrawSections(box,keys,intro);});},
   save:async function(payload,publish){
    var client=await pagesClient(),data=Object.assign({},payload,{is_active:publish});
    if(cfg.legal){data.content_json={legal_document:true,legal_review_approved:!!publish,legal_status:publish?'lawyer_approved':'draft'};}
    var query=row?client.from('content_sections').update(data).eq('id',row.id):client.from('content_sections').insert(data);
    var result=await query.select('*').single();if(result.error)throw result.error;
    pagesState.sections[key]=result.data;toast(publish?'Bölüm yayınlandı.':'Taslak kaydedildi.');pagesDrawSections(box,keys,intro);
   }
  });
 });
}
async function pagesSectionSetLive(row,value,done){
 if(!(await confirmDialog({title:'Bölümü yayından kaldır',message:'İçerik silinmeyecek, taslak olarak kalacak.',confirmText:'Yayından Kaldır'})))return;
 try{var client=await pagesClient(),result=await client.from('content_sections').update({is_active:value}).eq('id',row.id).select('*').single();if(result.error)throw result.error;pagesState.sections[row.section_key]=result.data;toast('Bölüm yayından kaldırıldı.');done();}
 catch(error){errorDialog({title:'İşlem tamamlanamadı',error:error});}
}

function renderBannerAdmin(){pagesRenderList('banner');}
function renderFaqAdmin(){pagesRenderList('faq');}
function renderReviewsAdmin(){pagesRenderList('testimonial');}
function renderHomeAdmin(){pagesRenderSections('#home-admin',['process','why_us','cta'],'Ana sayfadaki süreç adımları, “Neden biz” maddeleri ve alt çağrı bandı. Her bölüm ayrı kaydedilir ve önizleme onayı gerektirir.');}
function renderContentAdmin(){pagesRenderSections('#content-admin',['topbar','story'],'Üst bant duyuruları ve Hikâyemiz bölümü.');}
function renderCampaignAdmin(){pagesRenderSections('#campaign-admin',['campaign'],'');}
function renderLegalAdmin(){pagesRenderSections('#legal-admin',['legal_privacy','legal_kvkk','legal_local_storage','legal_data_sharing','legal_order_process','legal_returns','legal_shipping','legal_media_permissions'],'Her bölüm `content_sections` içinde ayrı bir kayıt olarak saklanır. Taslaklar kapalı tutulur; hukuk danışmanı onayı olmadan yayınlanamaz. İnceleme metinleri `docs/legal-drafts.md` dosyasındadır.');}

/* ---- admin overview (roadmap 8.2) ---- */
function pagesDashboardIssue(data,key){return(data.health&&data.health.issues&&data.health.issues[key])||{count:0,records:[]};}
function pagesDashboardNumber(value){var number=Number(value);return Number.isFinite(number)?number:0;}
function pagesDashboardEmpty(){
 var emptyIssue={count:0,records:[]};
 return{products:{published:0,drafts:0,unpublished:0,archived:0,total:0},health:{percentage:100,healthy_active:0,total_active:0,issues:{missing_primary:emptyIssue,missing_alt:emptyIssue,pending_drafts:emptyIssue,unused_media:emptyIssue,categoryless:emptyIssue,missing_price:emptyIssue,no_collection:emptyIssue}},recent_changes:[],categories:{total:0,top:[]},collections:{total:0,top:[]},scheduled_banners:[]};
}
async function pagesDashboardData(){
 var client=await pagesClient(),result=await client.rpc('admin_dashboard_summary');
 if(result.error)throw result.error;
 var data=result.data||pagesDashboardEmpty(),fallback=pagesDashboardEmpty();
 data.products=Object.assign(fallback.products,data.products||{});
 data.health=Object.assign(fallback.health,data.health||{});
 data.health.issues=Object.assign(fallback.health.issues,data.health.issues||{});
 data.recent_changes=Array.isArray(data.recent_changes)?data.recent_changes:[];
 data.categories=Object.assign(fallback.categories,data.categories||{});
 data.collections=Object.assign(fallback.collections,data.collections||{});
 data.scheduled_banners=Array.isArray(data.scheduled_banners)?data.scheduled_banners:[];
 return data;
}
function pagesDashboardRecordAction(record,type){
 if(type==='media')return'<button class="dashboard-fix" data-dash-media-name="'+pagesEsc(record.name)+'" type="button">'+pagesEsc(record.name)+' <span>Düzelt →</span></button>';
 return'<button class="dashboard-fix" data-dash-product="'+record.id+'" type="button">'+pagesEsc(record.name)+' <span>Düzelt →</span></button>';
}
function pagesDashboardIssueRows(data,key,type,emptyText){
 var issue=pagesDashboardIssue(data,key),records=issue.records||[];
 return records.length?'<ul class="dashboard-records">'+records.map(function(record){return'<li>'+pagesDashboardRecordAction(record,type)+'</li>';}).join('')+'</ul>':'<p class="dashboard-empty">'+emptyText+'</p>';
}
function pagesDashboardHtml(d){
 var products=d.products||{},health=d.health||{},percentage=Math.max(0,Math.min(100,pagesDashboardNumber(health.percentage)));
 var stat=function(value,label,tone){return'<article class="pg-stat dashboard-stat '+tone+'"><strong>'+pagesDashboardNumber(value)+'</strong><span>'+label+'</span></article>';};
 var healthRow=function(key,label,view){var issue=pagesDashboardIssue(d,key),record=(issue.records||[])[0],action='';if(record)action=pagesDashboardRecordAction(record,view);else action='<span class="dashboard-ok">Tamam</span>';return'<li><span>'+label+'</span><strong>'+pagesDashboardNumber(issue.count)+'</strong>'+action+'</li>';};
 var attention=function(key,title,priority,type,emptyText){var issue=pagesDashboardIssue(d,key);return'<article class="dashboard-attention '+priority+'"><div><span class="dashboard-priority">'+priority+'</span><h4>'+title+'</h4><p>'+pagesDashboardNumber(issue.count)+' kayıt</p></div>'+pagesDashboardIssueRows(d,key,type,emptyText)+'</article>';};
 var recent=d.recent_changes.length?'<ul class="dashboard-recent">'+d.recent_changes.map(function(row){return'<li><div><b>'+pagesEsc(row.summary||'Değişiklik')+'</b><small>'+pagesEsc(row.actor_name||'Sistem')+' · '+pagesDate(row.created_at)+'</small></div><span>'+pagesEsc(row.action||'update')+'</span></li>';}).join('')+'</ul>':'<p class="dashboard-empty">Henüz güncelleme yok.</p>';
 var distribution=function(group,label,view){var rows=group.top||[];return'<div class="dashboard-distribution"><div><b>'+pagesDashboardNumber(group.total)+'</b><span>'+label+'</span></div>'+(rows.length?'<ul>'+rows.map(function(row){return'<li><button data-dash-view="'+view+'" type="button">'+pagesEsc(row.name)+'</button><strong>'+pagesDashboardNumber(row.product_count)+'</strong></li>';}).join('')+'</ul>':'<p class="dashboard-empty">Henüz kayıt yok.</p>')+'</div>';};
 var banners=d.scheduled_banners.length?'<section class="dashboard-schedule"><div><span>Planlı içerik</span><h3>Yaklaşan banner zamanlaması</h3><p>'+d.scheduled_banners.map(function(row){var date=row.starts_at||row.ends_at;return pagesEsc(row.name)+' · '+pagesDate(date);}).join('<br>')+'</p></div><button class="a-btn" data-dash-view="banner" type="button">Bannerları aç</button></section>':'';
 return'<div class="pg-stats dashboard-stats">'+stat(products.published,'Yayındaki ürün','live')+stat(products.drafts,'Taslak','draft')+stat(products.unpublished,'Yayında değil','off')+stat(products.archived,'Arşiv','archive')+'</div>'+banners+
 '<div class="dashboard-grid">'+
  '<section class="pg-panel dashboard-health"><div class="dashboard-card-head"><div><span>Katalog durumu</span><h3>Katalog sağlığı</h3></div><strong>'+percentage+'%</strong></div><div class="dashboard-progress" role="progressbar" aria-label="Katalog sağlığı yüzde '+percentage+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percentage+'"><span style="width:'+percentage+'%"></span></div><p>'+pagesDashboardNumber(health.healthy_active)+' / '+pagesDashboardNumber(health.total_active)+' aktif ürün sağlıklı</p><ul class="dashboard-health-list">'+healthRow('missing_primary','Ana görseli eksik','product')+healthRow('missing_alt','Alt metni eksik','media')+healthRow('pending_drafts','Yayınlanmamış taslak','product')+healthRow('unused_media','Kullanılmayan görsel','media')+'</ul><div class="dashboard-secondary-health"><span>Kategorisiz: <b>'+pagesDashboardNumber(pagesDashboardIssue(d,'categoryless').count)+'</b></span><span>Fiyatı eksik: <b>'+pagesDashboardNumber(pagesDashboardIssue(d,'missing_price').count)+'</b></span><span>Koleksiyonsuz: <b>'+pagesDashboardNumber(pagesDashboardIssue(d,'no_collection').count)+'</b></span></div></section>'+
  '<section class="pg-panel dashboard-quick"><div class="dashboard-card-head"><div><span>Kısayollar</span><h3>Hızlı işlemler</h3></div></div><div class="dashboard-quick-grid"><button class="a-btn primary" data-dash-view="add" type="button">+ Yeni ürün</button><button class="a-btn" data-dash-upload type="button">Görsel yükle</button><button class="a-btn" data-dash-view="banner" type="button">Banner düzenle</button><button class="a-btn" data-dash-view="reports" type="button">Rapor al</button></div><div class="dashboard-analytics-placeholder"><b>Analiz</b><p>Trafik ve talep analizi sonraki adımda eklenecek.</p></div></section>'+
 '</div>'+
 '<section class="pg-panel dashboard-attention-panel"><div class="dashboard-card-head"><div><span>Öncelikli işler</span><h3>Dikkat gerektirenler</h3></div></div><div class="dashboard-attention-list">'+attention('missing_primary','Ana görseli eksik ürünler','yüksek','product','Eksik ana görsel yok.')+attention('missing_alt','Alt metni eksik görseller','orta','media','Eksik alt metin yok.')+attention('unused_media','Kullanılmayan görseller','düşük','media','Kullanılmayan görsel yok.')+'</div></section>'+
 '<div class="dashboard-grid dashboard-lower"><section class="pg-panel"><div class="dashboard-card-head"><div><span>Hareketler</span><h3>Son değişiklikler</h3></div><button class="a-btn" data-dash-view="history" type="button">Tümünü gör</button></div>'+recent+'</section><section class="pg-panel"><div class="dashboard-card-head"><div><span>Dağılım</span><h3>Katalog yapısı</h3></div></div><div class="dashboard-distributions">'+distribution(d.categories,'Kategori','categories')+distribution(d.collections,'Koleksiyon','collections')+'</div></section></div>';
}
function pagesRenderDashboard(){
 var box=$('#dashboard-admin');if(!box)return;
 box.innerHTML='<div class="taxonomy-loading">Genel bakış yükleniyor…</div>';
 pagesDashboardData().then(function(data){
  box.innerHTML='<div class="dashboard-toolbar"><p>Toplam '+pagesDashboardNumber(data.products.total)+' ürün</p><button class="a-btn" data-dash-refresh type="button">Yenile</button></div>'+pagesDashboardHtml(data);
  box.querySelector('[data-dash-refresh]').onclick=pagesRenderDashboard;
  $all('[data-dash-product]',box).forEach(function(button){button.onclick=function(){editProduct(Number(button.dataset.dashProduct));};});
  $all('[data-dash-media-name]',box).forEach(function(button){button.onclick=function(){var name=button.dataset.dashMediaName;switchView('media').then(function(opened){if(!opened)return;var search=$('#media-search');search.value=name;search.dispatchEvent(new Event('input',{bubbles:true}));});};});
  $all('[data-dash-view]',box).forEach(function(button){button.onclick=function(){adminOpenView(button.dataset.dashView);};});
  var upload=box.querySelector('[data-dash-upload]');if(upload)upload.onclick=function(){switchView('media').then(function(opened){if(opened){var file=$('#media-file');if(file)file.focus();}});};
 }).catch(function(error){
  box.innerHTML='<div class="taxonomy-empty media-error">Genel bakış yüklenemedi: '+pagesEsc(pagesError(error))+'</div><button class="a-btn" data-pg-retry type="button">Tekrar Dene</button>';
  box.querySelector('[data-pg-retry]').onclick=pagesRenderDashboard;
 });
}

window.__pagesTest={urlPattern:PAGES_URL_PATTERN,bannerState:bannerState};
