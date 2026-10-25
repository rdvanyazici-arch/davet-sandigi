/* ============ CART ============ */
function normalizeCartItem(raw){
 var id=String(raw&&((raw.product_id!==undefined&&raw.product_id!==null)?raw.product_id:raw.id)||'');
 var quantity=Math.max(1,parseInt(raw&&((raw.quantity!==undefined)?raw.quantity:raw.qty),10)||1);
 return id?{product_id:id,quantity:quantity,note:String(raw&&raw.note||'').slice(0,500)}:null;
}
cart=(Array.isArray(cart)?cart:[]).map(normalizeCartItem).filter(Boolean);
var cartPriceSnapshot={},cartStorageAvailable=true;
function persistCart(){cartStorageAvailable=save(LS.cart,cart.map(function(i){return{product_id:i.product_id,quantity:i.quantity,note:i.note||''};}));return cartStorageAvailable;}
persistCart();

function cartId(i){return String(i.product_id);}
function cartQuantity(i){return Number(i.quantity)||0;}
function prodById(id){return products.filter(function(x){return String(x.id)===String(id);})[0];}
function productMin(p){var n=Number(p&&p.minQuantity);if(!Number.isInteger(n)||n<1)n=Number(settings.minQty);return Number.isInteger(n)&&n>0?n:1;}
function productStep(p){var n=Number(p&&p.quantityStep);if(!Number.isInteger(n)||n<1)n=Number(settings.stepQty);return Number.isInteger(n)&&n>0?n:1;}
function normalizeQuantity(p,qty){var min=productMin(p),step=productStep(p),n=Math.max(min,Number(qty)||min);return min+Math.ceil((n-min)/step)*step;}
function isQuote(qty,p){return!!(p&&p.priceMode==='quote')||((Number(settings.quoteThreshold)||0)>0&&Number(qty)>=(Number(settings.quoteThreshold)||0));}
function activeCart(){return cart.map(function(i){return{item:i,product:prodById(cartId(i))};}).filter(function(x){return!!x.product;});}
function cartQty(){return catalogReady()?activeCart().reduce(function(s,x){return s+cartQuantity(x.item);},0):cart.reduce(function(s,i){return s+cartQuantity(i);},0);}
function catalogReady(){return catalogState.catalog==='ready';}
function cartPriceError(){return(!catalogReady()&&cart.length>0)||activeCart().some(function(x){return x.product.priceMode==='error';});}
function lineTotal(p,qty){return p.priceMode==='price'&&!isQuote(qty,p)?p.price*qty:0;}
function lineText(p,qty){
 if(isQuote(qty,p)||p.priceMode==='hidden')return'Özel fiyat teklifi';
 if(p.priceMode==='price')return fmt(p.price*qty);
 return PUBLIC_PRICE_ERROR;
}
function subtotal(){return activeCart().reduce(function(s,x){return s+lineTotal(x.product,cartQuantity(x.item));},0);}
function hasQuote(){return activeCart().some(function(x){return isQuote(cartQuantity(x.item),x.product)||x.product.priceMode==='hidden';});}
function hasUnpriced(){return activeCart().some(function(x){return x.product.priceMode!=='price'||isQuote(cartQuantity(x.item),x.product);});}
function shipLabel(){return activeCart().length?(settings.shippingNote||'WhatsApp görüşmesinde netleşir'):'—';}
function announceCart(message){var n=$('#cart-status');if(!n)return;n.textContent='';setTimeout(function(){n.textContent=message;},20);}
function persistAndAnnounce(message){persistCart();syncCart();if(message){toast(message);announceCart(message);}if(!cartStorageAvailable)announceCart('Tarayıcı depolamasına erişilemedi. Sepetiniz bu sekme açık kaldığı sürece bellekte tutulacak.');}
function detectPriceChanges(){
 if(!catalogReady())return;
 var changed=[];
 activeCart().forEach(function(x){var id=cartId(x.item),p=x.product,current=p.priceMode==='price'?Number(p.price):p.priceMode;if(Object.prototype.hasOwnProperty.call(cartPriceSnapshot,id)&&cartPriceSnapshot[id]!==current)changed.push(p.name);cartPriceSnapshot[id]=current;});
 if(changed.length){var msg='Fiyat güncellendi; sepetinizde güncel fiyat kullanılıyor: '+changed.join(', ');toast(msg);announceCart(msg);}
}
function addToCart(id,qty){
 var p=prodById(id);if(!catalogReady()||!p){toast(catalogReady()?'Bu ürün şu an yayında değil.':'Ürün bilgileri yüklenmeden sepete eklenemez.');return;}
 var it=cart.filter(function(x){return cartId(x)===String(id);})[0],amount=qty===undefined?productMin(p):normalizeQuantity(p,qty);
 if(it)it.quantity=normalizeQuantity(p,cartQuantity(it)+amount);else cart.push({product_id:String(id),quantity:amount,note:''});
 persistAndAnnounce(p.name+' sepete eklendi.');
 if(window.dsAnalytics)window.dsAnalytics.track('add_to_cart',id);
}
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},2500);}
function setQty(id,dir){
 var it=cart.filter(function(x){return cartId(x)===String(id);})[0],p=prodById(id);if(!it||!p)return;
 var next=cartQuantity(it)+dir*productStep(p);
 /* Eskiden minimumun altına inince ürün sessizce siliniyordu: eksiye bir kez
    fazla basan kişinin sepeti uyarısız boşalıyordu. Silme işi "Kaldır"
    düğmesinin; burada adet minimumda tutulur ve sebebi söylenir. */
 if(next<productMin(p)){toast('En az '+productMin(p)+' adet. Çıkarmak için Kaldır düğmesini kullanın.');return;}
 it.quantity=normalizeQuantity(p,next);
 persistAndAnnounce(p.name+' adedi güncellendi.');renderCart();
}
function setCartNote(id,note){var it=cart.filter(function(x){return cartId(x)===String(id);})[0];if(!it)return;it.note=String(note||'').slice(0,500);persistCart();announceCart('Kişiselleştirme notu güncellendi.');}
function removeCart(id){var p=prodById(id);cart=cart.filter(function(x){return cartId(x)!==String(id);});persistAndAnnounce((p?p.name:'Ürün')+' sepetten çıkarıldı.');renderCart();}
function syncCart(){
 detectPriceChanges();
 var q=cartQty(),cc=$('#cart-count');cc.textContent=q;cc.hidden=q===0;
 var err=cartPriceError(),totalText=err?PUBLIC_PRICE_ERROR:(hasQuote()||hasUnpriced()?'Özel fiyat teklifi':fmt(subtotal()));
 if($('#cart-subtotal'))$('#cart-subtotal').textContent=err?PUBLIC_PRICE_ERROR:fmt(subtotal());
 if($('#cart-ship'))$('#cart-ship').textContent=shipLabel();
 if($('#cart-total'))$('#cart-total').textContent=totalText;
 var qn=$('#cart-quote-note');if(qn)qn.hidden=!hasQuote();
 $('#drawer-foot').hidden=cart.length===0;
 var fab=$('#cart-fab');if(fab){fab.hidden=q===0;$('#fab-count').textContent=q;}
}
function renderCart(){
 var b=$('#drawer-body');b.innerHTML='';
 if(!cart.length){b.appendChild(el('div','cart-empty','Sepetiniz henüz boş.<br>Beğendiğiniz ürünleri ekleyin.'));syncCart();return;}
 cart.forEach(function(i){
  var id=cartId(i),p=prodById(id),qty=cartQuantity(i),row=el('div','cart-item');
  if(!p){
   row.classList.add('cart-item-unavailable');
    var unresolved=!catalogReady(),priceNotice=catalogState.catalog==='error'?PUBLIC_PRICE_ERROR:'Katalog yüklenince doğrulanacak.';
    row.innerHTML='<div class="ci-main"><h5>'+(unresolved?'Ürün bilgisi bekleniyor.':'Bu ürün artık yayında değil.')+'</h5><p class="ci-warning">'+(unresolved?priceNotice:'Toplama dahil edilmedi.')+'</p><div class="stepper"><span>'+qty+' adet</span></div></div><button class="ci-remove" data-rm="'+qesc(id)+'">Kaldır</button>';
   b.appendChild(row);return;
  }
  var quote=isQuote(qty,p);
  row.innerHTML=mediaImg(p.img,{alt:p.name})+'<div class="ci-main"><span class="ci-code">'+esc(p.code)+'</span><h5>'+esc(p.name)+'</h5>'+
   '<div class="ci-price">'+(quote||p.priceMode==='hidden'?'<span class="ci-quote">Özel fiyat teklifi</span>':p.priceMode==='price'?fmt(p.price)+' <small class="muted-unit">/ adet</small>':esc(priceText(p)))+'</div>'+
   '<div class="stepper"><button data-dec="'+qesc(id)+'" aria-label="'+qesc(p.name)+' adedini azalt"'+(qty<=productMin(p)?' disabled':'')+'>−</button><span>'+qty+'</span><button data-inc="'+qesc(id)+'" aria-label="'+qesc(p.name)+' adedini artır">+</button></div>'+
   (quote||p.priceMode!=='price'?'':'<div class="ci-line">'+fmt(p.price*qty)+'</div>')+
   '<label class="ci-note">Kişiselleştirme notu<input data-cart-note="'+qesc(id)+'" maxlength="500" value="'+qesc(i.note||'')+'" placeholder="İsim, renk veya kısa not"></label></div>'+
   '<button class="ci-remove" data-rm="'+qesc(id)+'">Kaldır</button>';
  b.appendChild(row);
 });
 syncCart();
}
function openCart(event){var drawer=$('#drawer'),opener=event&&event.currentTarget;if(!drawer)return;renderCart();
 /* Tutar dökümü masaüstünde açık, dar ekranda kapalı başlar: mobilde liste
    için yer kalsın, isteyen başlığa dokunup açsın. */
 var terms=$('#cart-terms');if(terms){if(window.innerWidth<=620)terms.removeAttribute('open');else terms.setAttribute('open','');}
drawer.removeAttribute('aria-hidden');drawer.removeAttribute('inert');var overlay=$('#overlay');if(overlay)overlay.classList.add('open');drawer.classList.add('open');document.body.style.overflow='hidden';activateFocusLayer(drawer,closeCart,opener);announceCart('Sepet açıldı.');}
function closeCart(){var drawer=$('#drawer'),overlay=$('#overlay');if(!drawer)return;if(overlay)overlay.classList.remove('open');drawer.classList.remove('open');deactivateFocusLayer(drawer);drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');document.body.style.overflow='';var fields=$('#checkout-fields');if(fields)fields.classList.remove('show');cartFormStep(false);}
/* Sepet ile bilgi formu arasındaki adım geçişi tek yerden yönetilir. */
function cartFormStep(acik){
 var dr=$('#drawer');if(dr)dr.classList.toggle('form-step',!!acik);
 var gb=$('#checkout-back');if(gb)gb.hidden=!acik;
 var cb=$('#checkout-btn');if(cb&&cb.firstChild)cb.firstChild.nodeValue=acik?'WhatsApp’ta Önizle ':'Devam Et ';
 if(!acik){var cf=$('#checkout-fields');if(cf)cf.classList.remove('show');}
}
