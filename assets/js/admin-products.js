var editingId=null;
var pfGallery=[];
var productState={client:null,page:1,pageSize:8,total:0,allTotal:0,categories:[],collections:[],assets:[],drafts:{},form:null,previewSignature:'',loading:false};

function productClient(){
 return new Promise(function(resolve,reject){
  if(productState.client){resolve(productState.client);return;}
  if(adminAuthClient){productState.client=adminAuthClient;resolve(adminAuthClient);return;}
  startSupabaseClient(function(client,error){if(error||!client)reject(new Error(error||'Supabase bağlantısı kurulamadı.'));else{productState.client=client;resolve(client);}});
 });
}
function productError(error){return adminErrorText(error);}
function productSlug(value){return String(value||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90);}
function productMoney(value){return value==null||value===''?'Fiyat sorunuz':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(Number(value));}
function productPublicUrl(asset){if(!asset||!productState.client)return'';return productState.client.storage.from('site-media').getPublicUrl(asset.storage_path).data.publicUrl;}
function productSetStatus(message,isError){var node=$('#product-list-status');if(node){node.textContent=message||'';node.classList.toggle('media-error',!!isError);}}
function productSetFormStatus(message,isError){var node=$('#product-form-status');if(node){node.textContent=message||'';node.classList.toggle('media-error',!!isError);}}
function productCategoryName(id){var item=productState.categories.filter(function(row){return Number(row.id)===Number(id);})[0];return item?item.name:'Kategorisiz';}
function productAsset(id){return productState.assets.filter(function(row){return Number(row.id)===Number(id);})[0]||null;}
function productSignature(payload){return JSON.stringify(payload);}

function renderAdmin(){
 renderCollAdmin();renderCatAdmin();renderSettingsForm();renderReviewsAdmin();renderFaqAdmin();renderContentAdmin();renderLegalAdmin();renderCampaignAdmin();renderHomeAdmin();renderBannerAdmin();
 productEnsureListControls();productInitialize();
 if(typeof pagesRenderDashboard==='function')pagesRenderDashboard();
}

function productEnsureListControls(){
 var view=$('#view-products'),toolbar=view&&view.querySelector('.admin-toolbar');if(!toolbar||toolbar.dataset.productsReady)return;
 toolbar.dataset.productsReady='true';
 toolbar.innerHTML='<label class="product-filter-field">Arama<input id="admin-search" type="search" placeholder="Ad, SKU veya slug"></label>'+
  '<label class="product-filter-field">Kategori<select id="admin-filter"><option value="">Tüm kategoriler</option></select></label>'+
  '<label class="product-filter-field">Koleksiyon<select id="admin-collection-filter"><option value="">Tüm koleksiyonlar</option></select></label>'+
  '<label class="product-filter-field">Durum<select id="admin-status-filter"><option value="">Tüm durumlar</option><option value="active">Yayında</option><option value="inactive">Yayında değil</option><option value="draft">Taslak</option><option value="archived">Arşiv</option></select></label>'+
  '<button class="a-btn" id="product-refresh" type="button">Yenile</button>';
 if(!$('#product-list-status'))view.insertBefore(el('div','admin-note product-list-status',''),$('#admin-rows'));
 var status=view.querySelector('.product-list-status');status.id='product-list-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 if(!$('#product-pagination')){var pagination=el('div','product-pagination','');pagination.id='product-pagination';view.appendChild(pagination);}
 ['admin-search','admin-filter','admin-collection-filter','admin-status-filter'].forEach(function(id){$('#'+id).addEventListener(id==='admin-search'?'input':'change',function(){productState.page=1;renderAdminRows();});});
 $('#product-refresh').addEventListener('click',function(){productInitialize(true);});
}

