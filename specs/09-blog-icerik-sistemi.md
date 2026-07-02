# Spec 09 — Blog/İçerik Sistemi

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 1 hafta
**Bağımlılık:** Admin panel geliştirme (Spec 04), SEO altyapısı (Spec 01)

---

## Amaç

SEO içerik pazarlaması için blog sistemi kurmak. LAUNCH_STRATEGY'de organik trafik için en önemli kanal. Blog yazıları ile programatik SEO sayfalarını desteklemek.

---

## Yapılacaklar

### 1. Veritabanı (Migration V12)

Yeni tablo: `blog_posts`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| title | VARCHAR(255) | Başlık |
| slug | VARCHAR(255) | UNIQUE, URL dostu |
| content | TEXT | HTML içerik |
| excerpt | VARCHAR(500) | Özet / meta description |
| cover_image | TEXT | Kapak görseli URL |
| author_id | UUID | FK → users |
| category_id | UUID | FK → blog_categories (nullable) |
| status | VARCHAR(20) | DRAFT, PUBLISHED, SCHEDULED |
| published_at | TIMESTAMP | Yayın tarihi |
| scheduled_at | TIMESTAMP | Planlı yayın (nullable) |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | VARCHAR(500) | SEO description |
| view_count | INT | Okunma sayısı |
| reading_time | INT | Dakika cinsinden okuma süresi |
| is_featured | BOOLEAN | Öne çıkan yazı |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Yeni tablo: `blog_categories`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| name | VARCHAR(100) | Kategori adı |
| slug | VARCHAR(100) | UNIQUE |
| description | TEXT | Açıklama |
| sort_order | INT | Sıralama |
| created_at | TIMESTAMP | |

Yeni tablo: `blog_tags`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| name | VARCHAR(100) | Etiket adı |
| slug | VARCHAR(100) | UNIQUE |

Yeni tablo: `blog_post_tags`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| post_id | UUID | FK → blog_posts |
| tag_id | UUID | FK → blog_tags |
| PK: (post_id, tag_id) | | |

### 2. Backend API

**Public endpoints:**
- [ ] `GET /api/v1/blog/posts` — Yayındaki yazılar (sayfalı, filtreli)
  - Query: `?category=&tag=&search=&page=&size=`
  - Sıralama: published_at DESC, view_count DESC
- [ ] `GET /api/v1/blog/posts/{slug}` — Yazı detay
  - `view_count` artır (her görüntülemede +1)
- [ ] `GET /api/v1/blog/categories` — Kategoriler
- [ ] `GET /api/v1/blog/tags` — Etiketler
- [ ] `GET /api/v1/blog/featured` — Öne çıkan yazılar

**Admin endpoints:**
- [ ] `GET /api/v1/admin/blog/posts` — Tüm yazılar (taslak + yayın)
- [ ] `POST /api/v1/admin/blog/posts` — Yazı oluştur
- [ ] `PUT /api/v1/admin/blog/posts/{id}` — Yazı güncelle
- [ ] `DELETE /api/v1/admin/blog/posts/{id}` — Yazı sil
- [ ] `PUT /api/v1/admin/blog/posts/{id}/publish` — Yayınla
- [ ] `PUT /api/v1/admin/blog/posts/{id}/draft` — Taslağa çek
- [ ] `GET/POST/PUT/DELETE /api/v1/admin/blog/categories` — Kategori CRUD
- [ ] `GET/POST/PUT/DELETE /api/v1/admin/blog/tags` — Etiket CRUD

### 3. Frontend — Blog Sayfaları

- [ ] **Blog listeleme**: `/blog`
  - Grid/sıralı kart görünümü
  - Kategori filtresi (horizontal scroll veya dropdown)
  - Arama çubuğu
  - Skeleton loading
  - Sayfalama / infinite scroll
  - Her kart: kapak görseli, başlık, özet, kategori, tarih, okuma süresi
- [ ] **Blog detay**: `/blog/{slug}`
  - Kapak görseli (hero)
  - Başlık (H1)
  - Meta: yazar, tarih, kategori, okuma süresi, okunma sayısı
  - İçerik (HTML render, güvenli)
  - Paylaş butonları (Twitter, LinkedIn, WhatsApp)
  - İlgili yazılar (son 3 yazı)
  - Yorum/beğeni (opsiyonel, ilk aşamada yok)
- [ ] **Kategori sayfası**: `/blog/kategori/{slug}`
  - Kategori başlığı + açıklaması
  - Kategoriye ait yazılar listesi
- [ ] **Blog ana sayfa**: son 6 yazı, kategoriler, popüler etiketler

### 4. Frontend — Admin Blog Yönetimi

- [ ] Admin panelinde "Blog" sekmesi (yeni tab)
- [ ] Yazı listesi (tablo: başlık, kategori, durum, tarih, görüntülenme)
  - Filtre: durum (tümü/taslak/yayın/planlı), kategori
  - Arama: başlıkta
- [ ] Yazı düzenleme sayfası:
  - Başlık input
  - Slug (otomatik oluştur, manuel düzeltilebilir)
  - Zengin metin editörü (TipTap, Quill, veya ReactQuill)
  - Kapak görseli yükleme (drag & drop, preview)
  - Özet textarea
  - Kategori + etiket seçimi (multi-select)
  - SEO meta başlık + açıklama (özel alanlar)
  - Yayınla/taslak/planla butonları
  - Planlı yayın için tarih seçici
- [ ] Kategori yönetimi (ad, slug, sıralama)
- [ ] Etiket yönetimi

### 5. SEO Entegrasyonu

- [ ] Blog yazılarında dinamik meta tag'ler (react-helmet-async)
- [ ] Blog yazısı şeması: `Article` schema.org (JSON-LD)
- [ ] Blog listelemede `CollectionPage` schema.org
- [ ] Sitemap'e blog yazılarını ekle (Spec 01 ile entegre)
- [ ] RSS feed: `/blog/rss.xml`
  - Backend'de otomatik oluştur
  - Son 20 yazı

### 6. Yazı İçeriği Zenginleştirme

- [ ] Blok tabanlı içerik yapısı (opsiyonel, ilk aşamada HTML yeterli)
- [ ] Kod blokları (programlama içerikleri için)
- [ ] Alıntı (blockquote)
- [ ] Görsel galerisi
- [ ] İçindekiler (TOC) otomatik oluşturma (başlıklardan)
- [ ] İlgili içerik önerileri (etiket bazlı)

---

## Kabul Kriterleri

- [ ] Blog yazısı oluşturma, düzenleme, yayınlama tamam (admin)
- [ ] Blog listeleme ve detay sayfaları çalışıyor (public)
- [ ] Kategori ve etiket filtreleme çalışıyor
- [ ] SEO meta alanları blog yazılarında görünüyor
- [ ] Sitemap'te blog yazıları yer alıyor
- [ ] RSS feed geçerli
- [ ] Zengin metin editörü sorunsuz çalışıyor
- [ ] Kapak görseli yüklenebiliyor (MinIO üzerinden)

---

## Test

- [ ] Unit test: blog CRUD servisi
- [ ] Integration test: blog post + kategori + etiket ilişkileri
- [ ] Frontend: blog listeleme, detay, filtreleme
- [ ] Admin: blog yazısı oluşturma + yayınlama
- [ ] SEO: meta tag doğrulama (Playwright)
- [ ] RSS feed validasyonu
