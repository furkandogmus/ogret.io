# Spec 11 — Öğretmen Onboarding Akışı

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 4 gün
**Bağımlılık:** Mevcut profil + ders + müsaitlik API'leri hazır

---

## Amaç

Kayıt olan öğretmenlerin profil tamamlama oranını artırmak. Adım adım yönlendirme ile kullanıcıyı boğmadan, eksiksiz profil oluşturmasını sağlamak.

---

## Mevcut Durum

- Öğretmen kaydı sonrası direkt dashboard'a yönleniyor
- Hiçbir onboarding adımı yok
- Profil tamamlama durumu gösterilmiyor
- Boş profil: isim + email + şifre dışında hiçbir şey yok

---

## Yapılacaklar

### 1. Backend — Profil Tamamlama Skoru

- [ ] `User` entity'sine `profile_completion_score` alanı (int, 0-100)
- [ ] Her alan için puan ağırlığı:

| Alan | Puan | Kontrol |
|------|------|---------|
| full_name | 5 | dolu mu? |
| avatar_url | 10 | dolu mu? |
| phone | 5 | dolu mu? |
| bio | 15 | min 50 karakter? |
| education | 10 | dolu mu? |
| experience_years | 5 | >= 0? |
| hourly_rate | 10 | > 0? |
| En az 1 tutor_subject | 10 | var mı? |
| En az 1 availability | 10 | var mı? |
| Kimlik doğrulama | 10 | APPROVED mı? |
| En az 1 listing | 10 | var mı? |

- [ ] `PUT /api/v1/users/me` çağrılınca skoru otomatik yeniden hesapla
- [ ] `GET /api/v1/tutors/me/onboarding-status` endpoint'i
  - Response: `{ completedSteps: [...], missingSteps: [...], score: 67 }`

### 2. Frontend — Onboarding Wizard

Kayıt sonrası (veya profile eksikse) onboarding modalı/sayfası açılır.

#### Adım 1: Profil Bilgileri
- [ ] Ad soyad (doluysa atla)
- [ ] Profil fotoğrafı yükleme (drag & drop, kamera, crop)
- [ ] Telefon numarası (formatlı input)
- [ ] "Neden özel ders veriyorsunuz?" — kısa bio textarea (min 50 char)

#### Adım 2: Ders & Uzmanlık
- [ ] Kategori seçimi (YKS, LGS, DIL, YAZILIM, MUZIK)
- [ ] Kategoriye göre ders konuları (multi-select)
- [ ] Her konu için saatlik ücret
- [ ] Deneyim yılı
- [ ] Eğitim bilgisi (okul, bölüm, yıl)

#### Adım 3: Müsaitlik Takvimi
- [ ] Haftalık takvim seçici
- [ ] Her gün için başlangıç/bitiş saatleri
- [ ] "Hafta içi" / "Hafta sonu" kısayolları
- [ ] Tüm gün müsait değilim seçeneği
- [ ] Görsel zaman çizelgesi (visual weekly calendar)

#### Adım 4: İlan Oluştur
- [ ] İlan başlığı (örn: "Uzman Matematik Öğretmeninden LGS Hazırlık")
- [ ] Ders açıklaması (nasıl işlenir, kimler için uygun)
- [ ] Öğretmen hakkında (öğretim tarzı, deneyim)
- [ ] Ders işleniş şekli (online, öğrencinin evinde vb.)
- [ ] Konum/şehir (isteğe bağlı)

#### Adım 5: Doğrulama
- [ ] Kimlik belgesi yükleme
- [ ] Diploma veya sertifika yükleme
- [ ] "Doğrulama başvurunuz alındı, admin onayından sonra rozetiniz aktif olacak."

#### Tamamlama Ekranı
- [ ] "Tebrikler! Profiliniz %100 tamam."
- [ ] Profilinizin önizlemesi
- [ ] "Profili Görüntüle" butonu
- [ ] Profil paylaşma seçeneği (WhatsApp, Twitter)

### 3. UI Bileşenleri

#### Progress Bar
- [ ] Adım adım progress indicator (5 adım)
- [ ] Her adımda tamamlanan/eksik gösterimi
- [ ] Geri/İleri butonları
- [ ] Adımlar arası geçişte veri kaybı yok (state tutulur)

#### Profil Tamamlama Banner'ı
- [ ] Dashboard'da profil tamamlama banner'ı
- [ ] "Profiliniz %X tamamlanmıştır. Devam etmek için tıklayın."
- [ ] Progress bar (görsel)
- [ ] Eksik adımların listesi (linklerle)

#### Skip Seçeneği
- [ ] Her adımda "Şimdi Değil, Sonra Tamamla" butonu
- [ ] Atlanan adımlar banner'da gösterilmeye devam eder

### 4. Bildirimler

- [ ] Kayıt sonrası 24 saat sonra: "Profilinizi tamamlamayı unutmayın" (in-app)
- [ ] 48 saat sonra: "Hala profiliniz eksik" (in-app)
- [ ] Profil tamamlanınca: "Tebrikler! Artık ders talebi alabilirsiniz." (WebSocket)

### 5. Mevcut Sayfaların Güncellenmesi

- [ ] ProfileEditPage: onboarding akışına uygun hale getir
- [ ] Dashboard: onboarding banner'ı ekle
- [ ] Navbar: profil tamamlama yüzdesi (profil dropdown'ında)
- [ ] Yönlendirme: profile eksikse dashboard yerine onboarding aç

---

## Kabul Kriterleri

- [ ] Kayıt sonrası onboarding wizard'ı açılıyor
- [ ] 5 adımın tamamı çalışıyor (profil, ders, müsaitlik, ilan, doğrulama)
- [ ] Her adım atlanabiliyor (sonra tamamla)
- [ ] Profil tamamlama skoru doğru hesaplanıyor
- [ ] Eksik adımlar dashboard'da gösteriliyor
- [ ] Bildirimler doğru zamanlarda gidiyor
- [ ] Onboarding tamamlanınca yönlendirme dashboard'a
- [ ] Sayfa yenileyince adım state'i kaybolmuyor

---

## Test

- [ ] E2E: onboarding wizard'ı tamamlama (tüm adımlar)
- [ ] E2E: onboarding'i skip edip sonra geri dönme
- [ ] Unit test: profile_completion_score hesaplama
- [ ] Frontend: progress bar UI testi
- [ ] Frontend: banner gösterimi/gizleme testi
- [ ] Bildirim testi (24h, 48h, tamamlama)
