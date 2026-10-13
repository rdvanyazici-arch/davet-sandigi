/* ============ RENDER: COLLECTIONS ============ */
function renderCollections(){
 var g=$('#coll-grid');g.innerHTML='';
 occasions.forEach(function(o){
  var card=el('button','coll-card reveal');
  card.innerHTML='<div class="coll-thumb"><span class="coll-ic">'+glyphSvg(o.glyph)+'</span><img src="'+imgSrc(o.img)+'" alt="'+o.label+'"></div>'+
   '<div class="coll-body"><h3>'+o.label+'</h3><p>'+(o.sub||'')+'</p><span class="coll-more">Koleksiyonu Gör '+ICON.arr+'</span></div>';
  card.addEventListener('click',function(){openCollection(o.id);});
  g.appendChild(card);
 });
 var fc=$('#footer-coll');fc.innerHTML='';
 occasions.forEach(function(o){var li=el('li');li.innerHTML='<a href="#koleksiyonlar" data-occ="'+o.id+'">'+o.label+'</a>';li.firstChild.addEventListener('click',function(e){e.preventDefault();openCollection(o.id);});fc.appendChild(li);});
 observeReveal();
}

/* ============ RENDER: PRODUCTS ============ */
var activeFilter='featured';
function renderFilter(){
 var f=$('#filterbar');f.innerHTML='';
 var tabs=[{id:'featured',label:'Öne Çıkanlar'},{id:'all',label:'Tümü'}].concat(categories.map(function(c){return{id:c.id,label:c.label};}));
 tabs.forEach(function(t){
  var b=el('button',t.id==activeFilter?'active':'',t.label);
  b.addEventListener('click',function(){activeFilter=t.id;renderFilter();renderProducts();});
  f.appendChild(b);
 });
}
function visibleProducts(){return products.filter(function(p){return p.visible!==false;});}
var PG_PAGE=8,pgList=[],pgShown=0;
function renderProducts(){
 var grid=$('#prod-grid');grid.innerHTML='';
 var list=visibleProducts();
 if(activeFilter=='featured')list=list.filter(function(p){return p.featured;});
 else if(activeFilter!='all')list=list.filter(function(p){return p.cat==activeFilter;});
 var sab=$('#show-all-prod');
 if(sab){var acat=(activeFilter!=='all'&&activeFilter!=='featured')?categories.filter(function(c){return c.id===activeFilter;})[0]:null;sab.innerHTML=(acat?('Tüm '+acat.label):'Tüm Ürünleri Gör')+' '+ICON.arr;}
 pgList=list;pgShown=0;
 if(!list.length){grid.appendChild(el('div','prod-empty','Bu kategoride ürün bulunmuyor.'));if($('#prod-more'))$('#prod-more').hidden=true;return;}
 renderMoreMain();
}
function renderMoreMain(){
 var grid=$('#prod-grid'),next=pgList.slice(pgShown,pgShown+PG_PAGE);
 next.forEach(function(p){grid.appendChild(productCard(p));});
 pgShown+=next.length;
 var more=pgShown<pgList.length,btn=$('#prod-more');
 if(btn){btn.hidden=!more;if(more)btn.innerHTML='Daha Fazla Ürün ('+pgShown+'/'+pgList.length+') '+ICON.arr;}
 observeReveal();
}
function productCard(p){
 var c=el('article','prod-card reveal');c.setAttribute('data-pid',p.id);
 var isWish=wish.indexOf(p.id)>-1;
 c.innerHTML='<div class="prod-thumb">'+(p.featured?'<span class="prod-badge">Öne Çıkan</span>':'')+
  '<button class="wish'+(isWish?' on':'')+'" data-wish="'+p.id+'" aria-label="Favori"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-4.5-9.5-8.8A5.2 5.2 0 0112 6a5.2 5.2 0 019.5 6.2C19 16.5 12 21 12 21z"/></svg></button>'+
  '<img src="'+imgSrc(p.img)+'" alt="'+p.name+'"></div>'+
  '<div class="prod-body"><span class="prod-code">'+p.code+' · '+catLabel(p.cat)+'</span>'+
  '<h4>'+p.name+'</h4><p class="p-desc">'+(p.desc||'')+'</p>'+
  '<div class="prod-foot"><span class="prod-price">'+fmt(p.price)+'</span>'+
  '<button class="prod-add" data-add="'+p.id+'">'+ICON.cart+' Sepete Ekle</button></div></div>';
 return c;
}

