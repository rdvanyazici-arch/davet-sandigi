function adminPw(){return localStorage.getItem(LS.pw)||'davet2026';}
function showAdminPanel(){$('#admin-login').style.display='none';$('#admin-panel').classList.add('show');renderAdmin();}
function openAdmin(){$('#admin').classList.add('open');document.body.style.overflow='hidden';if(FB&&fbUser)showAdminPanel();}
function closeAdmin(){location.href='index.html';}
function adminLogin(){
 var pw=$('#admin-pw').value,email=$('#admin-email')?$('#admin-email').value.trim():'';
 if(FB){$('#admin-err').textContent='Giriş yapılıyor…';fbAuth.signInWithEmailAndPassword(email,pw).then(function(){$('#admin-err').textContent='';}).catch(function(e){$('#admin-err').textContent='Giriş başarısız ('+(e.code||e.message)+')';});return;}
 if(pw===adminPw()){showAdminPanel();}else{$('#admin-err').textContent='Parola hatalı.';}
}
function adminLogout(){if(FB&&fbAuth)fbAuth.signOut();fbUser=null;$('#admin-panel').classList.remove('show');$('#admin-login').style.display='';closeAdmin();}
