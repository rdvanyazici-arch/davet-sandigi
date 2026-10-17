/* Shared Supabase admin UI helpers. */
function toast(message){
 var node=$('#toast');if(!node)return;
 node.textContent=message;node.classList.add('show');clearTimeout(node._timer);
 node._timer=setTimeout(function(){node.classList.remove('show');},1900);
}
function renderLegalAdmin(){
 var box=$('#legal-admin');if(!box)return;
 box.innerHTML='<p class="admin-note">Yasal metinler Faz 15 kapsamında, onaylı içerik geldikten sonra yönetilecektir. Bu bölümde henüz kaydedilebilir metin yok.</p>';
}
function switchView(view){
 $all('.admin-tabs button').forEach(function(button){button.classList.toggle('active',button.getAttribute('data-view')===view);});
 $all('.admin-view').forEach(function(node){node.classList.remove('show');});
 var selected=$('#view-'+view);if(selected)selected.classList.add('show');
 if(view==='media'&&typeof renderMediaLibrary==='function')renderMediaLibrary();
 if(view==='dashboard'&&typeof pagesRenderDashboard==='function')pagesRenderDashboard();
}
$all('.admin-tabs button').forEach(function(button){
 button.addEventListener('click',function(){var view=button.getAttribute('data-view');if(view==='add'){editingId=null;renderProductForm();}switchView(view);});
});
