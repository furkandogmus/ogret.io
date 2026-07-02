# Spec 03 — Mobil Uygulama (Expo/React Native)

**Öncelik:** 🔴 Kritik
**Tahmini Süre:** 4 hafta
**Bağımlılık:** Mevcut REST API hazır, WebSocket altyapısı hazır

---

## Amaç

Native mobil uygulama ile kullanıcı deneyimini seviye atlatmak, push notification ile etkileşimi artırmak.

---

## Kapsam

### Faz 1 — Core Ekranlar (Hafta 1-2)

#### Proje Kurulumu
- [ ] `npx create-expo-app ogret-mobile --template blank-typescript`
- [ ] `expo-router` kurulumu (file-based routing)
- [ ] TailwindCSS benzeri stil (NativeWind veya tamamen custom)
- [ ] Eslint + Prettier config
- [ ] TypeScript strict mode

#### Auth Ekranları
- [ ] Login ekranı (email + şifre, JWT token saklama)
- [ ] Register ekranı (rol seçimi, validasyon)
- [ ] Token refresh mekanizması
- [ ] Biometric auth (parmak izi / yüz tanıma) — opsiyonel

#### Ana Sayfa / Landing
- [ ] Kategoriler (yatay scroll)
- [ ] Öne çıkan tutorlar
- [ ] Arama çubuğu (autocomplete ile)
- [ ] Nasıl çalışır bölümü

### Faz 2 — Arama & Profil (Hafta 2-3)

#### Arama Sayfası
- [ ] Arama input + autocomplete
- [ ] Filtreleme (konu, fiyat, puan, online)
- [ ] Sıralama (popüler, puan, fiyat)
- [ ] Sonuç listesi (TutorCard bileşeni)
- [ ] Infinite scroll (FlatList + onEndReached)

#### Tutor Profil Sayfası
- [ ] Profil header (fotoğraf, isim, puan, rozet)
- [ ] Sekmeli içerik: Hakkında, Yorumlar, Referanslar, Müsaitlik
- [ ] Ders talep butonu (bottom sheet)
- [ ] Favori ekle/çıkar

#### Ders Talep Akışı
- [ ] Bottom sheet wizard (konu → süre → tarih → mesaj → onay)
- [ ] Takvim seçici (date picker)
- [ ] Saat seçici (time slot)

### Faz 3 — Dashboard & Mesajlaşma (Hafta 3-4)

#### Öğrenci Paneli
- [ ] Yaklaşan dersler listesi
- [ ] Geçmiş dersler
- [ ] Favori tutorlar
- [ ] Değerlendirme modalı

#### Öğretmen Paneli
- [ ] Gelen talepler (onayla/reddet)
- [ ] Yaklaşan dersler
- [ ] Meeting link yönetimi
- [ ] Gelir/gösterge kartları
- [ ] Abonelik durumu

#### Mesajlaşma
- [ ] Konuşma listesi (son mesaj, okunmamış sayısı)
- [ ] Chat penceresi (WebSocket bağlantısı)
- [ ] Mesaj gönderme (text)
- [ ] Okundu bildirimi
- [ ] "Yazıyor..." göstergesi

### Faz 4 — Push Notification & Polish (Hafta 4)

- [ ] Firebase Cloud Messaging (FCM) kurulumu
- [ ] Bildirim tipleri: yeni mesaj, ders talebi, ders onayı, ders hatırlatma
- [ ] Bildirim tıklayınca doğru ekrana yönlendirme
- [ ] Deep linking: `ogret.io/profil/{id}` → uygulamada aç
- [ ] Offline destek (AsyncStorage + NetInfo)
- [ ] Dark mode
- [ ] Skeleton loading
- [ ] Pull-to-refresh

---

## Teknik Detaylar

### State Management
- [ ] Context API (mevcut frontend ile paralel)
- [ ] Veya Zustand (daha hafif)

### API İletişimi
- [ ] Axios instance (base URL, JWT interceptor)
- [ ] Token storage (SecureStore / AsyncStorage)
- [ ] Token refresh interceptor

### WebSocket
- [ ] `@stomp/stompjs` + `sockjs-client` (veya React Native uyumlu alternatif)
- [ ] Mevcut backend `/ws/chat` endpoint'i ile uyumlu

### Push Notification
- [ ] Firebase project setup
- [ ] Backend: FCM token kaydetme endpoint'i
- [ ] Backend: NotificationService'e FCM entegrasyonu
- [ ] Frontend: `expo-notifications` ile bildirim yönetimi

### Derin Bağlantı (Deep Linking)
- [ ] Expo Router linking config
- [ ] `ogret.io/{path}` → uygulamada ilgili sayfa
- [ ] Bildirimden tıklayınca yönlendirme

---

## Kabul Kriterleri

- [ ] Login/kayıt akışı sorunsuz çalışıyor
- [ ] Arama + filtreleme + profil görüntüleme tamam
- [ ] Ders talep akışı tamam
- [ ] Gerçek zamanlı mesajlaşma çalışıyor
- [ ] Push notification geliyor ve yönlendirme doğru
- [ ] Web ve mobil arasında tutarlı UX
- [ ] iOS + Android'de çalışıyor
- [ ] Offline modda crash vermiyor

---

## Test

- [ ] iOS simulator + Android emulator test
- [ ] Gerçek cihaz testi (en az 2 model)
- [ ] Push notification testi (foreground + background + killed)
- [ ] WebSocket bağlantı/kopma testi
- [ ] Performans test (FlatList 1000+ öğe)
- [ ] E2E test (Detox veya Maestro)
