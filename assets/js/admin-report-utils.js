/* Pure export helpers shared by admin reports and tests. */
(function(global){
 var FORMULA_PREFIX=/^[=+\-@]/;
 function text(value){return value===null||value===undefined?'':String(value);}
 function safeCell(value){var result=text(value);return FORMULA_PREFIX.test(result.trimStart())?"'"+result:result;}
 function quote(value){var result=safeCell(value).replace(/"/g,'""');return /[;"\r\n]/.test(result)?'"'+result+'"':result;}
 function price(value){if(value===null||value===undefined||value==='')return'';var number=Number(value);return Number.isFinite(number)?number.toFixed(2).replace('.',','):'';}
 function csv(columns,rows){
  var header=columns.map(function(column){return quote(column.label);}).join(';');
  var lines=(rows||[]).map(function(row){return columns.map(function(column){var value=typeof column.value==='function'?column.value(row):row[column.key];return quote(value);}).join(';');});
  return '\uFEFF'+[header].concat(lines).join('\r\n');
 }
 function dateStamp(date){var value=date||new Date(),pad=function(number){return String(number).padStart(2,'0');};return value.getFullYear()+pad(value.getMonth()+1)+pad(value.getDate());}
 function json(value){return JSON.stringify(value,null,2);}
 global.AdminReportUtils={safeCell:safeCell,quote:quote,price:price,csv:csv,dateStamp:dateStamp,json:json};
})(window);
