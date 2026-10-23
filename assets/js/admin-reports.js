/* RLS-backed catalogue reports. No customer or traffic data is collected. */
var adminReportsState={selected:'',rows:[],columns:[],loading:false,generated:false,run:0,fileType:'csv',fileName:'',backup:null,dateFrom:'',dateTo:'',orientation:'portrait'};
var ADMIN_REPORT_BATCH=1000;
var ADMIN_REPORTS={
 price:{title:'Fiyat listesi',description:'Yayındaki ürünlerin fiyat ve adet kuralları.'},
 missing:{title:'Eksik içerik',description:'Yayın kalitesini etkileyen katalog eksikleri.'},
 media:{title:'Görsel kullanımı',description:'Görsellerin kullanıldığı yerler ve arşiv durumu.'},
 audit:{title:'Değişiklik geçmişi',description:'Yönetici işlemleri ve güvenli değişiklik özetleri.'},
 backup:{title:'Katalog yedeği',description:'Katalog verilerinin tek JSON dosyasında taşınabilir kopyası.'},
 monthly:{title:'Aylık özet',description:'Katalog sayıları ve sağlık özeti; trafik verisi içermez.'}
};

function adminReportsDate(value){if(!value)return'—';try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(error){return String(value);}}
function adminReportsStatus(message,error){var node=$('#reports-status');if(!node)return;node.textContent=message||'';node.classList.toggle('media-error',!!error);}
function adminReportsCancelled(run){return run!==adminReportsState.run;}
function adminReportsProgress(run,label,count){if(adminReportsCancelled(run))throw new DOMException('Rapor iptal edildi.','AbortError');adminReportsStatus(label+' · '+Number(count||0).toLocaleString('tr-TR')+' kayıt alındı…');}
async function adminReportsFetch(table,columns,run,configure){
 var rows=[],offset=0;
 while(true){
  if(adminReportsCancelled(run))throw new DOMException('Rapor iptal edildi.','AbortError');
  var query=adminAuthClient.from(table).select(columns);if(configure)query=configure(query);query=query.range(offset,offset+ADMIN_REPORT_BATCH-1);
  var result=await query;if(result.error)throw result.error;var batch=result.data||[];rows=rows.concat(batch);adminReportsProgress(run,table,rows.length);
  if(batch.length<ADMIN_REPORT_BATCH)break;offset+=ADMIN_REPORT_BATCH;
 }
 return rows;
}
function adminReportsCategoryMap(rows){var map={};(rows||[]).forEach(function(row){map[row.id]=row.name||'—';});return map;}
function adminReportsDownload(content,type,name){
 var blob=new Blob([content],{type:type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(function(){URL.revokeObjectURL(url);},0);
}
function adminReportsPriceColumns(){return[
 {label:'Ürün',key:'name'},{label:'SKU',key:'sku'},{label:'Kategori',key:'category'},
 {label:'Fiyat',value:function(row){return row.is_quote_only?'Teklif':AdminReportUtils.price(row.price);}},{label:'Minimum adet',key:'min_quantity'},{label:'Adet artışı',key:'quantity_step'}
];}
async function adminReportsPrice(run){
 var results=await Promise.all([
  adminReportsFetch('products','id,name,sku,category_id,price,is_price_visible,is_quote_only,min_quantity,quantity_step,is_active,archived_at',run,function(q){return q.eq('is_active',true).is('archived_at',null);}),
  adminReportsFetch('categories','id,name',run)
 ]),categories=adminReportsCategoryMap(results[1]);
 return{rows:results[0].map(function(row){return Object.assign({},row,{category:categories[row.category_id]||'—',price:row.is_price_visible?row.price:null});}).sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''),'tr');}),columns:adminReportsPriceColumns()};
}
async function adminReportsMissing(run){
 var results=await Promise.all([
  adminReportsFetch('products','id,name,sku,description,category_id,is_active,archived_at',run,function(q){return q.is('archived_at',null);}),
  adminReportsFetch('product_images','product_id,media_id,alt_text,is_primary',run),
  adminReportsFetch('media_assets','id,alt_text,status,archived_at',run),
  adminReportsFetch('product_collections','product_id,collection_id',run)
 ]),images=results[1],assets={},collections={};
 results[2].forEach(function(row){assets[row.id]=row;});results[3].forEach(function(row){collections[row.product_id]=true;});
 var rows=[];results[0].forEach(function(product){
  var productImages=images.filter(function(row){return Number(row.product_id)===Number(product.id);}),primary=productImages.find(function(row){var asset=assets[row.media_id];return row.is_primary&&asset&&asset.status==='active'&&!asset.archived_at;}),missing=[];
  if(!primary)missing.push('Ana görsel');
  if(productImages.some(function(row){var asset=assets[row.media_id];return !String(row.alt_text||(asset&&asset.alt_text)||'').trim();}))missing.push('Alt metin');
  if(!String(product.description||'').trim())missing.push('Açıklama');if(!product.category_id)missing.push('Kategori');if(!collections[product.id])missing.push('Koleksiyon');
  if(missing.length)rows.push({id:product.id,name:product.name||'İsimsiz ürün',sku:product.sku||'—',missing:missing.join(', '),priority:!primary?'Yüksek':missing.includes('Alt metin')||missing.includes('Kategori')||missing.includes('Koleksiyon')?'Orta':'Düşük',status:product.is_active?'Yayında':'Yayında değil'});
 });
 return{rows:rows,columns:[{label:'Ürün',key:'name'},{label:'SKU',key:'sku'},{label:'Eksikler',key:'missing'},{label:'Öncelik',key:'priority'},{label:'Durum',key:'status'}]};
}
async function adminReportsMedia(run){
 var results=await Promise.all([
  adminReportsFetch('media_assets','id,storage_path,original_name,mime_type,file_size,width,height,alt_text,usage_type,status,created_at,archived_at',run),
  adminReportsFetch('product_images','media_id,product_id',run),adminReportsFetch('collections','id,name,cover_media_id',run),
  adminReportsFetch('banners','id,title,media_id',run),adminReportsFetch('content_sections','id,title,section_key,media_id',run),
  adminReportsFetch('testimonials','id,customer_display_name,media_id',run)
 ]),usage={};
 function add(id,label){if(!id)return;(usage[id]||(usage[id]=[])).push(label);}
 results[1].forEach(function(row){add(row.media_id,'Ürün #'+row.product_id);});results[2].forEach(function(row){add(row.cover_media_id,'Koleksiyon: '+(row.name||'#'+row.id));});results[3].forEach(function(row){add(row.media_id,'Banner: '+(row.title||'#'+row.id));});results[4].forEach(function(row){add(row.media_id,'İçerik: '+(row.title||row.section_key));});results[5].forEach(function(row){add(row.media_id,'Yorum: '+(row.customer_display_name||'#'+row.id));});
 var rows=results[0].map(function(row){var locations=usage[row.id]||[];return Object.assign({},row,{dimensions:row.width&&row.height?row.width+'×'+row.height:'—',size:row.file_size?Math.round(row.file_size/1024)+' KB':'0 KB',used_at:locations.length?locations.join(' | '):'Kullanılmıyor',unused:locations.length?'Hayır':'Evet',state:row.archived_at||row.status==='archived'?'Arşiv':'Aktif'});});
 return{rows:rows,columns:[{label:'Dosya',key:'original_name'},{label:'Kullanım türü',key:'usage_type'},{label:'Kullanıldığı yerler',key:'used_at'},{label:'Boyut',key:'size'},{label:'Çözünürlük',key:'dimensions'},{label:'Kullanılmayan',key:'unused'},{label:'Durum',key:'state'}]};
}
async function adminReportsAudit(run){
 var rows=await adminReportsFetch('admin_audit_log','id,table_name,row_id,action,actor_id,summary,created_at',run,function(q){if(adminReportsState.dateFrom)q=q.gte('created_at',new Date(adminReportsState.dateFrom+'T00:00:00').toISOString());if(adminReportsState.dateTo)q=q.lte('created_at',new Date(adminReportsState.dateTo+'T23:59:59.999').toISOString());return q.order('created_at',{ascending:false});});
 rows=rows.map(function(row){return Object.assign({},row,{table:typeof adminAuditTableLabel==='function'?adminAuditTableLabel(row.table_name):row.table_name,action_label:typeof adminAuditActionLabel==='function'?adminAuditActionLabel(row.action):row.action,date:adminReportsDate(row.created_at)});});
 return{rows:rows,columns:[{label:'Tablo',key:'table'},{label:'Eylem',key:'action_label'},{label:'Özet',key:'summary'},{label:'Tarih',key:'date'}]};
}
var ADMIN_BACKUP_TABLES={
 products:'id,category_id,slug,sku,name,short_description,description,price,is_price_visible,is_quote_only,min_quantity,quantity_step,is_featured,is_active,sort_order,seo_title,seo_description,created_at,updated_at,archived_at',
 categories:'id,slug,name,code_prefix,description,sort_order,is_active,created_at,updated_at,archived_at',
 collections:'id,slug,name,short_description,cover_media_id,icon_key,sort_order,is_active,created_at,updated_at,archived_at',
 category_collections:'category_id,collection_id,sort_order',product_collections:'product_id,collection_id',product_images:'id,product_id,media_id,alt_text,sort_order,is_primary,created_at',
 banners:'id,eyebrow,title,description,primary_button_text,primary_button_url,secondary_button_text,secondary_button_url,media_id,sort_order,is_active,starts_at,ends_at,created_at,updated_at',
 content_sections:'id,section_key,eyebrow,title,body,button_text,button_url,media_id,content_json,is_active,updated_at',
 faqs:'id,question,answer,sort_order,is_active,created_at,updated_at',testimonials:'id,customer_display_name,event_name,review_text,rating,media_id,consent_confirmed,is_published,sort_order,created_at',
 site_settings:'id,brand_name,whatsapp_number,instagram_url,phone,email,delivery_text,currency_code,default_min_quantity,default_quantity_step,quote_threshold,shipping_note,address_locality,address_region,is_maintenance_mode,updated_at',
 media_assets:'id,storage_path,original_name,mime_type,file_size,width,height,alt_text,usage_type,status,created_at,updated_at,archived_at'
};
async function adminReportsBackup(run){
 var names=Object.keys(ADMIN_BACKUP_TABLES),values=await Promise.all(names.map(function(name){return adminReportsFetch(name,ADMIN_BACKUP_TABLES[name],run);})),data={schema_version:1,exported_at:new Date().toISOString(),project:'Davet Sandığı',notes:['Görsel dosyaları ve Auth kullanıcıları bu yedeğe dahil değildir.','media_assets kayıtları storage_path ve public_url listesi içerir.'],tables:{}};
 names.forEach(function(name,index){data.tables[name]=values[index];});
 data.tables.media_assets=data.tables.media_assets.map(function(row){var publicData=adminAuthClient.storage.from('site-media').getPublicUrl(row.storage_path).data;return Object.assign({},row,{public_url:publicData&&publicData.publicUrl||''});});
 adminReportsState.backup=data;
 return{rows:names.map(function(name){return{table:name,count:data.tables[name].length};}),columns:[{label:'Tablo',key:'table'},{label:'Kayıt sayısı',key:'count'}],fileType:'json'};
}
async function adminReportsMonthly(run){
 adminReportsProgress(run,'Aylık özet',0);var result=await adminAuthClient.rpc('admin_dashboard_summary');if(result.error)throw result.error;var data=result.data||{},products=data.products||{},health=data.health||{},categories=data.categories||{},collections=data.collections||{};
 return{rows:[
  {metric:'Yayındaki ürün',value:products.published||0},{metric:'Taslak',value:products.drafts||0},{metric:'Yayında değil',value:products.unpublished||0},{metric:'Arşiv',value:products.archived||0},{metric:'Toplam ürün',value:products.total||0},{metric:'Katalog sağlığı',value:(health.percentage==null?0:health.percentage)+'%'},{metric:'Kategori',value:categories.total||0},{metric:'Koleksiyon',value:collections.total||0},{metric:'Trafik ve talep',value:'Sonraki adımda eklenecek'}
 ],columns:[{label:'Ölçüm',key:'metric'},{label:'Değer',key:'value'}]};
}
async function adminReportsBuild(key){
 if(adminReportsState.loading)return;adminReportsState.selected=key;adminReportsState.loading=true;adminReportsState.generated=false;adminReportsState.rows=[];adminReportsState.columns=[];adminReportsState.backup=null;adminReportsState.fileType='csv';var run=++adminReportsState.run,slow=setTimeout(function(){if(!adminReportsCancelled(run))adminReportsStatus('Rapor hazırlanıyor. Büyük kataloglarda bu işlem biraz sürebilir…');},2000);adminReportsDrawShell();
 try{
  var loader={price:adminReportsPrice,missing:adminReportsMissing,media:adminReportsMedia,audit:adminReportsAudit,backup:adminReportsBackup,monthly:adminReportsMonthly}[key],result=await loader(run);if(adminReportsCancelled(run))return;
  adminReportsState.rows=result.rows||[];adminReportsState.columns=result.columns||[];adminReportsState.fileType=result.fileType||'csv';adminReportsState.fileName='davet-sandigi-'+key+'-'+AdminReportUtils.dateStamp();adminReportsState.generated=true;adminReportsDrawPreview();adminReportsStatus(adminReportsState.rows.length+' satır hazır.');
 }catch(error){if(error&&error.name==='AbortError'){adminReportsStatus('Rapor oluşturma iptal edildi.');}else{adminReportsStatus('Rapor oluşturulamadı: '+adminErrorText(error),true);$('#reports-preview').innerHTML='<div class="taxonomy-empty media-error">Rapor verileri alınamadı.</div>';}}
 finally{clearTimeout(slow);if(run===adminReportsState.run){adminReportsState.loading=false;adminReportsToggleControls();}}
}
function adminReportsTableHtml(rows,columns){
 if(!rows.length)return'<div class="taxonomy-empty">Bu raporda gösterilecek kayıt yok.</div>';
 return'<div class="admin-table-scroll reports-table-wrap"><table class="admin-data-table reports-table"><caption>'+esc(ADMIN_REPORTS[adminReportsState.selected].title)+'</caption><thead><tr>'+columns.map(function(column){return'<th scope="col">'+esc(column.label)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(row){return'<tr>'+columns.map(function(column){var value=typeof column.value==='function'?column.value(row):row[column.key];return'<td>'+esc(value===null||value===undefined||value===''?'—':value)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
}
function adminReportsDrawPreview(){var node=$('#reports-preview');if(!node)return;node.innerHTML=adminReportsTableHtml(adminReportsState.rows,adminReportsState.columns);adminReportsToggleControls();}
function adminReportsToggleControls(){var ready=adminReportsState.generated;var csv=$('#reports-csv'),print=$('#reports-print'),cancel=$('#reports-cancel');if(csv){csv.disabled=!ready||adminReportsState.loading;csv.textContent=adminReportsState.fileType==='json'?'JSON indir':'CSV indir';}if(print)print.disabled=!ready||adminReportsState.loading;if(cancel)cancel.hidden=!adminReportsState.loading;}
function adminReportsCards(){return Object.keys(ADMIN_REPORTS).map(function(key){var report=ADMIN_REPORTS[key];return'<button class="report-card'+(adminReportsState.selected===key?' selected':'')+'" data-report="'+key+'" type="button"><span>'+esc(report.title)+'</span><small>'+esc(report.description)+'</small></button>';}).join('');}
function adminReportsDrawShell(){
 var box=$('#reports-admin');if(!box)return;box.innerHTML='<div class="report-cards" aria-label="Katalog raporları">'+adminReportsCards()+'</div><section class="pg-panel report-workspace" aria-labelledby="reports-preview-title"><div class="report-toolbar"><div><span>Seçili rapor</span><h2 id="reports-preview-title">'+(adminReportsState.selected?esc(ADMIN_REPORTS[adminReportsState.selected].title):'Rapor seçin')+'</h2></div><div class="report-toolbar-actions"><label id="reports-date-from-wrap"'+(adminReportsState.selected==='audit'?'':' hidden')+'>Başlangıç<input id="reports-date-from" type="date" value="'+esc(adminReportsState.dateFrom)+'"></label><label id="reports-date-to-wrap"'+(adminReportsState.selected==='audit'?'':' hidden')+'>Bitiş<input id="reports-date-to" type="date" value="'+esc(adminReportsState.dateTo)+'"></label><label>Sayfa yönü<select id="reports-orientation"><option value="portrait"'+(adminReportsState.orientation==='portrait'?' selected':'')+'>Dikey</option><option value="landscape"'+(adminReportsState.orientation==='landscape'?' selected':'')+'>Yatay</option></select></label><button class="a-btn" id="reports-generate" type="button"'+(adminReportsState.selected?'':' disabled')+'>Yenile</button><button class="a-btn" id="reports-csv" type="button" disabled>CSV indir</button><button class="a-btn" id="reports-print" type="button" disabled>Yazdır / PDF</button><button class="a-btn media-danger" id="reports-cancel" type="button" hidden>İptal</button></div></div><div id="reports-status" class="admin-note" role="status" aria-live="polite">Bir rapor seçin.</div><div id="reports-preview">'+(adminReportsState.loading?'<div class="taxonomy-loading">Rapor hazırlanıyor…</div>':'<div class="taxonomy-empty">Önizlemek için yukarıdan bir rapor seçin.</div>')+'</div></section>';
 $all('[data-report]',box).forEach(function(button){button.onclick=function(){adminReportsBuild(button.dataset.report);};});
 $('#reports-cancel').onclick=function(){adminReportsState.run++;adminReportsState.loading=false;adminReportsStatus('Rapor oluşturma iptal edildi.');adminReportsToggleControls();};
 $('#reports-date-from').onchange=function(){adminReportsState.dateFrom=this.value;};$('#reports-date-to').onchange=function(){adminReportsState.dateTo=this.value;};$('#reports-orientation').onchange=function(){adminReportsState.orientation=this.value;};
 $('#reports-generate').onclick=function(){if(adminReportsState.selected)adminReportsBuild(adminReportsState.selected);};
 $('#reports-csv').onclick=function(){if(adminReportsState.fileType==='json'){adminReportsDownload(AdminReportUtils.json(adminReportsState.backup),'application/json;charset=utf-8',adminReportsState.fileName+'.json');}else{adminReportsDownload(AdminReportUtils.csv(adminReportsState.columns,adminReportsState.rows),'text/csv;charset=utf-8',adminReportsState.fileName+'.csv');}};
 $('#reports-print').onclick=function(){document.documentElement.dataset.reportOrientation=adminReportsState.orientation;window.print();};
 adminReportsToggleControls();
}
function adminReportsRender(){adminReportsDrawShell();}

window.__adminReportsTest={reports:ADMIN_REPORTS,priceColumns:adminReportsPriceColumns,backupTables:ADMIN_BACKUP_TABLES};
