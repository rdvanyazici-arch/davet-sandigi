var editingId=null;
function renderAdmin(){renderAdminRows();renderProductForm();renderCollAdmin();renderCatAdmin();renderSettingsForm();renderReviewsAdmin();renderFaqAdmin();renderContentAdmin();renderLegalAdmin();renderCampaignAdmin();renderHomeAdmin();renderBannerAdmin();
 $('#admin-count').textContent=products.length+' ürün · '+categories.length+' kategori';
 var f=$('#admin-filter');f.innerHTML='<option value="">Tüm kategoriler</option>'+categories.map(function(c){return'<option value="'+c.id+'">'+c.label+'</option>';}).join('');
}
function renderAdminRows(){
 var box=$('#admin-rows');box.innerHTML='';
 var q=($('#admin-search').value||'').toLowerCase(),cf=$('#admin-filter').value;
 products.filter(function(p){return(!q||p.name.toLowerCase().indexOf(q)>-1||(p.code||'').toLowerCase().indexOf(q)>-1)&&(!cf||p.cat==cf);}).forEach(function(p){
  var row=el('div','arow');
  row.innerHTML='<img src="'+imgSrc(p.img)+'" alt=""><div class="ai"><b>'+p.name+'</b><small>'+p.code+' · '+catLabel(p.cat)+' · '+fmt(p.price)+'</small>'+
   '<div class="admin-badge-row">'+(p.featured?'<span class="badge feat">Öne Çıkan</span>':'')+(p.visible===false?'<span class="badge hid">Gizli</span>':'')+
   (p.occ||[]).map(function(o){return'<small class="admin-occ-label">#'+occLabel(o)+'</small>';}).join('')+'</div></div>'+
   '<div class="aacts"><button class="star'+(p.featured?' on':'')+'" title="Öne çıkar" data-af="'+p.id+'">★</button>'+
   '<button class="'+(p.visible!==false?'on':'')+'" title="Görünürlük" data-av="'+p.id+'">'+(p.visible!==false?'👁':'∅')+'</button>'+
   '<button title="Düzenle" data-ae="'+p.id+'">✎</button><button title="Sil" data-ad="'+p.id+'">🗑</button></div>';
  box.appendChild(row);
 });
 $all('[data-af]',box).forEach(function(b){b.onclick=function(){var p=prod(b.getAttribute('data-af'));p.featured=!p.featured;save(LS.p,products);renderAdminRows();refreshSite();};});
 $all('[data-av]',box).forEach(function(b){b.onclick=function(){var p=prod(b.getAttribute('data-av'));p.visible=p.visible===false;save(LS.p,products);renderAdminRows();refreshSite();};});
 $all('[data-ae]',box).forEach(function(b){b.onclick=function(){editProduct(b.getAttribute('data-ae'));};});
 $all('[data-ad]',box).forEach(function(b){b.onclick=function(){if(confirm('Ürün silinsin mi?')){products=products.filter(function(x){return x.id!=b.getAttribute('data-ad');});save(LS.p,products);renderAdmin();refreshSite();}};});
}
function prod(id){return products.filter(function(x){return x.id==id;})[0];}
function builtinImgKeys(){return Object.keys(IMG).filter(function(k){return k!=='hero'&&k!=='cta'&&k.indexOf('col-')!==0;}).sort();}
var pfGallery=[];
function renderProductForm(){
 var f=$('#product-form');var p=editingId?prod(editingId):{name:'',cat:categories[0].id,occ:[],price:'',desc:'',featured:false,visible:true,code:''};
 pfGallery=(editingId?galleryOf(p).filter(Boolean):[]).slice();
 $('#form-title').textContent=editingId?'Ürünü Düzenle':'Yeni Ürün';
 f.innerHTML='<label>Ürün Adı<input id="pf-name" value="'+esc(p.name)+'"></label>'+
  '<div class="row2"><label>Kategori (Tür)<select id="pf-cat">'+categories.map(function(c){return'<option value="'+c.id+'"'+(c.id==p.cat?' selected':'')+'>'+c.label+'</option>';}).join('')+'</select></label>'+
  '<label>Fiyat (₺)<input id="pf-price" type="number" step="0.01" value="'+(p.price||'')+'"></label></div>'+
  '<label>Görsel Galerisi (ilki ana görseldir; ürün pop-up’ında sırayla gösterilir)</label>'+
  '<div id="pf-gallery" class="pf-gallery"></div>'+
  '<div class="pf-gadd"><label class="a-btn primary pf-uplabel">＋ Görsel Yükle<input type="file" id="pf-file" accept="image/*" hidden></label><span class="admin-note admin-inline-note">Birden fazla ekleyebilirsiniz. İlk görsel ana görseldir.</span></div>'+
  '<label>Koleksiyonlar (Etkinlik)<div class="chk-row">'+occasions.map(function(o){return'<label><input type="checkbox" class="pf-occ" value="'+o.id+'"'+((p.occ||[]).indexOf(o.id)>-1?' checked':'')+'>'+o.label+'</label>';}).join('')+'</div></label>'+
  '<label>Açıklama<textarea id="pf-desc" rows="3">'+esc(p.desc)+'</textarea></label>'+
  '<label>Ürün Kodu (boş bırakılırsa otomatik)<input id="pf-code" value="'+esc(p.code)+'"></label>'+
  '<div class="chk-row admin-checkbox-gap"><label><input type="checkbox" id="pf-feat"'+(p.featured?' checked':'')+'>Öne çıkan</label><label><input type="checkbox" id="pf-vis"'+(p.visible!==false?' checked':'')+'>Sitede görünür</label></div>'+
  '<button class="admin-save" id="pf-save">'+(editingId?'Kaydet':'Ürünü Ekle')+'</button>'+(editingId?' <button class="a-btn admin-cancel-button" id="pf-cancel">İptal</button>':'');
 renderPfGallery();
 $('#pf-file').onchange=function(){var file=this.files[0];if(file)resizeImage(file,function(d){pfGallery.push(d);renderPfGallery();});this.value='';};
 $('#pf-save').onclick=saveProduct;
 if($('#pf-cancel'))$('#pf-cancel').onclick=function(){editingId=null;renderProductForm();switchView('products');};
}
function renderPfGallery(){
 var g=$('#pf-gallery');if(!g)return;g.innerHTML='';
 if(!pfGallery.length){g.innerHTML='<span class="admin-note">Henüz görsel yok — “Görsel Yükle” ile ekleyin.</span>';return;}
 pfGallery.forEach(function(im,i){
  var d=el('div','pf-gthumb'+(i===0?' primary':''));
  d.innerHTML='<img src="'+imgSrc(im)+'" alt="">'+(i===0?'<span class="pf-main">Ana</span>':'<button type="button" class="pf-gup" title="Ana yap">▲</button>')+'<button type="button" class="pf-grm" title="Kaldır">✕</button>';
  d.querySelector('.pf-grm').onclick=function(){pfGallery.splice(i,1);renderPfGallery();};
  var up=d.querySelector('.pf-gup');if(up)up.onclick=function(){var x=pfGallery.splice(i,1)[0];pfGallery.unshift(x);renderPfGallery();};
  g.appendChild(d);
 });
}
function suggestCode(cat){var pre=(categories.filter(function(c){return c.id==cat;})[0]||{prefix:'URN'}).prefix;var n=products.filter(function(p){return(p.code||'').indexOf(pre)===0;}).length+1;return pre+pad3(n);}
function saveProduct(){
 var name=$('#pf-name').value.trim();if(!name){alert('Ürün adı gerekli');return;}
 var cat=$('#pf-cat').value,occ=$all('.pf-occ:checked').map(function(c){return c.value;});
 var code=$('#pf-code').value.trim()||suggestCode(cat);
 var data={name:name,cat:cat,occ:occ,price:parseFloat($('#pf-price').value)||0,img:pfGallery[0]||'',gallery:pfGallery.slice(),desc:$('#pf-desc').value.trim(),code:code,featured:$('#pf-feat').checked,visible:$('#pf-vis').checked};
 if(editingId){Object.assign(prod(editingId),data);}else{data.id='p'+Date.now();products.push(data);}
 try{save(LS.p,products);}catch(e){alert('Kaydedilemedi — yüklenen görseller çok büyük olabilir (tarayıcı depolama sınırı). Daha az/daha küçük görsel deneyin.');return;}
 save(LS.p,products);editingId=null;renderAdmin();switchView('products');refreshSite();
}
function editProduct(id){editingId=id;renderProductForm();switchView('add');}
function renderCollAdmin(){
 var box=$('#coll-admin');box.innerHTML='<p class="admin-note">Etkinlik koleksiyonları (ana sayfadaki kartlar). İsim ve alt metni düzenleyip kaydedin. Ürünler bu koleksiyonlara ürün formundan atanır.</p>';
 occasions.forEach(function(o){var cnt=products.filter(function(p){return(p.occ||[]).indexOf(o.id)>-1;}).length;
  var row=el('div','arow admin-wrap-row');
  row.innerHTML='<span class="coll-ic admin-coll-icon">'+glyphSvg(o.glyph)+'</span><div class="admin-stack-fields"><input class="oc-lbl" value="'+esc(o.label)+'"><input class="oc-sub" value="'+esc(o.sub)+'"></div><small class="admin-count-label">'+cnt+' ürün</small>';box.appendChild(row);});
 var bar=el('div','admin-toolbar');bar.innerHTML='<button class="a-btn primary" id="oc-save">Değişiklikleri Kaydet</button>';box.appendChild(bar);
 $('#oc-save').onclick=function(){var lbls=$all('.oc-lbl',box),subs=$all('.oc-sub',box);occasions.forEach(function(o,i){if(lbls[i])o.label=lbls[i].value.trim()||o.label;if(subs[i])o.sub=subs[i].value.trim();});save(LS.o,occasions);renderAdmin();refreshSite();alert('Koleksiyonlar kaydedildi.');};
}
function renderCatAdmin(){
 var box=$('#cat-admin');box.innerHTML='<p class="admin-note">Ürün türü kategorileri. İsim ve kod ön ekini düzenleyip kaydedin.</p>';
 categories.forEach(function(c){var cnt=products.filter(function(p){return p.cat==c.id;}).length;
  var row=el('div','arow admin-wrap-row');
  row.innerHTML='<div class="admin-cat-fields"><input class="cat-lbl" value="'+esc(c.label)+'"><input class="cat-pre admin-uppercase" value="'+esc(c.prefix)+'"></div><small class="admin-count-label">'+cnt+' ürün</small><button class="a-btn" data-cd="'+c.id+'">Sil</button>';box.appendChild(row);});
 var bar=el('div','admin-toolbar');bar.innerHTML='<button class="a-btn primary" id="cat-save">Değişiklikleri Kaydet</button>';box.appendChild(bar);
 var add=el('div','admin-toolbar');add.innerHTML='<input id="newcat" placeholder="Yeni kategori adı"><input class="admin-prefix-input" id="newpre" placeholder="Ön ek (örn. TEP)"><button class="a-btn" id="addcat">＋ Ekle</button>';box.appendChild(add);
 $('#cat-save').onclick=function(){var lbls=$all('.cat-lbl',box),pres=$all('.cat-pre',box);categories.forEach(function(c,i){if(lbls[i])c.label=lbls[i].value.trim()||c.label;if(pres[i])c.prefix=(pres[i].value.trim()||c.prefix).toUpperCase();});save(LS.c,categories);renderAdmin();refreshSite();alert('Kategoriler kaydedildi.');};
 $('#addcat').onclick=function(){var l=$('#newcat').value.trim(),pre=($('#newpre').value.trim()||l.slice(0,3)).toUpperCase();if(!l)return;categories.push({id:'c'+Date.now(),label:l,prefix:pre});save(LS.c,categories);renderAdmin();refreshSite();};
 $all('[data-cd]',box).forEach(function(b){b.onclick=function(){var id=b.getAttribute('data-cd');if(products.some(function(p){return p.cat==id;})){alert('Bu kategoride ürün var, önce onları taşıyın/silin.');return;}categories=categories.filter(function(c){return c.id!=id;});save(LS.c,categories);renderAdmin();refreshSite();};});
}
