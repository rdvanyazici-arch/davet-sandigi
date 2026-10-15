/* Admin image preparation utilities. */
function resizeImage(file,cb){var rd=new FileReader();rd.onload=function(){var img=new Image();img.onload=function(){var mx=1000,w=img.width,h=img.height;if(w>mx||h>mx){if(w>h){h=Math.round(h*mx/w);w=mx;}else{w=Math.round(w*mx/h);h=mx;}}var cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);var durl;try{durl=cv.toDataURL('image/jpeg',0.82);}catch(e){alert('Görsel yüklenemedi.');return;}if(FB&&fbUser&&typeof toast==='function')toast('Görsel yükleniyor…');uploadImage(durl).then(cb);};img.src=rd.result;};rd.readAsDataURL(file);}

var MEDIA_BUCKET='site-media';
var MEDIA_MAX_BYTES=6*1024*1024;
var MEDIA_MAX_EDGE=12000;
var MEDIA_WEBP_EDGE=2400;
var MEDIA_TYPES=['image/jpeg','image/png','image/webp'];
var MEDIA_ENTITY_USAGE={product:'products',collection:'collections',banner:'banners',testimonial:'testimonials'};
var MEDIA_ROOTS={product:'products',collection:'collections',banner:'banners',story:'story',testimonial:'testimonials',campaign:'campaigns',brand:'brand'};
var mediaState={client:null,assets:[],usages:{},selected:null,previewUrl:'',replaceId:null,loading:false};

function mediaClient(){return new Promise(function(resolve,reject){if(mediaState.client){resolve(mediaState.client);return;}startSupabaseClient(function(client,error){if(error||!client){reject(new Error(error||'Supabase bağlantısı kurulamadı.'));return;}mediaState.client=client;resolve(client);});});}
function mediaErrorMessage(error){return(error&&error.message)?error.message:String(error||'Bilinmeyen hata');}
function mediaSetStatus(message,isError){var node=$('#media-library-status');if(!node)return;node.textContent=message||'';node.classList.toggle('media-error',!!isError);}
function mediaSetValidation(message,isError){var node=$('#media-validation');if(!node)return;node.textContent=message||'';node.classList.toggle('media-error',!!isError);}
function mediaHumanSize(bytes){var n=Number(bytes)||0;if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(2)+' MB';}
function mediaDate(value){if(!value)return'—';try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(value));}catch(e){return value;}}
function mediaSlug(value){return String(value||'gorsel').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'gorsel';}
function mediaUsageLabel(value){return{product:'Ürün',collection:'Koleksiyon',banner:'Banner',story:'Hikâye',testimonial:'Yorum',campaign:'Kampanya',brand:'Marka'}[value]||value;}
function mediaEscape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
function mediaPublicUrl(asset){if(!mediaState.client)return'';return mediaState.client.storage.from(MEDIA_BUCKET).getPublicUrl(asset.storage_path).data.publicUrl;}
function mediaNeedsId(usage){return!!MEDIA_ENTITY_USAGE[usage];}
function mediaRequiresId(usage){return mediaNeedsId(usage)&&usage!=='product';}

