# Genel Bakış RPC performans kontrolü

Tarih: 2026-10-20  
Ortam: Yerel Supabase / PostgreSQL 17  
Fixture: 300 ürün, 1.000 aktif görsel, 300 ürün görseli, 300 koleksiyon bağlantısı ve 30 ürün taslağı. İşlem sonunda `ROLLBACK` uygulanmıştır.

## İndeks kararı

Mevcut foreign key, aktif kayıt, ürün görseli, koleksiyon bağlantısı ve audit indeksleri sorgunun birleşimlerini karşılıyor. Yalnız zamanlanan banner sorgusu için aşağıdaki kısmi indeksler eklendi:

- `banners_active_starts_at_idx`
- `banners_active_ends_at_idx`

Alt metin ve katalog sağlık taramaları 300/1.000 kayıt hedefinde küçük tablo taraması olarak bırakıldı; düşük seçicilikli ek indeksler eklenmedi.

## EXPLAIN (ANALYZE, BUFFERS)

```text
Result  (cost=0.00..0.26 rows=1 width=32) (actual time=38.513..38.514 rows=1 loops=1)
  Buffers: shared hit=12413 dirtied=2
Planning Time: 0.006 ms
Execution Time: 38.526 ms
```

PL/pgSQL fonksiyonu plan çıktısında tek `Result` düğümü olarak görünür; toplam yürütme süresi RPC içindeki tüm sayaç, ilk beş kayıt, dağılım ve audit sorgularını kapsar. 300 ürün ve 1.000 görsellik hedef veri setinde yerel yürütme yaklaşık 39 ms'dir.
