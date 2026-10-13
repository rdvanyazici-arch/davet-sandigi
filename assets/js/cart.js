/* ============ CART ============ */
function prodById(id){return products.filter(function(x){return x.id==id;})[0];}
function minQ(){return settings.minQty||1;}
function stepQ(){return settings.stepQty||1;}
function isQuote(qty){return(settings.quoteThreshold>0)&&(qty>settings.quoteThreshold);}
function cartQty(){return cart.reduce(function(s,i){return s+i.qty;},0);}
function lineTotal(p,qty){return isQuote(qty)?0:p.price*qty;}
function subtotal(){return cart.reduce(function(s,i){var p=prodById(i.id);return s+(p?lineTotal(p,i.qty):0);},0);}
function hasQuote(){return cart.some(function(i){return isQuote(i.qty);});}
function shipCost(){var st=subtotal();if(st<=0)return 0;return(settings.shipFree>0&&st>=settings.shipFree)?0:(settings.shipFee||0);}
function grandTotal(){return subtotal()+shipCost();}
function addToCart(id,qty){var it=cart.filter(function(x){return x.id==id;})[0];
 if(qty){if(it)it.qty+=qty;else cart.push({id:id,qty:qty});}
 else{if(it)it.qty+=stepQ();else cart.push({id:id,qty:minQ()});}
 save(LS.cart,cart);syncCart();toast('Sepete eklendi ✓');}
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},1900);}
function setQty(id,dir){var it=cart.filter(function(x){return x.id==id;})[0];if(!it)return;it.qty+=dir*stepQ();if(it.qty<minQ())cart=cart.filter(function(x){return x.id!=id;});save(LS.cart,cart);syncCart();renderCart();}
function removeCart(id){cart=cart.filter(function(x){return x.id!=id;});save(LS.cart,cart);syncCart();renderCart();}
function syncCart(){
 var q=cartQty(),cc=$('#cart-count');cc.textContent=q;cc.hidden=q===0;
 var st=subtotal(),sc=shipCost();
 if($('#cart-subtotal'))$('#cart-subtotal').textContent=fmt(st);
 if($('#cart-ship'))$('#cart-ship').textContent=sc===0?(st>0?'Ücretsiz':'—'):fmt(sc);
 if($('#cart-total'))$('#cart-total').textContent=fmt(grandTotal());
 var qn=$('#cart-quote-note');if(qn)qn.hidden=!hasQuote();
 $('#drawer-foot').hidden=cart.length===0;
 var fab=$('#cart-fab');if(fab){fab.hidden=cart.length===0;$('#fab-count').textContent=q;}
}
function renderCart(){
 var b=$('#drawer-body');b.innerHTML='';
 if(!cart.length){b.appendChild(el('div','cart-empty','Sepetiniz henüz boş.<br>Beğendiğiniz ürünleri ekleyin.'));syncCart();return;}
 cart.forEach(function(i){
  var p=prodById(i.id);if(!p)return;
  var q=isQuote(i.qty);
  var row=el('div','cart-item');
  row.innerHTML='<img src="'+imgSrc(p.img)+'" alt=""><div class="ci-main"><span class="ci-code">'+p.code+'</span><h5>'+p.name+'</h5>'+
   '<div class="ci-price">'+(q?'<span class="ci-quote">Özel fiyat teklifi</span>':fmt(p.price)+' <small class="muted-unit">/ adet</small>')+'</div>'+
   '<div class="stepper"><button data-dec="'+p.id+'">−</button><span>'+i.qty+'</span><button data-inc="'+p.id+'">+</button></div>'+
   (q?'':'<div class="ci-line">'+fmt(p.price*i.qty)+'</div>')+'</div>'+
   '<button class="ci-remove" data-rm="'+p.id+'">Kaldır</button>';
  b.appendChild(row);
 });
 syncCart();
}
function openCart(){renderCart();$('#overlay').classList.add('open');$('#drawer').classList.add('open');document.body.style.overflow='hidden';}
function closeCart(){$('#overlay').classList.remove('open');$('#drawer').classList.remove('open');document.body.style.overflow='';$('#checkout-fields').classList.remove('show');}
