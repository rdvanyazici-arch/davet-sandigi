var adminManagersState={rows:[],loading:false};

function adminManagersDate(value){if(!value)return'—';try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(value));}catch(error){return value;}}
function adminManagersStatus(message,isError){var node=$('#admin-managers-status');if(!node)return;node.textContent=message||'';node.classList.toggle('media-error',!!isError);}

function adminApplyRoleVisibility(){
 var owner=adminIsOwner()&&adminMfaLevel==='aal2';$all('[data-owner-only]').forEach(function(node){node.hidden=!owner;});
 if(!owner&&$('#view-admins')&&$('#view-admins').classList.contains('show'))switchView('dashboard',{force:true});
}

async function adminManagersRequireAccess(){
 if(!adminIsOwner())return false;
 if(adminMfaLevel==='aal2')return true;
 try{return await requireOwnerMfa();}catch(error){errorDialog({title:'MFA doğrulanamadı',error:error});return false;}
}

async function adminManagersLoad(){
 if(adminManagersState.loading)return;adminManagersState.loading=true;adminManagersStatus('Yöneticiler yükleniyor…',false);
 try{var result=await adminAuthClient.from('admin_profiles').select('user_id,display_name,role,is_active,created_at,updated_at').order('created_at');if(result.error)throw result.error;adminManagersState.rows=result.data||[];adminManagersDraw();adminManagersStatus(adminManagersState.rows.length+' yönetici profili.',false);}catch(error){adminShowInlineError($('#admin-managers-status'),'Yöneticiler yüklenemedi: ',error);}finally{adminManagersState.loading=false;}
}

function adminManagersDraw(){
 var box=$('#admin-managers-list');if(!box)return;var current=adminAuthProfile&&adminAuthProfile.user_id;
 box.innerHTML=adminManagersState.rows.length?adminManagersState.rows.map(function(row){var self=row.user_id===current;return'<article class="manager-card" data-manager-id="'+row.user_id+'"><div><strong>'+esc(row.display_name)+'</strong><small>'+esc(row.user_id)+'</small><span>Oluşturulma: '+esc(adminManagersDate(row.created_at))+'</span></div><label>Rol<select data-manager-role'+(self?' disabled':'')+'><option value="editor"'+(row.role==='editor'?' selected':'')+'>Editor</option><option value="owner"'+(row.role==='owner'?' selected':'')+'>Owner</option></select></label><label class="taxonomy-check"><input data-manager-active type="checkbox"'+(row.is_active?' checked':'')+(self?' disabled':'')+'> Aktif</label><button class="a-btn primary" data-manager-save type="button"'+(self?' disabled':'')+'>Kaydet</button>'+(self?'<small class="admin-note">Kendi rolünüz ve durumunuz bu ekrandan değiştirilemez.</small>':'')+'</article>';}).join(''):'<div class="taxonomy-empty">Yönetici profili bulunamadı.</div>';
 $all('[data-manager-save]',box).forEach(function(button){button.onclick=function(){adminManagersSave(button.closest('[data-manager-id]'));};});
}

async function adminManagersSave(card){
 var id=card.dataset.managerId,role=card.querySelector('[data-manager-role]').value,isActive=card.querySelector('[data-manager-active]').checked,row=adminManagersState.rows.find(function(item){return item.user_id===id;});
 if(!(await confirmDialog({title:'Yönetici yetkisini güncelle',message:(row?row.display_name:'Bu yönetici')+' için rol '+role+' ve durum '+(isActive?'aktif':'pasif')+' olarak kaydedilecek.',confirmText:'Güncelle',danger:!isActive})))return;
 try{var result=await adminAuthClient.rpc('set_admin_status',{p_user_id:id,p_role:role,p_is_active:isActive});if(result.error)throw result.error;toast('Yönetici profili güncellendi.');await adminManagersLoad();}catch(error){errorDialog({title:'Yönetici güncellenemedi',error:error});}
}

async function adminManagersAdd(event){
 event.preventDefault();var userId=$('#manager-user-id').value.trim(),name=$('#manager-display-name').value.trim(),role=$('#manager-role').value;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)){adminManagersStatus('Geçerli bir kullanıcı UUID değeri girin.',true);return;}if(!name){adminManagersStatus('Yönetici adı zorunludur.',true);return;}
 try{var result=await adminAuthClient.rpc('add_admin_profile',{p_user_id:userId,p_display_name:name,p_role:role});if(result.error)throw result.error;event.currentTarget.reset();toast('Yönetici profili eklendi.');await adminManagersLoad();}catch(error){adminShowInlineError($('#admin-managers-status'),'Yönetici eklenemedi: ',error);}
}

async function adminManagersRender(){
 var box=$('#admin-managers');if(!box)return;if(!(await adminManagersRequireAccess())){box.innerHTML='<div class="taxonomy-empty media-error">Bu bölüm yalnız MFA doğrulaması yapılmış owner tarafından açılabilir.</div>';return;}
 box.innerHTML='<section class="manager-instructions"><h2>Yeni yönetici ekleme</h2><ol><li>Supabase Dashboard → Authentication → Users bölümünde kullanıcıyı oluşturun.</li><li>Kullanıcının UUID değerini kopyalayın.</li><li>Aşağıdaki formda ad ve rolü belirleyin.</li></ol><p class="admin-note">Panel Auth hesabı oluşturmaz ve service_role anahtarı kullanmaz. İleride güvenli davet akışı için ayrı bir Edge Function değerlendirilebilir.</p></section><form id="manager-add-form" class="taxonomy-form"><h3>Yönetici profili ekle</h3><div class="admin-grid-3"><label>Kullanıcı UUID<input id="manager-user-id" required autocomplete="off"></label><label>Ad<input id="manager-display-name" required maxlength="120"></label><label>Rol<select id="manager-role"><option value="editor">Editor</option><option value="owner">Owner</option></select></label></div><button class="admin-save" type="submit">Profili Ekle</button></form><div id="admin-managers-status" class="admin-note" role="status" aria-live="polite"></div><div id="admin-managers-list" class="manager-list"></div>';
 $('#manager-add-form').onsubmit=adminManagersAdd;adminManagersLoad();
}

window.__adminManagersTest={applyVisibility:adminApplyRoleVisibility};
