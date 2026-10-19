/* Admin navigation and module routing. */
function renderLegalAdmin(){
 var box=$('#legal-admin');if(!box)return;
 box.innerHTML='<p class="admin-note">Yasal metinler Faz 15 kapsamında, onaylı içerik geldikten sonra yönetilecektir. Bu bölümde henüz kaydedilebilir metin yok.</p>';
}
function switchView(view){
 $all('[data-view]',document.querySelector('.admin-panel')).forEach(function(button){var selected=button.getAttribute('data-view')===view;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 $all('.admin-view').forEach(function(node){node.classList.remove('show');});
 var selected=$('#view-'+view);if(selected)selected.classList.add('show');
 if(view==='media'&&typeof renderMediaLibrary==='function')renderMediaLibrary();
 if(view==='dashboard'&&typeof pagesRenderDashboard==='function')pagesRenderDashboard();
 if(typeof window.adminCloseMobileMenu==='function')window.adminCloseMobileMenu();
}
function adminOpenView(view){
 if(view==='add'){editingId=null;renderProductForm();}
 switchView(view);
}
$all('[data-view]',document.querySelector('.admin-panel')).forEach(function(button){
 button.addEventListener('click',function(){var view=button.getAttribute('data-view');if(view==='add'){editingId=null;renderProductForm();}switchView(view);});
});
function adminRunProductSearch(value){
 adminOpenView('products');
 var search=$('#admin-search');
 if(!search)return;
 search.value=String(value||'').trim();
 search.dispatchEvent(new Event('input',{bubbles:true}));
 search.focus();
}
var globalSearchForm=$('#admin-global-search-form');
if(globalSearchForm)globalSearchForm.addEventListener('submit',function(event){event.preventDefault();adminRunProductSearch($('#admin-global-search').value);});
var globalSearch=$('#admin-global-search');
if(globalSearch)globalSearch.addEventListener('search',function(){adminRunProductSearch(globalSearch.value);});
var newProduct=$('#admin-new-product');if(newProduct)newProduct.addEventListener('click',function(){adminOpenView('add');});
adminInitMobileMenu();
