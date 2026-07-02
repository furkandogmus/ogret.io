# Spec 02 — Arama Altyapısı Güçlendirme

**Öncelik:** 🔴 Kritik
**Tahmini Süre:** 3 gün
**Bağımlılık:** PostgreSQL erişimi

---

## Amaç

SQL `LIKE` sorgularından PostgreSQL Full-Text Search (FTS) geçişi ile hızlı, doğru ve ölçeklenebilir arama.

---

## Mevcut Durum

```sql
-- Şu anki yaklaşım (basit LIKE)
WHERE LOWER(u.full_name) LIKE LOWER(CONCAT('%', :query, '%'))
   OR LOWER(tl.title) LIKE LOWER(CONCAT('%', :query, '%'))
```

Bu yaklaşım:
- Büyük veride çok yavaş
- Türkçe karakter desteği zayıf (ı/i/ü/ö vs.)
- Sıralama yok (alphabetical veya random)
- Yazım hatası toleransı yok

---

## Yapılacaklar

### 1. PostgreSQL FTS Migration (V10__fulltext_search.sql)

- [ ] `tsvector` kolonu ekle (`fulltext_search_vector`)
- [ ] Türkçe text search configuration kullan
- [ ] `to_tsvector('turkish', ...)` ile indeksle
- [ ] Otomatik güncelleme için trigger

```sql
-- Örnek migration
ALTER TABLE tutor_listings ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('turkish',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.about_tutor, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tutor_listings_search
  BEFORE INSERT OR UPDATE ON tutor_listings
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE INDEX idx_tutor_listings_search ON tutor_listings USING GIN(search_vector);
```

- [ ] `users` tablosu için de benzer migration (full_name, bio, education)
- [ ] `subjects` tablosu için (name)
- [ ] Mevcut verileri backfill et (`UPDATE ... SET search_vector = ...`)

### 2. Backend Arama Servisi İyileştirme

- [ ] `TutorListingService.search()` metodunu FTS'e geçir
- [ ] `UserService.searchUsers()` (mesajlaşma için) FTS'e geçir
- [ ] Sıralama: `ts_rank(search_vector, query)` DESC
- [ ] Filtreleme: subject_id, minPrice, maxPrice, minRating, is_online
- [ ] Sayfalama: `LIMIT :size OFFSET :offset`

```java
// Örnek repository query
@Query(value = """
    SELECT tl, ts_rank(tl.search_vector, to_tsquery('turkish', :query)) as rank
    FROM TutorListing tl
    WHERE tl.search_vector @@ to_tsquery('turkish', :query)
    ORDER BY rank DESC
    """)
Page<TutorListing> searchByQuery(@Param("query") String query, Pageable pageable);
```

### 3. Yazım Hatası Toleransı (pg_trgm)

- [ ] `pg_trgm` extension'ını enable et
- [ ] `similarity()` fonksiyonu ile alternatif eşleştirme
- [ ] FTS sonuç yoksa trigram similarity'e düş (fallback)
- [ ] Eşik değer: `similarity > 0.3`

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tutor_listings_trgm ON tutor_listings USING GIN (title gin_trgm_ops);
```

### 4. Arama Önerileri (Autocomplete)

- [ ] Backend endpoint: `GET /api/v1/search/suggestions?q=`
- [ ] Redis sorted set ile popüler aramaları cache'le
- [ ] Sonuçlar: subject adları, tutor adları, kategoriler
- [ ] Frontend: debounce (300ms), minimum 2 karakter
- [ ] Frontend: dropdown öneri listesi
- [ ] Limit: 6 öneri

### 5. Frontend Arama Sayfası İyileştirme

- [ ] Arama input'unda autocomplete dropdown
- [ ] Filtreler: subject (multi-select), fiyat aralığı (slider), puan (star), online
- [ ] Sıralama: popülerlik, puan, fiyat artan/azalan, yenilik
- [ ] Sonuç sayısı göstergesi ("128 sonuç bulundu")
- [ ] Boş sonuç durumu: "Aramanızla eşleşen sonuç bulunamadı" + öneriler
- [ ] Skeleton loading (sonuçlar yüklenirken)
- [ ] Infinite scroll veya sayfalama

### 6. Index Optimizasyonu

- [ ] `tutor_listings` için indexler: subject_id, price, is_active, created_at
- [ ] `users` için indexler: role, is_verified, is_online, rating_avg
- [ ] `tutor_subjects` için index: tutor_id + subject_id
- [ ] Query plan analizi (`EXPLAIN ANALYZE`)

---

## Kabul Kriterleri

- [ ] Arama 500ms altında sonuç döndürüyor (100K kayıtta)
- [ ] Türkçe karakterler doğru çalışıyor (ı, İ, ü, Ü, ö, Ö, ş, Ş, ç, Ç)
- [ ] Yazım hatası toleransı çalışıyor ("matematik" yerine "matematik" yazınca sonuç)
- [ ] Autocomplete 200ms altında cevap veriyor
- [ ] Filtreler + sıralama + arama birlikte çalışıyor
- [ ] Boş sorguda popüler tutorları göster
- [ ] Mevcut testler geçiyor (regression)

---

## Test

- [ ] Unit test: FTS sorgu oluşturma
- [ ] Integration test: FTS + trigram + filtreleme
- [ ] Performans test: 10K, 50K, 100K kayıt
- [ ] Frontend: autocomplete UI testi
- [ ] Frontend: filtreleme/sıralama UI testi
- [ ] E2E: arama akışı (girdi → sonuç → tıklama → profil)