async function productInitialize(force){
 if(productState.loading&&!force)return;productState.loading=true;productSetStatus('Ürünler yükleniyor…',false);
 try{
  var client=await productClient();
  var results=await Promise.all([
   client.from('categories').select('id,name,code_prefix,is_active').order('sort_order'),
   client.from('collections').select('id,name,is_active').order('sort_order'),
   client.from('media_assets').select('id,storage_path,alt_text,original_name,status,archived_at,usage_type').eq('status','active').is('archived_at',null).order('created_at',{ascending:false}),
   client.from('product_drafts').select('id,product_id,payload,updated_at'),
   client.from('products').select('id',{count:'exact',head:true})
  ]);
  results.forEach(function(result){if(result.error)throw result.error;});
  productState.categories=results[0].data||[];productState.collections=results[1].data||[];productState.assets=results[2].data||[];productState.allTotal=results[4].count||0;productState.drafts={};
  (results[3].data||[]).forEach(function(draft){productState.drafts[draft.product_id]=draft;});
  productFillFilters();await renderAdminRows();
 }catch(error){adminShowInlineError($('#product-list-status'),'Ürünler yüklenemedi: ',error);$('#admin-rows').innerHTML='<div class="product-empty">Supabase bağlantısını ve yönetici oturumunu kontrol edin.</div>';}
 finally{productState.loading=false;}
}

function productFillFilters(){
 var category=$('#admin-filter'),collection=$('#admin-collection-filter');if(!category||!collection)return;
 var categoryValue=category.value,collectionValue=collection.value;
 category.innerHTML='<option value="">Tüm kategoriler</option>'+productState.categories.map(function(row){return'<option value="'+row.id+'">'+esc(row.name)+'</option>';}).join('');
 collection.innerHTML='<option value="">Tüm koleksiyonlar</option>'+productState.collections.map(function(row){return'<option value="'+row.id+'">'+esc(row.name)+'</option>';}).join('');
 category.value=categoryValue;collection.value=collectionValue;
}

function productSearchValue(){return String($('#admin-search').value||'').trim().replace(/[,%()]/g,' ').replace(/\s+/g,' ').slice(0,80);}
async function renderAdminRows(){
 var box=$('#admin-rows');if(!box)return;box.innerHTML='<div class="product-loading">Ürünler yükleniyor…</div>';productSetStatus('Ürünler yükleniyor…',false);
 try{
  var client=await productClient(),collectionId=$('#admin-collection-filter').value,status=$('#admin-status-filter').value,allowedIds=null;
  if(collectionId){var rel=await client.from('product_collections').select('product_id').eq('collection_id',collectionId);if(rel.error)throw rel.error;allowedIds=(rel.data||[]).map(function(row){return row.product_id;});if(!allowedIds.length){productState.total=0;productRenderRows([]);return;}}
  if(status==='draft'){var draftIds=Object.keys(productState.drafts).map(Number);allowedIds=allowedIds?allowedIds.filter(function(id){return draftIds.indexOf(Number(id))>-1;}):draftIds;if(!allowedIds.length){productState.total=0;productRenderRows([]);return;}}
  var fields='*,categories(id,name),product_collections(collection_id),product_images(id,media_id,alt_text,sort_order,is_primary,media_assets(id,storage_path,alt_text,status,archived_at))';
  var query=client.from('products').select(fields,{count:'exact'}).order('sort_order',{ascending:true}).order('updated_at',{ascending:false});
  var search=productSearchValue();if(search)query=query.or('name.ilike.%'+search+'%,sku.ilike.%'+search+'%,slug.ilike.%'+search+'%');
  var categoryId=$('#admin-filter').value;if(categoryId)query=query.eq('category_id',categoryId);
  if(allowedIds)query=query.in('id',allowedIds);
  if(status==='active')query=query.eq('is_active',true).is('archived_at',null);
  if(status==='inactive')query=query.eq('is_active',false).is('archived_at',null);
  if(status==='archived')query=query.not('archived_at','is',null);
  var from=(productState.page-1)*productState.pageSize,to=from+productState.pageSize-1;var result=await query.range(from,to);if(result.error)throw result.error;
  productState.total=result.count||0;productRenderRows(result.data||[]);
 }catch(error){adminShowInlineError($('#product-list-status'),'Ürün listesi yüklenemedi: ',error);box.innerHTML='<div class="product-empty">Liste alınamadı. Yenile düğmesiyle tekrar deneyin.</div>';}
}

