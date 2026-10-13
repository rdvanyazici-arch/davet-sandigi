var bnIndex=0;
function bannerList(){return(settings.banners&&settings.banners.length)?settings.banners:[JSON.parse(JSON.stringify(DEF_BANNER))];}
function applySettings(){}
function refreshSite(){}
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},1900);}
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

function renderSettingsForm(){
 var f=$('#settings-form'),s=settings;
 f.innerHTML='<div class="row2 admin-grid-2">'+
  '<label>WhatsApp No (ülke koduyla, sadece rakam)<input id="sf-wa" value="'+esc(s.whatsapp)+'" placeholder="905xxxxxxxxx"></label>'+
  '<label>Instagram Linki<input id="sf-ig" value="'+esc(s.instagram)+'"></label>'+
  '<label>Telefon (görünen)<input id="sf-phone" value="'+esc(s.phone)+'"></label>'+
  '<label>E-posta<input id="sf-mail" value="'+esc(s.mail)+'"></label></div>'+
  '<label>Adres / Teslimat Notu<input id="sf-addr" value="'+esc(s.addr)+'"></label>'+
  '<h3 class="admin-section-heading">Sipariş & Kargo</h3>'+
  '<div class="row2 admin-grid-3">'+
  '<label>Min. adet<input id="sf-min" type="number" value="'+(s.minQty||0)+'"></label>'+
  '<label>Adet artışı<input id="sf-step" type="number" value="'+(s.stepQty||0)+'"></label>'+
  '<label>Özel teklif eşiği (üzeri)<input id="sf-quote" type="number" value="'+(s.quoteThreshold||0)+'"></label></div>'+
  '<div class="row2 admin-grid-3">'+
  '<label>Kargo ücreti (₺)<input id="sf-shipfee" type="number" value="'+(s.shipFee||0)+'"></label>'+
  '<label>Ücretsiz kargo (₺ üzeri)<input id="sf-shipfree" type="number" value="'+(s.shipFree||0)+'"></label>'+
  '<label>Sıradaki sipariş no<input id="sf-orderno" type="number" value="'+(s.orderNext||1)+'"></label></div>'+
  '<h3 class="admin-section-heading">Parola</h3>'+
  '<label>Yeni yönetim parolası (boş=değişmez)<input id="sf-pw" type="password" placeholder="••••••"></label>'+
  '<button class="admin-save" id="sf-save">Ayarları Kaydet</button>';
 $('#sf-save').onclick=function(){
  s.whatsapp=$('#sf-wa').value.trim();s.instagram=$('#sf-ig').value.trim();s.phone=$('#sf-phone').value.trim();s.mail=$('#sf-mail').value.trim();s.addr=$('#sf-addr').value.trim();
  s.minQty=parseInt($('#sf-min').value)||1;s.stepQty=parseInt($('#sf-step').value)||1;s.quoteThreshold=parseInt($('#sf-quote').value)||0;
  s.shipFee=parseFloat($('#sf-shipfee').value)||0;s.shipFree=parseFloat($('#sf-shipfree').value)||0;s.orderNext=parseInt($('#sf-orderno').value)||1;
  var pw=$('#sf-pw').value;if(pw)localStorage.setItem(LS.pw,pw);
  save(LS.s,settings);applySettings();alert('Ayarlar kaydedildi.');};
}
var rvList=[];
function renderReviewsAdmin(){
 var box=$('#reviews-admin');if(!box)return;
 rvList=JSON.parse(JSON.stringify(settings.reviews||[]));
 var rh=JSON.parse(JSON.stringify(settings.revHead||DEF_REVHEAD));
 function collect(){$all('.rv-name',box).forEach(function(e,i){if(rvList[i])rvList[i].name=e.value;});$all('.rv-event',box).forEach(function(e,i){if(rvList[i])rvList[i].event=e.value;});$all('.rv-text',box).forEach(function(e,i){if(rvList[i])rvList[i].text=e.value;});}
 function drawImg(i){var b=$('#rv-imgbox-'+i);if(!b)return;b.innerHTML='';var v=rvList[i].img;if(v){var d=el('div','pf-gthumb');d.innerHTML='<img src="'+imgSrc(v)+'"><button type="button" class="pf-grm">✕</button>';d.querySelector('.pf-grm').onclick=function(){rvList[i].img='';drawImg(i);};b.appendChild(d);}else b.innerHTML='<span class="admin-note">Fotoğraf yok</span>';}
 function draw(){
  box.innerHTML='<p class="admin-note">“Sizden Gelenler” bölümü — her kayıt fotoğraf + yorum. Başlığı ve fotoğraf paylaşım notunu da buradan düzenleyin.</p>'+
   '<div class="admin-card-box"><label class="admin-label-tight">Bölüm başlığı<input id="rh-t" value="'+esc(rh.t)+'"></label><label class="admin-label-spaced">Alt yazı<input id="rh-s" value="'+esc(rh.s)+'"></label><label class="admin-label-spaced">Paylaşım notu (fotoğraf çağrısı)<textarea id="rh-note" rows="2">'+esc(rh.note)+'</textarea></label></div>';
  rvList.forEach(function(r,i){
   var d=el('div','arow admin-row-stack');
   d.innerHTML='<div class="admin-row-head"><b class="admin-serif">Kayıt '+(i+1)+'</b><button class="a-btn" data-rvdel="'+i+'">Sil</button></div>'+
    '<div class="admin-grid-2-compact"><label class="admin-label-tight">İsim<input class="rv-name" value="'+esc(r.name)+'"></label><label class="admin-label-tight">Etkinlik<input class="rv-event" value="'+esc(r.event)+'"></label></div>'+
    '<label class="admin-label-spaced">Yorum<textarea class="rv-text" rows="2">'+esc(r.text)+'</textarea></label>'+
    '<label class="admin-gallery-label">Fotoğraf</label><div class="pf-gallery" id="rv-imgbox-'+i+'"></div>'+
    '<div class="pf-gadd"><label class="a-btn pf-uplabel">＋ Fotoğraf Yükle<input type="file" class="rv-file" data-i="'+i+'" accept="image/*" hidden></label></div>';
   box.appendChild(d);
  });
  var bar=el('div','admin-toolbar');bar.innerHTML='<button class="a-btn" id="rv-add">＋ Kayıt Ekle</button><button class="a-btn primary" id="rv-save">Kaydet</button>';box.appendChild(bar);
  rvList.forEach(function(r,i){drawImg(i);});
  $all('[data-rvdel]',box).forEach(function(x){x.onclick=function(){collect();rvList.splice(+x.getAttribute('data-rvdel'),1);draw();};});
  $all('.rv-file',box).forEach(function(x){x.onchange=function(){var i=+x.getAttribute('data-i'),f=this.files[0];if(f)resizeImage(f,function(dd){rvList[i].img=dd;drawImg(i);});this.value='';};});
  $('#rv-add').onclick=function(){collect();rvList.push({name:'',event:'',text:'',img:''});draw();};
  $('#rv-save').onclick=function(){collect();settings.reviews=rvList.filter(function(r){return r.name||r.text||r.img;});settings.revHead={eb:rh.eb||'Sizden Gelenler',t:$('#rh-t').value,s:$('#rh-s').value,note:$('#rh-note').value};try{save(LS.s,settings);}catch(e){alert('Kaydedilemedi (görsel çok büyük olabilir).');return;}applySettings();alert('Sizden Gelenler kaydedildi.');};
 }
 draw();
}
function renderFaqAdmin(){
 var box=$('#faq-admin');box.innerHTML='<p class="admin-note">Sıkça Sorulan Sorular bölümü.</p>';
 (settings.faq||[]).forEach(function(f,i){
  var d=el('div','arow admin-row-stack');
  d.innerHTML='<label class="admin-label-tight">Soru<input class="fq-q" value="'+esc(f.q)+'"></label><label class="admin-label-spaced">Cevap<textarea class="fq-a" rows="2">'+esc(f.a)+'</textarea></label><div class="admin-text-right"><button class="a-btn" data-fqdel="'+i+'">Sil</button></div>';
  box.appendChild(d);
 });
 var bar=el('div','admin-toolbar');bar.innerHTML='<button class="a-btn" id="fq-add">＋ Soru Ekle</button><button class="a-btn primary" id="fq-save">Kaydet</button>';box.appendChild(bar);
 $('#fq-add').onclick=function(){settings.faq.push({q:'',a:''});renderFaqAdmin();};
 $all('[data-fqdel]',box).forEach(function(b){b.onclick=function(){settings.faq.splice(+b.getAttribute('data-fqdel'),1);renderFaqAdmin();};});
 $('#fq-save').onclick=function(){var qs=$all('.fq-q',box),as=$all('.fq-a',box);settings.faq=qs.map(function(q,i){return{q:q.value.trim(),a:as[i].value.trim()};}).filter(function(f){return f.q;});save(LS.s,settings);applySettings();alert('SSS kaydedildi.');};
}
function renderContentAdmin(){
 var box=$('#content-admin'),s=settings.story||{};
 box.innerHTML='<h3 class="admin-content-title">Hikayemiz</h3>'+
  '<label>Başlık<input id="st-title" value="'+esc(s.title)+'"></label>'+
  '<label>Kısa cümle<input id="st-lead" value="'+esc(s.lead)+'"></label>'+
  '<label>Metin<textarea id="st-text" rows="5">'+esc(s.text)+'</textarea></label>'+
  '<h3 class="admin-content-subtitle">Üst Bant Öğeleri (her satır bir madde)</h3>'+
  '<label><textarea id="tb-items" rows="5">'+esc((settings.topbar||[]).join('\n'))+'</textarea></label>'+
  '<button class="admin-save" id="ct-save">Kaydet</button>';
 $('#ct-save').onclick=function(){settings.story={title:$('#st-title').value.trim(),lead:$('#st-lead').value.trim(),text:$('#st-text').value.trim()};settings.topbar=$('#tb-items').value.split('\n').map(function(x){return x.trim();}).filter(Boolean);save(LS.s,settings);applySettings();alert('İçerik kaydedildi.');};
}
function renderLegalAdmin(){
 var box=$('#legal-admin'),lg=settings.legal||{};
 box.innerHTML='<p class="admin-note">Footer’daki yasal metinler. (Hukuki geçerlilik için danışmanınıza doğrulatmanız önerilir.)</p>'+
  '<label>Gizlilik Politikası<textarea id="lg-privacy" rows="4">'+esc(lg.privacy)+'</textarea></label>'+
  '<label>KVKK Aydınlatma Metni<textarea id="lg-kvkk" rows="4">'+esc(lg.kvkk)+'</textarea></label>'+
  '<label>Çerez Politikası<textarea id="lg-cookie" rows="4">'+esc(lg.cookie)+'</textarea></label>'+
  '<label>Sipariş & Mesafeli Satış Koşulları<textarea id="lg-mesafeli" rows="4">'+esc(lg.mesafeli)+'</textarea></label>'+
  '<button class="admin-save" id="lg-save">Kaydet</button>';
 $('#lg-save').onclick=function(){settings.legal={privacy:$('#lg-privacy').value,kvkk:$('#lg-kvkk').value,cookie:$('#lg-cookie').value,mesafeli:$('#lg-mesafeli').value};save(LS.s,settings);alert('Yasal metinler kaydedildi.');};
}
function renderCampaignAdmin(){
 var box=$('#campaign-admin'),c=settings.campaign||{},cmImg=c.img||'';
 box.innerHTML='<p class="admin-note">Siteye ilk girişte açılan karşılama penceresi. Varsayılan olarak <b>pasiftir</b>; aşağıdaki kutuyla aktifleştirin. Ziyaretçiye oturum başına bir kez gösterilir.</p>'+
  '<div class="chk-row admin-campaign-check"><label><input type="checkbox" id="cm-en"'+(c.enabled?' checked':'')+'>Kampanya pop-up aktif</label></div>'+
  '<label>Başlık<input id="cm-title" value="'+esc(c.title)+'"></label>'+
  '<label>Metin<textarea id="cm-text" rows="4">'+esc(c.text)+'</textarea></label>'+
  '<div class="row2 admin-grid-2"><label>Buton yazısı (boş=butonsuz)<input id="cm-bt" value="'+esc(c.btnText)+'"></label><label>Buton bağlantısı<input id="cm-bl" value="'+esc(c.btnLink)+'"></label></div>'+
  '<label>Görsel</label><div id="cm-imgbox" class="pf-gallery"></div>'+
  '<div class="pf-gadd"><label class="a-btn pf-uplabel">＋ Görsel Yükle<input type="file" id="cm-file" accept="image/*" hidden></label></div>'+
  '<div class="admin-preview-row"><button class="a-btn" id="cm-preview">Önizle</button></div>'+
  '<button class="admin-save" id="cm-save">Kaydet</button>';
 function drawImg(){var b=$('#cm-imgbox');b.innerHTML=cmImg?'':'<span class="admin-note">Görsel yok</span>';if(cmImg){var d=el('div','pf-gthumb');d.innerHTML='<img src="'+imgSrc(cmImg)+'"><button type="button" class="pf-grm">✕</button>';d.querySelector('.pf-grm').onclick=function(){cmImg='';drawImg();};b.appendChild(d);}}
 drawImg();
 $('#cm-file').onchange=function(){var f=this.files[0];if(f)resizeImage(f,function(d){cmImg=d;drawImg();});this.value='';};
 function collect(){return{enabled:$('#cm-en').checked,title:$('#cm-title').value.trim(),text:$('#cm-text').value.trim(),btnText:$('#cm-bt').value.trim(),btnLink:$('#cm-bl').value.trim(),img:cmImg};}
 $('#cm-preview').onclick=function(){settings.campaign=collect();showCampaign(true);};
 $('#cm-save').onclick=function(){settings.campaign=collect();try{save(LS.s,settings);}catch(e){alert('Kaydedilemedi (görsel çok büyük olabilir).');return;}alert('Kampanya ayarları kaydedildi.');};
}
var baList=[];
function renderBannerAdmin(){
 var box=$('#banner-admin');if(!box)return;
 baList=JSON.parse(JSON.stringify(bannerList()));
 function collect(){$all('.ba-eb',box).forEach(function(e){baList[+e.getAttribute('data-i')].eyebrow=e.value;});$all('.ba-title',box).forEach(function(e){baList[+e.getAttribute('data-i')].title=e.value;});$all('.ba-lead',box).forEach(function(e){baList[+e.getAttribute('data-i')].lead=e.value;});$all('.ba-b1t',box).forEach(function(e){baList[+e.getAttribute('data-i')].b1t=e.value;});$all('.ba-b1l',box).forEach(function(e){baList[+e.getAttribute('data-i')].b1l=e.value;});$all('.ba-b2t',box).forEach(function(e){baList[+e.getAttribute('data-i')].b2t=e.value;});$all('.ba-b2l',box).forEach(function(e){baList[+e.getAttribute('data-i')].b2l=e.value;});}
 function drawImg(i){var b=$('#ba-imgbox-'+i);if(!b)return;b.innerHTML='';var d=el('div','pf-gthumb');d.innerHTML='<img src="'+imgSrc(baList[i].img||'hero')+'">';b.appendChild(d);}
 function draw(){
  box.innerHTML='<p class="admin-note">Üst banner slider’ı. Birden çok banner eklerseniz otomatik döner (oklar + noktalar). Başlıkta bir kısmı <b>*yıldız*</b> içine alırsanız o kelime gold italik olur; satır başı için Enter kullanın.</p>';
  baList.forEach(function(b,i){
   var c=el('div','arow admin-row-stack');
   c.innerHTML='<div class="admin-row-head-center"><b class="admin-serif">Banner '+(i+1)+'</b><span>'+(i>0?'<button class="a-btn ba-up" data-i="'+i+'">↑</button> ':'')+(i<baList.length-1?'<button class="a-btn ba-dn" data-i="'+i+'">↓</button> ':'')+'<button class="a-btn ba-del" data-i="'+i+'">Sil</button></span></div>'+
    '<label class="admin-label-tight">Üst etiket<input class="ba-eb" data-i="'+i+'" value="'+esc(b.eyebrow)+'"></label>'+
    '<label class="admin-label-spaced">Başlık (gold için *...*)<textarea class="ba-title" data-i="'+i+'" rows="2">'+esc(b.title)+'</textarea></label>'+
    '<label class="admin-label-spaced">Alt metin<textarea class="ba-lead" data-i="'+i+'" rows="2">'+esc(b.lead)+'</textarea></label>'+
    '<div class="admin-grid-2-top"><label class="admin-label-tight">1. Buton yazısı<input class="ba-b1t" data-i="'+i+'" value="'+esc(b.b1t)+'"></label><label class="admin-label-tight">1. Buton linki<input class="ba-b1l" data-i="'+i+'" value="'+esc(b.b1l)+'"></label></div>'+
    '<div class="admin-grid-2-top"><label class="admin-label-tight">2. Buton yazısı<input class="ba-b2t" data-i="'+i+'" value="'+esc(b.b2t)+'"></label><label class="admin-label-tight">2. Buton linki<input class="ba-b2l" data-i="'+i+'" value="'+esc(b.b2l)+'"></label></div>'+
    '<label class="admin-gallery-label">Görsel</label><div class="pf-gallery" id="ba-imgbox-'+i+'"></div>'+
    '<div class="pf-gadd"><label class="a-btn pf-uplabel">＋ Görsel Yükle<input type="file" class="ba-file" data-i="'+i+'" accept="image/*" hidden></label></div>';
   box.appendChild(c);
  });
  var bar=el('div','admin-toolbar');bar.innerHTML='<button class="a-btn" id="ba-add">＋ Banner Ekle</button><button class="a-btn primary" id="ba-save">Kaydet</button>';box.appendChild(bar);
  baList.forEach(function(b,i){drawImg(i);});
  $all('.ba-del',box).forEach(function(x){x.onclick=function(){collect();baList.splice(+x.getAttribute('data-i'),1);if(!baList.length)baList=[JSON.parse(JSON.stringify(DEF_BANNER))];draw();};});
  $all('.ba-up',box).forEach(function(x){x.onclick=function(){collect();var i=+x.getAttribute('data-i'),t=baList[i];baList[i]=baList[i-1];baList[i-1]=t;draw();};});
  $all('.ba-dn',box).forEach(function(x){x.onclick=function(){collect();var i=+x.getAttribute('data-i'),t=baList[i];baList[i]=baList[i+1];baList[i+1]=t;draw();};});
  $all('.ba-file',box).forEach(function(x){x.onchange=function(){var i=+x.getAttribute('data-i'),f=this.files[0];if(f)resizeImage(f,function(d){baList[i].img=d;drawImg(i);});this.value='';};});
  $('#ba-add').onclick=function(){collect();baList.push(JSON.parse(JSON.stringify(DEF_BANNER)));draw();};
  $('#ba-save').onclick=function(){collect();settings.banners=baList;try{save(LS.s,settings);}catch(e){alert('Kaydedilemedi (görsel çok büyük olabilir).');return;}bnIndex=0;applySettings();alert('Banner kaydedildi.');};
 }
 draw();
}
function renderHomeAdmin(){
 var box=$('#home-admin');if(!box)return;
 var h=JSON.parse(JSON.stringify(settings.home||defSettings().home)),hImg=h.heroImg||'',cImg=(h.cta&&h.cta.img)||'';
 function picker(id){return'<div id="'+id+'-box" class="pf-gallery"></div><div class="pf-gadd"><label class="a-btn pf-uplabel">＋ Görsel Yükle<input type="file" id="'+id+'-file" accept="image/*" hidden></label></div>';}
 box.innerHTML='<p class="admin-note">Ana sayfadaki tüm metinleri, istatistikleri, adımları, "Neden biz" maddelerini, bölüm başlıklarını ve CTA’yı buradan düzenleyin.</p>'+
  '<h3 class="ha-h">Hero İstatistikleri</h3>'+
  '<p class="admin-note">Üst banner (görsel / başlık / butonlar / slider) artık ayrı <b>“Banner”</b> sekmesinden yönetilir.</p>'+
  '<label>İstatistikler (3 adet: değer / açıklama)</label>'+h.proof.map(function(p){return'<div class="admin-proof-row"><input class="ha-pb" value="'+esc(p.b)+'"><input class="ha-ps" value="'+esc(p.s)+'"></div>';}).join('')+
  '<h3 class="ha-h">Bölüm Başlıkları</h3>'+
  '<label>Koleksiyonlar — etiket / başlık / alt yazı<input id="ha-ceb" value="'+esc(h.collHead.eb)+'"><input class="admin-input-top" id="ha-ct" value="'+esc(h.collHead.t)+'"><input class="admin-input-top" id="ha-cs" value="'+esc(h.collHead.s)+'"></label>'+
  '<label>Ürünler — etiket / başlık / alt yazı<input id="ha-peb" value="'+esc(h.prodHead.eb)+'"><input class="admin-input-top" id="ha-pt" value="'+esc(h.prodHead.t)+'"><input class="admin-input-top" id="ha-ps2" value="'+esc(h.prodHead.s)+'"></label>'+
  '<h3 class="ha-h">Nasıl Çalışır?</h3>'+
  '<label>Etiket / başlık<input id="ha-heb2" value="'+esc(h.howHead.eb)+'"><input class="admin-input-top" id="ha-ht" value="'+esc(h.howHead.t)+'"></label>'+
  h.steps.map(function(s,i){return'<div class="admin-step-card"><b class="admin-step-label">Adım '+(i+1)+'</b><input class="ha-st admin-input-top-small" value="'+esc(s.t)+'"><textarea class="ha-sd admin-input-top" rows="2">'+esc(s.d)+'</textarea></div>';}).join('')+
  '<h3 class="ha-h">Neden Davet Sandığı?</h3>'+
  '<label>Etiket / başlık<input id="ha-web" value="'+esc(h.whyHead.eb)+'"><input class="admin-input-top" id="ha-wt" value="'+esc(h.whyHead.t)+'"></label>'+
  h.why.map(function(w,i){return'<div class="admin-step-card"><b class="admin-step-label">Madde '+(i+1)+'</b><input class="ha-wct admin-input-top-small" value="'+esc(w.t)+'"><textarea class="ha-wcd admin-input-top" rows="2">'+esc(w.d)+'</textarea></div>';}).join('')+
  '<h3 class="ha-h">Alt CTA Bandı</h3>'+
  '<label>Etiket<input id="ha-caeb" value="'+esc(h.cta.eb)+'"></label>'+
  '<label>Başlık<input id="ha-cat" value="'+esc(h.cta.t)+'"></label>'+
  '<label>Metin<textarea id="ha-cap" rows="3">'+esc(h.cta.p)+'</textarea></label>'+
  '<label>Buton yazısı<input id="ha-cab" value="'+esc(h.cta.btn)+'"></label>'+
  '<label>CTA görseli (boş=varsayılan)</label>'+picker('ha-cta')+
  '<button class="admin-save admin-save-spaced" id="ha-save">Ana Sayfayı Kaydet</button>';
 function wireImg(id,get,set){function draw(){var b=$('#'+id+'-box');b.innerHTML='';var v=get();if(v){var d=el('div','pf-gthumb');d.innerHTML='<img src="'+imgSrc(v)+'"><button type="button" class="pf-grm">✕</button>';d.querySelector('.pf-grm').onclick=function(){set('');draw();};b.appendChild(d);}else b.innerHTML='<span class="admin-note">Varsayılan görsel kullanılıyor</span>';}draw();$('#'+id+'-file').onchange=function(){var f=this.files[0];if(f)resizeImage(f,function(d){set(d);draw();});this.value='';};}
 wireImg('ha-cta',function(){return cImg;},function(v){cImg=v;});
 $('#ha-save').onclick=function(){
  var pb=$all('.ha-pb',box),ps=$all('.ha-ps',box),stT=$all('.ha-st',box),stD=$all('.ha-sd',box),wcT=$all('.ha-wct',box),wcD=$all('.ha-wcd',box);
  settings.home={proof:pb.map(function(b,i){return{b:b.value,s:ps[i].value};}),
   collHead:{eb:$('#ha-ceb').value,t:$('#ha-ct').value,s:$('#ha-cs').value},
   prodHead:{eb:$('#ha-peb').value,t:$('#ha-pt').value,s:$('#ha-ps2').value},
   howHead:{eb:$('#ha-heb2').value,t:$('#ha-ht').value},
   steps:stT.map(function(t,i){return{t:t.value,d:stD[i].value};}),
   whyHead:{eb:$('#ha-web').value,t:$('#ha-wt').value},
   why:wcT.map(function(t,i){return{t:t.value,d:wcD[i].value};}),
   cta:{eb:$('#ha-caeb').value,t:$('#ha-cat').value,p:$('#ha-cap').value,btn:$('#ha-cab').value,img:cImg}};
  try{save(LS.s,settings);}catch(e){alert('Kaydedilemedi (görsel çok büyük olabilir).');return;}
  applySettings();alert('Ana sayfa kaydedildi.');
 };
}
function switchView(v){$all('.admin-tabs button').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-view')==v);});$all('.admin-view').forEach(function(x){x.classList.remove('show');});$('#view-'+v).classList.add('show');}
$all('.admin-tabs button').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-view');if(v=='add'){editingId=null;renderProductForm();}switchView(v);});});
$('#admin-login-btn').addEventListener('click',adminLogin);
$('#admin-pw').addEventListener('keydown',function(e){if(e.key=='Enter')adminLogin();});
$('#admin-search').addEventListener('input',renderAdminRows);
$('#admin-filter').addEventListener('change',renderAdminRows);
$('#admin-exit').addEventListener('click',closeAdmin);
$('#admin-logout').addEventListener('click',adminLogout);
$('#admin-export').addEventListener('click',function(){var data={settings:settings,categories:categories,occasions:occasions,products:products};var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='davet-sandigi-yedek.json';a.click();});
$('#admin-import').addEventListener('click',function(){var i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=function(){var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(d.settings){settings=d.settings;save(LS.s,settings);}if(d.categories){categories=d.categories;save(LS.c,categories);}if(d.occasions){occasions=d.occasions;save(LS.o,occasions);}if(d.products){products=d.products;save(LS.p,products);}renderAdmin();refreshSite();alert('Yedek yüklendi.');}catch(e){alert('Geçersiz dosya.');}};r.readAsText(i.files[0]);};i.click();});
function refreshSite(){renderCollections();renderFilter();renderProducts();applySettings();}
openAdmin();
(function(){var note=$('#admin-login-note');
 if(note)note.textContent='Bağlantı kuruluyor…';
 startLegacyFirebase(function(available){
  if(available){if(note)note.textContent='Firebase e-posta ve parolanızla giriş yapın.';fbAuth.onAuthStateChanged(function(u){fbUser=u||null;if(u){if(note)note.textContent='';showAdminPanel();}else{$('#admin-panel').classList.remove('show');$('#admin-login').style.display='';}});loadFromCloud();}
  else{if(note)note.textContent='Bağlantı yok — demo modu. Parola: davet2026';var em=$('#admin-email');if(em)em.style.display='none';}
 });
})();
