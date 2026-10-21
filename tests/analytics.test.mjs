import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source=await readFile(new URL('../assets/js/analytics.js',import.meta.url),'utf8');

function runtime({dnt='0',gpc=false,beacon=()=>true,host='davetsandigi.com'}={}){
  const context={
    location:{hostname:host},
    document:{referrer:'https://www.google.com/search?q=davet'},
    navigator:{doNotTrack:dnt,globalPrivacyControl:gpc,sendBeacon:beacon},
    matchMedia:()=>({matches:false}),
    SUPABASE_CONFIG:{url:'https://example.supabase.co'}
  };
  context.window=context;
  vm.createContext(context);vm.runInContext(source,context);
  return context;
}

test('DNT ve GPC açıkken hiçbir analitik isteği göndermez',()=>{
  for(const options of [{dnt:'1'},{gpc:true}]){
    const calls=[],ctx=runtime({...options,beacon:(...args)=>{calls.push(args);return true;}});
    ctx.dsAnalytics.configure(true);
    ctx.dsAnalytics.track('add_to_cart',1);
    assert.equal(calls.length,0);
  }
});

test('canlı alan adında yalnız izinli ve kişisel verisiz olay gönderir',()=>{
  const calls=[],ctx=runtime({beacon:(url,body)=>{calls.push({url,body:JSON.parse(body)});return true;}});
  ctx.dsAnalytics.configure(true);
  ctx.dsAnalytics.track('product_view',42);
  assert.equal(calls.length,2);
  assert.deepEqual(Object.keys(calls[1].body).sort(),['device','event_type','product_id','referrer']);
  assert.equal(calls[1].body.product_id,42);
  assert.equal(ctx.dsAnalytics.track('unknown_event'),false);
});

test('Preview ve local adreslerinde bayrak açık olsa bile veri göndermez',()=>{
  for(const host of ['127.0.0.1','localhost','davet-sandigi-preview.vercel.app']){
    const calls=[],ctx=runtime({host,beacon:(...args)=>{calls.push(args);return true;}});
    assert.equal(ctx.dsAnalytics.configure(true),false);
    assert.equal(calls.length,0);
  }
});

test('sendBeacon hatası kullanıcı akışına taşınmaz',()=>{
  const ctx=runtime({beacon:()=>{throw new Error('network');}});
  ctx.dsAnalytics.configure(true);
  assert.equal(ctx.dsAnalytics.track('add_to_cart',1),false);
});
