/* Shared, accessible admin feedback and dialog helpers. */
function toast(message){
 var node=$('#toast');if(!node)return;
 node.textContent=message;node.classList.add('show');clearTimeout(node._timer);
 node._timer=setTimeout(function(){node.classList.remove('show');},1900);
}
function adminIsOwner(){return!!(window.adminAuthProfile&&window.adminAuthProfile.role==='owner');}
function adminRawError(error){return String(error&&error.message||error&&error.details||error||'').trim();}
function adminErrorInfo(error){
 var raw=adminRawError(error),code=String(error&&error.code||''),text=(code+' '+raw).toLocaleLowerCase('tr-TR'),message='İşlem tamamlanamadı. Lütfen tekrar deneyin.';
 if(code==='23505'&&/sku/.test(text))message='Bu SKU başka bir üründe kullanılıyor.';
 else if(code==='23505'&&/slug/.test(text))message='Bu slug başka bir kayıtta kullanılıyor.';
 else if(/jwt|session|refresh token|oturum/.test(text))message='Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.';
 else if(code==='42501'||/permission|policy|row-level security|rls|yetki/.test(text))message='Bu işlem için yetkiniz yok.';
 else if(/failed to fetch|network|load failed|ağ|bağlantı/.test(text))message='Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.';
 else if(/kullanımdaki görsel|unsafe media|still referenced|foreign key/.test(text))message='Kullanımdaki görsel arşivlenemez veya silinemez.';
 else if(/primary image|ana görsel|one active primary/.test(text))message='Aktif ürün için ana görsel zorunludur.';
 return{message:message,technical:raw&&raw!==message?raw:''};
}
function adminErrorText(error){return adminErrorInfo(error).message;}
function adminErrorHtml(error){var info=adminErrorInfo(error);return esc(info.message)+(info.technical?'<details class="admin-technical-details"><summary>Teknik ayrıntı</summary><code>'+esc(info.technical)+'</code></details>':'');}
function adminShowInlineError(node,prefix,error){if(!node)return;node.innerHTML=esc(prefix||'')+adminErrorHtml(error);node.classList.add('media-error');}
function adminFocusable(root){return $all('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',root).filter(function(node){return !node.hidden;});}
function adminOpenDialog(options){
 var opener=options.opener||document.activeElement,overlay=el('div',options.overlayClass||'admin-dialog-overlay');
 overlay.innerHTML='<div class="'+(options.dialogClass||'admin-dialog')+'" role="dialog" aria-modal="true"'+(options.labelledBy?' aria-labelledby="'+esc(options.labelledBy)+'"':' aria-label="'+esc(options.label||'İletişim penceresi')+'"')+'>'+options.html+'</div>';
 document.body.appendChild(overlay);var dialog=overlay.firstElementChild,closed=false;
 function close(value){if(closed)return;closed=true;document.removeEventListener('keydown',onKey,true);overlay.remove();if(opener&&opener.focus)opener.focus();if(options.onClose)options.onClose(value);}
 function onKey(event){if(event.key==='Escape'){event.preventDefault();close(false);return;}if(event.key!=='Tab')return;var nodes=adminFocusable(dialog);if(!nodes.length){event.preventDefault();dialog.focus();return;}var first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 document.addEventListener('keydown',onKey,true);overlay.addEventListener('click',function(event){if(event.target===overlay&&options.closeOnBackdrop!==false)close(false);});
 var first=adminFocusable(dialog)[0];if(first)first.focus();else{dialog.tabIndex=-1;dialog.focus();}
 return{root:overlay,dialog:dialog,close:close};
}
function confirmDialog(options){return new Promise(function(resolve){var done=false,dialog=adminOpenDialog({labelledBy:'admin-confirm-title',closeOnBackdrop:false,onClose:function(value){if(!done){done=true;resolve(!!value);}},html:'<h2 id="admin-confirm-title">'+esc(options.title||'Onay')+'</h2><p>'+esc(options.message||'')+'</p><div class="admin-dialog-actions"><button class="a-btn" data-dialog-cancel type="button">Vazgeç</button><button class="a-btn '+(options.danger?'media-danger':'primary')+'" data-dialog-confirm type="button">'+esc(options.confirmText||'Onayla')+'</button></div>'});dialog.root.querySelector('[data-dialog-cancel]').onclick=function(){dialog.close(false);};dialog.root.querySelector('[data-dialog-confirm]').onclick=function(){dialog.close(true);};});}
function errorDialog(options){var data=typeof options==='string'?{message:options}:options||{},info=data.error?adminErrorInfo(data.error):{message:data.message||'İşlem tamamlanamadı.',technical:data.technical||''},dialog=adminOpenDialog({labelledBy:'admin-error-title',html:'<h2 id="admin-error-title">'+esc(data.title||'İşlem tamamlanamadı')+'</h2><p>'+esc(info.message)+'</p>'+(info.technical?'<details class="admin-technical-details"><summary>Teknik ayrıntı</summary><code>'+esc(info.technical)+'</code></details>':'')+'<div class="admin-dialog-actions"><button class="a-btn primary" data-dialog-close type="button">Kapat</button></div>'});dialog.root.querySelector('[data-dialog-close]').onclick=function(){dialog.close(true);};return dialog;}
function adminInitMobileMenu(){
 var side=$('#admin-side'),open=$('#admin-menu-open'),close=$('#admin-menu-close'),overlay=$('#admin-menu-overlay');if(!side||!open||!close||!overlay)return;
 function setOpen(value){side.classList.toggle('open',value);overlay.classList.toggle('show',value);open.setAttribute('aria-expanded',String(value));if(value)close.focus();else open.focus();}
 open.onclick=function(){setOpen(true);};close.onclick=function(){setOpen(false);};overlay.onclick=function(){setOpen(false);};
 document.addEventListener('keydown',function(event){if(event.key==='Escape'&&side.classList.contains('open')){event.preventDefault();setOpen(false);}else if(event.key==='Tab'&&side.classList.contains('open')&&matchMedia('(max-width:760px)').matches){var nodes=adminFocusable(side),first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 window.adminCloseMobileMenu=function(){if(side.classList.contains('open'))setOpen(false);};
}
window.__adminUiTest={errorInfo:adminErrorInfo,isOwner:adminIsOwner};