function productRenderRows(rows){
 var box=$('#admin-rows');box.innerHTML='';
 if(!rows.length){box.innerHTML='<div class="product-empty">Bu filtrelere uygun ürün bulunamadı.</div>';productSetStatus('0 filtreli sonuç.',false);$('#admin-count').textContent=productState.allTotal+' ürün';productRenderPagination();return;}
 rows.forEach(function(row){
  var draft=productState.drafts[row.id],images=(row.product_images||[]).slice().sort(function(a,b){return a.sort_order-b.sort_order;}),draftImage=draft&&draft.payload.images&&draft.payload.images[0],primary=draftImage?{alt_text:draftImage.alt_text,media_assets:productAsset(draftImage.media_id)}:(images.filter(function(image){return image.is_primary;})[0]||images[0]),url=primary&&primary.media_assets?productPublicUrl(primary.media_assets):'';
  var emptyDraft=productIsEmptyDraft(row,draft),status=row.archived_at?'Arşiv':emptyDraft?'Boş taslak':draft?'Taslak değişiklik':row.is_active?'Yayında':'Yayında değil';
  var statusClass=row.archived_at?'status-archived':(emptyDraft||draft)?'status-draft':row.is_active?'feat':'hid';
  var item=el('article','arow product-admin-row');
  item.innerHTML=(url?'<img src="'+esc(url)+'" alt="'+esc(primary.alt_text||row.name||'Ürün')+'">':'<div class="product-image-placeholder">Görsel yok</div>')+
   '<div class="ai"><b>'+esc((draft&&draft.payload.name)||row.name||'İsimsiz ürün')+'</b><small>'+esc((draft&&draft.payload.sku)||row.sku||'SKU yok')+' · '+esc(productCategoryName((draft&&draft.payload.category_id)||row.category_id))+' · '+productMoney((draft&&draft.payload.price)!==undefined?draft.payload.price:row.price)+'</small><div class="admin-badge-row"><span class="badge '+statusClass+'">'+status+'</span>'+(row.is_featured?'<span class="badge feat">Öne çıkan</span>':'')+'</div></div>'+
   '<div class="aacts product-row-actions"><button type="button" title="Önizle" aria-label="Ürünü önizle" data-product-preview="'+row.id+'">◉</button><button type="button" title="Düzenle" aria-label="Ürünü düzenle" data-product-edit="'+row.id+'">✎</button><button type="button" title="Çoğalt" aria-label="Ürünü çoğalt" data-product-duplicate="'+row.id+'">⧉</button>'+(row.is_active?'<button type="button" title="Yayından kaldır" aria-label="Ürünü yayından kaldır" data-product-unpublish="'+row.id+'">∅</button>':'')+(row.archived_at?'<button type="button" title="Arşivden çıkar" aria-label="Ürünü arşivden çıkar" data-product-restore="'+row.id+'">↶</button>':!emptyDraft?'<button type="button" title="Arşivle" aria-label="Ürünü arşivle" data-product-archive="'+row.id+'">▣</button>':'')+(emptyDraft&&adminIsOwner()?'<button type="button" class="media-danger" title="Taslağı sil" aria-label="Boş taslağı kalıcı sil" data-product-delete-draft="'+row.id+'">×</button>':'')+'</div>';
  item.dataset.product=JSON.stringify(row);box.appendChild(item);
 });
 $all('[data-product-edit]',box).forEach(function(button){button.onclick=function(){editProduct(Number(button.dataset.productEdit));};});
 $all('[data-product-duplicate]',box).forEach(function(button){button.onclick=function(){productOpenForm(Number(button.dataset.productDuplicate),true);};});
 $all('[data-product-preview]',box).forEach(function(button){button.onclick=function(){productPreviewFromList(Number(button.dataset.productPreview));};});
 $all('[data-product-unpublish]',box).forEach(function(button){button.onclick=function(){productUnpublish(Number(button.dataset.productUnpublish));};});
 $all('[data-product-archive]',box).forEach(function(button){button.onclick=function(){productArchive(Number(button.dataset.productArchive));};});
 $all('[data-product-restore]',box).forEach(function(button){button.onclick=function(){productRestore(Number(button.dataset.productRestore));};});
 $all('[data-product-delete-draft]',box).forEach(function(button){button.onclick=function(){productDeleteEmptyDraft(Number(button.dataset.productDeleteDraft));};});
 productSetStatus(productState.total+' filtreli sonuç.',false);$('#admin-count').textContent=productState.allTotal+' ürün';productRenderPagination();
}

