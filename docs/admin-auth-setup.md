# Faz 6 — Supabase Auth ve İlk Owner Kurulumu

Bu adımlar `Davet Sandığı` projesinde (`zdksvgtkeeweufuajugd`) uygulanmalıdır.
Başka Supabase projesinde işlem yapmayın. Gizli anahtarları hiçbir dosyaya yazmayın.

## 1. Dashboard güvenlik ayarları

1. Supabase Dashboard > **Authentication > Sign In / Providers > Email** bölümünü açın.
2. **Allow new users to sign up** seçeneğini kapatın. Müşteri kaydı olmayacaktır.
3. **Confirm Email** seçeneğinin açık olduğunu doğrulayın.
4. **Authentication > Users > Add user > Create new user** ile yalnızca yönetici e-posta
   adresinizi kullanarak tek kullanıcı oluşturun. En az 16 karakterli, benzersiz bir parola
   kullanın ve parolayı GitHub'a, koda veya bu belgeye yazmayın.
5. Kullanıcının e-postasının doğrulanmış olduğunu Users ekranından kontrol edin. Manuel
   kullanıcı oluştururken görünen **Auto Confirm User** seçeneğini kullanabilirsiniz.
6. **Authentication > Multi-Factor** bölümünde TOTP enrollment, challenge ve verification
   işlemlerinin açık olduğunu doğrulayın. Owner ilk girişinde yönetim paneli QR kodu gösterecek;
   Authenticator uygulamasıyla taratıp 6 haneli kodu girin. Owner, AAL2 doğrulaması olmadan
   yönetim verilerine erişemez.
7. **Authentication > Password Security** bölümünde minimum uzunluğu en az 14 yapın;
   büyük harf, küçük harf, rakam ve sembol zorunluluğunu açın. Plan destekliyorsa sızdırılmış
   parola kontrolünü de açın.
8. **Authentication > Rate Limits** bölümünde sign-in ve token limitlerini kontrol edin.
   Varsayılanlardan daha yüksek değer vermeyin. Tek yönetici için sign-in trafiği beklenmez;
   olağan dışı artışta Auth loglarını inceleyin. MFA challenge limiti Supabase tarafından
   yönetilir.
9. Supabase hesap güvenliği için ayrıca **Account > Security** bölümünde kendi dashboard
   hesabınızın MFA özelliğini açın. Bu, uygulamadaki owner TOTP'sinden ayrı bir korumadır.

## 2. İlk owner profilini ekleme

Önce Authentication > Users ekranından oluşturduğunuz kullanıcının UUID değerini kopyalayın.
Aşağıdaki SQL'de yalnızca `00000000-0000-0000-0000-000000000000` değerini bu UUID ile
değiştirin. SQL Editor'da tek sefer çalıştırın.

```sql
begin;

do $$
declare
  owner_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- BURAYA USER ID
begin
  if owner_user_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Önce BURAYA USER ID alanını gerçek Auth user UUID değeriyle değiştirin.';
  end if;

  if not exists (select 1 from auth.users where id = owner_user_id) then
    raise exception 'Bu UUID ile auth.users kaydı bulunamadı.';
  end if;

  insert into public.admin_profiles (user_id, display_name, role, is_active)
  values (owner_user_id, 'Davet Sandığı Owner', 'owner', true)
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      role = 'owner',
      is_active = true,
      updated_at = now();
end $$;

commit;
```

Sonucu doğrulayın:

```sql
select user_id, display_name, role, is_active, created_at, updated_at
from public.admin_profiles;
```

Listede yalnızca beklediğiniz kullanıcı olmalı; gizli anahtar veya parola bulunmamalıdır.
