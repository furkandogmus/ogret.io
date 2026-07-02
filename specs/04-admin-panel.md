# Spec 04 — Admin Panel Geliştirme

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 1 hafta
**Bağımlılık:** Mevcut admin panel var (temel seviye)

---

## Amaç

Mevcut admin panelini operasyonel verimlilik için geliştirmek. Dashboard istatistikleri, içerik yönetimi, raporlama, anlaşmazlık yönetimi.

---

## Mevcut Durum

Admin panelinde şu an:
- Dashboard: temel sayılar (toplam kullanıcı, tutor, öğrenci, ders)
- Kullanıcı listesi (sayfalı, temel bilgiler)
- Doğrulama başvuruları (onay/ret)
- Referans yönetimi (onay/ret)

---

## Yapılacaklar

### 1. Dashboard Geliştirme

- [ ] Zaman serisi grafikleri (Recharts ile)
  - [ ] Günlük yeni kayıt (son 30 gün)
  - [ ] Günlük tamamlanan ders (son 30 gün)
  - [ ] Haftalık ders talebi / onay dönüşümü
- [ ] Özet kartları:
  - [ ] Toplam kullanıcı (öğrenci/tutor/admin dağılımı)
  - [ ] Toplam ders (durum dağılımı: pending/confirmed/completed/cancelled)
  - [ ] Toplam yorum
  - [ ] Toplam gelir (abonelik) — ödeme entegrasyonu sonrası
- [ ] Bekleyen işlem kartları:
  - [ ] Bekleyen doğrulama sayısı
  - [ ] Bekleyen referans sayısı
  - [ ] Açık anlaşmazlık/talep sayısı
- [ ] Quick actions:
  - [ ] "Son 5 kayıtlı kullanıcı" listesi
  - [ ] "Son 5 ders talebi" listesi

### 2. Kullanıcı Yönetimi Geliştirme

- [ ] Gelişmiş filtreleme (rol, doğrulama durumu, online, tarih aralığı)
- [ ] Arama (isim, email, telefon)
- [ ] Kullanıcı detay sayfası:
  - [ ] Profil bilgileri (tüm alanlar)
  - [ ] Ders geçmişi (öğrenci/tutor olarak)
  - [ ] Yorum geçmişi
  - [ ] Abonelik durumu
  - [ ] Doğrulama belgeleri
  - [ ] Aktivite log
- [ ] Kullanıcı düzenleme (admin tarafından)
- [ ] Kullanıcı yasaklama/devre dışı bırakma
- [ ] CSV/Excel export

### 3. İçerik Yönetimi

- [ ] Blog yazıları CRUD (admin panelinde)
  - [ ] Başlık, içerik (zengin metin editörü), özet, kapak görseli
  - [ ] Kategori, etiket, yazar, SEO meta alanları
  - [ ] Yayınla/taslak/planla
- [ ] SSS yönetimi
  - [ ] Soru-cevap CRUD
  - [ ] Kategorilere ayırma
  - [ ] Sıralama
- [ ] Sayfa yönetimi (Hakkimizda, İletişim, Kullanım Koşulları)
  - [ ] Statik sayfa içerik düzenleme
- [ ] Banner/duyuru yönetimi
  - [ ] Ana sayfa banner'ı
  - [ ] Duyuru metinleri

### 4. Raporlama

- [ ] Öğretmen raporu:
  - [ ] En çok ders alan öğretmenler
  - [ ] En yüksek puanlı öğretmenler
  - [ ] En çok talep alan konular
- [ ] Öğrenci raporu:
  - [ ] En aktif öğrenciler
  - [ ] Ders tamamlama oranı
- [ ] Ders raporu:
  - [ ] Gün/saat bazlı ders dağılımı
  - [ ] Konu bazlı ders dağılımı
  - [ ] İptal oranı ve sebepleri
- [ ] Rapor export: CSV, PDF

### 5. Anlaşmazlık Yönetimi

- [ ] Anlaşmazlık/ticket listesi (filtreleme, sıralama)
- [ ] Ticket detay sayfası:
  - [ ] Taraflar (öğrenci + öğretmen)
  - [ ] İlgili ders bilgisi
  - [ ] Mesaj geçmişi (chat log)
  - [ ] Ticket mesajları (admin-taraflar arası)
- [ ] Karar verme: haklı/haksız belirleme
- [ ] Not ekleme (internal)
- [ ] Durum yönetimi: açık, incelemede, çözüldü, reddedildi

### 6. Konu/Kategori Yönetimi

- [ ] Subject CRUD (admin panelinde)
- [ ] Kategori CRUD
- [ ] Subject ekleme: ad, slug, kategori, ikon, açıklama
- [ ] Subject devre dışı bırakma

---

## Backend İhtiyaçları

- [ ] Yeni endpoint: `GET /api/v1/admin/dashboard/timeseries?range=7d|30d|90d`
- [ ] Yeni endpoint: `GET /api/v1/admin/users/{id}/details` (detaylı profil)
- [ ] Yeni endpoint: `GET /api/v1/admin/reports/{reportType}` (raporlar)
- [ ] Yeni endpoint: `GET/POST/PUT /api/v1/admin/disputes` (anlaşmazlık)
- [ ] Yeni endpoint: `GET/POST/PUT/DELETE /api/v1/admin/blog` (içerik)
- [ ] Yeni endpoint: `GET/POST/PUT/DELETE /api/v1/admin/faq` (SSS)
- [ ] Yeni endpoint: `GET/POST/PUT /api/v1/admin/subjects` (konu yönetimi)

---

## Kabul Kriterleri

- [ ] Dashboard grafikleri doğru veri gösteriyor
- [ ] Kullanıcı yönetimi (filtreleme, arama, detay, düzenleme) çalışıyor
- [ ] Blog yazısı oluşturma, düzenleme, yayınlama tamam
- [ ] Raporlar indirilebiliyor (CSV/PDF)
- [ ] Anlaşmazlık ticket'ı açma, inceleme, karar verme tamam
- [ ] Admin paneli responsive (mobilde de kullanılabilir)
- [ ] Rol bazlı erişim (sadece ADMIN rolü görebilir)