/* ============ COLLECTION VIEW ============ */
function openCollection(occId){
 var o=occasions.filter(function(x){return x.id==occId;})[0];if(!o)return;
 $('#cv-title').textContent=o.label+' Koleksiyonu';
 var ban=$('#cv-banner');ban.style.backgroundImage='url('+imgSrc(o.img)+')';
 if($('#cv-eyebrow'))$('#cv-eyebrow').textContent='Koleksiyon';
 $('#cv-banner-title').textContent=o.label;$('#cv-banner-sub').textContent=o.sub||'';
 var list=visibleProducts().filter(function(p){return(p.occ||[]).indexOf(occId)>-1;});
 cvOpen(list,'Bu koleksiyonda henüz ürün yok.');
 openCollview();
}
/* ---- collection view: category filter + paging (load-more + infinite scroll) ---- */
var cvList=[],cvShown=0,CV_PAGE=8,cvBase=[],cvCat='all',cvEmpty='Ürün bulunmuyor.';
function cvOpen(list,emptyMsg){cvBase=list||[];cvCat='all';cvEmpty=emptyMsg||'Ürün bulunmuyor.';renderCvFilter();cvApplyFilter();}
function renderCvFilter(){
 var bar=$('#cv-filter');if(!bar)return;
 var cats=categories.filter(function(c){return cvBase.some(function(p){return p.cat===c.id;});});
 if(cats.length<2){bar.hidden=true;bar.innerHTML='';return;}
 bar.hidden=false;bar.innerHTML='';
 [{id:'all',label:'Tümü'}].concat(cats.map(function(c){return{id:c.id,label:c.label};})).forEach(function(t){
  var b=el('button',t.id===cvCat?'active':'',t.label);b.onclick=function(){cvCat=t.id;renderCvFilter();cvApplyFilter();$('#collview').scrollTop=Math.min($('#collview').scrollTop,$('#cv-filter').offsetTop-20);};bar.appendChild(b);
 });
}
function cvApplyFilter(){var list=cvCat==='all'?cvBase:cvBase.filter(function(p){return p.cat===cvCat;});cvSetList(list,cvEmpty);}
function cvSetList(list,emptyMsg){
 cvList=list||[];cvShown=0;
 var grid=$('#cv-grid');grid.innerHTML='';
 if(!cvList.length){grid.appendChild(el('div','prod-empty',emptyMsg||'Ürün bulunmuyor.'));$('#cv-more-wrap').hidden=true;return;}
 cvRenderMore();
}
function cvRenderMore(){
 var grid=$('#cv-grid'),next=cvList.slice(cvShown,cvShown+CV_PAGE);
 next.forEach(function(p){var c=productCard(p);c.classList.add('in');grid.appendChild(c);});
 cvShown+=next.length;
 var more=cvShown<cvList.length;
 $('#cv-more-wrap').hidden=!more;
 if(more)$('#cv-more').innerHTML='Daha Fazla Ürün ('+cvShown+'/'+cvList.length+') '+ICON.arr;
}
function openCollview(){$('#collview').classList.add('open');document.body.style.overflow='hidden';$('#collview').scrollTop=0;window.scrollTo(0,0);}
function closeCollection(){$('#collview').classList.remove('open');document.body.style.overflow='';}
function openAllProducts(){
 var list=visibleProducts();
 var cat=(activeFilter!=='all'&&activeFilter!=='featured')?categories.filter(function(c){return c.id===activeFilter;})[0]:null;
 var title,sub,ban;
 if(cat){list=list.filter(function(p){return p.cat===cat.id;});title=cat.label;sub='Bu kategorideki tüm ürünler';}
 else{title='Tüm Ürünler';sub='Koleksiyonumuzun tamamı';}
 ban=(list[0]||{}).img;
 $('#cv-title').textContent=cat?(cat.label+' — Tüm Ürünler'):'Tüm Ürünler';
 if($('#cv-eyebrow'))$('#cv-eyebrow').textContent=cat?'Kategori':'Ürünler';
 var b=$('#cv-banner');b.style.backgroundImage='url('+imgSrc(ban)+')';
 $('#cv-banner-title').textContent=title;$('#cv-banner-sub').textContent=sub;
 cvOpen(list,'Bu kategoride ürün bulunmuyor.');
 openCollview();
}

/* ============ PRODUCT MODAL ============ */
var pmState={imgs:[],idx:0,id:null},pmQty=25;
function openProduct(id){
 var p=prodById(id);if(!p)return;
 pmState.id=id;pmState.imgs=galleryOf(p).slice();pmState.idx=0;pmQty=minQ();
 $('#pm-badge').textContent=catLabel(p.cat);
 $('#pm-code').textContent=p.code+' · '+catLabel(p.cat);
 $('#pm-name').textContent=p.name;
 $('#pm-desc').textContent=p.desc||'';
 $('#pm-qty').textContent=pmQty;
 $('#pm-note').textContent='Minimum '+minQ()+' adet, '+stepQ()+'’er artışlarla.';
 renderPmGallery();pmUpdateQuote();
 $('#product-modal').classList.add('open');document.body.style.overflow='hidden';
}
function pmUpdateQuote(){
 var p=prodById(pmState.id);if(!p)return;var q=isQuote(pmQty);
 if($('#pm-quote'))$('#pm-quote').hidden=!q;
 if($('#pm-price'))$('#pm-price').innerHTML=q?'<span class="pm-quoteprice">Özel fiyat teklifi</span>':fmt(p.price)+' <small>/ adet</small>';
}
function renderPmGallery(){
 var imgs=pmState.imgs,multi=imgs.length>1;
 $('#pm-main').src=imgSrc(imgs[pmState.idx]);
 $('#pm-counter').textContent=(pmState.idx+1)+' / '+imgs.length;
 $('#pm-counter').style.display=multi?'':'none';
 $('#pm-prev').style.display=multi?'':'none';$('#pm-next').style.display=multi?'':'none';
 var th=$('#pm-thumbs');th.innerHTML='';th.style.display=multi?'':'none';
 imgs.forEach(function(im,i){var b=el('button','pm-thumb'+(i==pmState.idx?' active':''));b.innerHTML='<img src="'+imgSrc(im)+'" alt="">';b.onclick=function(){pmState.idx=i;renderPmGallery();};th.appendChild(b);});
}
function pmNav(d){var n=pmState.imgs.length;if(!n)return;pmState.idx=(pmState.idx+d+n)%n;renderPmGallery();}
function pmSetQty(d){pmQty+=d*stepQ();if(pmQty<minQ())pmQty=minQ();$('#pm-qty').textContent=pmQty;pmUpdateQuote();}
function closeProduct(){$('#product-modal').classList.remove('open');document.body.style.overflow='';}

/* ============ WISHLIST ============ */
function toggleWish(id){var i=wish.indexOf(id);if(i>-1)wish.splice(i,1);else wish.push(id);save('ds_wish_v1',wish);
 $all('[data-wish="'+id+'"]').forEach(function(b){b.classList.toggle('on',wish.indexOf(id)>-1);});}