function productIsEmptyDraft(row,draft){var payload=draft&&draft.payload||{},images=row.product_images||[];return!!draft&&!row.is_active&&!row.archived_at&&!String(row.name||'').trim()&&!String(row.sku||'').trim()&&!String(payload.name||'').trim()&&!String(payload.sku||'').trim()&&!images.length&&!(payload.images||[]).length;}

function productRenderPagination(){
 var box=$('#product-pagination');if(!box)return;var pages=Math.max(1,Math.ceil(productState.total/productState.pageSize));if(productState.page>pages)productState.page=pages;
 box.innerHTML='<button class="a-btn" type="button" id="product-prev"'+(productState.page<=1?' disabled':'')+'>← Önceki</button><span>Sayfa '+productState.page+' / '+pages+'</span><button class="a-btn" type="button" id="product-next"'+(productState.page>=pages?' disabled':'')+'>Sonraki →</button>';
 $('#product-prev').onclick=function(){if(productState.page>1){productState.page--;renderAdminRows();}};$('#product-next').onclick=function(){if(productState.page<pages){productState.page++;renderAdminRows();}};
}

async function productLoadDetail(id){
 if(!id)return null;var client=await productClient();var result=await client.from('products').select('*,product_collections(collection_id),product_images(id,media_id,alt_text,sort_order,is_primary,media_assets(id,storage_path,alt_text,status,archived_at))').eq('id',id).single();if(result.error)throw result.error;return result.data;
}
function productPayloadFromRow(row){
 var images=(row&&row.product_images||[]).slice().sort(function(a,b){return a.sort_order-b.sort_order;});return{
  name:row&&row.name||'',slug:row&&row.slug||'',sku:row&&row.sku||'',category_id:row&&row.category_id||'',short_description:row&&row.short_description||'',description:row&&row.description||'',price:row&&row.price!=null?row.price:'',is_price_visible:row?row.is_price_visible:true,is_quote_only:row?row.is_quote_only:false,min_quantity:row&&row.min_quantity||25,quantity_step:row&&row.quantity_step||25,is_featured:row?row.is_featured:false,sort_order:row&&row.sort_order||0,seo_title:row&&row.seo_title||'',seo_description:row&&row.seo_description||'',collection_ids:(row&&row.product_collections||[]).map(function(item){return Number(item.collection_id);}),images:images.map(function(image){return{media_id:Number(image.media_id),alt_text:image.alt_text||(image.media_assets&&image.media_assets.alt_text)||''};})
 };
}
function productDuplicatePayload(payload){var copy=JSON.parse(JSON.stringify(payload));copy.name=(copy.name||'Ürün')+' Kopyası';copy.slug=productSlug(copy.name)+'-'+String(Date.now()).slice(-6);copy.sku='';copy.is_featured=false;return copy;}

function renderProductForm(){productOpenForm(editingId||null,false);}
async function productOpenForm(id,duplicate){
 editingId=id||null;switchView('add');var form=$('#product-form');form.innerHTML='<div class="product-loading">Ürün formu yükleniyor…</div>';
 try{
  if(!productState.categories.length)await productInitialize();var row=id?await productLoadDetail(id):null,draft=id?productState.drafts[id]:null,payload=draft?draft.payload:productPayloadFromRow(row);if(duplicate){payload=productDuplicatePayload(payload);row=null;draft=null;editingId=null;}
  productState.form={productId:row&&row.id||null,draftId:draft&&draft.id||null,payload:JSON.parse(JSON.stringify(payload)),row:row};pfGallery=(payload.images||[]).slice();productState.previewSignature='';productDrawForm(!!duplicate);
 }catch(error){form.innerHTML='<div class="product-empty media-error">Form yüklenemedi: '+adminErrorHtml(error)+'</div>';}
}

