import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../assets/js/admin-report-utils.js',import.meta.url),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(source,context);const utils=context.window.AdminReportUtils;

test('CSV UTF-8 BOM ve noktalı virgül kullanır',()=>{
 const csv=utils.csv([{label:'Ürün',key:'name'},{label:'Fiyat',value:row=>utils.price(row.price)}],[{name:'Şişe; özel',price:38}]);
 assert.equal(csv.charCodeAt(0),0xFEFF);assert.match(csv,/Ürün;Fiyat\r\n"Şişe; özel";38,00/);
});

test('CSV formül enjeksiyonu başlangıç karakterlerini kaçırır',()=>{
 for(const value of ['=1+1','+SUM(A1)','-2+3','@cmd'])assert.equal(utils.safeCell(value)[0],"'");
 assert.equal(utils.safeCell('Normal'),'Normal');
});

test('fiyatlar iki ondalık ve virgüllü üretilir',()=>{
 assert.equal(utils.price(38),'38,00');assert.equal(utils.price('12.5'),'12,50');assert.equal(utils.price(null),'');
});
