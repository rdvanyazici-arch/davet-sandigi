/* ============ CART ============ */
function prodById(id){return products.filter(function(x){return x.id==id;})[0];}
function minQ(){return settings.minQty||1;}
function stepQ(){return settings.stepQty||1;}
function isQuote(qty){return(settings.quoteThreshold>0)&&(qty>settings.quoteThreshold);}
function cartQty(){return cart.reduce(function(s,i){return s+i.qty;},0);}
function catalogReady(){return catalogState.catalog==='ready';}
function cartPriceError(){
 if(!cart.length)return false;
 if(!catalogReady())return true;
 return cart.some(function(i){var p=prodById(i.id);return p&&p.priceMode==='error';});
}
function lineTotal(p,qty){return(p.priceMode==='price'&&!isQuote(qty))?p.price*qty:0;}
function lineText(p,qty){
 if(isQuote(qty)||p.priceMode==='quote')return'Özel fiyat teklifi';
 if(p.priceMode==='hidden')return'Fiyat WhatsApp görüşmesinde netleşir';
 if(p.priceMode==='price')return fmt(p.price*qty);
 return PUBLIC_PRICE_ERROR;
}
function subtotal(){return cart.reduce(function(s,i){var p=prodById(i.id);return s+(p?lineTotal(p,i.qty):0);},0);}
function hasQuote(){return cart.some(function(i){var p=prodById(i.id);return isQuote(i.qty)||(p&&p.priceMode==='quote');});}
function hasUnpriced(){return cart.some(function(i){var p=prodById(i.id);return!p||p.priceMode!=='price'||isQuote(i.qty);});}
function shipCost(){return 0;}
function shipLabel(){
 if(cartPriceError()||subtotal()<=0&&!cart.length)return'—';
 return settings.shippingNote||'WhatsApp görüşmesinde netleşir';
}
function grandTotal(){return subtotal()+shipCost();}
function addToCart(id,qty){
 if(!catalogReady()||!prodById(id)){toast(catalogReady()?'Bu ürün şu an yayında değil.':'Ürün bilgileri yüklenmeden sepete eklenemez.');return;}
 var it=cart.filter(function(x){return x.id==id;})[0];
 if(qty){if(it)it.qty+=qty;else cart.push({id:id,qty:qty});}
 else{if(it)it.qty+=stepQ();else cart.push({id:id,qty:minQ()});}
 save(LS.cart,cart);syncCart();toast('Sepete eklendi ✓');}
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},1900);}
function setQty(id,dir){var it=cart.filter(function(x){return x.id==id;})[0];if(!it)return;it.qty+=dir*stepQ();if(it.qty<minQ())cart=cart.filter(function(x){return x.id!=id;});save(LS.cart,cart);syncCart();renderCart();}
function removeCart(id){cart=cart.filter(function(x){return x.id!=id;});save(LS.cart,cart);syncCart();renderCart();}
function syncCart(){
 var q=cartQty(),cc=$('#cart-count');cc.textContent=q;cc.hidden=q===0;
 var err=cartPriceError();
 if($('#cart-subtotal'))$('#cart-subtotal').textContent=err?PUBLIC_PRICE_ERROR:fmt(subtotal());
 if($('#cart-ship'))$('#cart-ship').textContent=shipLabel();
 if($('#cart-total'))$('#cart-total').textContent=err?PUBLIC_PRICE_ERROR:(hasUnpriced()?fmt(grandTotal())+' + teklifli ürünler':fmt(grandTotal()));
 var qn=$('#cart-quote-note');if(qn)qn.hidden=!hasQuote();
 $('#drawer-foot').hidden=cart.length===0;
 var fab=$('#cart-fab');if(fab){fab.hidden=cart.length===0;$('#fab-count').textContent=q;}
}
function renderCart(){
 var b=$('#drawer-body');b.innerHTML='';
 if(!cart.length){b.appendChild(el('div','cart-empty','Sepetiniz henüz boş.<br>Beğendiğiniz ürünleri ekleyin.'));syncCart();return;}
 cart.forEach(function(i){
  var p=prodById(i.id),row;
  if(!p){
   if(catalogState.catalog==='ready')return;
   row=el('div','cart-item');
   row.innerHTML='<div class="ci-main"><h5>Ürün bilgisi '+(catalogState.catalog==='loading'?'yükleniyor…':'yüklenemedi')+'</h5><div class="ci-price">'+(catalogState.catalog==='loading'?'':PUBLIC_PRICE_ERROR)+'</div><div class="stepper"><span>'+i.qty+' adet</span></div></div><button class="ci-remove" data-rm="'+qesc(i.id)+'">Kaldır</button>';
   b.appendChild(row);return;
  }
  var q=isQuote(i.qty);
  row=el('div','cart-item');
  row.innerHTML=mediaImg(p.img,{alt:p.name})+'<div class="ci-main"><span class="ci-code">'+esc(p.code)+'</span><h5>'+esc(p.name)+'</h5>'+
   '<div class="ci-price">'+(q?'<span class="ci-quote">Özel fiyat teklifi</span>':p.priceMode==='price'?fmt(p.price)+' <small class="muted-unit">/ adet</small>':esc(priceText(p)))+'</div>'+
   '<div class="stepper"><button data-dec="'+qesc(p.id)+'">−</button><span>'+i.qty+'</span><button data-inc="'+qesc(p.id)+'">+</button></div>'+
   (q||p.priceMode!=='price'?'':'<div class="ci-line">'+fmt(p.price*i.qty)+'</div>')+'</div>'+
   '<button class="ci-remove" data-rm="'+qesc(p.id)+'">Kaldır</button>';
  b.appendChild(row);
 });
 syncCart();
}
function openCart(){renderCart();$('#overlay').classList.add('open');$('#drawer').classList.add('open');document.body.style.overflow='hidden';}
function closeCart(){$('#overlay').classList.remove('open');$('#drawer').classList.remove('open');document.body.style.overflow='';$('#checkout-fields').classList.remove('show');}
