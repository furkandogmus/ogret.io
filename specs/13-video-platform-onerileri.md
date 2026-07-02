# Spec 13 — 3. Parti Video Platform Önerileri

**Öncelik:** 🟢 Orta
**Tahmini Süre:** 1 gün
**Bağımlılık:** —

---

## Amaç

Platformda video konferans olmayacağı için, kullanıcılara üçüncü parti araçları önererek meeting linki oluşturmayı kolaylaştırmak.

---

## Yapılacaklar

### 1. Önerilen Platform Listesi

Ana ekranda ve ders oluşturma akışında gösterilecek platformlar:

| Platform | Ücret | Özellikler |
|----------|-------|------------|
| **Zoom** | Ücretsiz (40dk limit) | Ekran paylaşımı, kayıt, beyaz tahta |
| **Google Meet** | Ücretsiz (60dk) | Gmail entegrasyonu, takvim, ekran paylaşımı |
| **Jitsi Meet** | Tamamen ücretsiz | Hesap gerektirmez, şifreleme, self-host seçeneği |
| **Microsoft Teams** | Ücretsiz (60dk) | Office 365 entegrasyonu, ekran paylaşımı |
| **Skype** | Ücretsiz | Sohbet, ekran paylaşımı |

### 2. Frontend — Meeting Link Öneri Kartı

#### Ders Oluşturma Modalı'nda (4. Adım: Onay)

- [ ] "Meeting Linki" alanının altında öneri kartı:

```
💡 Online ders için popüler platformlar:
Zoom (zoom.us)  |  Google Meet (meet.google.com)  |  Jitsi Meet (meet.jit.si)

[Zoom'da Başlat]  [Google Meet'te Başlat]  [Jitsi Meet'te Başlat]
```

- [ ] Her buton ilgili platformun yeni meeting sayfasını açar (yeni sekme)
- [ ] Oluşturulan linki otomatik kopyala veya alana yapıştır

#### Öğretmen Dashboard'ında — Ders Yönetimi

- [ ] Ders detayında "Meeting Linki Ekle" butonu
- [ ] Tıklandığında öneri kartı açılır
- [ ] Hızlı aksiyon: link oluştur + kopyala + alana yapıştır

#### Öğrenci Dashboard'ında — Yaklaşan Dersler

- [ ] Ders kartında "Derse Katıl" butonu (meeting link varsa)
- [ ] Link yoksa: "Meeting linki henüz eklenmemiş. Öğretmeninizle iletişime geçin."

### 3. Frontend — Meeting Link İşlemleri

- [ ] **Link oluşturma** (her platform için direkt URL)

```typescript
const createMeetingLink = (platform: MeetingPlatform): string => {
  switch (platform) {
    case 'zoom':
      return 'https://zoom.us/start?room='; // Zoom başlat
    case 'google-meet':
      return 'https://meet.google.com/new'; // Yeni Meet odası
    case 'jitsi':
      return `https://meet.jit.si/ogret-${Date.now()}`; // Jitsi oda
    case 'teams':
      return 'https://teams.microsoft.com/l/meeting/new';
    case 'skype':
      return 'https://web.skype.com/';
  }
};
```

- [ ] **Link doğrulama**: Geçerli bir URL mi? (basit regex kontrolü)
- [ ] **Link kopyalama**: Clipboard API ile "Kopyalandı" toast'u
- [ ] **Platform logosu**: Her platform için küçük ikon (SVG)

### 4. Backend — Yardımcı Endpoint

- [ ] `GET /api/v1/video-platforms` — Önerilen platform listesi

```json
[
  { "id": "zoom", "name": "Zoom", "url": "https://zoom.us", "icon": "zoom.svg", "free": true, "description": "En popüler video konferans aracı" },
  { "id": "google-meet", "name": "Google Meet", "url": "https://meet.google.com", "icon": "meet.svg", "free": true, "description": "Google hesabınızla ücretsiz görüşme" },
  { "id": "jitsi", "name": "Jitsi Meet", "url": "https://meet.jit.si", "icon": "jitsi.svg", "free": true, "description": "Hesap gerektirmez, ücretsiz" },
  { "id": "teams", "name": "Microsoft Teams", "url": "https://teams.microsoft.com", "icon": "teams.svg", "free": true, "description": "Office 365 ile entegre" }
]
```

- [ ] Admin panelinde platform listesini düzenleme (ekle/çıkar/sırala) — opsiyonel

### 5. Kullanıcıya Yardım

- [ ] Yardım sayfası: `/yardim/video-gorusme`
  - [ ] "Hangi platformu kullanmalıyım?" rehberi
  - [ ] Platform karşılaştırma tablosu
  - [ ] Adım adım: "Zoom'da ders nasıl başlatılır?"
  - [ ] Sık sorulan sorular

### 6. Bildirimler

- [ ] Ders onaylandığında: "Dersiniz onaylandı! Meeting linki eklemeyi unutmayın."
- [ ] Ders başlamadan 1 saat önce: "Dersiniz 1 saat sonra. Meeting linkiniz hazır mı?"
- [ ] Öğrenci tarafı: Öğretmen link eklediğinde bildirim

---

## Kabul Kriterleri

- [ ] Öneri kartı ders oluşturma modalında görünüyor
- [ ] Her platform butonu doğru URL'i açıyor
- [ ] Link kopyalama çalışıyor (Clipboard API)
- [ ] Yardım sayfası yayında
- [ ] Bildirimler doğru zamanlarda gidiyor
- [ ] Mobile'da da çalışıyor

---

## Test

- [ ] Frontend: öneri kartı UI testi (tüm butonlar)
- [ ] Frontend: link kopyalama testi (Clipboard API mock)
- [ ] Frontend: "Derse Katıl" butonu testi
- [ ] E2E: ders oluşturma → meeting linki ekleme akışı
- [ ] Bildirim testi: link ekleme hatırlatması
