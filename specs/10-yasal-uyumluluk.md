# Spec 10 — Yasal Uyumluluk Belgeleri

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 2 gün (geliştirme) + hukuki metin hazırlığı
**Bağımlılık:** Hukuki metinlerin hazırlanması (avukat)

---

## Amaç

KVKK, 5651 sayılı kanun, tüketici hakları ve diğer yasal düzenlemelere uyum sağlamak. Platformu yasal risklerden korumak.

---

## Yapılacaklar

### 1. Veritabanı (Migration V13)

Yeni tablo: `consent_logs`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| consent_type | VARCHAR(50) | KVKK, COOKIE, CONTRACT |
| consent_version | VARCHAR(20) | Versiyon no |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| granted | BOOLEAN | Kabul/red |
| granted_at | TIMESTAMP | |

Yeni tablo: `legal_document_versions`

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| document_type | VARCHAR(50) | KVKK, USER_AGREEMENT, COOKIE_POLICY, vb. |
| version | VARCHAR(20) | v1.0, v1.1 vb. |
| content | TEXT | Belge içeriği (HTML/Markdown) |
| is_active | BOOLEAN | Aktif versiyon |
| effective_date | TIMESTAMP | Yürürlük tarihi |
| created_at | TIMESTAMP | |

### 2. Yasal Belgeler

**Hazırlanması gereken metinler (avukat/ekip tarafından):**

- [ ] **KVKK Aydınlatma Metni**
  - Veri sorumlusu bilgisi
  - Hangi verilerin toplandığı
  - Veri işleme amaçları
  - Verilerin kimlerle paylaşıldığı
  - Veri saklama süreleri
  - Kullanıcı hakları (silme, düzeltme, itiraz)
  - İletişim bilgileri
- [ ] **Kullanıcı Sözleşmesi (Öğrenci)**
  - Hesap oluşturma kuralları
  - Platform kullanım şartları
  - Ders talep ve iptal politikası
  - Sorumluluk reddi
  - Fesih ve hesap kapatma
- [ ] **Kullanıcı Sözleşmesi (Öğretmen)**
  - Profil oluşturma kuralları
  - Abonelik ve ücretlendirme (ödeme entegrasyonu sonrası)
  - Doğrulama yükümlülükleri
  - Platform kurallarına uyum
  - Fesih koşulları
- [ ] **Çerez Politikası**
  - Hangi çerezler kullanılıyor
  - Çerezlerin amacı
  - Üçüncü taraf çerezler
  - Çerez yönetimi (kabul/red)
  - Zorunlu ve isteğe bağlı çerez ayrımı
- [ ] **Gizlilik Politikası**
  - KVKK metnini kapsayan genel politika
  - Veri güvenliği önlemleri
  - Veri ihlali bildirim prosedürü
- [ ] **Mesafeli Hizmet Sözleşmesi** (öğretmenler için)
  - Hizmet tanımı
  - Cayma hakkı
  - Uyuşmazlık çözümü
- [ ] **Platform Sorumluluk Reddi**
  - "Aracı hizmet sağlayıcı" statüsü (6563 sayılı kanun)
  - Kullanıcılar arası anlaşmazlıklarda sorumluluk sınırı
  - İçerik denetimi yükümlülüğü

### 3. Frontend — Kullanıcı Akışları

#### Kayıt Sırasında
- [ ] KVKK aydınlatma metni onay checkbox'ı
  - "KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum."
  - Link → `/kvkk` sayfası
- [ ] Kullanıcı sözleşmesi onay checkbox'ı
  - "Kullanıcı Sözleşmesi'ni okudum ve kabul ediyorum."
  - Link → `/kullanim-kosullari` sayfası
- [ ] Çerez onayı (cookie banner ile)
- [ ] Tüm onaylar `consent_logs` tablosuna kaydedilir

#### Statik Sayfalar
- [ ] `/kvkk` — KVKK Aydınlatma Metni
- [ ] `/kullanim-kosullari` — Kullanıcı Sözleşmesi
- [ ] `/cerez-politikasi` — Çerez Politikası
- [ ] `/gizlilik-politikasi` — Gizlilik Politikası
- [ ] `/hakkimizda` — Hakkımızda
- [ ] `/iletisim` — İletişim
- [ ] `/sss` — Sık Sorulan Sorular

#### Cookie Banner
- [ ] İlk ziyarette çerez banner'ı göster
- [ ] "Tüm Çerezleri Kabul Et" / "Sadece Gerekli Çerezler" / "Ayarlar"
- [ ] Çerez ayarları modalı (gerekli, analitik, pazarlama ayrımı)
- [ ] Seçim localStorage'a kaydedilir (veya consent_logs)
- [ ] Kabul edilene kadar sadece zorunlu çerezler çalışır
- [ ] Banner tasarımı: bottom bar, kapat butonu, geri bildirim

### 4. 5651 Sayılı Kanun Uyumu (Log Tutma)

- [ ] Tüm kullanıcı işlemleri loglanır:
  - [ ] Login/logout zamanı + IP
  - [ ] İçerik ekleme/silme (yorum, mesaj, ilan)
  - [ ] Profil değişiklikleri
  - [ ] Admin işlemleri
- [ ] Log formatı: { timestamp, user_id, ip, action, details }
- [ ] Loglar en az 1 yıl saklanır
- [ ] Loglar yetkisiz erişime karşı korunur
- [ ] Log sorgulama: admin panelinde IP veya kullanıcı bazlı

### 5. Veri Yönetimi

- [ ] Kullanıcı hesap silme endpoint'i:
  - `DELETE /api/v1/users/me/account`
  - Hesabı devre dışı bırak (soft delete)
  - 30 gün sonra kalıcı sil (cron job)
- [ ] Veri talep endpoint'i:
  - `GET /api/v1/users/me/data` — Tüm kullanıcı verilerini JSON olarak döndür
- [ ] KVKK başvuru formu (email üzerinden):
  - Admin panelinde KVKK taleplerini görüntüleme
  - Talep durumu takibi (alındı, işleniyor, tamamlandı)

### 6. Sözleşme Versiyon Yönetimi

- [ ] Admin panelinde yasal belgelerin versiyonlarını yönetme
- [ ] Yeni versiyon yayınlandığında kullanıcılara bildirim
- [ ] Kullanıcı yeni versiyonu onaylamalı (bloke eden screen)
- [ ] Eski versiyonlar arşivde saklanır

---

## Kabul Kriterleri

- [ ] Tüm yasal belgeler public sayfalarda görüntülenebiliyor
- [ ] Kayıt sırasında KVKK + sözleşme onayı alınıyor
- [ ] Cookie banner çalışıyor, seçim kaydediliyor
- [ ] Kullanıcı hesap silebiliyor
- [ ] Kullanıcı verilerini talep edebiliyor (export)
- [ ] 5651 logları doğru formatta tutuluyor
- [ ] Sözleşme versiyon yönetimi çalışıyor
- [ ] Tüm onay logları veritabanında saklanıyor

---

## Test

- [ ] Kayıt sırasında onay akışı testi (checkbox'lar)
- [ ] Cookie banner UI testi (kabul/red sonrası davranış)
- [ ] Hesap silme akışı testi
- [ ] Veri export testi (JSON formatı)
- [ ] Sözleşme versiyon değişikliği testi
- [ ] 5651 log formatı validasyonu
