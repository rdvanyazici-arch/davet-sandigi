var adminAuthClient=null;
var adminAuthProfile=null;
var adminMfaFactorId='';
var adminRefreshTimer=null;
var adminAuthRun=0;

function setAdminAuthScreen(screen){
 ['admin-login','admin-mfa-enroll','admin-mfa-challenge'].forEach(function(id){
  var node=$('#'+id);
  if(node)node.classList.toggle('admin-auth-hidden',id!==screen);
 });
}

function hideAdminPanel(){
 var panel=$('#admin-panel');
 if(panel)panel.classList.remove('show');
}

function showAdminLogin(message){
 adminAuthProfile=null;
 hideAdminPanel();
 setAdminAuthScreen('admin-login');
 var error=$('#admin-err');
 if(error)error.textContent=message||'';
 var password=$('#admin-pw');
 if(password)password.value='';
}

function showAdminPanel(profile){
 adminAuthProfile=profile;
 setAdminAuthScreen('');
 var panel=$('#admin-panel');
 if(panel)panel.classList.add('show');
 var count=$('#admin-count');
 if(count)count.textContent=(profile.display_name||profile.role)+' · '+(profile.role==='owner'?'Owner':'Editor');
 if(typeof renderAdmin==='function')renderAdmin();
}

function openAdmin(){
 var root=$('#admin');
 if(root)root.classList.add('open');
 document.body.style.overflow='hidden';
}

function closeAdmin(){location.replace('index.html');}

function setAdminBusy(isBusy){
 var button=$('#admin-login-btn');
 if(button){button.disabled=isBusy;button.textContent=isBusy?'Giriş yapılıyor…':'Giriş Yap';}
}

function setAdminDebugError(stage,error){
 var node=$('#admin-err');
 if(!node)return;
 node.dataset.errorStage=stage||'';
 node.dataset.errorMessage=String(error&&error.message||'').slice(0,240);
}

async function signOutUnauthorized(message){
 hideAdminPanel();
 if(adminAuthClient)await adminAuthClient.auth.signOut({scope:'local'}).catch(function(){});
 showAdminLogin(message||'Bu hesap yönetim paneline erişemez.');
}

async function loadAdminProfile(userId){
 var result=await adminAuthClient.from('admin_profiles')
  .select('user_id,display_name,role,is_active')
  .eq('user_id',userId)
  .maybeSingle();
 if(result.error)throw result.error;
 return result.data||null;
}

function showMfaEnroll(){
 hideAdminPanel();
 setAdminAuthScreen('admin-mfa-enroll');
 var fields=$('#admin-mfa-enroll-fields');
 if(fields)fields.classList.add('admin-auth-hidden');
 var start=$('#admin-mfa-start');
 if(start)start.classList.remove('admin-auth-hidden');
 var error=$('#admin-mfa-enroll-err');
 if(error)error.textContent='';
}

function showMfaChallenge(factorId){
 adminMfaFactorId=factorId;
 hideAdminPanel();
 setAdminAuthScreen('admin-mfa-challenge');
 var code=$('#admin-mfa-code');
 if(code){code.value='';code.focus();}
 var error=$('#admin-mfa-challenge-err');
 if(error)error.textContent='';
}

async function requireOwnerMfa(){
 var level=await adminAuthClient.auth.mfa.getAuthenticatorAssuranceLevel();
 if(level.error)throw level.error;
 if(level.data.currentLevel==='aal2')return true;
 var factors=await adminAuthClient.auth.mfa.listFactors();
 if(factors.error)throw factors.error;
 var verified=(factors.data.totp||[]).filter(function(factor){return factor.status==='verified';});
 if(verified.length)showMfaChallenge(verified[0].id);
 else showMfaEnroll();
 return false;
}

function scheduleSessionRefresh(session){
 clearTimeout(adminRefreshTimer);
 if(!session||!session.expires_at)return;
 var wait=Math.max(15000,(session.expires_at*1000)-Date.now()-60000);
 adminRefreshTimer=setTimeout(refreshAdminSession,wait);
}

