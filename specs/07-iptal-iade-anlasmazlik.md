# Spec 07 — İptal/İade ve Anlaşmazlık Sistemi

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 4 gün
**Bağımlılık:** Admin panel geliştirme (Spec 04)

---

## Amaç

Öğrenci ve öğretmen arasındaki anlaşmazlıkları yönetmek, iptal sürecini standartlaştırmak, platform güvenini artırmak.

---

## Yapılacaklar

### 1. Veritabanı (Migration V11)

Yeni tablo: `disputes`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| lesson_id | UUID | FK → lessons |
| reported_by | UUID | FK → users (şikayet eden) |
| reported_user | UUID | FK → users (şikayet edilen) |
| reason | TEXT | Şikayet sebebi |
| status | ENUM | OPEN, INVESTIGATING, RESOLVED, DISMISSED |
| resolution | TEXT | Admin kararı |
| resolved_by | UUID | FK → users (admin) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Yeni tablo: `dispute_messages`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| dispute_id | UUID | FK → disputes |
| sender_id | UUID | FK → users |
| content | TEXT | |
| is_internal | BOOLEAN | Sadece admin görebilir |
| created_at | TIMESTAMP | |

`lessons` tablosuna ekle:

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| cancelled_by | UUID | FK → users (nullable) |
| cancellation_reason_type | VARCHAR(50) | STUDENT_REQUEST, TUTOR_REQUEST, NO_SHOW, OTHER |

### 2. Backend API

#### Ders İptali
- [ ] `PUT /api/v1/lessons/{id}/cancel` → sebep zorunlu
- [ ] Seçenekli iptal sebepleri:
  - Öğrenci: "Programım uymadı", "Başka öğretmen buldum", "Ekonomik nedenler", "Diğer"
  - Öğretmen: "Müsaitlik sorunu", "Sağlık sorunu", "Öğrenci uygun değil", "Diğer"
- [ ] İptal bildirimi (karşı tarafa WebSocket + in-app notification)
- [ ] İptal zamanına göre ceza/limit yok (platform ödeme almadığı için ceza mekanizması yok, sadece kayıt)

#### Anlaşmazlık/Ticket Sistemi
- [ ] `POST /api/v1/disputes` — Anlaşmazlık aç
  - Request: `{ lessonId, reason, description }`
  - Sadece dersin tarafları (öğrenci/öğretmen) açabilir
- [ ] `GET /api/v1/disputes` — Kendi anlaşmazlıklarım
- [ ] `GET /api/v1/disputes/{id}` — Detay + mesajlar
- [ ] `POST /api/v1/disputes/{id}/messages` — Mesaj ekle
  - Request: `{ content, isInternal }`

#### Admin Anlaşmazlık Yönetimi
- [ ] `GET /api/v1/admin/disputes` — Tüm anlaşmazlıklar (filtreleme: status, tarih)
- [ ] `GET /api/v1/admin/disputes/{id}` — Detay (tüm mesajlar dahil)
- [ ] `PUT /api/v1/admin/disputes/{id}` — Karar ver
  - Request: `{ status, resolution }`
  - Status: RESOLVED, DISMISSED

### 3. Frontend

#### Öğrenci/Öğretmen Tarafı
- [ ] Ders kartında "İptal Et" butonu (pending/confirmed durumunda)
- [ ] İptal modalı: sebep seçimi + açıklama
- [ ] İptal onay ekranı
- [ ] "Şikayet Et" butonu (tutor profilinde, mesajlaşmada, ders detayında)
- [ ] Anlaşmazlık formu: ders seçimi, sebep, açıklama
- [ ] Anlaşmazlık durum takibi (panelde)

#### Admin Tarafı
- [ ] Anlaşmazlık listesi (Admin panelinde yeni sekme)
- [ ] Anlaşmazlık detay sayfası:
  - [ ] Ders bilgisi (tarih, konu, ücret)
  - [ ] Taraflar (link to user profiles)
  - [ ] Chat log (dersle ilgili mesajlaşma)
  - [ ] Ticket mesajları
  - [ ] Karar formu
- [ ] Durum güncelleme: Açık → İncelemede → Çözüldü/Reddedildi
- [ ] Admin notu ekleme (internal)

### 4. Politika & İş Kuralları

- [ ] **İptal politikası**:
  - Ders saatinden 24+ saat önce: Serbest iptal (kayıt düşer)
  - Ders saatinden 2-24 saat önce: İptal kaydı (not düşülür)
  - Ders saatinden 2 saatten az: Geç iptal / no-show
  - 30 günde 3+ geç iptal / no-show: Uyarı + hesap kısıtlama
- [ ] **Anlaşmazlık politikası**:
  - İletişim sorunları: Admin devreye girer, tarafları dinler
  - Ders kalitesi şikayetleri: Admin yorumları/değerlendirmeleri inceler
  - Platforma uygun olmayan davranış: Uyarı, geçici uzaklaştırma, kalıcı yasaklama

---

## Kabul Kriterleri

- [ ] Ders iptal edilebiliyor, karşı taraf bildirim alıyor
- [ ] Anlaşmazlık açılabiliyor (öğrenci veya öğretmen)
- [ ] Admin anlaşmazlığı görüp karar verebiliyor
- [ ] Chat log anlaşmazlık detayında görünüyor
- [ ] İptal politikası kuralları backend'de kontrol ediliyor
- [ ] Tüm bildirimler WebSocket + in-app notification ile gidiyor

---

## Test

- [ ] Unit test: iptal politikası kuralları
- [ ] Integration test: anlaşmazlık açma, mesaj ekleme, karar verme
- [ ] E2E: öğrenci iptal akışı
- [ ] E2E: anlaşmazlık açma + admin çözme
- [ ] Frontend: iptal modalı UI testi
- [ ] Frontend: anlaşmazlık formu validasyon testi
