import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile, readdir } from 'node:fs/promises';

const source=await readFile(new URL('../assets/js/admin-auth.js',import.meta.url),'utf8');
const configSource=await readFile(new URL('../assets/js/config.js',import.meta.url),'utf8');
const siteSource=await readFile(new URL('../assets/js/site.js',import.meta.url),'utf8');
const contentSource=await readFile(new URL('../assets/js/admin-content.js',import.meta.url),'utf8');
const mediaSource=await readFile(new URL('../assets/js/admin-media.js',import.meta.url),'utf8');
const adminHtml=await readFile(new URL('../admin.html',import.meta.url),'utf8');

function element(){
 const classes=new Set();
 return{
  value:'',textContent:'',disabled:false,src:'',style:{},dataset:{},
  classList:{add:(name)=>classes.add(name),remove:(name)=>classes.delete(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name),contains:(name)=>classes.has(name)},
  addEventListener(){},focus(){}
 };
}

function contextFor(profile,{aal='aal1',profileError=null,renderError=null}={}){
 const nodes=new Map();
 const get=(selector)=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
 let signOutCount=0;
 let mfaChecks=0;
 let replaced='';
 const query={select(){return this;},eq(){return this;},async maybeSingle(){return{data:profile,error:profileError};}};
 const client={
  from(){return query;},
  auth:{
   async signOut(){signOutCount++;return{error:null};},
   mfa:{
    async getAuthenticatorAssuranceLevel(){mfaChecks++;return{data:{currentLevel:aal,nextLevel:aal},error:null};},
    async listFactors(){return{data:{totp:[]},error:null};}
   }
  }
 };
 const context={
  console,setTimeout:()=>0,clearTimeout(){},
  window:{addEventListener(){}},document:{body:{style:{}},addEventListener(){},visibilityState:'visible'},
  location:{pathname:'/admin.html',replace:(value)=>{replaced=value;}},history:{replaceState(){}},
  $:get,$all:()=>[],renderAdmin(){if(renderError)throw renderError;context.rendered=true;},startSupabaseClient(){},
  rendered:false
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 context.adminAuthClient=client;
 return{context,get,stats:()=>({signOutCount,mfaChecks,replaced})};
}

test('profil kaydı olmayan kullanıcı paneli göremez',async()=>{
 const fixture=contextFor(null);
 const allowed=await fixture.context.authorizeAdminSession({user:{id:'regular'},expires_at:9999999999});
 assert.equal(allowed,false);
 assert.equal(fixture.context.rendered,false);
 assert.equal(fixture.stats().signOutCount,1);
});

test('pasif admin oturumu kapatılır',async()=>{
 const fixture=contextFor({user_id:'inactive',display_name:'Inactive',role:'editor',is_active:false});
 await fixture.context.authorizeAdminSession({user:{id:'inactive'},expires_at:9999999999});
 assert.equal(fixture.context.rendered,false);
 assert.equal(fixture.stats().signOutCount,1);
});

test('editor paneli açar, owner AAL2 olmadan açamaz',async()=>{
 const editor=contextFor({user_id:'editor',display_name:'Editor',role:'editor',is_active:true});
 assert.equal(await editor.context.authorizeAdminSession({user:{id:'editor'},expires_at:9999999999}),true);
 assert.equal(editor.context.rendered,true);
 assert.equal(editor.stats().mfaChecks,0);

 const owner=contextFor({user_id:'owner',display_name:'Owner',role:'owner',is_active:true});
 assert.equal(await owner.context.authorizeAdminSession({user:{id:'owner'},expires_at:9999999999}),false);
 assert.equal(owner.context.rendered,false);
 assert.equal(owner.stats().mfaChecks,1);
});

test('çıkış paneli kapatır ve geri dönüşte admin sayfasını korumaz',async()=>{
 const fixture=contextFor({user_id:'editor',display_name:'Editor',role:'editor',is_active:true});
 fixture.get('#admin-panel').classList.add('show');
 await fixture.context.adminLogout();
 assert.equal(fixture.get('#admin-panel').classList.contains('show'),false);
 assert.equal(fixture.stats().signOutCount,1);
 assert.equal(fixture.stats().replaced,'index.html');
});

test('yönetim paneli Supabase ayarlarını yükler ve Firebase/localStorage legacy kodunu içermez',()=>{
 assert.match(configSource,/function esc\(s\)/);
 assert.doesNotMatch(configSource,/firebase|firestore|CLOUD_IMG|ds_cloudimg|pushToCloud|img:/i);
 assert.doesNotMatch(contentSource,/localStorage|FileReader|firebase|firestore|admin-import|admin-export/i);
 assert.doesNotMatch(mediaSource,/FileReader|firebase|uploadImage|resizeImage\(/i);
 assert.doesNotMatch(siteSource,/function esc\(s\)/);
 assert.doesNotMatch(adminHtml,/legacy-firebase|firebasejs|firebaseapp|admin-import|admin-export|googleapis|fonts\.googleapis|fonts\.gstatic/i);
 assert.ok(adminHtml.indexOf('assets/js/config.js')<adminHtml.indexOf('assets/js/admin-products.js'));
 assert.match(adminHtml,/assets\/js\/config\.js\?v=\d{8}-\d+/);
 assert.match(adminHtml,/assets\/js\/admin-auth\.js\?v=\d{8}-\d+/);
});

test('uygulama runtime kaynaklarında Firebase istemci kodu veya endpoint kalmadı',async()=>{
 const runtimeFiles=['index.html','admin.html','scripts/generate-supabase-config.mjs','scripts/generate-sitemap.mjs','scripts/sitemap-core.mjs'];
 for(const directory of ['assets/js']){
  const entries=await readdir(new URL('../'+directory+'/',import.meta.url),{withFileTypes:true});
  runtimeFiles.push(...entries.filter(entry=>entry.isFile()&&/\.(?:html|js|mjs)$/i.test(entry.name)).map(entry=>directory+'/'+entry.name));
 }
 for(const file of runtimeFiles){
  const content=await readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.doesNotMatch(content,/firebase|firestore|googleapis/i,file);
 }
});

test('profil ve panel hataları ayrı mesajlarla güvenli biçimde durur',async()=>{
 const profileFailure=contextFor(null,{profileError:{code:'TEST'}});
 assert.equal(await profileFailure.context.authorizeAdminSession({user:{id:'owner'},expires_at:9999999999}),false);
 assert.equal(profileFailure.get('#admin-err').textContent,'Yönetici profili doğrulanamadı. Lütfen tekrar deneyin.');

 const renderFailure=contextFor({user_id:'editor',display_name:'Editor',role:'editor',is_active:true},{renderError:new Error('render')});
 assert.equal(await renderFailure.context.authorizeAdminSession({user:{id:'editor'},expires_at:9999999999}),false);
 assert.equal(renderFailure.get('#admin-err').textContent,'Yönetim paneli yüklenemedi. Lütfen tekrar deneyin.');
});

test('MFA doğrulamasından dönen güncel oturum doğrudan kullanılır',()=>{
 assert.match(source,/verified\.data&&verified\.data\.session/);
});
