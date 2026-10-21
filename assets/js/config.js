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
var LS={cart:'ds_cart_v6'};
var products=[],categories=[],occasions=[];
var settings={whatsapp:'',instagram:'',phone:'',mail:'',deliveryText:'',currencyCode:'TRY',minQty:1,stepQty:1,quoteThreshold:0,shippingNote:'',analyticsEnabled:false,legal:{},campaign:{enabled:false}};
function load(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
var cart=load(LS.cart,[]);
var wish=load('ds_wish_v1',[]);

/* ============ HELPERS ============ */
function $(s,r){return(r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmt(n){return'₺'+Number(n||0).toFixed(2).replace('.',',');}
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