async function refreshAdminSession(){
 if(!adminAuthClient)return;
 var refreshed=await adminAuthClient.auth.refreshSession();
 if(refreshed.error||!refreshed.data.session){
  await signOutUnauthorized('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
  return;
 }
 scheduleSessionRefresh(refreshed.data.session);
}

async function authorizeAdminSession(session){
 var run=++adminAuthRun;
 if(!session||!session.user){showAdminLogin('');return false;}
 var profile=null;
 try{
  profile=await loadAdminProfile(session.user.id);
 }catch(error){
  console.error('[admin-auth] Profile lookup failed',error);
  setAdminDebugError('profile',error);
  if(run===adminAuthRun)await signOutUnauthorized('Yönetici profili doğrulanamadı. Lütfen tekrar deneyin.');
  return false;
 }
 if(run!==adminAuthRun)return false;
 if(!profile||!profile.is_active||['owner','editor'].indexOf(profile.role)===-1){
  await signOutUnauthorized('Bu hesap yönetim paneline erişemez.');
  return false;
 }
 adminAuthProfile=profile;
 scheduleSessionRefresh(session);
 if(profile.role==='owner'){
  try{
   if(!(await requireOwnerMfa()))return false;
  }catch(error){
   console.error('[admin-auth] MFA check failed',error);
   setAdminDebugError('mfa',error);
   if(run===adminAuthRun)await signOutUnauthorized('MFA durumu doğrulanamadı. Lütfen tekrar deneyin.');
   return false;
  }
 }
 if(run!==adminAuthRun)return false;
 try{
  showAdminPanel(profile);
  return true;
 }catch(error){
  console.error('[admin-auth] Panel render failed',error);
  setAdminDebugError('panel',error);
  if(run===adminAuthRun)await signOutUnauthorized('Yönetim paneli yüklenemedi. Lütfen tekrar deneyin.');
  return false;
 }
}

async function adminLogin(event){
 if(event)event.preventDefault();
 var email=$('#admin-email').value.trim();
 var password=$('#admin-pw').value;
 var error=$('#admin-err');
 error.textContent='';
 error.dataset.errorStage='';
 error.dataset.errorMessage='';
 setAdminBusy(true);
 var result=await adminAuthClient.auth.signInWithPassword({email:email,password:password});
 setAdminBusy(false);
 if(result.error||!result.data.session){
  error.textContent='E-posta veya parola hatalı.';
  $('#admin-pw').value='';
  return;
 }
 await authorizeAdminSession(result.data.session);
}

async function startMfaEnrollment(){
 var error=$('#admin-mfa-enroll-err');
 error.textContent='';
 var result=await adminAuthClient.auth.mfa.enroll({factorType:'totp',friendlyName:'Davet Sandığı Owner'});
 if(result.error){error.textContent='MFA kurulumu başlatılamadı. Lütfen tekrar deneyin.';return;}
 adminMfaFactorId=result.data.id;
 $('#admin-mfa-qr').src=result.data.totp.qr_code;
 $('#admin-mfa-secret').textContent=result.data.totp.secret;
 $('#admin-mfa-enroll-fields').classList.remove('admin-auth-hidden');
 $('#admin-mfa-start').classList.add('admin-auth-hidden');
 $('#admin-mfa-enroll-code').focus();
}

async function verifyMfaCode(inputId,errorId){
 var code=$(inputId).value.replace(/\D/g,'').slice(0,6);
 var error=$(errorId);
 error.textContent='';
 if(code.length!==6){error.textContent='6 haneli doğrulama kodunu girin.';return;}
 var challenge=await adminAuthClient.auth.mfa.challenge({factorId:adminMfaFactorId});
 if(challenge.error){error.textContent='Doğrulama başlatılamadı. Lütfen tekrar deneyin.';return;}
 var verified=await adminAuthClient.auth.mfa.verify({factorId:adminMfaFactorId,challengeId:challenge.data.id,code:code});
 if(verified.error){error.textContent='Doğrulama kodu hatalı veya süresi dolmuş.';return;}
 var session=verified.data&&verified.data.session;
 if(!session){
  var refreshed=await adminAuthClient.auth.refreshSession();
  if(refreshed.error||!refreshed.data.session){
   error.textContent='MFA oturumu yenilenemedi. Lütfen tekrar giriş yapın.';
   return;
  }
  session=refreshed.data.session;
 }
 await authorizeAdminSession(session);
}

async function adminLogout(){
 ++adminAuthRun;
 clearTimeout(adminRefreshTimer);
 hideAdminPanel();
 if(adminAuthClient)await adminAuthClient.auth.signOut({scope:'local'}).catch(function(){});
 history.replaceState(null,'',location.pathname);
 closeAdmin();
}

function bindAdminAuthEvents(){
 $('#admin-login-form').addEventListener('submit',adminLogin);
 $('#admin-mfa-start').addEventListener('click',startMfaEnrollment);
 $('#admin-mfa-enroll-verify').addEventListener('click',function(){verifyMfaCode('#admin-mfa-enroll-code','#admin-mfa-enroll-err');});
 $('#admin-mfa-verify').addEventListener('click',function(){verifyMfaCode('#admin-mfa-code','#admin-mfa-challenge-err');});
 $all('[data-admin-signout]').forEach(function(button){button.addEventListener('click',adminLogout);});
 $('#admin-logout').addEventListener('click',adminLogout);
 $('#admin-exit').addEventListener('click',closeAdmin);
 window.addEventListener('popstate',function(){
  if(!adminAuthClient)return;
  adminAuthClient.auth.getSession().then(function(result){if(!result.data.session)showAdminLogin('');});
 });
 document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&adminAuthProfile)refreshAdminSession();
 });
}

function initAdminAuth(){
 openAdmin();
 bindAdminAuthEvents();
 var note=$('#admin-login-note');
 note.textContent='Güvenli bağlantı kuruluyor…';
 startSupabaseClient(function(client,error){
  if(error||!client){note.textContent='Bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.';return;}
  adminAuthClient=client;
  note.textContent='';
  client.auth.onAuthStateChange(function(event,session){
   if(event==='SIGNED_OUT'){showAdminLogin('');return;}
   if(event==='TOKEN_REFRESHED'){scheduleSessionRefresh(session);return;}
   if(event==='SIGNED_IN')setTimeout(function(){authorizeAdminSession(session);},0);
  });
  client.auth.getSession().then(function(result){authorizeAdminSession(result.data.session);});
 });
}

window.addEventListener('DOMContentLoaded',initAdminAuth);
