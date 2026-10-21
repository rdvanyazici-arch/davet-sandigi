/* Aggregate, customer-data-free analytics dashboard. */
var adminAnalyticsDays=30;
function analyticsNum(value){var number=Number(value);return Number.isFinite(number)?number:0;}
function analyticsLabel(value){return{instagram:'Instagram',google:'Google',direct:'Doğrudan',other:'Diğer',mobile:'Mobil',desktop:'Masaüstü'}[value]||value;}
async function adminAnalyticsData(days){
 var client=await pagesClient();
 var results=await Promise.all([
  client.rpc('admin_analytics_summary',{p_days:days}),
  client.from('site_settings').select('analytics_enabled').eq('id',1).single()
 ]);
 if(results[0].error)throw results[0].error;
 if(results[1].error)throw results[1].error;
 return{summary:results[0].data||{},enabled:results[1].data&&results[1].data.analytics_enabled===true};
}
function analyticsBars(rows,labelKey){
 var max=Math.max.apply(null,[1].concat(rows.map(function(row){return analyticsNum(row.count);})));return rows.length?'<div class="analytics-bars">'+rows.map(function(row){var value=analyticsNum(row.count);return'<div><span>'+esc(analyticsLabel(row[labelKey]))+'</span><i><b style="width:'+Math.round(value/max*100)+'%"></b></i><strong>'+value+'</strong></div>';}).join('')+'</div>':'<p class="analytics-empty">Henüz veri yok.</p>';
}
function analyticsTable(rows,type){
 if(!rows.length)return'<p class="analytics-empty">Henüz veri yok.</p>';
 var collection=type==='collection';return'<div class="admin-table-scroll"><table class="admin-data-table analytics-table"><thead><tr><th>'+ (collection?'Koleksiyon':'Ürün') +'</th>'+(collection?'':'<th>SKU</th>')+'<th>Görüntüleme</th><th>Sepete ekleme</th></tr></thead><tbody>'+rows.map(function(row){return'<tr><td>'+esc(row.name||'—')+'</td>'+(collection?'':'<td>'+esc(row.sku||'—')+'</td>')+'<td>'+analyticsNum(row.views)+'</td><td>'+analyticsNum(row.adds)+'</td></tr>';}).join('')+'</tbody></table></div>';
}
function analyticsHtml(data){
 var d=data.summary||{},totals=d.totals||{},views=analyticsNum(totals.product_view),adds=analyticsNum(totals.add_to_cart),wa=analyticsNum(totals.whatsapp_request),pages=analyticsNum(totals.page_view),low=pages<20;
 var rate=function(value,base){return base?Math.round(value/base*100):0;};
 return'<div class="analytics-toolbar"><div class="product-status-chips" role="group" aria-label="Tarih aralığı">'+[7,30,90].map(function(days){return'<button class="product-status-chip '+(days===adminAnalyticsDays?'active':'')+'" data-analytics-days="'+days+'" type="button">'+days+' gün</button>';}).join('')+'</div><button class="a-btn" data-analytics-refresh type="button">Yenile</button></div>'+
 (!data.enabled?'<div class="analytics-notice"><b>Analitik kapalı</b><p>Canlı alan adı ve gerçek katalog hazır olduğunda Site Ayarları bölümündeki tek bayrakla açabilirsiniz.</p></div>':'')+
 (low&&pages?'<div class="analytics-notice"><b>Veri henüz az</b><p>En az 20 sayfa görüntüleme oluşana kadar yanıltıcı olmaması için dönüşüm yüzdeleri gösterilmiyor.</p></div>':'')+
 '<div class="pg-stats analytics-stats"><article class="pg-stat"><strong>'+pages+'</strong><span>Sayfa görüntüleme</span></article><article class="pg-stat"><strong>'+views+'</strong><span>Ürün görüntüleme</span></article><article class="pg-stat"><strong>'+adds+'</strong><span>Sepete ekleme</span></article><article class="pg-stat"><strong>'+wa+'</strong><span>WhatsApp talebi</span></article></div>'+
 '<section class="pg-panel analytics-funnel"><div class="dashboard-card-head"><div><span>Talep akışı</span><h3>Talep hunisi</h3></div></div><div><span>Ürün görüntüleme <b>'+views+'</b></span><span>Sepete ekleme <b>'+adds+(low?'':' · %'+rate(adds,views))+'</b></span><span>WhatsApp talebi <b>'+wa+(low?'':' · %'+rate(wa,adds))+'</b></span></div></section>'+
 '<div class="analytics-grid"><section class="pg-panel"><div class="dashboard-card-head"><div><span>Geliş kanalı</span><h3>Trafik kaynakları</h3></div></div>'+analyticsBars(d.sources||[],'source')+'</section><section class="pg-panel"><div class="dashboard-card-head"><div><span>Ekran sınıfı</span><h3>Cihaz dağılımı</h3></div></div>'+analyticsBars(d.devices||[],'device')+'</section></div>'+
 '<section class="pg-panel analytics-section"><div class="dashboard-card-head"><div><span>Katalog</span><h3>Koleksiyon ilgisi</h3></div></div>'+analyticsTable(d.collections||[],'collection')+'</section>'+
 '<section class="pg-panel analytics-section"><div class="dashboard-card-head"><div><span>Katalog</span><h3>Ürün performansı</h3></div></div>'+analyticsTable(d.products||[],'product')+'</section>';
}
function adminAnalyticsRender(){
 var box=$('#analytics-admin');if(!box)return;box.innerHTML='<div class="taxonomy-loading">Analiz verileri yükleniyor…</div>';
 adminAnalyticsData(adminAnalyticsDays).then(function(data){
  box.innerHTML=analyticsHtml(data);
  $all('[data-analytics-days]',box).forEach(function(button){button.onclick=function(){adminAnalyticsDays=Number(button.dataset.analyticsDays);adminAnalyticsRender();};});
  box.querySelector('[data-analytics-refresh]').onclick=adminAnalyticsRender;
 }).catch(function(error){box.innerHTML='<div class="taxonomy-empty media-error">Analiz verileri yüklenemedi: '+esc(adminErrorText(error))+'</div><button class="a-btn" data-analytics-retry type="button">Tekrar Dene</button>';box.querySelector('[data-analytics-retry]').onclick=adminAnalyticsRender;});
}
function adminAnalyticsRenderDashboard(box){
 if(!box)return;
 adminAnalyticsData(30).then(function(data){var totals=data.summary.totals||{},pages=analyticsNum(totals.page_view),wa=analyticsNum(totals.whatsapp_request);box.innerHTML='<b>Son 30 gün</b><p>'+(data.enabled?pages+' sayfa görüntüleme · '+wa+' WhatsApp talebi':'Analitik kapalı; test verisi toplanmıyor.')+'</p><button class="dashboard-fix" data-dashboard-analytics type="button">Analizi aç <span>İncele →</span></button>';box.querySelector('[data-dashboard-analytics]').onclick=function(){adminOpenView('analytics');};}).catch(function(){box.innerHTML='<b>Analiz</b><p>Özet şu an yüklenemedi.</p>';});
}
window.__analyticsAdminTest={html:analyticsHtml};