function mediaWireControls(){
 var file=$('#media-file');if(!file||file.dataset.wired)return;file.dataset.wired='true';
 file.addEventListener('change',function(){mediaPrepareFile(file.files&&file.files[0]);});
 $('#media-usage').addEventListener('change',mediaToggleRelated);
 $('#media-alt').addEventListener('input',mediaUpdateUploadState);
 $('#media-related-id').addEventListener('input',mediaUpdateUploadState);
 $('#media-upload').addEventListener('click',mediaUploadSelected);
 $('#media-filter').addEventListener('change',mediaDrawLibrary);
 $('#media-refresh').addEventListener('click',renderMediaLibrary);
 $('#media-replace-cancel').addEventListener('click',mediaCancelReplace);
 mediaToggleRelated();
}
function mediaToggleRelated(){var usage=$('#media-usage').value,wrap=$('#media-related-wrap'),input=$('#media-related-id'),optional=$('#media-related-optional');wrap.classList.toggle('media-hidden',!mediaNeedsId(usage));input.required=mediaRequiresId(usage);if(optional)optional.textContent=usage==='product'?'(isteğe bağlı)':'';mediaUpdateUploadState();}
function mediaUpdateUploadState(){var button=$('#media-upload');if(!button)return;var needsId=mediaRequiresId($('#media-usage').value),hasId=Number($('#media-related-id').value)>0;button.disabled=!mediaState.selected||!$('#media-alt').value.trim()||(needsId&&!hasId&&!mediaState.replaceId)||mediaState.loading;}
function mediaClearPreview(){if(mediaState.previewUrl)URL.revokeObjectURL(mediaState.previewUrl);mediaState.previewUrl='';mediaState.selected=null;var box=$('#media-local-preview');if(box){box.innerHTML='';box.classList.add('media-hidden');}var file=$('#media-file');if(file)file.value='';mediaUpdateUploadState();}
function mediaCancelReplace(){mediaState.replaceId=null;var cancel=$('#media-replace-cancel');if(cancel)cancel.classList.add('media-hidden');var button=$('#media-upload');if(button)button.textContent='WebP Olarak Yükle';mediaClearPreview();mediaSetValidation('',false);}

async function mediaReadImage(file){var url=URL.createObjectURL(file);try{return await new Promise(function(resolve,reject){var image=new Image();image.onload=function(){resolve({image:image,width:image.naturalWidth,height:image.naturalHeight});};image.onerror=function(){reject(new Error('Dosya geçerli bir görsel olarak okunamadı.'));};image.src=url;});}finally{URL.revokeObjectURL(url);}}
async function mediaHash(file){var buffer=await file.arrayBuffer();var digest=await crypto.subtle.digest('SHA-256',buffer);return Array.from(new Uint8Array(digest)).map(function(value){return value.toString(16).padStart(2,'0');}).join('');}
async function mediaToWebp(file,imageInfo){var scale=Math.min(1,MEDIA_WEBP_EDGE/Math.max(imageInfo.width,imageInfo.height));var width=Math.max(1,Math.round(imageInfo.width*scale)),height=Math.max(1,Math.round(imageInfo.height*scale));var canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;var context=canvas.getContext('2d',{alpha:false});context.fillStyle='#fff';context.fillRect(0,0,width,height);context.drawImage(imageInfo.image,0,0,width,height);var blob=await new Promise(function(resolve,reject){canvas.toBlob(function(result){if(result)resolve(result);else reject(new Error('WebP türevi oluşturulamadı.'));},'image/webp',0.86);});return{blob:blob,width:width,height:height};}
async function mediaPrepareFile(file){
 mediaClearPreview();mediaSetValidation('',false);if(!file)return;
 try{
  if(MEDIA_TYPES.indexOf(file.type)===-1)throw new Error('Dosyanın gerçek MIME türü JPEG, PNG veya WebP olmalıdır. SVG kabul edilmez.');
  if(file.size>MEDIA_MAX_BYTES)throw new Error('Dosya 6 MiB sınırını aşıyor.');if(!file.size)throw new Error('Boş dosya yüklenemez.');
  var info=await mediaReadImage(file);if(!info.width||!info.height||info.width>MEDIA_MAX_EDGE||info.height>MEDIA_MAX_EDGE)throw new Error('Görsel çözünürlüğü geçersiz veya 12.000 piksel sınırını aşıyor.');
  var converted=await mediaToWebp(file,info),hash=await mediaHash(file);mediaState.selected={original:file,blob:converted.blob,hash:hash,width:converted.width,height:converted.height,originalWidth:info.width,originalHeight:info.height};mediaState.previewUrl=URL.createObjectURL(converted.blob);
  var box=$('#media-local-preview');box.classList.remove('media-hidden');box.innerHTML='<div class="media-preview-label">Yerel önizleme · '+info.width+'×'+info.height+' → '+converted.width+'×'+converted.height+' WebP · '+mediaHumanSize(converted.blob.size)+'</div>'+mediaPreviewMarkup(mediaState.previewUrl,$('#media-alt').value||'Seçilen görsel');mediaSetValidation('Dosya doğrulandı. Yüklemeden önce alt metni ve kullanım alanını kontrol edin.',false);
 }catch(error){mediaClearPreview();mediaSetValidation(mediaErrorMessage(error),true);}mediaUpdateUploadState();
}
function mediaPreviewMarkup(url,alt){return'<div class="media-ratio-previews"><figure class="media-preview-card"><img src="'+mediaEscape(url)+'" alt="'+mediaEscape(alt)+'"><figcaption>Kart · 4:5</figcaption></figure><figure class="media-preview-hero"><img src="'+mediaEscape(url)+'" alt="'+mediaEscape(alt)+'"><figcaption>Masaüstü hero · 16:7</figcaption></figure><figure class="media-preview-mobile"><img src="'+mediaEscape(url)+'" alt="'+mediaEscape(alt)+'"><figcaption>Mobil hero · 4:5</figcaption></figure></div>';}

