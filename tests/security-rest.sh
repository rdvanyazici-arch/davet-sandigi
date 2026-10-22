#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL gerekli}"
: "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY gerekli}"

auth_headers=(-H "apikey: ${SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" -H "Content-Type: application/json")
public_tables=(site_settings_public categories collections products product_collections category_collections media_assets product_images banners content_sections testimonials faqs)
private_tables=(admin_profiles product_drafts admin_audit_log analytics_daily)
all_tables=("${public_tables[@]}" "${private_tables[@]}")
failures=0

request_status() {
  curl -sS -o /dev/null -w '%{http_code}' "$@"
}

for table in "${public_tables[@]}"; do
  status=$(request_status "${auth_headers[@]}" "${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1")
  if [[ "$table" == "media_assets" && "$status" =~ ^(200|401|403)$ ]]; then
    printf 'GEÇTİ public read %-24s HTTP %s (hassas sütunlar kapalı)\n' "$table" "$status"
  elif [[ "$status" != "200" ]]; then
    printf 'KALDI public read %-24s HTTP %s\n' "$table" "$status"
    failures=$((failures + 1))
  else
    printf 'GEÇTİ public read %-24s HTTP %s\n' "$table" "$status"
  fi
done

for table in "${private_tables[@]}"; do
  status=$(request_status "${auth_headers[@]}" "${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1")
  if [[ "$status" =~ ^(401|403|404)$ ]]; then
    printf 'GEÇTİ private read %-23s HTTP %s\n' "$table" "$status"
  else
    printf 'KALDI private read %-23s HTTP %s\n' "$table" "$status"
    failures=$((failures + 1))
  fi
done

for table in "${all_tables[@]}"; do
  for method in POST PATCH DELETE; do
    body='{}'
    [[ "$method" == "PATCH" ]] && body='{"is_active":false}'
    [[ "$table" == "site_settings_public" && "$method" == "PATCH" ]] && body='{"brand_name":"Prompt 8 write probe"}'
    status=$(request_status -X "$method" "${auth_headers[@]}" -H 'Prefer: return=minimal' --data "$body" "${SUPABASE_URL}/rest/v1/${table}?id=eq.1")
    if [[ "$status" =~ ^(400|401|403|404|405|409)$ ]]; then
      printf 'GEÇTİ anon %-6s %-27s HTTP %s\n' "$method" "$table" "$status"
    else
      printf 'KALDI anon %-6s %-27s HTTP %s\n' "$method" "$table" "$status"
      failures=$((failures + 1))
    fi
  done
done

rpcs=(admin_dashboard_summary admin_analytics_summary set_admin_status add_admin_profile delete_empty_product_draft record_analytics_event)
for rpc in "${rpcs[@]}"; do
  status=$(request_status -X POST "${auth_headers[@]}" --data '{}' "${SUPABASE_URL}/rest/v1/rpc/${rpc}")
  if [[ "$status" =~ ^(400|401|403|404)$ ]]; then
    printf 'GEÇTİ anon RPC %-27s HTTP %s\n' "$rpc" "$status"
  else
    printf 'KALDI anon RPC %-27s HTTP %s\n' "$rpc" "$status"
    failures=$((failures + 1))
  fi
done

exit "$failures"