function productDrawForm(isDuplicate){
 var state=productState.form,p=state.payload,form=$('#product-form');$('#form-title').textContent=isDuplicate?'Ürünü Çoğalt':state.productId?'Ürünü Düzenle':'Yeni Ürün';
 form.innerHTML='<div id="product-form-status" class="product-form-status" role="status" aria-live="polite">Kaydetmeden önce önizleme zorunludur.</div>'+
  '<div class="admin-grid-2"><label>Ürün adı<input id="pf-name" required value="'+esc(p.name)+'"></label><label>Slug<input id="pf-slug" required value="'+esc(p.slug)+'"></label></div>'+
  '<div class="admin-grid-2"><label>SKU / ürün kodu<input id="pf-sku" required value="'+esc(p.sku)+'"></label><label>Kategori<select id="pf-category"><option value="">Kategori seçin</option>'+productState.categories.map(function(item){return'<option value="'+item.id+'"'+(Number(item.id)===Number(p.category_id)?' selected':'')+'>'+esc(item.name)+'</option>';}).join('')+'</select></label></div>'+
  '<label>Kısa açıklama<input id="pf-short-description" maxlength="180" value="'+esc(p.short_description)+'"></label><label>Açıklama<textarea id="pf-description" rows="4">'+esc(p.description)+'</textarea></label>'+
  '<div class="admin-grid-3"><label>Fiyat (₺)<input id="pf-price" type="number" min="0" step="0.01" value="'+esc(p.price)+'"></label><label>Minimum adet<input id="pf-min-quantity" type="number" min="1" step="1" value="'+esc(p.min_quantity)+'"></label><label>Adet artışı<input id="pf-quantity-step" type="number" min="1" step="1" value="'+esc(p.quantity_step)+'"></label></div>'+
  '<div class="admin-grid-2"><label>Sıralama<input id="pf-sort-order" type="number" step="1" value="'+esc(p.sort_order)+'"></label><div class="chk-row product-checks"><label><input type="checkbox" id="pf-price-visible"'+(p.is_price_visible?' checked':'')+'>Fiyatı göster</label><label><input type="checkbox" id="pf-quote-only"'+(p.is_quote_only?' checked':'')+'>Teklif ürünü</label><label><input type="checkbox" id="pf-featured"'+(p.is_featured?' checked':'')+'>Öne çıkar</label></div></div>'+
  '<fieldset class="product-fieldset"><legend>Koleksiyonlar</legend><div class="chk-row">'+productState.collections.map(function(item){return'<label><input type="checkbox" class="pf-collection" value="'+item.id+'"'+((p.collection_ids||[]).map(Number).indexOf(Number(item.id))>-1?' checked':'')+'>'+esc(item.name)+'</label>';}).join('')+'</div></fieldset>'+
  '<fieldset class="product-fieldset"><legend>Ana görsel ve galeri</legend><p class="admin-note">İlk görsel ana görseldir. Oklarla sıralayın; her görselin alt metnini doldurun.</p><div id="pf-gallery" class="product-gallery-editor"></div><div class="pf-gadd"><select id="pf-media-select"><option value="">Kütüphaneden görsel seçin</option>'+productState.assets.map(function(asset){return'<option value="'+asset.id+'">'+esc(asset.original_name||asset.alt_text||('#'+asset.id))+'</option>';}).join('')+'</select><button class="a-btn" id="pf-media-add" type="button">Galeriyi Ekle</button><button class="a-btn" id="pf-open-media" type="button">Görsel Kütüphanesi</button></div></fieldset>'+
  '<div class="admin-grid-2"><label>SEO başlığı<input id="pf-seo-title" maxlength="70" value="'+esc(p.seo_title)+'"></label><label>SEO açıklaması<textarea id="pf-seo-description" maxlength="170" rows="2">'+esc(p.seo_description)+'</textarea></label></div>'+
  '<div class="product-form-actions"><button class="a-btn" id="pf-preview" type="button">Önizlemeyi Göster</button><button class="a-btn primary" id="pf-draft" type="button">Taslak Kaydet</button><button class="admin-save" id="pf-publish" type="button">Önizle ve Yayınla</button><button class="a-btn" id="pf-cancel" type="button">İptal</button></div>';
 renderPfGallery();productBindForm();
}