async function mediaUploadSelected(){
 if(!mediaState.selected)return;var usage=$('#media-usage').value,relatedId=Number($('#media-related-id').value)||null,alt=$('#media-alt').value.trim();
 if(!alt){mediaSetValidation('Alt metin zorunludur.',true);return;}if(mediaRequiresId(usage)&&!relatedId&&!mediaState.replaceId){mediaSetValidation('Bu kullanım alanı için bağlı kayıt kimliği zorunludur.',true);return;}
 mediaState.loading=true;mediaUpdateUploadState();mediaSetValidation('Yönetici oturumu ve tekrar kontrol ediliyor…',false);
 try{
  var client=await mediaClient(),sessionResult=await client.auth.getSession(),session=sessionResult.data.session;if(!session)throw new Error('Yükleme için Supabase yönetici oturumu gerekir. Bu giriş Faz 6’da etkinleştirilecek.');
  var duplicate=await client.from('media_assets').select('id,original_name').eq('file_hash',mediaState.selected.hash).maybeSingle();if(duplicate.error)throw duplicate.error;if(duplicate.data)throw new Error('Bu dosya daha önce yüklendi: '+duplicate.data.original_name);
  var root=MEDIA_ROOTS[usage],oldAsset=mediaState.replaceId?mediaState.assets.filter(function(asset){return asset.id===mediaState.replaceId;})[0]:null,folder=oldAsset?oldAsset.storage_path.split('/').slice(0,-1).join('/'):root+(mediaNeedsId(usage)?'/'+relatedId:'');var path=folder+'/'+mediaState.selected.hash.slice(0,16)+'-'+mediaSlug(mediaState.selected.original.name.replace(/\.[^.]+$/,''))+'.webp';mediaSetValidation('WebP dosyası yükleniyor…',false);
  var upload=await client.storage.from(MEDIA_BUCKET).upload(path,mediaState.selected.blob,{contentType:'image/webp',upsert:false,cacheControl:'3600'});if(upload.error)throw upload.error;
  var row={storage_path:path,original_name:mediaState.selected.original.name,mime_type:'image/webp',file_size:mediaState.selected.blob.size,width:mediaState.selected.width,height:mediaState.selected.height,alt_text:alt,usage_type:usage,status:'active',created_by:session.user.id,file_hash:mediaState.selected.hash};var inserted=await client.from('media_assets').insert(row).select().single();
  if(inserted.error){await client.storage.from(MEDIA_BUCKET).remove([path]);throw inserted.error;}
  try{if(mediaState.replaceId)await mediaFinishReplacement(client,mediaState.replaceId,inserted.data.id);else await mediaLinkAsset(client,inserted.data,usage,relatedId);}catch(linkError){mediaSetValidation('Görsel yüklendi fakat bağlantı tamamlanamadı: '+mediaErrorMessage(linkError),true);await renderMediaLibrary();return;}
  mediaSetValidation('Görsel güvenli biçimde yüklendi ve kaydedildi.',false);mediaCancelReplace();$('#media-alt').value='';$('#media-related-id').value='';await renderMediaLibrary();
 }catch(error){mediaSetValidation(mediaErrorMessage(error),true);}finally{mediaState.loading=false;mediaUpdateUploadState();}
}

