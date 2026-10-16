-- Faz 7c: sayfa içerikleri modülleri için doğrulama ve silme koruması.

-- İçerik kayıtları istemciden kalıcı silinmez; yayından kaldırma (is_active=false) kullanılır.
revoke delete on public.banners from authenticated;
revoke delete on public.content_sections from authenticated;
revoke delete on public.testimonials from authenticated;
revoke delete on public.faqs from authenticated;

drop policy if exists banners_delete_admin on public.banners;
drop policy if exists content_sections_delete_admin on public.content_sections;
drop policy if exists testimonials_delete_admin on public.testimonials;
drop policy if exists faqs_delete_admin on public.faqs;

-- Bağlantılar yalnızca https, site içi yol, çapa, tel veya mailto olabilir.
alter table public.banners
  add constraint banners_primary_url_check
  check (primary_button_url is null or primary_button_url ~ '^(https://|#|/($|[^/])|tel:|mailto:)'),
  add constraint banners_secondary_url_check
  check (secondary_button_url is null or secondary_button_url ~ '^(https://|#|/($|[^/])|tel:|mailto:)'),
  add constraint banners_active_requires_content_check
  check (not is_active or (nullif(btrim(title), '') is not null and media_id is not null));

alter table public.content_sections
  add constraint content_sections_key_check
  check (section_key in ('topbar', 'process', 'why_us', 'story', 'cta', 'campaign')),
  add constraint content_sections_button_url_check
  check (button_url is null or button_url ~ '^(https://|#|/($|[^/])|tel:|mailto:)'),
  add constraint content_sections_json_shape_check
  check (
    case section_key
      when 'topbar' then coalesce(jsonb_typeof(content_json -> 'items') = 'array', false)
      when 'process' then coalesce(jsonb_typeof(content_json -> 'steps') = 'array', false)
      when 'why_us' then coalesce(jsonb_typeof(content_json -> 'items') = 'array', false)
      else true
    end
  ),
  add constraint content_sections_active_title_check
  check (not is_active or section_key = 'topbar' or nullif(btrim(title), '') is not null);

alter table public.testimonials
  add constraint testimonials_published_text_check
  check (not is_published or nullif(btrim(review_text), '') is not null);

alter table public.faqs
  add constraint faqs_text_length_check
  check (char_length(btrim(question)) between 1 and 300 and char_length(btrim(answer)) between 1 and 2000);
