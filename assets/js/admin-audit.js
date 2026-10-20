var adminAuditState={page:1,pageSize:25,total:0,rows:[],profiles:[],recordFilter:null,loading:false};

function adminAuditDate(value){if(!value)return'—';try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(error){return value;}}
function adminAuditActorLabel(id){if(!id)return'Sistem';var profile=adminAuditState.profiles.find(function(item){return item.user_id===id;});return profile?profile.display_name:'Yönetici · '+String(id).slice(0,8);}
function adminAuditTableLabel(value){return{products:'Ürünler',product_drafts:'Ürün taslakları',categories:'Kategoriler',collections:'Koleksiyonlar',banners:'Bannerlar',content_sections:'Sayfa içerikleri',testimonials:'Yorumlar',faqs:'SSS',site_settings:'Site ayarları',media_assets:'Görseller',product_images:'Ürün görselleri',admin_profiles:'Yöneticiler'}[value]||value;}
function adminAuditActionLabel(value){return{insert:'Eklendi',update:'Güncellendi',archive:'Arşivlendi',delete:'Silindi'}[value]||value;}
function adminAuditValue(value){if(value===null||value===undefined)return'—';if(typeof value==='object')return JSON.stringify(value);if(typeof value==='boolean')return value?'Evet':'Hayır';return String(value);}

async function adminAuditLoadProfiles(){
 var result=await adminAuthClient.from('admin_profiles').select('user_id,display_name,role,is_active').order('display_name');
 if(result.error)throw result.error;adminAuditState.profiles=result.data||[];
}

function adminAuditFilters(){return{table:$('#audit-table-filter').value,actor:$('#audit-actor-filter').value,from:$('#audit-date-from').value,to:$('#audit-date-to').value};}

async function adminAuditLoad(reset){
 if(adminAuditState.loading)return;if(reset)adminAuditState.page=1;adminAuditState.loading=true;
 var status=$('#audit-status'),body=$('#audit-list');if(status)status.textContent='Değişiklik geçmişi yükleniyor…';if(body)body.innerHTML='<div class="taxonomy-loading">Kayıtlar yükleniyor…</div>';
 try{
  if(!adminAuditState.profiles.length)await adminAuditLoadProfiles();
  var filters=adminAuditFilters(),from=(adminAuditState.page-1)*adminAuditState.pageSize,query=adminAuthClient.from('admin_audit_log').select('id,table_name,row_id,action,actor_id,summary,changes,created_at',{count:'exact'}).order('created_at',{ascending:false}).range(from,from+adminAuditState.pageSize-1);
  if(filters.table)query=query.eq('table_name',filters.table);if(filters.actor)query=query.eq('actor_id',filters.actor);if(filters.from)query=query.gte('created_at',new Date(filters.from+'T00:00:00').toISOString());if(filters.to)query=query.lte('created_at',new Date(filters.to+'T23:59:59.999').toISOString());
  if(adminAuditState.recordFilter){query=query.eq('table_name',adminAuditState.recordFilter.table).eq('row_id',String(adminAuditState.recordFilter.rowId));}
  var result=await query;if(result.error)throw result.error;adminAuditState.rows=result.data||[];adminAuditState.total=result.count||0;adminAuditDraw();
 }catch(error){adminShowInlineError(status,'Geçmiş yüklenemedi: ',error);if(body)body.innerHTML='<div class="taxonomy-empty">Kayıtlar alınamadı.</div>';}
 finally{adminAuditState.loading=false;}
}

function adminAuditDraw(){
 var status=$('#audit-status'),body=$('#audit-list'),pages=Math.max(1,Math.ceil(adminAuditState.total/adminAuditState.pageSize));if(status)status.textContent=adminAuditState.total+' kayıt bulundu.';
 if(!adminAuditState.rows.length)body.innerHTML='<div class="taxonomy-empty">Bu filtrelere uygun değişiklik kaydı yok.</div>';
 else body.innerHTML='<div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Tablo</th><th>Yönetici</th><th>Eylem</th><th>Özet</th><th>Tarih</th></tr></thead><tbody>'+adminAuditState.rows.map(function(row){return'<tr><td>'+esc(adminAuditTableLabel(row.table_name))+'</td><td>'+esc(adminAuditActorLabel(row.actor_id))+'</td><td><span class="badge audit-'+esc(row.action)+'">'+esc(adminAuditActionLabel(row.action))+'</span></td><td><button class="admin-audit-detail" type="button" data-audit-id="'+row.id+'">'+esc(row.summary)+'</button></td><td>'+esc(adminAuditDate(row.created_at))+'</td></tr>';}).join('')+'</tbody></table></div>';
 $all('[data-audit-id]',body).forEach(function(button){button.onclick=function(){adminAuditShowDetail(Number(button.dataset.auditId));};});
 $('#audit-pagination').innerHTML='<button class="a-btn" type="button" data-audit-prev'+(adminAuditState.page<=1?' disabled':'')+'>← Önceki</button><span>Sayfa '+adminAuditState.page+' / '+pages+'</span><button class="a-btn" type="button" data-audit-next'+(adminAuditState.page>=pages?' disabled':'')+'>Sonraki →</button>';
 var prev=$('[data-audit-prev]'),next=$('[data-audit-next]');if(prev)prev.onclick=function(){adminAuditState.page--;adminAuditLoad(false);};if(next)next.onclick=function(){adminAuditState.page++;adminAuditLoad(false);};
}

