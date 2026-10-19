/* Admin navigation and module routing. */
function renderLegalAdmin(){
 var box=$('#legal-admin');if(!box)return;
 box.innerHTML='<p class="admin-note">Yasal metinler Faz 15 kapsamında, onaylı içerik geldikten sonra yönetilecektir. Bu bölümde henüz kaydedilebilir metin yok.</p>';
}
function switchView(view){
 $all('.admin-tabs button').forEach(function(button){var selected=button.getAttribute('data-view')===view;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 $all('.admin-view').forEach(function(node){node.classList.remove('show');});
 var selected=$('#view-'+view);if(selected)selected.classList.add('show');
 if(view==='media'&&typeof renderMediaLibrary==='function')renderMediaLibrary();
 if(view==='dashboard'&&typeof pagesRenderDashboard==='function')pagesRenderDashboard();
 if(typeof window.adminCloseMobileMenu==='function')window.adminCloseMobileMenu();
}
$all('.admin-tabs button').forEach(function(button){
 button.addEventListener('click',function(){var view=button.getAttribute('data-view');if(view==='add'){editingId=null;renderProductForm();}switchView(view);});
});
adminInitMobileMenu();
