/* Privacy-safe aggregate analytics. No cookies, identifiers or customer/cart data. */
(function(){
 var enabled=false,pageViewSent=false;
 var allowed={page_view:1,product_view:1,add_to_cart:1,whatsapp_request:1,instagram_click:1};
 function privacySignal(){return navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true;}
 function productionHost(){var h=location.hostname.toLowerCase();return h!=='localhost'&&h!=='127.0.0.1'&&!h.endsWith('.vercel.app');}
 function endpoint(){var url=String((window.SUPABASE_CONFIG||{}).url||'').replace(/\/$/,'');return url?url+'/functions/v1/analytics-event':'';}
 function device(){return window.matchMedia&&window.matchMedia('(max-width: 760px)').matches?'mobile':'desktop';}
 function track(eventType,productId){
  if(!enabled||privacySignal()||!allowed[eventType])return false;
  var url=endpoint();if(!url||!navigator.sendBeacon)return false;
  var payload={event_type:eventType,device:device(),referrer:String(document.referrer||'').slice(0,2048)};
  if(eventType==='product_view'||eventType==='add_to_cart'){
   var id=Number(productId);if(!Number.isSafeInteger(id)||id<1)return false;payload.product_id=id;
  }
  try{return navigator.sendBeacon(url,JSON.stringify(payload));}catch(error){return false;}
 }
 function configure(value){
  enabled=value===true&&productionHost();
  if(enabled&&!pageViewSent){pageViewSent=true;track('page_view');}
  return enabled;
 }
 window.dsAnalytics={configure:configure,track:track,isEnabled:function(){return enabled;}};
 window.__analyticsTest={privacySignal:privacySignal,productionHost:productionHost,device:device};
})();