function adminAuditShowDetail(id){
 var row=adminAuditState.rows.find(function(item){return Number(item.id)===Number(id);});if(!row)return;var keys=Object.keys(row.changes||{}),html=keys.length?'<div class="audit-change-list">'+keys.map(function(key){var value=row.changes[key]||{};if(value.changed)return'<div><strong>'+esc(key)+'</strong><span>Değişti (gizli veya büyük alan)</span></div>';return'<div><strong>'+esc(key)+'</strong><span>'+esc(adminAuditValue(value.old))+' → '+esc(adminAuditValue(value.new))+'</span></div>';}).join('')+'</div>':'<p class="admin-note">Güvenli karşılaştırma verisi bulunmuyor.</p>';
 var dialog=adminOpenDialog({labelledBy:'audit-detail-title',html:'<h2 id="audit-detail-title">'+esc(row.summary)+'</h2><p class="admin-note">'+esc(adminAuditTableLabel(row.table_name))+' · '+esc(adminAuditActorLabel(row.actor_id))+' · '+esc(adminAuditDate(row.created_at))+'</p>'+html+'<div class="admin-dialog-actions"><button class="a-btn primary" data-audit-close type="button">Kapat</button></div>'});dialog.root.querySelector('[data-audit-close]').onclick=function(){dialog.close(true);};
}

function adminAuditRender(){
 var box=$('#audit-admin');if(!box)return;adminAuditState.profiles=[];
 box.innerHTML='<div class="admin-toolbar audit-toolbar"><label>Tablo<select id="audit-table-filter"><option value="">Tüm tablolar</option>'+['products','product_drafts','categories','collections','banners','content_sections','testimonials','faqs','site_settings','media_assets','product_images','admin_profiles'].map(function(name){return'<option value="'+name+'">'+esc(adminAuditTableLabel(name))+'</option>';}).join('')+'</select></label><label>Yönetici<select id="audit-actor-filter"><option value="">Tüm yöneticiler</option></select></label><label>Başlangıç<input id="audit-date-from" type="date"></label><label>Bitiş<input id="audit-date-to" type="date"></label><button class="a-btn" id="audit-filter-clear" type="button">Filtreleri Temizle</button></div><div id="audit-record-filter" class="admin-note" hidden></div><div id="audit-status" class="admin-note" role="status" aria-live="polite"></div><div id="audit-list"></div><div id="audit-pagination" class="product-pagination"></div>';
 adminAuditLoadProfiles().then(function(){var select=$('#audit-actor-filter');select.innerHTML='<option value="">Tüm yöneticiler</option>'+adminAuditState.profiles.map(function(profile){return'<option value="'+profile.user_id+'">'+esc(profile.display_name)+'</option>';}).join('');return adminAuditLoad(true);}).catch(function(error){adminShowInlineError($('#audit-status'),'Geçmiş hazırlanamadı: ',error);});
 ['audit-table-filter','audit-actor-filter','audit-date-from','audit-date-to'].forEach(function(id){$('#'+id).onchange=function(){adminAuditState.recordFilter=null;$('#audit-record-filter').hidden=true;adminAuditLoad(true);};});
 $('#audit-filter-clear').onclick=function(){adminAuditState.recordFilter=null;['audit-table-filter','audit-actor-filter','audit-date-from','audit-date-to'].forEach(function(id){$('#'+id).value='';});$('#audit-record-filter').hidden=true;adminAuditLoad(true);};
 if(adminAuditState.recordFilter){var note=$('#audit-record-filter');note.hidden=false;note.textContent='Kayıt filtresi: '+adminAuditTableLabel(adminAuditState.recordFilter.table)+' #'+adminAuditState.recordFilter.rowId;}
}

async function adminOpenAuditForRecord(table,rowId){adminAuditState.recordFilter={table:table,rowId:String(rowId)};await adminOpenView('history');}

window.__adminAuditTest={tableLabel:adminAuditTableLabel,actionLabel:adminAuditActionLabel};
