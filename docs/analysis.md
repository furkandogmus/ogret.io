# Kapsamlı Proje Analizi — öğret.io (ders.online)

> Tarih: Temmuz 2026
> Analiz: Kod tabanı, pazar konumu, büyüme potansiyeli

---

## İçindekiler

1. [Proje Durum Özeti](#1-proje-durum-özeti)
2. [Karar Matrisi: Yapılacaklar / Ertelenenler](#2-karar-matrisi-yapılacaklar--ertelenenler)
3. [Mevcut Eksikler ve Yapılacak İşler](#3-mevcut-eksikler-ve-yapılacak-işler)
4. [Pazar Analizi](#4-pazar-analizi)
5. [Rekabet Karşılaştırması](#5-rekabet-karşılaştırması)
6. [Eylem Planı](#6-eylem-planı)

---

## 1. Proje Durum Özeti

| Alan | Durum | Detay |
|------|-------|-------|
| Frontend (React) | ✅ MVP Tamam | 17 sayfa, tümü gerçek API'ye bağlı |
| Backend (Spring Boot) | ✅ MVP Tamam | 60+ endpoint, 13 entity, 13 service |
| Auth & Yetkilendirme | ✅ Tamam | JWT access/refresh, rol bazlı |
| Gerçek Zamanlı Mesajlaşma | ✅ Tamam | WebSocket STOMP + REST fallback |
| Veritabanı & Migration | ✅ Tamam | 9 Flyway migration, seed data |
| Dosya Depolama | ✅ MinIO | Docker'da hazır, base64'ten S3'e geçiş yapılacak |
| Test (Backend) | ✅ 33 JUnit | Controller + Service katmanları |
| Test (E2E) | ✅ 8 Playwright spec | Tüm kritik akışlar |
| Dokümantasyon | ✅ Kapsamlı | SPEC, ROADMAP, LAUNCH_STRATEGY, PRD-UI |
| CI/CD | ⚠️ CI tam | Deploy adımı sonraya bırakıldı |

---

## 2. Karar Matrisi: Yapılacaklar / Ertelenenler

### 🔴 GÜNDEMDE — Şimdi Yapılacaklar

| # | İş | Öncelik | Gerekçe |
|---|-----|---------|---------|
| 1 | SEO Optimizasyonu | 🔴 Kritik | Organik trafik için hayati, LAUNCH_STRATEGY'de #1 kanal |
| 2 | Arama Altyapısı Güçlendirme | 🔴 Kritik | Kullanıcı deneyimini doğrudan etkiliyor |
| 3 | Mobil Uygulama (Expo) | 🔴 Kritik | Kullanıcı tabanı ve rekabet için zorunlu |
| 4 | Admin Panel Geliştirme | 🟡 Yüksek | Operasyonel verimlilik |
| 5 | Güvenlik Açıkları Kapama | 🟡 Yüksek | Kullanıcı güveni ve veri güvenliği |
| 6 | Performans Optimizasyonu | 🟡 Yüksek | Kullanıcı deneyimi ve dönüşüm |
| 7 | İptal/İade & Anlaşmazlık Sistemi | 🟡 Yüksek | Kullanıcı güveni, hukuki gereklilik |
| 8 | Analitik & Kullanıcı Takibi | 🟡 Yüksek | Veri odaklı karar, dönüşüm optimizasyonu |
| 9 | Blog/İçerik Sistemi | 🟡 Yüksek | SEO içerik pazarlaması |
| 10 | Yasal Uyumluluk Belgeleri | 🟡 Yüksek | KVKK, kullanıcı sözleşmesi, çerez politikası |
| 11 | Öğretmen Onboarding Akışı | 🟡 Yüksek | Kayıt → profil tamamlama dönüşümü |
| 12 | MinIO Dosya Depolama (base64'ten geçiş) | 🟡 Yüksek | Ölçeklenebilirlik, veritabanı yükü |
| 13 | 3. Parti Video Platform Önerileri (Zoom/Meet) | 🟢 Orta | meeting_link alanı için UX iyileştirmesi |

### ⏸️ ERTELENDİ — Sonraki Aşamalara

| # | İş | Sebep |
|---|-----|-------|
| ⏸️ | Ödeme Entegrasyonu (İyzico/PayTR) | Gelir modeli olgunlaşınca eklenecek |
| ⏸️ | SMS Doğrulama (Twilio) | Şimdilik mock çalışıyor, sonra API key girilir |
| ⏸️ | Email Servisi (SMTP) | Şimdilik mock, sonra SendGrid/SMTP eklenir |
| ⏸️ | Production Deployment + Domain | Sunucu ve domain hazır olunca |
| ⏸️ | Uluslararasılaşma (i18n) | Türkiye pazarı oturduktan sonra |
| ⏸️ | Video Konferans Entegrasyonu | ❌ YAPILMAYACAK — Platformda video olmayacak. Kullanıcılara Zoom/Google Meet/Jitsi gibi üçüncü parti araçlar önerilecek. |

### ❌ KAPSAM DIŞI

| İş | Sebep |
|----|-------|
| Video Konferans (embedded) | Platform bünyesinde video görüşme olmayacak |
| Sentry / Hata Takip Servisi | Kullanılmayacak |
| Elasticsearch | Bütçe ve operasyonel yük nedeniyle şimdilik PostgreSQL FTS yeterli |

---

## 3. Mevcut Eksikler ve Yapılacak İşler

### 3.1 SEO Optimizasyonu — ŞİMDİ YAPILACAK

**Durum:** Sıfır. React SPA, SSR yok, meta tag yok, sitemap yok.

Yapılacaklar:
- [ ] Dinamik meta tag yönetimi (`react-helmet-async`)
- [ ] Open Graph / Twitter Card etiketleri (sosyal medya paylaşımı)
- [ ] `sitemap.xml` otomatik oluşturma (tüm tutor profilleri, kategoriler, blog)
- [ ] `robots.txt` yapılandırması
- [ ] Programatik SEO sayfaları (`/konu/lgs-matematik`, `/konu/yks-fizik`, `/sehir/ankara-online-ders`)
- [ ] Schema.org/Structured data (LocalBusiness, Product, Review)
- [ ] Prerender.io veya benzeri bir servis (botlar için statik HTML döndürme)
- [ ] Lazy loading kritik değil, önce meta tag ve programatik sayfalar
- [ ] `lang` ve `hreflang` etiketleri
- [ ] Kanonik URL yönetimi
- [ ] Sayfa hızı metrikleri (Core Web Vitals takibi)

### 3.2 Arama Altyapısı Güçlendirme — ŞİMDİ YAPILACAK

**Durum:** SQL `LIKE` sorguları ile çalışıyor, 1000+ öğretmende performans düşer.

Yapılacaklar:
- [ ] PostgreSQL Full-Text Search (FTS) geçişi — `tsvector` + `tsquery` ile
- [ ] Türkçe stemming desteği (PostgreSQL Turkish text search config)
- [ ] Yazım hatası toleransı (pg_trgm extension ile trigram similarity)
- [ ] Arama önerileri (autocomplete) — Redis sorted sets veya PostgreSQL ile
- [ ] Filtreleme performansı (index ekleme: subject_id, price, rating, is_online)
- [ ] Sıralama algoritması iyileştirme (skor + rating + yenilik)
- [ ] Frontend: debounce, skeleton loading, boş sonuç durumları

### 3.3 Mobil Uygulama — ŞİMDİ YAPILACAK

**Durum:** Yok. Expo/React Native ile yapılacak.

Yapılacaklar:
- [ ] Expo + Expo Router kurulumu
- [ ] Core ekranlar: giriş/kayıt, arama, tutor profili, mesajlaşma
- [ ] Push notification (Firebase Cloud Messaging)
- [ ] Mevcut WebSocket altyapısının mobilde çalışması
- [ ] Performans: FlatList optimizasyonu, lazy loading
- [ ] Deep linking (tutor profili, mesaj, ders)
- [ ] Offline destek (AsyncStorage + NetInfo)

### 3.4 Admin Panel Geliştirme — ŞİMDİ YAPILACAK

**Durum:** Çok temel. Sadece kullanıcı listesi, doğrulama onay/ret.

Yapılacaklar:
- [ ] Dashboard: gelişmiş istatistikler (yeni kayıt, ders grafikleri, dönüşüm)
- [ ] İçerik yönetimi (blog yazıları, SSS, referanslar)
- [ ] Kullanıcı segmentasyonu ve filtreleme
- [ ] Raporlama (CSV/PDF export)
- [ ] Anlaşmazlık/talep yönetimi
- [ ] Banner ve duyuru yönetimi
- [ ] Aktivite log görüntüleme

### 3.5 Güvenlik Açıkları — ŞİMDİ YAPILACAK

**Durum:**
- Rate limiting in-memory (dağıtık ortamda sorunlu)
- CSRF koruması yok
- Brute force koruması yok
- JWT secret rotasyonu yok
- Hata mesajlarında bilgi sızması riski

Yapılacaklar:
- [ ] Rate limiting: in-memory → Redis geçişi (dağıtık scale için)
- [ ] Brute force koruması: login endpoint'inde rate limit + account lockout
- [ ] JWT blacklist (refresh token iptali için)
- [ ] Hata mesajlarında stack trace gizleme (prod profile)
- [ ] Input validasyonu güçlendirme (XSS, SQL injection)
- [ ] CORS yapılandırması daraltma
- [ ] Dosya yükleme güvenliği (tip kontrolü, boyut limiti, tarama)
- [ ] Session management iyileştirme

### 3.6 Performans Optimizasyonu — ŞİMDİ YAPILACAK

**Durum:**
- Code splitting yok
- Lazy loading yok
- Image optimization yok
- Redis cache kullanımı sınırlı
- N+1 query problemleri olabilir

Yapılacaklar:
- [ ] Code splitting (React.lazy + Suspense ile route bazlı)
- [ ] Image optimization (WebP formatı, srcset, lazy loading)
- [ ] Redis cache stratejisi (tutor listesi, subject listesi, popüler aramalar)
- [ ] Backend: N+1 sorgu optimizasyonu (fetch join, EntityGraph)
- [ ] Bundle analizi ve gereksiz dependancy temizliği
- [ ] CDN hazırlığı (statik dosyalar için)
- [ ] Backend: sorgu index optimizasyonu

### 3.7 İptal/İade ve Anlaşmazlık Sistemi — ŞİMDİ YAPILACAK

**Durum:** Yok.

Yapılacaklar:
- [ ] Ders iptal politikası (süreler, ceza, bildirim)
- [ ] İptal akışı (seçenekli sebep, karşı tarafa bildirim)
- [ ] Anlaşmazlık bildirim sistemi (ticket)
- [ ] Admin panelinde anlaşmazlık yönetimi (chat log görme, karar verme)
- [ ] Kullanıcı şikayet butonu (profil, mesaj, ders)
- [ ] Otomatik iptal kuralları (24 saat kala iptal, no-show)
- [ ] Geri ödeme/para iade politikası (platform üzerinden ödeme olmadığı için danışmanlık)

### 3.8 Analitik & Kullanıcı Takibi — ŞİMDİ YAPILACAK

**Durum:** Yok.

Yapılacaklar:
- [ ] PostHog self-hosted (ücretsiz, self-hosted, KVKK uyumlu)
- [ ] Kullanıcı davranış takibi (sayfa görüntüleme, tıklama, form terk)
- [ ] Dönüşüm hunisi (kayıt → profil tamamlama → ders talep → ders tamamlama)
- [ ] Öğretmen dashboard'ında kendi istatistikleri (profil görüntülenme, talep dönüşüm)
- [ ] Feature flag altyapısı (PostHog ile)
- [ ] A/B test hazırlığı (PostHog experimentation)
- [ ] Kullanıcı segmentasyonu (davranış bazlı e-posta/notifikasyon)

### 3.9 Blog/İçerik Sistemi — ŞİMDİ YAPILACAK

**Durum:** Yok. LAUNCH_STRATEGY'de SEO için en önemli kanal.

Yapılacaklar:
- [ ] Blog modeli: Post, Category, Tag, Author (backend + DB migration)
- [ ] Blog API (CRUD, filtreleme, sayfalama)
- [ ] Blog frontend (listeleme, detay, kategoriler, etiketler)
- [ ] Admin panelinde blog yönetimi (zengin metin editörü)
- [ ] SEO dostu URL'ler (`/blog/yks-2026-rehberi`)
- [ ] Blog yazılarında schema.org/Article structured data
- [ ] RSS feed
- [ ] Sosyal medya paylaşım butonları

### 3.10 Yasal Uyumluluk Belgeleri — ŞİMDİ YAPILACAK

**Durum:** Yok.

Yapılacaklar:
- [ ] KVKK Aydınlatma Metni (kayıt sırasında onay)
- [ ] Kullanıcı Sözleşmesi (önğrenci + öğretmen ayrı)
- [ ] Çerez Politikası (cookie banner)
- [ ] Gizlilik Politikası
- [ ] Mesafeli Hizmet Sözleşmesi (öğretmenler için)
- [ ] 5651 sayılı kanun log tutma (IP, zaman, işlem kaydı)
- [ ] Platform sorumluluk reddi (aracı hizmet sağlayıcı statüsü)
- [ ] Kayıt sırasında zorunlu onay checkbox
- [ ] Admin panelinde sözleşme versiyon yönetimi

### 3.11 Öğretmen Onboarding Akışı — ŞİMDİ YAPILACAK

**Durum:** Yok. Tutor kaydı sonrası yönlendirme yok.

Yapılacaklar:
- [ ] Kayıt sonrası adım adım onboarding wizard (4-5 adım)
- [ ] Adım 1: Profil bilgileri (bio, eğitim, fotoğraf)
- [ ] Adım 2: Ders konuları seçimi + saatlik ücret
- [ ] Adım 3: Müsaitlik takvimi
- [ ] Adım 4: Kimlik doğrulama belgesi yükleme
- [ ] Adım 5: İlan oluşturma
- [ ] Profil tamamlama yüzdesi göstergesi (navbar'da)
- [ ] Eksik adımlar için hatırlatma bildirimleri

### 3.12 MinIO Dosya Depolama (base64'ten geçiş) — ŞİMDİ YAPILACAK

**Durum:** S3/MinIO altyapısı Docker'da hazır ama frontend base64 kullanıyor.

Yapılacaklar:
- [ ] Backend multipart file upload → MinIO
- [ ] Presigned URL ile güvenli dosya erişimi
- [ ] Profil fotoğrafı upload (drag & drop, crop, preview)
- [ ] Kimlik doğrulama belgesi upload
- [ ] İlan görselleri
- [ ] Eski base64 verilerin S3'e migration script'i
- [ ] Dosya boyut limitleri ve format kontrolü

### 3.13 3. Parti Video Platform Önerileri — ŞİMDİ YAPILACAK

**Durum:** meeting_link alanı manuel metin girişi, hiçbir yönlendirme yok.

Yapılacaklar:
- [ ] Önerilen platform listesi (Zoom, Google Meet, Jitsi Meet, Microsoft Teams)
- [ ] "Meeting linki oluştur" butonları (her platform için direkt link)
- [ ] Zoom: zoom.us/start gibi yönlendirme
- [ ] Google Meet: meet.google.com'a yönlendirme
- [ ] Ders oluşturma akışında meeting linki öneri kartı
- [ ] "Henüz link eklemediniz" hatırlatmaları

---

## 4. Pazar Analizi

### 4.1 Türkiye Özel Ders Pazarı

| Metrik | Değer |
|--------|-------|
| Pazar büyüklüğü (2026) | ~₺15-20 milyar/yıl (tahmini) |
| Online ders penetrasyonu | %30-35 (COVID sonrası kalıcı) |
| Yıllık büyüme | ~%15-20 (online segmentte) |
| Ortalama ders ücreti | ₺200-500/saat (branşa göre) |
| Aktif özel ders öğretmeni | ~500.000+ (part-time dahil) |
| Sınava hazırlık öğrencisi | ~5 milyon (LGS+YKS) |

### 4.2 Hedef Kitle Segmentleri

#### Birincil: LGS/YKS Hazırlık Öğrencileri
- **Yaş**: 12-18, **Karar verici**: Veli
- **Aylık harcama**: ₺2.000-10.000
- **Ağrı noktası**: Kaliteli öğretmene erişim, yüksek komisyonlar, ulaşım maliyeti

#### İkincil: Dil, Yazılım, Müzik Öğrencileri
- **Yaş**: 18-35, **Karar verici**: Kendileri
- **Aylık harcama**: ₺1.000-5.000
- **Ağrı noktası**: Esnek saatler, uzman öğretmen bulma

### 4.3 Rekabet Haritası

| Rakipler | Güçlü Yönler | Zayıf Yönler |
|----------|--------------|--------------|
| **Superprof TR** | Marka, geniş ağ | Eski UI, mobil webview, yıllık ₺1200, hibrit |
| **Armut.com** | Geniş hizmet, bilinirlik | Teklif usulü, yüksek komisyon, anlık iletişim yok |
| **Sahibinden Özel Ders** | Dev trafik, ücretsiz | Yönetim aracı yok, güvenlik yok |
| **Preply (global)** | Global marka, iyi UX | Türkiye'de zayıf, TL fiyatlandırma yok |

### 4.4 öğret.io'nun Rekabet Avantajları

| Avantaj | Açıklama |
|---------|----------|
| ✅ **Sıfır Komisyon** | En güçlü argüman. Öğretmen %100 kazanır. |
| ✅ **Sadece Online** | Türkiye'de online derse özel ilk platform. |
| ✅ **Modern UX** | Superprof'un eski arayüzüne karşı modern tasarım. |
| ✅ **Gerçek Zamanlı Mesajlaşma** | WebSocket ile anlık iletişim. |
| ✅ **Düşük Abonelik** | Superprof ₺1200/yıl'a karşı ₺49/ay (~₺588/yıl). |
| ✅ **Doğrulama Sistemi** | Admin onaylı öğretmenler, güven. |
| ✅ **Mobil Uygulama** | Native mobil (Expo) ile Superprof'un webview'ına karşı. |

---

## 5. Rekabet Karşılaştırması

| Özellik | öğret.io | Superprof TR | Armut | Preply |
|---------|----------|--------------|-------|--------|
| Online derse özel | ✅ | ❌ | ❌ | ✅ |
| Sıfır komisyon | ✅ | ❌ | ❌ | ❌ (%33) |
| Aylık abonelik | ✅ (₺49'dan) | ❌ (yıllık ₺1200) | ❌ (kredi) | ❌ |
| Gerçek zamanlı chat | ✅ | ❌ | ❌ | ✅ |
| Kimlik doğrulama | ✅ | ❌ | ❌ | ✅ |
| Dark mode | ✅ | ❌ | ❌ | ✅ |
| Mobil uygulama | ✅ (native) | ❌ (webview) | ✅ | ✅ |
| SEO | ⚡ YAPILACAK | ❌ (SSR yok) | ✅ | ✅ (SSR) |
| Gelişmiş arama | ⚡ YAPILACAK | ❌ | ✅ | ✅ |
| Admin panel | ⚡ GELİŞTİRİLECEK | ❌ | ✅ | ✅ |
| Blog/CMS | ⚡ YAPILACAK | ❌ | ✅ | ❌ |
| Yasal uyumluluk | ⚡ YAPILACAK | ✅ | ✅ | ✅ |
| Ödeme entegrasyonu | ⏸️ Ertelendi | ✅ | ✅ | ✅ |
| Video görüşme | ❌ Platformda yok | ❌ | ❌ | ✅ |
| Türkiye pazarı | ✅ (odaklı) | ✅ | ✅ | ❌ |

---

## 6. Eylem Planı

### 6.1 Sıralı Yapılacaklar Listesi (Öncelik Sırası)

| # | İş | Süre | Bağımlılık |
|---|-----|------|------------|
| 1 | SEO: meta tag + sitemap + robots.txt + OG tags | 3 gün | Yok |
| 2 | PostgreSQL Full-Text Search + index ekleme | 3 gün | Yok |
| 3 | Yasal belgeler (KVKK, kullanıcı sözleşmesi, çerez) | 2 gün | Hukuki metin |
| 4 | MinIO dosya depolama geçişi (base64 → S3) | 3 gün | MinIO çalışıyor |
| 5 | 3. parti video öneri kartı (Zoom/Meet/Jitsi) | 1 gün | Yok |
| 6 | Öğretmen onboarding akışı | 4 gün | Yok |
| 7 | İptal/anlaşmazlık sistemi (ticket + admin) | 4 gün | Admin panel |
| 8 | PostHog analitik kurulumu | 2 gün | Yok |
| 9 | Admin panel geliştirme (dashboard + içerik) | 1 hafta | Yok |
| 10 | Blog/CMS sistemi | 1 hafta | Admin panel |
| 11 | Güvenlik: Redis rate limit + brute force + JWT blacklist | 3 gün | Redis çalışıyor |
| 12 | Performans: code splitting + lazy loading + Redis cache | 4 gün | Yok |
| 13 | Programatik SEO sayfaları (`/konu/{slug}`, `/sehir/{sehir}`) | 1 hafta | SEO altyapısı |
| 14 | Mobil uygulama (Expo) | 4 hafta | API hazır |

### 6.2 Ertelenen İşler (Sonraki Aşamalar)

| İş | Ne Zaman |
|----|----------|
| Ödeme Entegrasyonu (İyzico) | Aktif kullanıcı sayısı 500+ olunca |
| SMS Doğrulama (Twilio) | Hesap güvenliği iyileştirme fazında |
| Email Servisi (SMTP) | Kullanıcı tabanı büyüyünce |
| Production Deployment + Domain | Lansman zamanı |
| Uluslararasılaştırma (i18n) | Türkiye pazarı oturduktan sonra |
| Elasticsearch | PostgreSQL FTS yetersiz kalırsa |

### 6.3 Metrikler (KPI)

| KPI | Mevcut | 3 Ay Hedefi | 6 Ay Hedefi |
|-----|--------|-------------|--------------|
| Kayıtlı öğretmen | 4 (seed) | 200 | 1.000+ |
| Kayıtlı öğrenci | 2 (seed) | 1.000 | 5.000+ |
| Aylık tamamlanan ders | 0 | 200 | 2.500+ |
| SEO organik trafik | 0 | 5.000/ay | 50.000+/ay |
| Öğretmen onboarding tamamlama | - | %60 | %80+ |
| Sayfa yüklenme süresi | ~3s | <1.5s | <1s |

### 6.4 Dosya ve Kaynak Referansları

| Dosya | İçerik |
|-------|--------|
| `görevler.md` | Mevcut task listesi |
| `ROADMAP.md` | Geliştirme yol haritası |
| `SPEC.md` | Sistem şartnamesi, DB şeması, API'ler |
| `PRD-UI.md` | UI/UX profesyonelleştirme planı |
| `LAUNCH_STRATEGY.md` | Pazarlama ve exit stratejisi |
| `docs/architecture.md` | Mimari dokümantasyon |
| `docs/api.md` | REST API referansı |

---

> *Bu doküman, kod tabanı incelemesi, mevcut dokümantasyon ve pazar araştırmasına dayanarak hazırlanmıştır. Temmuz 2026. Kararlar ürün sahibi ile yapılan toplantı sonrası netleştirilmiştir.*
