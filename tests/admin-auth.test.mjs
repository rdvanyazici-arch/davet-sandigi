import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../assets/js/admin-auth.js',import.meta.url),'utf8');
const configSource=await readFile(new URL('../assets/js/config.js',import.meta.url),'utf8');
const siteSource=await readFile(new URL('../assets/js/site.js',import.meta.url),'utf8');
const adminHtml=await readFile(new URL('../admin.html',import.meta.url),'utf8');

function element(){
 const classes=new Set();
 return{
  value:'',textContent:'',disabled:false,src:'',style:{},
  classList:{add:(name)=>classes.add(name),remove:(name)=>classes.delete(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name),contains:(name)=>classes.has(name)},
  addEventListener(){},focus(){}
 };
}

function contextFor(profile,{aal='aal1'}={}){
 const nodes=new Map();
 const get=(selector)=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
 let signOutCount=0;
 let mfaChecks=0;
 let replaced='';
 const query={select(){return this;},eq(){return this;},async maybeSingle(){return{data:profile,error:null};}};
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
  $:get,$all:()=>[],renderAdmin(){context.rendered=true;},startSupabaseClient(){},
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

test('yönetim paneli ortak HTML kaçış yardımcısını yükler',()=>{
 assert.match(configSource,/function esc\(s\)/);
 assert.doesNotMatch(siteSource,/function esc\(s\)/);
 assert.ok(adminHtml.indexOf('assets/js/config.js')<adminHtml.indexOf('assets/js/admin-products.js'));
});
