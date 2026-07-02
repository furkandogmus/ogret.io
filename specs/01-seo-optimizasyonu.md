# Spec 01 — SEO Optimizasyonu

**Öncelik:** 🔴 Kritik
**Tahmini Süre:** 3 gün (meta tag/sitemap/robots) + 1 hafta (programatik sayfalar)
**Bağımlılık:** Yok

---

## Amaç

React SPA'nın arama motorlarında görünürlüğünü sıfırdan kurmak. Organik trafik, LAUNCH_STRATEGY'de #1 kanal.

---

## Yapılacaklar

### 1. Dinamik Meta Tag Yönetimi

- [ ] `react-helmet-async` paketini kur (`npm i react-helmet-async`)
- [ ] `HelmetProvider`'ı `App.tsx`'e ekle
- [ ] Her sayfa için dinamik `<title>` ve `<meta name="description">`
- [ ] Open Graph etiketleri: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] Twitter Card etiketleri: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `lang="tr"` html etiketi
- [ ] Kanonik URL (`<link rel="canonical">`)
- [ ] `hreflang` etiketleri (şimdilik sadece tr, sonra çoklu dil)

**Kapsam:** Tüm sayfalar (Landing, Search, TutorProfile, Blog, Dashboard, Auth, vs.)

### 2. Sitemap.xml

- [ ] Backend'de `/api/v1/seo/sitemap.xml` endpoint'i
- [ ] Statik sayfalar: `/`, `/giris`, `/kayit`, `/hakkimizda`, `/sss`
- [ ] Dinamik sayfalar: tüm tutor profilleri, tüm blog yazıları, tüm kategoriler
- [ ] Son güncelleme tarihleri (lastmod)
- [ ] Değişiklik sıklığı (changefreq: daily/weekly/monthly)
- [ ] Öncelik (priority: 1.0 ana sayfa, 0.8 tutor, 0.6 blog)
- [ ] Frontend'de `/sitemap.xml` → backend proxy
- [ ] Frontend'de her yeni tutor/blog eklendiğinde sitemap güncellenmeli

### 3. Robots.txt

- [ ] `public/robots.txt` dosyası ekle
- [ ] `User-agent: *`, `Allow: /`, `Sitemap: https://ogret.io/sitemap.xml`
- [ ] Admin ve dashboard sayfalarını gizle (`Disallow: /admin`, `/ogrenci-panel`, `/ogretmen-panel`)
- [ ] Auth sayfalarını gizle (`Disallow: /giris`, `/kayit`, `/sifre-unuttum`)

### 4. Schema.org / Structured Data (JSON-LD)

- [ ] **WebSite schema** (tüm sayfalarda)
- [ ] **Organization schema** (logo, iletişim, sosyal medya)
- [ ] **LocalBusiness schema** (eğitim sektörü)
- [ ] **Product schema** (abonelik planları için)
- [ ] **Review schema** (tutor yorumları için)
- [ ] **Article schema** (blog yazıları için)
- [ ] **BreadcrumbList schema** (tüm sayfalarda breadcrumb)
- [ ] **FAQPage schema** (SSS sayfası için)

### 5. Programatik SEO Sayfaları

- [ ] Backend endpoint: `GET /api/v1/seo/pages?subject={slug}&city={city}`
- [ ] Frontend route: `/seo/konu/{subjectSlug}` — örn: `/seo/konu/lgs-matematik`
- [ ] Frontend route: `/seo/konu/{subjectSlug}/{city}` — örn: `/seo/konu/lgs-matematik/ankara`
- [ ] Frontend route: `/seo/sehir/{city}` — örn: `/seo/sehir/istanbul`
- [ ] Her sayfada: benzersiz title, description, H1, içerik metni
- [ ] Sayfalarda ilgili tutorları listele (subject/city filtresiyle)
- [ ] Sayfalarda SSS bölümü (sık sorulan sorular)
- [ ] Internal linking (ilgili konulara, ilgili şehirlere link ver)
- [ ] Breadcrumb navigasyonu

### 6. Prerender / SSR Alternatifi

- [ ] Prerender.io veya rendertron gibi bir servis araştır
- [ ] Backend'de bot detection middleware (User-Agent kontrolü)
- [ ] Bot isteklerini prerender servisine yönlendir
- [ ] Alternatif: `@prerenderer/webpack-plugin` ile build-time prerender
- [ ] Alternatif: basit bir Node.js prerender proxy'si

### 7. Core Web Vitals

- [ ] LCP (Largest Contentful Paint) optimizasyonu
- [ ] FID (First Input Delay) optimizasyonu
- [ ] CLS (Cumulative Layout Shift) optimizasyonu
- [ ] Lighthouse skoru hedefi: 80+ (mobile), 95+ (desktop)

---

## Kabul Kriterleri

- [ ] Google Search Console'da sayfalar indexleniyor
- [ ] Her sayfanın benzersiz title ve description'ı var
- [ ] Sosyal medyada paylaşınca OG görseli çıkıyor
- [ ] Sitemap geçerli, Google'a submit edilebilir
- [ ] Schema.org test aracından 0 hata
- [ ] Programatik sayfalar Google'da ilk sayfada çıkıyor
- [ ] Lighthouse SEO skoru 90+

---

## Test

- [ ] Her sayfa için title/description doğrulaması (Playwright)
- [ ] Sitemap geçerlilik testi
- [ ] Schema.org validasyon testi
- [ ] Google Rich Results test
- [ ] Lighthouse SEO audit