function productBindForm(){
 var slug=$('#pf-slug'),name=$('#pf-name');slug.dataset.manual=slug.value?'true':'false';slug.addEventListener('input',function(){slug.dataset.manual='true';productMarkDirty();});name.addEventListener('input',function(){if(slug.dataset.manual!=='true')slug.value=productSlug(name.value);productMarkDirty();});
 $all('input,textarea,select',$('#product-form')).forEach(function(input){if(input!==name&&input!==slug)input.addEventListener('input',productMarkDirty);});
 $('#pf-media-add').onclick=function(){var id=Number($('#pf-media-select').value);if(!id)return;if(pfGallery.some(function(item){return Number(item.media_id)===id;})){productSetFormStatus('Bu görsel galeride zaten var.',true);return;}var asset=productAsset(id);pfGallery.push({media_id:id,alt_text:asset&&asset.alt_text||''});renderPfGallery();productMarkDirty();};
 $('#pf-open-media').onclick=function(){switchView('media');renderMediaLibrary();};
 $('#pf-preview').onclick=productPreviewCurrent;$('#pf-draft').onclick=function(){productSaveDraft(false);};$('#pf-publish').onclick=function(){productSaveDraft(true);};$('#pf-cancel').onclick=function(){editingId=null;switchView('products');renderAdminRows();};
}

function productMarkDirty(){productState.previewSignature='';productSetFormStatus('Değişiklikleri kaydetmeden önce önizlemeyi yeniden açın.',false);}
function renderPfGallery(){
 var box=$('#pf-gallery');if(!box)return;box.innerHTML='';if(!pfGallery.length){box.innerHTML='<div class="product-empty">Henüz görsel seçilmedi.</div>';return;}
 pfGallery.forEach(function(image,index){var asset=productAsset(image.media_id),url=productPublicUrl(asset),card=el('div','product-gallery-item'+(index===0?' primary':''));card.innerHTML=(url?'<img src="'+esc(url)+'" alt="'+esc(image.alt_text||'Ürün görseli')+'">':'<div class="product-image-placeholder">Görsel yok</div>')+'<div class="product-gallery-fields"><span>'+(index===0?'Ana görsel':'Galeri '+(index+1))+'</span><input type="text" value="'+esc(image.alt_text||'')+'" placeholder="Alt metin" aria-label="Görsel alt metni"><div><button type="button" class="a-btn" data-gallery-up '+(index===0?'disabled':'')+' aria-label="Görseli yukarı taşı">↑</button><button type="button" class="a-btn" data-gallery-down '+(index===pfGallery.length-1?'disabled':'')+' aria-label="Görseli aşağı taşı">↓</button><button type="button" class="a-btn" data-gallery-primary '+(index===0?'disabled':'')+'>Ana yap</button><button type="button" class="a-btn media-danger" data-gallery-remove>Kaldır</button></div></div>';
  card.querySelector('input').oninput=function(){image.alt_text=this.value;productMarkDirty();};card.querySelector('[data-gallery-up]').onclick=function(){var moved=pfGallery.splice(index,1)[0];pfGallery.splice(index-1,0,moved);renderPfGallery();productMarkDirty();};card.querySelector('[data-gallery-down]').onclick=function(){var moved=pfGallery.splice(index,1)[0];pfGallery.splice(index+1,0,moved);renderPfGallery();productMarkDirty();};card.querySelector('[data-gallery-primary]').onclick=function(){var moved=pfGallery.splice(index,1)[0];pfGallery.unshift(moved);renderPfGallery();productMarkDirty();};card.querySelector('[data-gallery-remove]').onclick=function(){pfGallery.splice(index,1);renderPfGallery();productMarkDirty();};box.appendChild(card);
 });
}

