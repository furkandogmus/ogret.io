# Spec 06 — Performans Optimizasyonu

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 4 gün
**Bağımlılık:** —

---

## Amaç

Sayfa yüklenme süresini düşürmek (<1.5s), Lighthouse skorunu yükseltmek (90+), backend sorgularını optimize etmek.

---

## Mevcut Durum

- Code splitting yok (tüm JS tek bundle, ~1MB+)
- Lazy loading yok (tüm bileşenler aynı anda yükleniyor)
- Image optimization yok (base64 avatar'lar, optimize edilmemiş görseller)
- Redis cache sadece birkaç yerde kullanılıyor
- Backend'de N+1 sorgu problemleri olabilir
- Bundle analizi yapılmamış

---

## Yapılacaklar

### 1. Frontend Code Splitting

- [ ] Route bazlı code splitting (`React.lazy` + `Suspense`)

```tsx
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const SearchPage = React.lazy(() => import('@/pages/SearchPage'));
const TutorProfilePage = React.lazy(() => import('@/pages/TutorProfilePage'));
// ... tüm sayfalar
```

- [ ] Loading fallback (route geçişlerinde skeleton veya spinner)
- [ ] Component bazlı lazy loading (ağır bileşenler: LessonRequestModal, Recharts)
- [ ] `React.memo` kullanımı (ağır listeler: TutorCard)
- [ ] `useMemo` / `useCallback` optimizasyonu

### 2. Bundle Analizi ve Optimizasyon

- [ ] `vite-bundle-analyzer` ile bundle analizi
- [ ] Gereksiz import'ları temizle
- [ ] Büyük kütüphaneleri alternatifleriyle değiştir:
  - [ ] `motion` (framer-motion) → lightweight animasyon (CSS transitions tercih edilebilir)
  - [ ] `recharts` → gerekli mi? Kullanım oranı düşükse kaldır
  - [ ] `date-fns` tree-shaking kontrolü
- [ ] Ant Design / büyük UI kütüphaneleri import'larını optimize et
- [ ] Moment.js varsa date-fns'e geç (zaten date-fns kullanılıyor, kontrol et)

### 3. Image Optimization

- [ ] Avatar'lar için WebP formatı (S3'e yüklerken dönüştür)
- [ ] `loading="lazy"` tüm `<img>` etiketlerinde
- [ ] `srcset` ile responsive görseller (320w, 640w, 960w)
- [ ] Avatar placeholder (blur hash veya gradient)
- [ ] Blog görselleri için optimize edilmiş boyutlar
- [ ] Vite Image plugin (`vite-imagetools`)

### 4. Redis Cache Stratejisi

- [ ] **Tutor listesi cache**: 5 dk TTL, sayfa değişince invalidate
- [ ] **Subject listesi cache**: 1 saat TTL, nadiren değişir
- [ ] **Kategori listesi cache**: 1 saat TTL
- [ ] **Popüler aramalar cache**: 15 dk TTL
- [ ] **Tutor profil cache**: 2 dk TTL (sık güncellenebilir)
- [ ] **Blog listesi cache**: 5 dk TTL

### 5. Backend Query Optimizasyonu

- [ ] N+1 sorgu tespiti (Hibernate statistics ile)
  - [ ] Tutor listesi sorgusu (N+1 on subjects, reviews)
  - [ ] Tutor profil sorgusu (N+1 on availability, listings)
  - [ ] Mesajlaşma sorgusu (N+1 on conversation list)
- [ ] Fetch join / EntityGraph kullanımı

```java
@Query("SELECT DISTINCT u FROM User u " +
       "LEFT JOIN FETCH u.tutorSubjects ts " +
       "LEFT JOIN FETCH ts.subject " +
       "WHERE u.role = 'TUTOR' AND u.isVerified = true")
List<User> findAllTutorsWithSubjects();
```

- [ ] Pagination optimizasyonu (count query'yi ayrı, `Pageable` kullan)
- [ ] Lazy loading vs eager loading dengesi
- [ ] PostgreSQL sorgu planı analizi (`EXPLAIN ANALYZE`)

### 6. Frontend Cache Stratejisi

- [ ] React Query (TanStack Query) kurulumu
  - [ ] API çağrılarını cache'le (staleTime, gcTime)
  - [ ] Optimistic updates (mesaj gönderme, favori ekleme)
  - [ ] Background refetch
  - [ ] Pagination / infinite scroll için `useInfiniteQuery`
- [ ] Varsa swr/react-query'ye geç (şu an axios + state management, switch to react-query)

### 7. Lighthouse Optimizasyonu

- [ ] **LCP (Largest Contentful Paint)**:
  - [ ] Preload kritik font'lar
  - [ ] Hero image optimize (preload + webp)
  - [ ] Server response time < 200ms
- [ ] **FID (First Input Delay)**:
  - [ ] JS bundle'ı küçült (code splitting)
  - [ ] Long task'leri böl (requestIdleCallback)
- [ ] **CLS (Cumulative Layout Shift)**:
  - [ ] Görsel boyutları (width/height) zorunlu
  - [ ] Skeleton loading ile layout shift önleme
  - [ ] Font loading: `font-display: swap` veya `optional`

### 8. Network Optimizasyonu

- [ ] HTTP/2 kullanımı (nginx reverse proxy'de)
- [ ] Compression: gzip/brotli (nginx'te)
- [ ] CDN: statik dosyalar için Cloudflare CDN (daha sonra)
- [ ] API response boyutunu küçült (gereksiz alanları kırp)
- [ ] Pagination default size: 20 (şu an kaç?)

---

## Kabul Kriterleri

- [ ] Lighthouse Performance skoru: 90+ (mobile), 95+ (desktop)
- [ ] Sayfa yüklenme süresi: <1.5s (3G), <1s (4G)
- [ ] Bundle boyutu: <300KB (gzipped) initial load
- [ ] Time to Interactive: <2s
- [ ] Backend API response time: <200ms (cached)
- [ ] N+1 sorgu sayısı: 0 (tüm sorgular optimize edilmiş)
- [ ] Redis cache hit rate: %70+

---

## Test

- [ ] Lighthouse audit (mobile + desktop)
- [ ] WebPageTest (Slow 3G simülasyonu)
- [ ] Bundle analyze (vite-bundle-analyzer raporu)
- [ ] Backend query log analizi (N+1 tespiti)
- [ ] Redis cache hit/miss oranı takibi
- [ ] Load test (100 concurrent user, endpoint bazlı)
