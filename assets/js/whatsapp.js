/* ============ WHATSAPP REQUEST ============ */
function pad2(n){return('0'+n).slice(-2);}
function requestReference(){
 var d=new Date(),stamp=d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate())+pad2(d.getHours())+pad2(d.getMinutes())+pad2(d.getSeconds()),rand='';
 if(window.crypto&&crypto.getRandomValues){var bytes=new Uint8Array(3);crypto.getRandomValues(bytes);rand=Array.from(bytes).map(function(n){return n.toString(36);}).join('').slice(0,5).toUpperCase();}
 else rand=Math.random().toString(36).slice(2,7).toUpperCase();
 return'DS-'+stamp+'-'+rand;
}
function validRequestLines(){return activeCart();}
/* Bu metni müşteri KENDİ ağzından işletmeye gönderiyor. Önceki hâli bir
   sistem bildirimi gibiydi: selamlama yok, "Bu mesaj bir sipariş talebidir"
   gibi kendini açıklayan satırlar vardı ve tarih makine biçimindeydi.
   Burada bir insanın yazacağı gibi kurulur; bilgiler aynı kalır. */
function trTarih(iso){
 var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||''));
 return m?m[3]+'.'+m[2]+'.'+m[1]:String(iso||'');
}
function buildOrderText(reference,eventDate,generalNote){
 var lines=['Merhaba, aşağıdaki ürünler için sipariş talebi iletmek istiyorum.',''];
 var teklifVar=false;
 validRequestLines().forEach(function(x){
  var p=x.product,i=x.item,qty=cartQuantity(i),quote=isQuote(qty,p)||p.priceMode!=='price';
  lines.push('• '+p.name+' ('+p.code+')');
  lines.push(quote?'  '+qty+' adet — fiyat teklifi rica ediyorum':'  '+qty+' adet × '+fmt(p.price)+' = '+fmt(p.price*qty));
  if(i.note)lines.push('  Not: '+i.note);
  if(quote)teklifVar=true;
  lines.push('');
 });
 if(!teklifVar&&!hasUnpriced())lines.push('Toplam: '+fmt(subtotal()),'');
 if(eventDate)lines.push('Davet tarihi: '+trTarih(eventDate));
 if(generalNote)lines.push('Not: '+generalNote);
 if(eventDate||generalNote)lines.push('');
 lines.push('Kargo ve kesin fiyat için dönüşünüzü bekliyorum.');
 lines.push('Talep no: '+reference);
 return lines.join('\n');
}
function checkout(){
 var cf=$('#checkout-fields');
 if(!catalogReady()||cartPriceError()){alert(PUBLIC_PRICE_ERROR+'. Lütfen sayfayı yenileyip tekrar deneyin.');return;}
 if(!validRequestLines().length){alert('Talep oluşturmak için yayındaki bir ürünü sepetinize ekleyin.');return;}
 if(!waNumber()){alert('WhatsApp numarası geçerli değil. Yönetim panelinden ülke koduyla ve yalnızca rakam kullanarak güncelleyin.');return;}
 /* Bilgi alanları dar bir alt panele sıkışmak yerine kendi adımında açılır:
    sepet listesi ve tutar dökümü gizlenir, form tüm alanı kullanır. */
 if(!cf.classList.contains('show')){
  cf.classList.add('show');
  var dr=$('#drawer');if(dr)dr.classList.add('form-step');
  var gb=$('#checkout-back');if(gb)gb.hidden=false;
  var cb=$('#checkout-btn');if(cb)cb.firstChild.nodeValue='WhatsApp’ta Önizle ';
  /* Tarih alanına odaklanmak iOS'ta takvimi anında açıyordu: kullanıcı formu
     görmeden karşısına takvim çıkıyordu. Odak, adımın ilk denetimi olan
     geri düğmesine verilir. */
  if(gb)gb.focus();
  announceCart('Sipariş talebi bilgileri açıldı.');return;
 }
 if(!$('#c-kvkk').checked){alert('Devam etmek için KVKK Aydınlatma Metni onayını işaretleyin.');return;}
 var eventDate=$('#c-event-date').value,generalNote=$('#c-note').value.trim(),reference=requestReference(),text=buildOrderText(reference,eventDate,generalNote);
 renderReceipt(reference,eventDate,generalNote,text);$('#order-modal').classList.add('open');activateFocusLayer($('#order-modal'),closeOrder,$('#checkout-btn'));
}
function renderReceipt(reference,eventDate,generalNote,text){
 var r=$('#receipt');
 var rows=validRequestLines().map(function(x){var p=x.product,i=x.item,qty=cartQuantity(i);return'<div class="receipt-line"><span>'+esc(p.name)+' <small class="receipt-qty">x'+qty+'</small></span><span>'+esc(lineText(p,qty))+'</span></div>';}).join('');
 var total='<div class="receipt-line"><span>Ara toplam</span><span>'+fmt(subtotal())+'</span></div><div class="receipt-line"><span>Kargo</span><span>'+esc(shipLabel())+'</span></div><div class="receipt-total"><span>Talep toplamı</span><span>'+(hasQuote()||hasUnpriced()?'Özel fiyat teklifi':fmt(subtotal()))+'</span></div>';
 var meta=(eventDate?'Etkinlik tarihi: '+esc(eventDate)+'<br>':'')+(generalNote?'Genel not: '+esc(generalNote)+'<br>':'')+'Oluşturulma: '+new Date().toLocaleString('tr-TR');
 r.innerHTML='<div class="receipt-head"><b>Davet Sandığı</b><span>Sipariş talebi önizlemesi</span><div class="receipt-no">Talep referansı: '+esc(reference)+'</div></div><p class="receipt-disc">Aşağıdaki metni kontrol edin. Devam ettiğinizde WhatsApp açılır ve bu bilgiler WhatsApp’a aktarılır.</p>'+rows+total+'<p class="receipt-meta">'+meta+'</p><pre class="wa-message-preview" id="wa-message-preview">'+esc(text)+'</pre><p class="receipt-meta receipt-legal-note">Müşteri bilgileri Supabase’e kaydedilmez. Talep, WhatsApp görüşmesindeki karşılıklı onaydan sonra kesinleşir.</p>';
 var waButton=$('#rc-wa');if(!waButton)return;
 waButton.onclick=function(){if(window.dsAnalytics)window.dsAnalytics.track('whatsapp_request');window.open(waLink(text),'_blank','noopener,noreferrer');};
}
function closeOrder(){var modal=$('#order-modal');if(!modal)return;modal.classList.remove('open');deactivateFocusLayer(modal);}
