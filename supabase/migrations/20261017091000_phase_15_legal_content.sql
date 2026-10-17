-- Faz 15: yasal metin anahtarları ve veritabanı seviyesinde yayın koruması.

alter table public.content_sections
  drop constraint content_sections_key_check;

alter table public.content_sections
  add constraint content_sections_key_check
  check (
    section_key in (
      'topbar',
      'process',
      'why_us',
      'story',
      'cta',
      'campaign',
      'legal_privacy',
      'legal_kvkk',
      'legal_local_storage',
      'legal_data_sharing',
      'legal_order_process',
      'legal_returns',
      'legal_shipping',
      'legal_media_permissions'
    )
  ),
  add constraint content_sections_legal_publication_check
  check (
    section_key not like 'legal\_%' escape '\'
    or not is_active
    or (
      nullif(btrim(title), '') is not null
      and nullif(btrim(body), '') is not null
      and content_json @> '{"legal_document":true,"legal_review_approved":true,"legal_status":"lawyer_approved"}'::jsonb
      and body !~* 'Hukuk danışmanı onayı bekliyor|\[TAMAMLANACAK\]'
    )
  );
