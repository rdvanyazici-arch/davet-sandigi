/* ============ SUPABASE BROWSER CONFIG ============ */
var SUPABASE_CONFIG=(function(){
 var runtime=window.__DAVET_SANDIGI_ENV__||{};
 return Object.freeze({
  url:String(runtime.SUPABASE_URL||''),
  publishableKey:String(runtime.SUPABASE_PUBLISHABLE_KEY||'')
 });
})();

/* ============ ICONS ============ */
var ICON={
 arr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4a.5.5 0 000-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11 11 0 004.2 3.7c.6.3 1 .4 1.4.5a3.3 3.3 0 001.5.1 2.5 2.5 0 001.6-1.1 2 2 0 00.1-1.1c0-.1-.2-.2-.4-.3z"/></svg>',cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.6 1.6 0 001.6 1.3h8.4a1.6 1.6 0 001.6-1.3L22 7H6"/></svg>',chk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
};

/* ============ DATA ============ */
var LS={p:'ds_products_v6',c:'ds_categories_v6',o:'ds_occasions_v6',s:'ds_settings_v6',cart:'ds_cart_v6'};
var CLOUD_IMG={};
try{CLOUD_IMG=JSON.parse(localStorage.getItem('ds_cloudimg_v1')||'{}')||{};}catch(e){CLOUD_IMG={};}
var IMG={
 "baby-1": "assets/images/fallback/baby-1.webp",
 "baby-2": "assets/images/fallback/baby-2.webp",
 "baby-3": "assets/images/fallback/baby-3.webp",
 "baby-4": "assets/images/fallback/baby-4.webp",
 "baby-5": "assets/images/fallback/baby-5.webp",
 "col-baby": "assets/images/fallback/col-baby.webp",
 "col-kina": "assets/images/fallback/col-kina.webp",
 "col-nikah": "assets/images/fallback/col-nikah.webp",
 "col-nisan": "assets/images/fallback/col-nisan.webp",
 "cta": "assets/images/fallback/cta.webp",
 "hero": "assets/images/fallback/hero.webp",
 "kina-1": "assets/images/fallback/kina-1.webp",
 "kina-2": "assets/images/fallback/kina-2.webp",
 "kina-3": "assets/images/fallback/kina-3.webp",
 "kina-4": "assets/images/fallback/kina-4.webp",
 "kina-5": "assets/images/fallback/kina-5.webp",
 "nikah-1": "assets/images/fallback/nikah-1.webp",
 "nikah-2": "assets/images/fallback/nikah-2.webp",
 "nikah-3": "assets/images/fallback/nikah-3.webp",
 "nikah-4": "assets/images/fallback/nikah-4.webp",
 "nikah-5": "assets/images/fallback/nikah-5.webp",
 "nisan-1-b": "assets/images/fallback/nisan-1-b.webp",
 "nisan-1-c": "assets/images/fallback/nisan-1-c.webp",
 "nisan-1-d": "assets/images/fallback/nisan-1-d.webp",
 "nisan-1-e": "assets/images/fallback/nisan-1-e.webp",
 "nisan-1": "assets/images/fallback/nisan-1.webp",
 "nisan-2": "assets/images/fallback/nisan-2.webp",
 "nisan-3": "assets/images/fallback/nisan-3.webp",
 "nisan-4": "assets/images/fallback/nisan-4.webp",
 "nisan-5": "assets/images/fallback/nisan-5.webp"
};
var DEF_OCC=[];
var DEF_CAT=[];
var SEED=[];
var DEF_TOPBAR=[];
var DEF_REVIEWS=[];
var DEF_REVHEAD={eb:'',t:'',s:'',note:''};
var DEF_FAQ=[];
var DEF_STORY={title:'',lead:'',text:''};
var DEF_LEGAL={privacy:'',kvkk:'',cookie:'',mesafeli:''};
var DEF_CAMPAIGN={enabled:false,title:'',text:'',btnText:'',btnLink:'',img:''};
var DEF_HOME={
 heroEyebrow:'',heroBtn1:'',heroBtn2:'',heroImg:'',proof:[],
 collHead:{eb:'',t:'Yayındaki koleksiyonlar',s:''},prodHead:{eb:'',t:'Yayındaki ürünler',s:''},
 howHead:{eb:'',t:'Süreç'},steps:[],whyHead:{eb:'',t:'Davet Sandığı'},why:[],
 cta:{eb:'',t:'',p:'',btn:'',img:''}
};
var DEF_BANNER={eyebrow:'',title:'',lead:'',b1t:'',b1l:'',b2t:'',b2l:'',img:''};
function defSettings(){return{whatsapp:'',banners:[],instagram:'',phone:'',mail:'',addr:'',deliveryText:'',shippingNote:'',heroTitle:'',heroLead:'',minQty:25,stepQty:25,quoteThreshold:100,shipFee:0,shipFree:0,orderNext:1,topbar:[],reviews:[],revHead:JSON.parse(JSON.stringify(DEF_REVHEAD)),faq:[],story:JSON.parse(JSON.stringify(DEF_STORY)),legal:JSON.parse(JSON.stringify(DEF_LEGAL)),campaign:JSON.parse(JSON.stringify(DEF_CAMPAIGN)),home:JSON.parse(JSON.stringify(DEF_HOME))};}
function load(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function save(k,v){var stored=true;try{localStorage.setItem(k,JSON.stringify(v));}catch(e){stored=false;}if(typeof FB!=='undefined'&&FB&&typeof fbUser!=='undefined'&&fbUser&&(k===LS.p||k===LS.c||k===LS.o||k===LS.s)){clearTimeout(_cloudT);_cloudT=setTimeout(pushToCloud,700);}return stored;}
function pad3(n){return('000'+n).slice(-3);}
function pad5(n){return('00000'+n).slice(-5);}
function seedProducts(){
 var out=[],cnt={};
 SEED.forEach(function(r,i){
  var cat=r[1],pre=(DEF_CAT.filter(function(c){return c.id==cat;})[0]||{prefix:'URN'}).prefix;
  cnt[pre]=(cnt[pre]||0)+1;
  out.push({id:'p'+(i+1),code:pre+pad3(cnt[pre]),name:r[0],cat:cat,occ:r[2],price:r[3],img:r[4],gallery:[r[4]].concat(r[7]||[]),featured:!!r[5],desc:r[6],visible:true});
 });
 return out;
}
var occasions=load(LS.o,[])||[];
var categories=load(LS.c,[])||[];
var products=load(LS.p,[])||[];
var settings=(function(){var d=defSettings(),s=load(LS.s,null);if(!s){save(LS.s,d);return d;}for(var k in d){if(s[k]===undefined)s[k]=d[k];}return s;})();
var cart=load(LS.cart,[]);
var wish=load('ds_wish_v1',[]);

/* ============ HELPERS ============ */
function $(s,r){return(r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmt(n){return'₺'+Number(n||0).toFixed(2).replace('.',',');}
function imgSrc(key){if(key&&key.indexOf){if(key.indexOf('img:')===0)return CLOUD_IMG[key.slice(4)]||'';if(key.indexOf('data:')===0||key.indexOf('http')===0||key.indexOf('blob:')===0)return key;}return IMG[key]||IMG['nisan-1']||'';}
function galleryOf(p){return(p.gallery&&p.gallery.length)?p.gallery:[p.img];}
function catLabel(id){var c=categories.filter(function(x){return x.id==id;})[0];return c?c.label:id;}
function occLabel(id){var o=occasions.filter(function(x){return x.id==id;})[0];return o?o.label:id;}
function glyphSvg(g){
 var m={
  rings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M12 3l2 3h-4z" fill="currentColor" stroke="none"/></svg>',
  henna:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 21V11a1.5 1.5 0 013 0M11 11V8a1.5 1.5 0 013 0v3M14 11V9.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6H8a4 4 0 01-4-4v-2l2 1"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z"/><path d="M4 20L14 10"/></svg>',
  baby:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 15a8 8 0 0116 0z"/><path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2"/><circle cx="7" cy="21" r="1.4"/><circle cx="17" cy="21" r="1.4"/><path d="M12 7V4"/></svg>'
 };
 return m[g]||m.leaf;
}
function waNumber(){var n=String(settings.whatsapp||'').trim();return/^[1-9][0-9]{9,14}$/.test(n)?n:'';}
function waLink(text){var n=waNumber();return'https://wa.me/'+(n?n:'')+'?text='+encodeURIComponent(text||'Merhaba, Davet Sandığı ürünleri hakkında bilgi almak istiyorum.');}
