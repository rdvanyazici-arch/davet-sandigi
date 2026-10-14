/* Supabase istemcisi yalnızca proje URL'sini ve publishable key'i kullanır. */
var dsSupabaseClient=null;
var SUPABASE_JS_URL='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js';

function getSupabaseBrowserConfig(){
 return{
  url:String((SUPABASE_CONFIG&&SUPABASE_CONFIG.url)||''),
  publishableKey:String((SUPABASE_CONFIG&&SUPABASE_CONFIG.publishableKey)||'')
 };
}

function startSupabaseClient(done){
 var callback=typeof done==='function'?done:function(){};
 var config=getSupabaseBrowserConfig();
 if(!config.url||!config.publishableKey){callback(null,'Supabase yapılandırması eksik.');return;}

 function initialize(){
  if(!window.supabase||typeof window.supabase.createClient!=='function'){
   callback(null,'Supabase istemci kütüphanesi yüklenemedi.');
   return;
  }
  dsSupabaseClient=window.supabase.createClient(config.url,config.publishableKey,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
  });
  callback(dsSupabaseClient,null);
 }

 if(window.supabase&&typeof window.supabase.createClient==='function'){initialize();return;}
 var existing=document.querySelector('script[data-supabase-client]');
 if(existing){existing.addEventListener('load',initialize,{once:true});return;}
 var script=document.createElement('script');
 script.src=SUPABASE_JS_URL;
 script.async=true;
 script.dataset.supabaseClient='true';
 script.onload=initialize;
 script.onerror=function(){callback(null,'Supabase istemci kütüphanesi yüklenemedi.');};
 document.head.appendChild(script);
}
