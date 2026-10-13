/* ============ ICONS ============ */
var ICON={
 arr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4a.5.5 0 000-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11 11 0 004.2 3.7c.6.3 1 .4 1.4.5a3.3 3.3 0 001.5.1 2.5 2.5 0 001.6-1.1 2 2 0 00.1-1.1c0-.1-.2-.2-.4-.3z"/></svg>',cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.6 1.6 0 001.6 1.3h8.4a1.6 1.6 0 001.6-1.3L22 7H6"/></svg>',chk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
};

/* ============ DATA ============ */
var LS={p:'ds_products_v6',c:'ds_categories_v6',o:'ds_occasions_v6',s:'ds_settings_v6',cart:'ds_cart_v6',pw:'ds_admin_pw_v1'};
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
var DEF_OCC=[
 {id:'nisan',label:'Nişan & Söz',sub:'Anılarınızı zarifçe saklayın',glyph:'rings',img:'col-nisan'},
 {id:'kina',label:'Kına',sub:'Geleneksel dokunuşlar',glyph:'henna',img:'col-kina'},
 {id:'nikah',label:'Nikâh',sub:'En özel başlangıçlar',glyph:'leaf',img:'col-nikah'},
 {id:'baby',label:'Baby Shower',sub:'Minikler için özel hatıralar',glyph:'baby',img:'col-baby'}
];
var DEF_CAT=[
 {id:'kolonya',label:'Kolonya Şişeleri',prefix:'KOL'},
 {id:'mum',label:'Mum & Kokular',prefix:'MUM'},
 {id:'magnet',label:'Magnetler',prefix:'MAG'},
 {id:'kese',label:'Keseler & Sachet',prefix:'KES'},
 {id:'kahve',label:'Kahve & Fincan',prefix:'KHV'},
 {id:'seker',label:'Şeker & Çikolata',prefix:'SEK'},
 {id:'kurdele',label:'Süsleme & Kurdele',prefix:'KUR'}
];
var SEED=[
 ['Nişan Kolonyası · İnci Detay','kolonya',['nisan'],54.90,'nisan-1',1,'Cam şişe, gold kapak ve inci detaylı kişiye özel kolonya.',['nisan-1-b','nisan-1-c','nisan-1-d','nisan-1-e']],
 ['Söz Çikolatası · Özel Kutu','seker',['nisan'],64.90,'nisan-2',0,'Özel kutuda, kişiye özel etiketli çikolata ikramı.'],
 ['İnci Taneli Magnet · Nişan','magnet',['nisan'],21.90,'nisan-3',0,'İnci ve kuru çiçek detaylı, isme özel magnet.'],
 ['Nişan Mumu · Cam Kavanoz','mum',['nisan'],44.90,'nisan-4',0,'Cam kavanozda, gold detaylı kokulu nişan mumu.'],
 ['Kahve İkramlık · Nişan','kahve',['nisan'],49.90,'nisan-5',1,'Fincan ve kolonya ikilisi, nişan ikramı için şık set.'],
 ['Kadife Kına Kesesi · Bordo','kese',['kina'],34.90,'kina-1',1,'Bordo kadife, gold biyeli, kuru çiçekli kına kesesi.'],
 ['Telli Kına Kesesi · Gold','kese',['kina'],37.90,'kina-2',0,'Gold tel ve pul işlemeli, zarif kına gecesi kesesi.'],
 ['Kınalı İkramlık Fincan','kahve',['kina'],52.90,'kina-3',0,'Kırmızı-gold motifli fincan ve kese ikilisi.'],
 ['Nazarlıklı Kına Magneti','magnet',['kina'],23.90,'kina-4',0,'Nazar boncuğu ve kırmızı-gold çiçekli magnet.'],
 ['Kına Gecesi Mumu · Kırmızı','mum',['kina'],42.90,'kina-5',0,'Kırmızı-gold detaylı, kokulu kına gecesi mumu.'],
 ['Beyaz Keten Kese · İnci','kese',['nikah'],32.90,'nikah-1',1,'Beyaz keten, inci detaylı, okaliptüslü nikâh kesesi.'],
 ['Nikah Şekeri · Badem','seker',['nikah'],12.90,'nikah-2',0,'Beyaz kurdeleli kutuda badem şekeri ikramı.'],
 ['Nikâh Kolonyası · Zarif','kolonya',['nikah'],56.90,'nikah-3',0,'Okaliptüslü, beyaz kurdeleli zarif nikâh kolonyası.'],
 ['Okaliptüslü Nikah Mumu','mum',['nikah'],46.90,'nikah-4',0,'Okaliptüs dokunuşlu, cam kavanozda nikâh mumu.'],
 ['Nikâh Magneti · Okaliptüs','magnet',['nikah'],22.90,'nikah-5',1,'Okaliptüs motifli, ivory zeminli nikâh magneti.'],
 ['Sage Müslin Kese · Bebek','kese',['baby'],27.90,'baby-1',1,'Sage yeşili müslin, minik etiketli baby shower kesesi.'],
 ['Bebek Şekeri · Pastel Kutu','seker',['baby'],14.90,'baby-2',0,'Mint-krem pastel kutuda bebek şekeri.'],
 ['Patik Temalı Magnet','magnet',['baby'],19.90,'baby-3',0,'Örgü patik temalı, pastel tonlarda sevimli magnet.'],
 ['Mini Bebek Mumu','mum',['baby'],34.90,'baby-4',0,'Küçük cam kavanozda pastel etiketli mini mum.'],
 ['Kurdeleli Bebek Hediyeliği','kurdele',['baby'],16.90,'baby-5',0,'Pastel saten kurdele ve cipso ile bebek hediyeliği.']
];
var DEF_TOPBAR=['Özenli Tasarım','Kişiye Özel Üretim','Özenle Seçilen Malzemeler','Özenli Hazırlık','Zamanında Teslimat'];
var DEF_REVIEWS=[
 {name:'Elif & Burak',event:'Nişan',text:'Nişanımız için hazırlanan kolonyalar ve magnetler herkesin çok beğendi. İşçilik ve paketleme kusursuzdu, teşekkürler.',img:'nisan-1'},
 {name:'Zeynep Y.',event:'Kına Gecesi',text:'Kına keseleri tam hayal ettiğim gibi oldu. Bordo-gold uyumu ve kuru çiçek dokunuşu çok şıktı.',img:'kina-1'},
 {name:'Merve & Can',event:'Nikâh',text:'Nikâh hediyeliklerimiz zamanında elimize ulaştı, davetlilerimiz çok memnun kaldı. Kişiye özel etiketler harikaydı.',img:'nikah-1'},
 {name:'Ayşe & Mert',event:'Baby Shower',text:'Bebeğimizin ilk günü için hazırlanan minik keseler ve mumlar çok sevildi. Pastel renk uyumu harikaydı.',img:'baby-1'},
 {name:'Selin & Kaan',event:'Nişan',text:'Nişan mumlarımız ve kolonyalarımız çok şıktı. Misafirlerimiz nereden yaptırdığımızı tek tek sordu.',img:'nisan-4'},
 {name:'Deniz & Ece',event:'Kına Gecesi',text:'Telli kına keseleri gerçekten göz kamaştırıcıydı. Hızlı teslimat için ayrıca teşekkürler.',img:'kina-2'}
];
var DEF_REVHEAD={eb:'Sizden Gelenler',t:'Sizden Gelenler',s:'Ürünlerimizi özel günlerinde kullanan misafirlerimizden kareler ve yorumlar.',note:'Siz de bizimle fotoğraflarınızı paylaşın, sayfamızda yayınlayalım! 💛 WhatsApp’tan gönderebilirsiniz.'};
var DEF_FAQ=[
 {q:'Minimum sipariş adedi nedir?',a:'Ürünlerimiz minimum 25 adet ve 25’er artışlarla sipariş edilebilir. Adet seçimini sepet üzerinden yapabilirsiniz.'},
 {q:'100 adet üzeri fiyat nasıl belirlenir?',a:'100 adedin üzerindeki siparişlerde size özel fiyat teklifi sunuyoruz. Sepetinizi oluşturup WhatsApp’tan iletişime geçmeniz yeterli.'},
 {q:'Kargo ücreti ne kadar?',a:'Kargo ücreti sipariş sırasında belirtilir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.'},
 {q:'Teslimat süresi ne kadardır?',a:'Tasarım onayının ardından ortalama 5-7 iş günü içinde hazırlayıp kargoya veriyoruz.'},
 {q:'Kişiye özel tasarım yapıyor musunuz?',a:'Evet, isim, tarih ve konseptinize özel tasarımlar hazırlıyoruz. Talebinizi WhatsApp üzerinden iletebilirsiniz.'}
];
var DEF_STORY={title:'Hikayemiz',lead:'Her hatıranın bir hikâyesi vardır.',text:'Davet Sandığı, özel günlerinizi zarif ve kalıcı hatıralara dönüştürmek için kuruldu. Her ürünü, sevdiklerinizle paylaşacağınız anların değerine yakışır bir özenle, el emeğiyle hazırlıyoruz. Kişiye özel tasarımlar, özenle seçilen malzemeler ve titiz bir işçilikle; sözünüzden nikâhınıza, kınanızdan bebeğinizin ilk gününe kadar yanınızdayız.'};
var DEF_LEGAL={
 privacy:'GİZLİLİK POLİTİKASI\n\nBu metin örnek/taslak niteliğindedir; yayına almadan önce bir hukuk danışmanıyla netleştirmeniz önerilir.\n\nDavet Sandığı olarak, sipariş talebinizi oluşturmak amacıyla paylaştığınız ad-soyad, telefon, etkinlik tarihi ve not bilgilerinizi yalnızca sizinle iletişim kurmak ve talebinizi değerlendirmek için kullanırız. Bilgileriniz üçüncü kişilerle pazarlama amacıyla paylaşılmaz.',
 kvkk:'KVKK AYDINLATMA METNİ\n\nBu metin örnek/taslak niteliğindedir; yayına almadan önce bir hukuk danışmanıyla netleştirmeniz önerilir.\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; sipariş talebinizin oluşturulması amacıyla ad-soyad, telefon ve etkinlik bilgileriniz veri sorumlusu sıfatıyla Davet Sandığı tarafından işlenmektedir. Verileriniz talebinizin sonuçlanması için gerekli süre boyunca saklanır. KVKK’nın 11. maddesindeki haklarınız için bizimle iletişime geçebilirsiniz.',
 cookie:'ÇEREZ POLİTİKASI\n\nBu metin örnek/taslak niteliğindedir; yayına almadan önce bir hukuk danışmanıyla netleştirmeniz önerilir.\n\nSitemiz; sepet ve tercih bilgilerinizi cihazınızda (localStorage) saklamak için teknik olarak gerekli depolama kullanır. Pazarlama/izleme çerezi kullanılmamaktadır.',
 mesafeli:'SİPARİŞ & MESAFELİ SATIŞ KOŞULLARI\n\nBu metin örnek/taslak niteliğindedir; yayına almadan önce bir hukuk danışmanıyla netleştirmeniz önerilir.\n\nSitemizde çevrimiçi ödeme alınmamaktadır. Oluşturduğunuz talep bir “sipariş talebi”dir; fiyat, adet, kargo ve teslimat detayları WhatsApp üzerinden karşılıklı teyit edilerek kesinleşir.'
};
var DEF_CAMPAIGN={enabled:false,title:'Hoş Geldiniz',text:'Özel günleriniz için el emeğiyle hazırlanan hediyeliklerimizi keşfedin. Sorularınız için WhatsApp’tan bize ulaşabilirsiniz.',btnText:'Ürünleri Keşfet',btnLink:'#urunler',img:''};
var DEF_HOME={
 heroEyebrow:'Kişiye özel davet & hatıra tasarımları',heroBtn1:'Ürünleri Keşfet',heroBtn2:'Koleksiyonları İncele',heroImg:'',
 proof:[{b:'500+',s:'Mutlu Çift'},{b:'%100',s:'El Emeği'},{b:'48 Saat',s:'Hızlı Hazırlık'}],
 collHead:{eb:'Koleksiyonlar',t:'Özel Günlerinize Özel Koleksiyonlar',s:'Her davetin kendine has bir hikâyesi var. Anınıza en yakışanı seçin.'},
 prodHead:{eb:'Ürünler',t:'Öne Çıkan Ürünler',s:'Kolonya şişelerinden mumlara, magnetlerden kına keselerine özenle hazırlanmış hediyelikler.'},
 howHead:{eb:'Süreç',t:'Nasıl Çalışır?'},
 steps:[{t:'Hayalinizi Anlatın',d:'İhtiyacınızı ve tercihlerinizi bizimle paylaşın.'},{t:'Tasarımı Onaylayın',d:'Size özel tasarımı hazırlayalım, onayınızı alalım.'},{t:'Özenle Hazırlayalım',d:'Ürünlerinizi el emeğiyle, büyük bir özenle hazırlayalım.'},{t:'Zamanında Teslim',d:'Belirttiğiniz tarihte, güvenle kapınıza teslim edelim.'}],
 whyHead:{eb:'Neden Biz',t:'Neden Davet Sandığı?'},
 why:[{t:'Kişiye Özel Tasarım',d:'İhtiyacınıza ve konseptinize özel kişiselleştirme.'},{t:'Özenli Hazırlık',d:'Her detayında emek ve özen barındırır.'},{t:'Özenle Seçilen Malzemeler',d:'Kaliteli, özenle seçilmiş malzemeler; şık ve zarif tasarımlar.'},{t:'Zamanında Teslimat',d:'Belirttiğiniz tarihte güvenli teslimat.'}],
 cta:{eb:'Birlikte Tasarlayalım',t:'Hayalinizdeki hediyeliği birlikte tasarlayalım.',p:'Size özel teklif almak ve detaylı bilgi için bizimle iletişime geçin. Fikirlerinizi birlikte hayata geçirelim.',btn:"WhatsApp'tan Teklif Al",img:''}
};
var DEF_BANNER={eyebrow:'Kişiye özel davet & hatıra tasarımları',title:'Özel anlarınız,\n*unutulmaz hatıralara* dönüşsün.',lead:'Söz, nişan, kına, nikâh ve tüm özel günleriniz için el emeğiyle hazırlanan, kişiye özel hediyelikler.',b1t:'Ürünleri Keşfet',b1l:'#urunler',b2t:'Koleksiyonları İncele',b2l:'#koleksiyonlar',img:'hero'};
function defSettings(){return{whatsapp:'905399413902',banners:[JSON.parse(JSON.stringify(DEF_BANNER))],instagram:'',phone:'+90 539 941 39 02',mail:'info@davetsandigi.com',addr:"Türkiye'nin her yerine teslimat",heroTitle:'',heroLead:'',minQty:25,stepQty:25,quoteThreshold:100,shipFee:150,shipFree:2500,orderNext:125,topbar:DEF_TOPBAR.slice(),reviews:JSON.parse(JSON.stringify(DEF_REVIEWS)),revHead:JSON.parse(JSON.stringify(DEF_REVHEAD)),faq:JSON.parse(JSON.stringify(DEF_FAQ)),story:JSON.parse(JSON.stringify(DEF_STORY)),legal:JSON.parse(JSON.stringify(DEF_LEGAL)),campaign:JSON.parse(JSON.stringify(DEF_CAMPAIGN)),home:JSON.parse(JSON.stringify(DEF_HOME))};}
function load(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v));if(FB&&fbUser&&(k===LS.p||k===LS.c||k===LS.o||k===LS.s)){clearTimeout(_cloudT);_cloudT=setTimeout(pushToCloud,700);}}
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
var occasions=load(LS.o,null)||DEF_OCC; if(!load(LS.o,null))save(LS.o,occasions);
var categories=load(LS.c,null)||DEF_CAT; if(!load(LS.c,null))save(LS.c,categories);
var products=load(LS.p,null)||seedProducts(); if(!load(LS.p,null))save(LS.p,products);
var settings=(function(){var d=defSettings(),s=load(LS.s,null);if(!s){save(LS.s,d);return d;}for(var k in d){if(s[k]===undefined)s[k]=d[k];}return s;})();
var cart=load(LS.cart,[]);
var wish=load('ds_wish_v1',[]);

/* ============ HELPERS ============ */
function $(s,r){return(r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
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
function waNumber(){return(settings.whatsapp||'').replace(/[^0-9]/g,'');}
function waLink(text){var n=waNumber();return'https://wa.me/'+(n?n:'')+'?text='+encodeURIComponent(text||'Merhaba, Davet Sandığı ürünleri hakkında bilgi almak istiyorum.');}
