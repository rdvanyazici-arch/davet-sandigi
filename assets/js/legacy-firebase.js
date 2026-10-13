/* Legacy Firebase is intentionally isolated for the rollback period. */
var FIRE_CFG={apiKey:"AIzaSyA5aLrfmek1yKIhDppcLXdqrypX5ey4h4E",authDomain:"davetsandigi-3ae7b.firebaseapp.com",projectId:"davetsandigi-3ae7b",storageBucket:"davetsandigi-3ae7b.firebasestorage.app",messagingSenderId:"415731819035",appId:"1:415731819035:web:f7ecb482edd505c0de8ebe"};
var FB=false,fbDB=null,fbAuth=null,fbStore=null,fbUser=null,_cloudT=null;
var LEGACY_FIREBASE_SDKS=[
 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage-compat.js'
];
function loadLegacyScript(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
function startLegacyFirebase(done){
 function finish(ok){if(typeof done==='function')done(ok);}
 function init(){try{if(typeof firebase==='undefined')throw new Error('Firebase SDK unavailable');if(!firebase.apps.length)firebase.initializeApp(FIRE_CFG);fbDB=firebase.firestore();fbAuth=firebase.auth();fbStore=firebase.storage();FB=true;finish(true);}catch(e){console.warn('Firebase init:',e);FB=false;finish(false);}}
 if(typeof firebase!=='undefined'){init();return;}
 LEGACY_FIREBASE_SDKS.reduce(function(p,src){return p.then(function(){return loadLegacyScript(src);});},Promise.resolve()).then(init).catch(function(e){console.warn('Firebase SDK load:',e);FB=false;finish(false);});
}
var CLOUD_IMG={};try{CLOUD_IMG=JSON.parse(localStorage.getItem('ds_cloudimg_v1')||'{}')||{};}catch(e){CLOUD_IMG={};}
function uploadImage(dataUrl){if(!FB||!fbUser||!dataUrl||dataUrl.indexOf('data:')!==0)return Promise.resolve(dataUrl);return fbDB.collection('images').add({d:dataUrl,t:Date.now()}).then(function(ref){CLOUD_IMG[ref.id]=dataUrl;try{localStorage.setItem('ds_cloudimg_v1',JSON.stringify(CLOUD_IMG));}catch(e){}return 'img:'+ref.id;}).catch(function(e){console.warn('img upload',e);if(typeof toast==='function')toast('Fotoğraf yüklenemedi');return dataUrl;});}
function collectImgRefs(){var ids={};function add(v){if(typeof v==='string'&&v.indexOf('img:')===0)ids[v.slice(4)]=1;}(products||[]).forEach(function(p){add(p.img);(p.gallery||[]).forEach(add);});var s=settings||{};(s.banners||[]).forEach(function(b){add(b.img);});if(s.home&&s.home.cta)add(s.home.cta.img);(s.reviews||[]).forEach(function(r){add(r.img);});if(s.campaign)add(s.campaign.img);return Object.keys(ids);}
function fetchCloudImages(cb){if(!FB){if(cb)cb();return;}var ids=collectImgRefs().filter(function(id){return !CLOUD_IMG[id];});if(!ids.length){if(cb)cb();return;}Promise.all(ids.map(function(id){return fbDB.collection('images').doc(id).get().then(function(s){if(s&&s.exists)CLOUD_IMG[id]=(s.data()||{}).d;}).catch(function(){});})).then(function(){try{localStorage.setItem('ds_cloudimg_v1',JSON.stringify(CLOUD_IMG));}catch(e){}if(cb)cb();});}
function pushToCloud(){if(!FB||!fbUser)return;fbDB.collection('site').doc('main').set({products:products,categories:categories,occasions:occasions,settings:settings,updated:Date.now()}).then(function(){if(typeof toast==='function')toast('Buluta kaydedildi ✓');}).catch(function(e){console.warn('cloud save',e);if(typeof toast==='function')toast('Buluta kaydedilemedi');});}
function loadFromCloud(){if(!FB)return;fbDB.collection('site').doc('main').get().then(function(s){if(s&&s.exists){var d=s.data()||{};if(d.categories&&d.categories.length)categories=d.categories;if(d.occasions&&d.occasions.length)occasions=d.occasions;if(d.products)products=d.products;if(d.settings)settings=Object.assign(defSettings(),d.settings);localStorage.setItem(LS.c,JSON.stringify(categories));localStorage.setItem(LS.o,JSON.stringify(occasions));localStorage.setItem(LS.p,JSON.stringify(products));localStorage.setItem(LS.s,JSON.stringify(settings));fetchCloudImages(function(){if(typeof refreshSite==='function')refreshSite();if(typeof syncCart==='function')syncCart();if($('#admin-panel')&&$('#admin-panel').classList.contains('show'))renderAdmin();});}}).catch(function(e){console.warn('cloud load',e);});}