async function mediaLinkAsset(client,asset,usage,relatedId){
 var result;
 if(usage==='product'&&relatedId){
  var existing=await client.from('product_images').select('id',{count:'exact',head:true}).eq('product_id',relatedId);if(existing.error)throw existing.error;
  result=await client.from('product_images').insert({product_id:relatedId,media_id:asset.id,alt_text:asset.alt_text,sort_order:existing.count||0,is_primary:(existing.count||0)===0});
 }else if(usage==='product')result={error:null};
 else if(usage==='collection')result=await client.from('collections').update({cover_media_id:asset.id}).eq('id',relatedId);
 else if(usage==='banner')result=await client.from('banners').update({media_id:asset.id}).eq('id',relatedId);
 else if(usage==='testimonial')result=await client.from('testimonials').update({media_id:asset.id}).eq('id',relatedId);
 else result={error:null};
 if(result.error)throw result.error;
}
async function mediaFinishReplacement(client,oldId,newId){
 var oldAsset=mediaState.assets.filter(function(asset){return asset.id===oldId;})[0];if(!oldAsset)return;
 var results=await Promise.all([
  client.from('product_images').update({media_id:newId}).eq('media_id',oldId),
  client.from('collections').update({cover_media_id:newId}).eq('cover_media_id',oldId),
  client.from('banners').update({media_id:newId}).eq('media_id',oldId),
  client.from('content_sections').update({media_id:newId}).eq('media_id',oldId),
  client.from('testimonials').update({media_id:newId}).eq('media_id',oldId)
 ]);
 var failed=results.filter(function(result){return result.error;})[0];if(failed)throw failed.error;
 await mediaArchiveAsset(oldAsset,true,true);mediaState.replaceId=null;
}
async function mediaLoadUsages(client){
 var queries=await Promise.all([
  client.from('product_images').select('media_id,product_id,products(name)'),
  client.from('collections').select('id,name,cover_media_id').not('cover_media_id','is',null),
  client.from('banners').select('id,title,media_id').not('media_id','is',null),
  client.from('content_sections').select('id,title,section_key,media_id').not('media_id','is',null),
  client.from('testimonials').select('id,customer_display_name,media_id').not('media_id','is',null)
 ]);
 var map={};function add(mediaId,label){if(!mediaId)return;(map[mediaId]||(map[mediaId]=[])).push(label);}queries.forEach(function(result){if(result.error)throw result.error;});
 (queries[0].data||[]).forEach(function(row){add(row.media_id,'Ürün: '+((row.products&&row.products.name)||'#'+row.product_id));});
 (queries[1].data||[]).forEach(function(row){add(row.cover_media_id,'Koleksiyon: '+(row.name||'#'+row.id));});
 (queries[2].data||[]).forEach(function(row){add(row.media_id,'Banner: '+(row.title||'#'+row.id));});
 (queries[3].data||[]).forEach(function(row){add(row.media_id,'İçerik: '+(row.title||row.section_key||'#'+row.id));});
 (queries[4].data||[]).forEach(function(row){add(row.media_id,'Yorum: '+(row.customer_display_name||'#'+row.id));});return map;
}
async function renderMediaLibrary(){
 mediaWireControls();if(mediaState.loading)return;mediaState.loading=true;mediaSetStatus('Görsel kütüphanesi yükleniyor…',false);
 try{var client=await mediaClient();var assets=await client.from('media_assets').select('*').order('created_at',{ascending:false});if(assets.error)throw assets.error;mediaState.assets=assets.data||[];mediaState.usages=await mediaLoadUsages(client);mediaSetStatus(mediaState.assets.length+' görsel bulundu.',false);mediaDrawLibrary();}
 catch(error){mediaSetStatus('Kütüphane yüklenemedi: '+mediaErrorMessage(error),true);var box=$('#media-library');if(box)box.innerHTML='<div class="media-empty">Supabase bağlantısını ve yönetici oturumunu kontrol edin.</div>';}
 finally{mediaState.loading=false;mediaUpdateUploadState();}
}
function mediaFilteredAssets(){var filter=$('#media-filter').value;return mediaState.assets.filter(function(asset){var used=(mediaState.usages[asset.id]||[]).length>0;if(filter==='all')return true;if(filter==='used')return used;if(filter==='unused')return!used;if(filter==='archived')return asset.status==='archived';return asset.usage_type===filter;});}
function mediaDrawLibrary(){
 var box=$('#media-library');if(!box)return;box.innerHTML='';var assets=mediaFilteredAssets();if(!assets.length){box.innerHTML='<div class="media-empty">Bu filtreye uygun görsel yok.</div>';return;}
 assets.forEach(function(asset){var usages=mediaState.usages[asset.id]||[],used=usages.length>0,url=mediaPublicUrl(asset),card=el('article','media-card');
  card.innerHTML='<img class="media-card-image" src="'+mediaEscape(url)+'" alt="'+mediaEscape(asset.alt_text)+'"><div class="media-card-body"><div class="media-card-title"><strong>'+mediaEscape(asset.original_name)+'</strong><span class="badge '+(asset.status==='active'?'feat':'hid')+'">'+(asset.status==='active'?'Aktif':'Arşiv')+'</span></div><dl><div><dt>Kullanım</dt><dd>'+mediaEscape(mediaUsageLabel(asset.usage_type))+'</dd></div><div><dt>Bağlı alan</dt><dd>'+mediaEscape(usages.join(', ')||'Kullanılmıyor')+'</dd></div><div><dt>Ölçü</dt><dd>'+asset.width+'×'+asset.height+' px</dd></div><div><dt>Boyut</dt><dd>'+mediaHumanSize(asset.file_size)+'</dd></div><div><dt>Tür</dt><dd>'+mediaEscape(asset.mime_type)+'</dd></div><div><dt>Alt metin</dt><dd>'+mediaEscape(asset.alt_text)+'</dd></div><div><dt>Yükleme</dt><dd>'+mediaDate(asset.created_at)+'</dd></div></dl><div class="media-card-actions"><button class="a-btn" data-media-preview="'+asset.id+'">Önizle</button><button class="a-btn" data-media-usage="'+asset.id+'">Kullanıldığı Yerler</button>'+(asset.status==='active'?'<button class="a-btn" data-media-replace="'+asset.id+'">Değiştir</button>':'')+(asset.status==='active'&&!used?'<button class="a-btn" data-media-archive="'+asset.id+'">Arşivle</button>':'')+(asset.status==='archived'&&!used?'<button class="a-btn media-danger" data-media-delete="'+asset.id+'">Kalıcı Sil</button>':'')+'</div>'+(used&&asset.status==='active'?'<p class="media-lock-note">Kullanıldığı için arşivleme ve kalıcı silme kapalıdır.</p>':'')+'</div>';box.appendChild(card);
 });
 $all('[data-media-preview]',box).forEach(function(button){button.onclick=function(){mediaShowPreview(Number(button.getAttribute('data-media-preview')));};});
 $all('[data-media-usage]',box).forEach(function(button){button.onclick=function(){var id=Number(button.getAttribute('data-media-usage')),items=mediaState.usages[id]||[];alert(items.length?items.join('\n'):'Bu görsel kullanılmıyor.');};});
 $all('[data-media-replace]',box).forEach(function(button){button.onclick=function(){mediaStartReplace(Number(button.getAttribute('data-media-replace')));};});
 $all('[data-media-archive]',box).forEach(function(button){button.onclick=function(){var asset=mediaState.assets.filter(function(item){return item.id===Number(button.getAttribute('data-media-archive'));})[0];mediaArchiveAsset(asset,false).catch(function(error){alert(mediaErrorMessage(error));});};});
 $all('[data-media-delete]',box).forEach(function(button){button.onclick=function(){var asset=mediaState.assets.filter(function(item){return item.id===Number(button.getAttribute('data-media-delete'));})[0];mediaDeleteAsset(asset);};});
}
function mediaShowPreview(id){var asset=mediaState.assets.filter(function(item){return item.id===id;})[0];if(!asset)return;var modal=document.createElement('div');modal.className='media-preview-modal';modal.innerHTML='<div class="media-preview-dialog"><button class="pm-close" aria-label="Önizlemeyi kapat">✕</button><h2>Mobil ve Masaüstü Önizleme</h2>'+mediaPreviewMarkup(mediaPublicUrl(asset),asset.alt_text)+'</div>';modal.querySelector('.pm-close').onclick=function(){modal.remove();};modal.onclick=function(event){if(event.target===modal)modal.remove();};document.body.appendChild(modal);}
function mediaStartReplace(id){var asset=mediaState.assets.filter(function(item){return item.id===id;})[0];if(!asset)return;mediaState.replaceId=id;$('#media-alt').value=asset.alt_text||'';$('#media-usage').value=asset.usage_type;var pathParts=asset.storage_path.split('/');$('#media-related-id').value=(pathParts.length>2&&/^\d+$/.test(pathParts[1]))?pathParts[1]:'';$('#media-replace-cancel').classList.remove('media-hidden');$('#media-upload').textContent='Yeni Görselle Değiştir';mediaToggleRelated();$('#media-file').click();mediaSetValidation('Yeni dosyayı seçin. Bağlantılar yeni görsele aktarılacak, eski görsel arşivlenecek.',false);}
async function mediaArchiveAsset(asset,silent,usageAlreadyMoved){
 if(!asset)return;var usages=mediaState.usages[asset.id]||[];if(usages.length&&!usageAlreadyMoved)throw new Error('Kullanımdaki görsel arşivlenemez.');if(!silent&&!confirm('Bu görsel arşive taşınsın mı?'))return;
 var client=await mediaClient(),archivePath='archive/'+asset.storage_path;var moved=await client.storage.from(MEDIA_BUCKET).move(asset.storage_path,archivePath);if(moved.error)throw moved.error;
 var updated=await client.from('media_assets').update({storage_path:archivePath,status:'archived',archived_at:new Date().toISOString()}).eq('id',asset.id).select().single();if(updated.error){await client.storage.from(MEDIA_BUCKET).move(archivePath,asset.storage_path);throw updated.error;}if(!silent){toast('Görsel arşivlendi.');await renderMediaLibrary();}
}
async function mediaDeleteAsset(asset){
 if(!asset||asset.status!=='archived'||(mediaState.usages[asset.id]||[]).length)return;if(!confirm('Arşivlenmiş görsel kalıcı olarak silinecek. Devam edilsin mi?'))return;if(!confirm('Bu işlem geri alınamaz. Kalıcı silmeyi ikinci kez onaylıyor musunuz?'))return;
 try{var client=await mediaClient();var removedRow=await client.from('media_assets').delete().eq('id',asset.id).select('id').single();if(removedRow.error)throw removedRow.error;var removedFile=await client.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);if(removedFile.error)throw new Error('Kayıt silindi ancak Storage dosyası silinemedi: '+removedFile.error.message);toast('Görsel kalıcı olarak silindi.');await renderMediaLibrary();}catch(error){alert(mediaErrorMessage(error));}
}
