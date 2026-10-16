/* ============ CHECKOUT ============ */
function orderNoStr(){return'DS-'+new Date().getFullYear()+'-'+pad5(settings.orderNext||1);}
function buildOrderText(no,name,phone,note){
 var lines=[no+' numaralı siparişim hakkında bilgi almak istiyorum.','','*DAVET SANDIĞI · SİPARİŞ TALEBİ*','Talep No: '+no,''];
 cart.forEach(function(i){var p=prodById(i.id);if(!p)return;lines.push('• '+p.name+' ('+p.code+') x'+i.qty+' = '+lineText(p,i.qty));});
 lines.push('','Ara Toplam: '+fmt(subtotal()),'Kargo: '+shipLabel(),hasUnpriced()?'*TOPLAM: Teklifli ürünler görüşmede netleşir*':'*TOPLAM: '+fmt(grandTotal())+'*');
 if(hasQuote())lines.push('(100 adet üzeri ürünler için özel fiyat teklifi verilecektir.)');
 lines.push('');
 if(name)lines.push('Ad Soyad: '+name);
 if(phone)lines.push('Telefon: '+phone);
 if(note)lines.push('Not: '+note);
 lines.push('','Bu bir sipariş talebidir; ödeme belgesi değildir.');
 return lines.join('\n');
}
function checkout(){
 var cf=$('#checkout-fields');
 if(!catalogReady()||cartPriceError()){alert(PUBLIC_PRICE_ERROR+'. Lütfen sayfayı yenileyip tekrar deneyin.');return;}
 if(!cart.length){alert('Sepetiniz boş.');return;}
 if(!waNumber()){alert('WhatsApp iletişim bilgisi şu an yüklenemedi. Lütfen sayfayı yenileyin.');return;}
 if(!cf.classList.contains('show')){cf.classList.add('show');$('#c-name').focus();return;}
 if(!$('#c-kvkk').checked){alert('Devam etmek için KVKK Aydınlatma Metni onayını işaretleyin.');return;}
 var name=$('#c-name').value.trim(),phone=$('#c-phone').value.trim(),note=$('#c-note').value.trim();
 var no=orderNoStr();
 settings.orderNext=(settings.orderNext||1)+1;save(LS.s,settings);
 var text=buildOrderText(no,name,phone,note);
 renderReceipt(no,name,phone,note,text);
 $('#order-modal').classList.add('open');
}
function renderReceipt(no,name,phone,note,text){
 var r=$('#receipt');
 var rows=cart.map(function(i){var p=prodById(i.id);if(!p)return'';return'<div class="receipt-line"><span>'+esc(p.name)+' <small class="receipt-qty">x'+i.qty+'</small></span><span>'+esc(lineText(p,i.qty))+'</span></div>';}).join('');
 var totals='<div class="receipt-line"><span>Ara Toplam</span><span>'+fmt(subtotal())+'</span></div>'+
  '<div class="receipt-line"><span>Kargo</span><span>'+esc(shipLabel())+'</span></div>'+
  '<div class="receipt-total"><span>Toplam</span><span>'+(hasUnpriced()?'Teklifli ürünler görüşmede netleşir':fmt(grandTotal()))+'</span></div>'+
  (hasQuote()?'<p class="receipt-meta receipt-quote-note">100 adet üzeri ürünler için özel fiyat teklifi verilecektir.</p>':'');
 var meta='';
 if(name)meta+='Ad Soyad: '+name+'<br>';
 if(phone)meta+='Telefon: '+phone+'<br>';
 if(note)meta+='Not: '+note+'<br>';
 meta+='Tarih: '+new Date().toLocaleDateString('tr-TR');
 r.innerHTML='<div class="receipt-head"><b>Davet Sandığı</b><span>Sipariş Talebi Özeti</span><div class="receipt-no">Sipariş Talep No: '+no+'</div></div>'+
  '<p class="receipt-disc">Bu belge sipariş talebi özetidir. Ödeme belgesi değildir.</p>'+
  rows+totals+'<p class="receipt-meta">'+meta+'</p>'+
  '<p class="receipt-meta receipt-legal-note">KVKK Aydınlatma Metni onayı alınmıştır. Talebiniz WhatsApp üzerinden teyit edilerek kesinleşir.</p>';
 $('#rc-wa').onclick=function(){window.open(waLink(text),'_blank');};
}