function productPayloadFromForm(){
 return{name:$('#pf-name').value.trim(),slug:productSlug($('#pf-slug').value),sku:$('#pf-sku').value.trim().toUpperCase(),category_id:$('#pf-category').value?Number($('#pf-category').value):'',short_description:$('#pf-short-description').value.trim(),description:$('#pf-description').value.trim(),price:$('#pf-price').value===''?'':Number($('#pf-price').value),is_price_visible:$('#pf-price-visible').checked,is_quote_only:$('#pf-quote-only').checked,min_quantity:Number($('#pf-min-quantity').value)||0,quantity_step:Number($('#pf-quantity-step').value)||0,is_featured:$('#pf-featured').checked,sort_order:Number($('#pf-sort-order').value)||0,seo_title:$('#pf-seo-title').value.trim(),seo_description:$('#pf-seo-description').value.trim(),collection_ids:$all('.pf-collection:checked').map(function(input){return Number(input.value);}),images:pfGallery.map(function(image){return{media_id:Number(image.media_id),alt_text:String(image.alt_text||'').trim()};})};
}
function productValidate(payload,publish){
 if(!payload.name)return'Ürün adı zorunludur.';if(!payload.min_quantity||payload.min_quantity<1)return'Minimum adet 1 veya daha büyük olmalıdır.';if(!payload.quantity_step||payload.quantity_step<1)return'Adet artışı 1 veya daha büyük olmalıdır.';if(payload.price!==''&&payload.price<0)return'Fiyat negatif olamaz.';if(payload.is_price_visible&&!payload.is_quote_only&&payload.price==='')return'Fiyat görünürken fiyat alanı boş bırakılamaz.';
 if(publish){if(!payload.slug||!payload.sku||!payload.category_id)return'Yayınlamak için slug, SKU ve kategori zorunludur.';if(!payload.images.length)return'Yayınlamak için ana görsel zorunludur.';if(payload.images.some(function(image){return!image.alt_text;}))return'Tüm görsellerin alt metni zorunludur.';}return'';
}

function productPreviewMarkup(payload){var image=payload.images[0],asset=image&&productAsset(image.media_id),url=productPublicUrl(asset),price=payload.is_quote_only?'Özel fiyat teklifi':payload.is_price_visible?productMoney(payload.price):'Fiyat için iletişime geçin';return'<div class="product-preview-layout"><section><h3>Kart önizlemesi</h3><article class="product-preview-card">'+(url?'<img src="'+esc(url)+'" alt="'+esc(image.alt_text)+'">':'<div class="product-preview-no-image">Görsel seçilmedi</div>')+'<div><small>'+esc(productCategoryName(payload.category_id))+'</small><h4>'+esc(payload.name||'Ürün adı')+'</h4><strong>'+esc(price)+'</strong></div></article></section><section><h3>Detay modalı önizlemesi</h3><article class="product-preview-detail">'+(url?'<img src="'+esc(url)+'" alt="'+esc(image.alt_text)+'">':'<div class="product-preview-no-image">Görsel seçilmedi</div>')+'<div><small>'+esc(payload.sku||'SKU')+'</small><h4>'+esc(payload.name||'Ürün adı')+'</h4><p>'+esc(payload.description||payload.short_description||'Ürün açıklaması')+'</p><strong>'+esc(price)+'</strong><span>Minimum '+payload.min_quantity+' adet · '+payload.quantity_step+' adet artış</span></div></article></section></div>';}
function productOpenPreview(payload){var dialog=adminOpenDialog({overlayClass:'product-preview-modal',dialogClass:'product-preview-dialog',labelledBy:'product-preview-title',html:'<button class="pm-close" type="button" aria-label="Önizlemeyi kapat">✕</button><h2 id="product-preview-title">Mobil ve Masaüstü Ürün Önizlemesi</h2><div class="product-preview-modes"><button class="a-btn primary" data-preview-mode="desktop" type="button">Masaüstü</button><button class="a-btn" data-preview-mode="mobile" type="button">Mobil</button></div><div class="product-preview-canvas desktop">'+productPreviewMarkup(payload)+'</div><button class="admin-save" data-preview-approve type="button">Önizlemeyi Onayla</button>'});var modal=dialog.root,canvas=modal.querySelector('.product-preview-canvas');$all('[data-preview-mode]',modal).forEach(function(button){button.onclick=function(){$all('[data-preview-mode]',modal).forEach(function(item){item.classList.toggle('primary',item===button);});canvas.className='product-preview-canvas '+button.dataset.previewMode;};});modal.querySelector('.pm-close').onclick=function(){dialog.close(false);};modal.querySelector('[data-preview-approve]').onclick=function(){productState.previewSignature=productSignature(payload);productSetFormStatus('Önizleme onaylandı. Taslak kaydedebilir veya yayınlayabilirsiniz.',false);dialog.close(true);};}
function productPreviewCurrent(){var payload=productPayloadFromForm(),error=productValidate(payload,false);if(error){productSetFormStatus(error,true);return;}productOpenPreview(payload);}
function productPreviewFromList(id){productOpenForm(id,false).then(function(){productPreviewCurrent();});}

