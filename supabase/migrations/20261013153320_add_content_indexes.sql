create index site_settings_updated_by_idx
  on public.site_settings (updated_by)
  where updated_by is not null;

create index categories_active_sort_idx
  on public.categories (is_active, sort_order)
  where is_active;

create index media_assets_created_by_idx
  on public.media_assets (created_by)
  where created_by is not null;

create index media_assets_active_idx
  on public.media_assets (status, created_at desc)
  where status = 'active' and archived_at is null;

create index collections_cover_media_id_idx
  on public.collections (cover_media_id)
  where cover_media_id is not null;

create index collections_active_sort_idx
  on public.collections (is_active, sort_order)
  where is_active;

create index products_category_id_idx
  on public.products (category_id)
  where category_id is not null;

create index products_active_sort_idx
  on public.products (is_active, sort_order)
  where is_active and archived_at is null;

create index product_collections_collection_id_idx
  on public.product_collections (collection_id);

create index product_images_product_id_idx
  on public.product_images (product_id);

create index product_images_media_id_idx
  on public.product_images (media_id);

create unique index product_images_one_primary_per_product_idx
  on public.product_images (product_id)
  where is_primary;

create index banners_media_id_idx
  on public.banners (media_id)
  where media_id is not null;

create index banners_active_sort_idx
  on public.banners (is_active, sort_order)
  where is_active;

create index content_sections_media_id_idx
  on public.content_sections (media_id)
  where media_id is not null;

create index content_sections_active_idx
  on public.content_sections (is_active, section_key)
  where is_active;

create index testimonials_media_id_idx
  on public.testimonials (media_id)
  where media_id is not null;

create index testimonials_published_sort_idx
  on public.testimonials (is_published, sort_order)
  where is_published and consent_confirmed;

create index faqs_active_sort_idx
  on public.faqs (is_active, sort_order)
  where is_active;