async function productSaveDraft(publish){
 var payload=productPayloadFromForm(),error=productValidate(payload,publish);if(error){productSetFormStatus(error,true);return;}if(productState.previewSignature!==productSignature(payload)){productSetFormStatus('Kaydetmeden önce güncel önizlemeyi açıp onaylayın.',true);productOpenPreview(payload);return;}
 var buttons=$all('#pf-draft,#pf-publish');buttons.forEach(function(button){button.disabled=true;});productSetFormStatus(publish?'Ürün yayınlanıyor…':'Taslak kaydediliyor…',false);
 try{
  var client=await productClient(),saved=await client.rpc('save_product_draft',{p_product_id:productState.form.productId,p_payload:payload}).single();if(saved.error)throw saved.error;productState.form.productId=saved.data.product_id;productState.form.draftId=saved.data.draft_id;
  if(publish){var published=await client.rpc('publish_product_draft',{p_draft_id:saved.data.draft_id});if(published.error)throw published.error;toast('Ürün yayınlandı.');}else toast('Ürün taslak olarak kaydedildi.');
  editingId=null;productState.page=1;await productInitialize(true);switchView('products');
 }catch(saveError){adminShowInlineError($('#product-form-status'),(publish?'Yayınlama':'Taslak kaydı')+' başarısız. Mevcut canlı içerik değiştirilmedi. ',saveError);}
 finally{buttons.forEach(function(button){button.disabled=false;});}
}

function editProduct(id){editingId=id;productOpenForm(id,false);}
async function productUnpublish(id){if(!(await confirmDialog({title:'Ürünü yayından kaldır',message:'Ziyaretçiler ürünü artık görmeyecek.',confirmText:'Yayından Kaldır'})))return;try{var client=await productClient(),result=await client.from('products').update({is_active:false}).eq('id',id).select('id').single();if(result.error)throw result.error;toast('Ürün yayından kaldırıldı.');await productInitialize(true);}catch(error){errorDialog({title:'Ürün yayından kaldırılamadı',error:error});}}
async function productArchive(id){if(!(await confirmDialog({title:'Ürünü arşivle',message:'Ürün silinmeyecek ve ziyaretçilere görünmeyecek.',confirmText:'Arşivle'})))return;try{var client=await productClient(),result=await client.from('products').update({is_active:false,archived_at:new Date().toISOString()}).eq('id',id).select('id').single();if(result.error)throw result.error;toast('Ürün arşivlendi.');await productInitialize(true);}catch(error){errorDialog({title:'Ürün arşivlenemedi',error:error});}}
async function productRestore(id){try{var client=await productClient(),result=await client.from('products').update({is_active:false,archived_at:null}).eq('id',id).select('id').single();if(result.error)throw result.error;toast('Ürün arşivden çıkarıldı ve yayında değil durumuna alındı.');await productInitialize(true);}catch(error){errorDialog({title:'Ürün arşivden çıkarılamadı',error:error});}}
async function productDeleteEmptyDraft(id){if(!adminIsOwner())return;if(!(await confirmDialog({title:'Boş taslağı sil',message:'Hiç yayınlanmamış boş taslak kalıcı olarak silinecek. Bu işlem geri alınamaz.',confirmText:'Taslağı Sil',danger:true})))return;try{var client=await productClient(),result=await client.rpc('delete_empty_product_draft',{p_product_id:id});if(result.error)throw result.error;toast('Boş taslak silindi.');await productInitialize(true);}catch(error){errorDialog({title:'Taslak silinemedi',error:error});}}

window.__productAdminTest={slug:productSlug,validate:productValidate,signature:productSignature,isEmptyDraft:productIsEmptyDraft};
