# Spec 14 — Production Readiness Master Planı

**Belge durumu:** Uygulama aşamasında — repo içi P0 sertleştirmeleri `feature/production-blockers` dalında

**Son repo incelemesi:** 17 Temmuz 2026

**Kapsam:** Web, API, veritabanı, gerçek zamanlı mesajlaşma, dosya depolama, e-posta/SMS, mobil uygulama, güvenlik, KVKK, ödeme, CI/CD ve operasyon

**Hedef:** öğret.io'nun kontrollü, ölçülebilir ve geri alınabilir biçimde production'a çıkması
**Mevcut release kararı:** **NO-GO** — repo dışı production kapıları [go-live kontrol listesinde](../docs/production-go-live-checklist.md) kanıtlanmadan gerçek kullanıcı trafiği açılmamalı. İlk sürümde ödeme trafiği kapsam dışıdır.

> Bu belge bir özellik istek listesi değil, release sözleşmesidir. Bir madde ancak belirtilen kabul kriteri çalışır sistem, test sonucu, dashboard, runbook veya imzalı iş kararıyla kanıtlandığında tamamlanmış sayılır.

---

## 1. Release kapsamı ve temel kararlar

### 1.1 Önerilen ilk production kapsamı

İlk release aşağıdaki kapsamla **web-first** yapılmalıdır:

- Responsive web uygulaması ve Spring Boot API
- Öğrenci ve öğretmen kaydı, doğrudan giriş ve isteğe bağlı şifre sıfırlama
- Öğretmen profili, ilan, arama, favori ve ders talebi
- Öğretmen/öğrenci panelleri ve ders yaşam döngüsü
- Mesajlaşma ve temel operasyonel bildirimler
- Öğretmen doğrulama başvurusu ve admin inceleme akışı
- Yasal metinler, onay kayıtları, hesap kapatma ve veri talebi
- Platform ilk sürümde ücretsizdir. Abonelik ve platform içi ödeme UI/API'de kapalıdır; ders ücreti taraflarca doğrudan kararlaştırılır.

Mobil uygulama ayrı bir release trenidir. Web production'a çıkmadan mobil mağaza yayını zorunlu değildir; ancak mobil beta/production açılacaksa Bölüm 16'daki tüm kapılar ayrıca sağlanmalıdır.

### 1.2 İlk release dışında tutulabilecekler

Aşağıdaki özellikler iş kararıyla sonraki faza bırakılabilir; kullanıcıya varmış gibi gösterilmemelidir:

- Platform içine gömülü video görüşme
- Gelişmiş öneri motoru ve A/B testleri
- Çoklu dil ve yurt dışı pazarı
- Gelişmiş reklam/affiliate sistemi
- Mobil mağaza yayını
- Gerçek ders ücretinin platform tarafından tahsil edilmesi

### 1.3 Başarı tanımı

Production çıkışı şu koşulların birlikte sağlanmasıdır:

1. Tüm P0 maddeler kapanmış ve kanıtlanmıştır.
2. Zorunlu CI kontrolleri release commit'i üzerinde yeşildir.
3. Production benzeri staging ortamında smoke, güvenlik ve geri dönüş testleri geçmiştir.
4. Yedekten geri yükleme ve son sürüme rollback denenmiştir.
5. Alarm, dashboard ve nöbet/iletişim zinciri aktiftir.
6. Hukuki metinler ve veri işleme envanteri yetkili hukuk danışmanı tarafından onaylanmıştır.
7. Ürün sahibi, teknik sorumlu ve operasyon sorumlusu Go/No-Go kaydını imzalamıştır.

---

## 2. Öncelik ve durum sözlüğü

| Kod | Anlamı | Release etkisi |
|---|---|---|
| P0 | Güvenlik, veri kaybı, hukuki risk veya temel akışı bozan zorunluluk | Kapanmadan production açılamaz |
| P1 | Ölçek, kalite, destek ve büyüme için yüksek öncelik | Lansmandan önce veya kontrollü soft launch sırasında kapanır |
| P2 | Optimizasyon ve olgunlaştırma | Trafik ve ürün verisine göre planlanır |
| ✅ | Repo veya çalışan ortamda yeterli kanıt var | Yeniden doğrulanabilir |
| 🟡 | Kısmen var, kabul kriteri karşılanmıyor | Ek iş ve test gerekiyor |
| ❌ | Yok veya production için güvenli değil | Uygulanmalı |
| ❓ | Dış sistemde olabilir, bu repoda kanıt yok | Kanıt eklenmeden tamamlanmış sayılmaz |

---

## 3. Repo incelemesinden çıkan production blokajları

| ID | P | Durum | Bulgu | Zorunlu sonuç |
|---|---|---:|---|---|
| PR-SEC-001 | P0 | ❌ | `RegisterRequest.role` tüm `Role` değerlerini kabul ediyor; servis `ADMIN` kaydını engellemiyor | Public kayıt yalnızca `STUDENT` veya `TUTOR` oluşturabilmeli; admin yalnızca kontrollü backoffice süreciyle atanmalı |
| PR-SEC-002 | P0 | ❌ | Brute-force anahtarı ilk hatada oluşturuluyor, login başında `hasKey` kontrolü yapıldığı için ikinci deneme kilitlenebiliyor | Deneme sayacı ve kilit anahtarı ayrılmalı; eşikler otomatik testle kanıtlanmalı |
| PR-SEC-003 | P0 | 🟡 | E-posta doğrulaması normal access token kullanıyor; amaç/audience ayrımı ve tek kullanımlılık yok | Ayrı doğrulama token'ı, tek kullanım, süre sonu ve tekrar gönderme akışı olmalı |
| PR-SEC-004 | P0 | 🟡 | Reset token'ı tekrar kullanılabilir; şifre değişimi/reset sonrası mevcut refresh token'lar topluca iptal edilmiyor | Token version/session store ile tüm oturumlar iptal edilebilmeli |
| PR-SEC-005 | P0 | ❌ | Web token'ları `localStorage` içinde; XSS halinde access ve refresh token çalınabilir | Tercihen Secure+HttpOnly+SameSite cookie/BFF modeli; aksi karar tehdit modeliyle belgelenmeli |
| PR-SEC-006 | P0 | ❌ | WebSocket origin'i `*`; mesaj/typing rate limit ve kötüye kullanım koruması yok | Production origin allowlist, frame/body limit, kullanıcı/destination yetkisi ve rate limit |
| PR-SEC-007 | P0 | ❌ | Dosya yükleme MIME, magic-byte, uzantı ve kötü amaçlı içerik taraması yapmıyor; istemci `public=true` seçebiliyor | Dosya sınıfına göre server-side bucket kararı, boyut/tip doğrulaması ve zararlı içerik karantinası |
| PR-SEC-008 | P0 | ❌ | `UserResponse` e-posta/telefon içeriyor ve genel kullanıcı detay endpoint'lerinde kullanılabiliyor | Public/private DTO ayrımı ve alan bazlı veri minimizasyonu |
| PR-BIZ-001 | P0 | ❌ | Abonelik endpoint'i ödeme doğrulamadan planı aktif ediyor | İmzalı webhook ile ödeme doğrulama veya tüm ücretli planların kapatılması |
| PR-LEGAL-001 | P0 | ❌ | Yasal sayfalarda `[Şirket Bilgileri]` placeholder'ı ve ödeme/iptal modeliyle çelişen metinler var | Tek kaynaklı, versiyonlu ve hukuk onaylı metinler yayınlanmalı |
| PR-LEGAL-002 | P0 | ❌ | Hesap silme UI'ında TODO var; veri export, saklama/imha ve ilgili kişi talep akışı kanıtlanmıyor | Kullanıcı talebi, export, soft-delete/anonymization ve denetim kaydı uygulanmalı |
| PR-LEGAL-003 | P0 | 🟡 | Cookie banner yalnızca kabul/red değerini localStorage'a yazıyor; kategori ve rıza geri alma yönetimi yok | Zorunlu/analitik/pazarlama ayrımı ve tercihi sonradan değiştirme |
| PR-OPS-001 | P0 | ❌ | Uygulama logları dışında merkezi gözlemleme, hata takibi, SLO dashboard'u ve alarm kanıtı yok | Metrik, log, trace/error takip, alarm ve runbook birlikte kurulmalı |
| PR-OPS-002 | P0 | ❓ | PostgreSQL/obje depolama yedeği, PITR ve geri yükleme tatbikatı bu repoda kanıtlanmıyor | Otomatik yedek + başarılı restore raporu olmadan release yok |
| PR-CICD-001 | P0 | ❌ | Deploy workflow'u `main` push'ta CI ile paralel tetiklenebilir; CI başarısını bekleme bağı yok | Deploy yalnızca başarılı, korumalı CI artifact/commit'inden başlamalı |
| PR-CICD-002 | P0 | ❌ | CI lint, typecheck, mobil test, SAST, secret scan, dependency/image scan çalıştırmıyor | Zorunlu quality ve security gate'leri branch protection'a bağlanmalı |
| PR-CICD-003 | P0 | 🟡 | E2E testlerin önemli bölümü route mock kullanıyor; gerçek backend sözleşmesini kanıtlamıyor | Kritik akışlar gerçek DB/Redis/S3 stub/SES sandbox ile integration E2E olmalı |
| PR-TEST-001 | P0 | ❌ | `pnpm lint` workspace dışındaki `.wrongstack` dosyalarını da tarıyor ve 37 hata/266 uyarıyla başarısız; gerçek web+tests taraması 0 hata/82 uyarı | Lint scope deterministik olmalı, hata sıfır olmalı, uyarı bütçesi belirlenmeli |
| PR-REL-001 | P0 | ❓ | GitOps kullanılıyor fakat canary/rolling strateji, health gate ve otomatik rollback kanıtı bu repoda yok | Staging deploy, health gate, kontrollü rollout ve test edilmiş rollback |
| PR-MOB-001 | P1 | ❌ | EAS config, mağaza build hattı, push yapılandırması ve mağaza gizlilik kanıtı yok | Mobil yayın ayrı release gate'iyle tamamlanmalı |

### 3.1 Mevcut güçlü temeller

- Frontend route bazlı lazy loading kullanıyor.
- Backend prod profili `open-in-view` ve Swagger UI'ı kapatıyor.
- Flyway migration ve PostgreSQL şema doğrulaması var.
- Redis tabanlı rate limit, refresh rotation/blacklist ve temel login kilitleme için başlangıç kodu var.
- S3 uyumlu depolama ve SES istemcisi eklenmiş.
- ECR'a SHA etiketli image gönderip ayrı GitOps repo'sunu güncelleyen deployment hattı var.
- Backend unit/service/controller testleri ve geniş Playwright senaryo seti mevcut.
- Mobil token saklama için SecureStore kullanılıyor.

Bu maddeler production hazır olduğu anlamına gelmez; aşağıdaki kabul kriterlerine ulaşmayı hızlandıran mevcut altyapıdır.

---

## 4. Hedef production mimarisi

```text
Kullanıcı
  -> DNS + CDN/WAF + TLS
    -> Web ingress
      -> statik React assetleri
      -> /api  -> Spring Boot servisleri
      -> /ws   -> WebSocket/STOMP servisleri
                    |-> PostgreSQL (managed, encrypted, PITR)
                    |-> Redis (managed/HA, auth+TLS)
                    |-> S3-compatible object storage (private/public ayrımı)
                    |-> SES/e-posta ve opsiyonel SMS sağlayıcısı
                    |-> ödeme sağlayıcısı + imzalı webhook

Tüm katmanlar -> merkezi log + metrik + hata/trace sistemi -> alarm -> nöbetçi
Deploy -> CI artifact/image scan -> staging -> smoke -> onay -> progressive production rollout
```

### 4.1 Ortamlar

En az üç bağımsız ortam olmalı:

| Ortam | Amaç | Veri kuralı | Deploy |
|---|---|---|---|
| development | Yerel geliştirme | Sentetik/seed | Serbest |
| staging | Production benzeri doğrulama | Anonim/sentetik, gerçek kullanıcı verisi yok | Main adayı veya release candidate |
| production | Gerçek trafik | KVKK envanterine uygun | Onaylı ve izlenebilir |

Kabul kriterleri:

- [ ] Her ortamın ayrı DB, Redis, bucket, domain, anahtar ve ödeme hesabı vardır.
- [ ] Staging ile production aynı image'ı çalıştırır; yalnız config/secrets değişir.
- [ ] Production secret'ları repoda, image'da, manifest plaintext'inde veya logda bulunmaz.
- [ ] Environment contract doğrulaması startup öncesi eksik/varsayılan kritik config'i reddeder.
- [ ] Production'da development seed, örnek admin ve varsayılan şifre oluşmaz.

---

## 5. Kimlik doğrulama ve hesap güvenliği

### PR-AUTH-001 — Kayıt ve rol güvenliği — P0

- Public API yalnız `STUDENT` ve `TUTOR` rollerini kabul eder.
- DTO allowlist kullanır; `ADMIN` veya bilinmeyen rol `400/403` döner.
- Admin oluşturma/rol değiştirme yalnız ayrı, audit'li, yeniden doğrulamalı admin akışında yapılır.
- E-posta ve telefon normalize edilerek benzersizlik uygulanır.
- Parola politikası ürün kararıyla 6–100 karakter olarak sabitlenir; ele geçirilmiş parola kontrolleri ayrıca değerlendirilir.

**Kabul:** API integration testi public register ile admin oluşturulamadığını; mevcut adminin kendine admin üretemediğini ve yetkili süreç dışında rol değişmediğini kanıtlar.

### PR-AUTH-002 — E-posta doğrulama — İlk sürüm kapsamı dışı

- İlk self-hosted sürümde hesaplar kayıt anında aktif olur; e-posta teslimatı temel işlevler için zorunlu değildir.
- Doğrulama endpoint'leri geriye dönük uyumluluk için kalabilir ancak kayıt, giriş, mesaj, ders talebi ve ilan akışlarını engellemez.
- İleride doğrulama yeniden etkinleştirilirse token access token'dan ayrı key/purpose/audience kullanır ve tek kullanımlı olur.

**Kabul:** Harici e-posta sağlayıcısı olmadan kayıt sonrası doğrudan oturum açılır ve temel ürün akışları çalışır.

### PR-AUTH-003 — Login, rate limit ve brute-force — P0

- IP ve hesap/email bazlı sayaçlar ayrıdır.
- Önerilen başlangıç: 5 hatada kısa gecikme, 10 hatada 15 dakika kilit; kesin eşikler risk testinden sonra sabitlenir.
- Hatalı kullanıcı adı ve hatalı parola aynı dış mesajı ve benzer yanıt süresini üretir.
- Redis kesintisindeki davranış tehdit modeline göre fail-open/fail-closed olarak tanımlanır ve alarm üretir.
- Reverse proxy gerçek istemci IP zinciri güvenilir proxy allowlist'iyle çözülür.

**Kabul:** 1–4 hatadan sonra doğru parolayla giriş mümkün; eşik sonrası kilit; süre sonunda açılma; farklı IP ve aynı hesap senaryoları otomatik testlidir.

### PR-AUTH-004 — Token ve oturum yaşam döngüsü — P0

- Access token 10–15 dakika, refresh token ürün riskine göre 7–30 gün olabilir.
- Refresh her kullanımda döner; eski token tekrar kullanılırsa token ailesi iptal edilir ve alarm/audit oluşturulur.
- Logout, parola değişimi, parola reseti, hesap kapatma ve admin askıya alma ilgili tüm refresh session'larını iptal eder.
- Kullanıcı aktif cihazlarını görüp tek tek veya topluca kapatabilir (P1).
- JWT anahtar rotasyonu `kid`/keyring veya eşdeğer yöntemle kesintisiz yapılabilir.

**Kabul:** Rotation reuse, logout sonrası refresh, parola sonrası refresh, expired token ve key rotation testleri geçer.

### PR-AUTH-005 — Web token saklama — P0

- Tercih edilen model: refresh token `Secure`, `HttpOnly`, uygun `SameSite` cookie; access token memory'de.
- Cookie modeli kullanılırsa CSRF token/origin kontrolü uygulanır.
- LocalStorage'da refresh token bırakılacaksa karar; XSS tehdidi, CSP, token ömrü ve kabul edilen riskle yazılı olarak onaylanır.
- Mobilde SecureStore devam eder; cihaz kaybı/biometric politikası P1'de tanımlanır.

---

## 6. Yetkilendirme ve veri minimizasyonu

### PR-AUTHZ-001 — Endpoint matrisi — P0

Her endpoint için `anonymous / student / tutor / admin / resource owner` matrisi hazırlanmalı ve integration test olmalıdır.

- [ ] Ders, mesaj, favori, doğrulama, ilan, anlaşmazlık ve abonelik nesnelerinde ownership kontrolü vardır.
- [ ] IDOR testleri başka kullanıcının UUID'siyle okuma/yazmayı reddeder.
- [ ] Public tutor DTO yalnız gösterilmesi gereken profil alanlarını içerir.
- [ ] E-posta, telefon, belge URL'si, iç audit alanları ve özel mesaj metadata'sı rol bazlı DTO'lardan ayrılır.
- [ ] Admin işlemleri yeniden doğrulama veya güçlü oturum gerektirir.
- [ ] Tüm admin mutasyonları actor, hedef, önceki/yeni değer, zaman ve correlation ID ile audit edilir.

### PR-AUTHZ-002 — WebSocket yetkilendirmesi — P0

- CONNECT sırasında token, blacklist ve kullanıcı aktifliği kontrol edilir.
- Origin allowlist yalnız production web/mobil gereksinimlerini kapsar.
- Kullanıcı yalnız kendi `/user/queue/**` hedeflerine abone olabilir.
- Mesaj gönderen/alan ilişkisi ve bloke/şikâyet durumu kontrol edilir.
- Mesaj uzunluğu, frame boyutu, mesaj/saniye ve bağlantı/kullanıcı limitleri uygulanır.
- Simple broker'ın çoklu replica davranışı çözülür: sticky session + ortak broker relay veya tek replica sınırı belgelenir.

**Kabul:** Yetkisiz subscribe/send, spoof sender, wildcard origin ve flood testleri geçer.

---

## 7. Dosya ve kimlik belgesi güvenliği

### PR-FILE-001 — Upload politikası — P0

| Dosya tipi | Bucket | Önerilen limit | Erişim |
|---|---|---:|---|
| Profil/ilan görseli | public veya CDN kontrollü | 5 MB | Optimize edilmiş türevler public |
| Kimlik/diploma/sertifika | private | 10 MB | Kısa ömürlü signed URL, yalnız yetkili admin+sahip |
| Mesaj eki | private | 10 MB başlangıç | Gönderen/alıcı sahipliği |

- [ ] İstemci bucket/public kararını veremez; endpoint kullanım amacı verir.
- [ ] Extension, bildirilen MIME ve magic-byte birlikte doğrulanır.
- [ ] Dosya adı storage key olarak kullanılmaz; metadata sanitize edilir.
- [ ] Görseller yeniden encode edilir; EXIF/konum metadata'sı temizlenir.
- [ ] PDF/görseller zararlı içerik taramasından geçmeden erişilebilir olmaz.
- [ ] Private obje URL'si DB'ye public URL olarak yazılmaz; opaque key yazılır.
- [ ] Bucket encryption, versioning/lifecycle ve public access block politikası tanımlanır.
- [ ] Silinen/ret edilen belgeler retention politikasına göre temizlenir.

**Kabul:** EXE/PHP, MIME spoof, polyglot, oversized, path traversal, malware fixture ve başka kullanıcı belgesine erişim testleri geçer.

---

## 8. Temel ürün akışları

### PR-FUNC-001 — Öğretmen onboarding — P0

- Kayıt -> doğrudan oturum -> profil -> konu/ücret -> müsaitlik -> ilan akışı kesintisizdır.
- Her adım kaydedilir, devam edilebilir ve kullanıcıya tamamlanma durumu gösterilir.
- Zorunlu alanlar backend tarafından da doğrulanır.
- Doğrulanmamış veya askıya alınmış öğretmenin listelenme kuralı ürün tarafından belirlenir.
- İlanın draft/pending/published/rejected/suspended durumları açık bir state machine ile yönetilir.

### PR-FUNC-002 — Arama ve profil — P0

- Arama yalnız aktif/yayınlanmış ve izin verilen profilleri döndürür.
- Filtre, sıralama ve sayfalama DB seviyesinde deterministiktir.
- Fiyat, puan, konu ve müsaitlik tutarlı ve günceldir.
- Boş sonuç, hata, yavaş bağlantı ve pagination tekrarları testlidir.
- SEO URL'leri canonical ve indexlenebilir içerik üretir.

### PR-FUNC-003 — Ders yaşam döngüsü — P0

İzin verilen geçişler tek server-side state machine ile tanımlanmalıdır:

```text
PENDING -> CONFIRMED -> COMPLETED
   |           |
   +---------->CANCELLED
```

- [ ] Geçersiz/geçmiş tarih ve öğretmen müsaitliği çakışması engellenir.
- [ ] Aynı slot için yarış koşulu DB constraint/transaction ile önlenir.
- [ ] Öğrenci yalnız kendi talebini; öğretmen yalnız kendisine gelen talebi yönetir.
- [ ] İptal sebebi/politikası ve taraf bildirimleri tutarlıdır.
- [ ] Review yalnız tamamlanmış ders ve ilgili öğrenci tarafından bir kez yazılabilir.
- [ ] Tüm zamanlar DB'de UTC, görüntülemede kullanıcının timezone'u ile ele alınır.

### PR-FUNC-004 — Mesajlaşma ve güvenlik — P0

- Mesaj kalıcı kayıt ve gerçek zamanlı teslim arasında idempotent kimlik taşır.
- Offline kullanıcı yeniden bağlandığında eksik mesajları REST cursor ile alır.
- Optimistic send başarısızsa UI durumu düzeltir.
- İçerik uzunluk/karakter kuralı, spam limiti, block/report ve admin inceleme politikası vardır.
- Mesaj silme/retention davranışı hukuki politika ile uyumludur.

### PR-FUNC-005 — Admin ve destek — P0

- Kullanıcı askıya alma/açma, öğretmen belge onay/ret, anlaşmazlık ve içerik şikâyeti yönetilir.
- Belge görüntüleme işlemleri ayrıca audit edilir.
- Admin listelerinde pagination, filtre ve hassas alan maskeleme vardır.
- Kritik işlem confirmation + gerekçe ister.
- En az iki kontrollü admin hesabı, MFA ve break-glass prosedürü vardır.

### PR-FUNC-006 — Bildirimler — P0

- Transactional e-posta: kayıt doğrulama, reset, ders talebi/onayı/iptali ve güvenlik uyarıları.
- E-posta domaini için SPF, DKIM ve DMARC doğrulanır.
- Bounce/complaint webhook'ları işlenir; teslim edilemeyen adresler baskılanır.
- SMS doğrulama release kapsamındaysa gerçek sağlayıcı, ülke/numara formatı, abuse/cost limit ve fallback tamamlanır; değilse telefon doğrulandı iddiası gösterilmez.
- WebSocket bildirimi tek kalıcı kanal değildir; okunmamış durum server-side kayda dayanır veya bunun geçici ürün kısıtı açıkça belirtilir.

---

## 9. Ödeme, abonelik ve finansal güvenlik

### 9.1 Release kararı — P0

Aşağıdaki iki seçenekten biri yazılı olarak seçilmelidir:

**A. Ücretsiz beta:** Abonelik CTA'ları kaldırılır/devre dışı bırakılır; API ücretli planı aktive edemez; fiyat sayfasında beta durumu açıkça yazılır.

**B. Ücretli release:** Lisanslı ödeme sağlayıcısı entegre edilir ve aşağıdaki maddelerin tamamı sağlanır.

### PR-PAY-001 — Ücretli release kabul kriterleri — P0

- [ ] Backend plan fiyatını kendi kataloğundan hesaplar; istemci fiyat/başarı bildiremez.
- [ ] Abonelik yalnız sağlayıcıdan doğrulanmış, imzalı ve replay korumalı webhook sonrası aktif olur.
- [ ] Webhook idempotency key/event ID ile bir kez işlenir.
- [ ] `pending/active/past_due/cancel_at_period_end/cancelled/refunded` durumları tanımlıdır.
- [ ] Başarısız ödeme, yenileme, iptal, cayma/iade ve fatura akışları ürün+hukuk tarafından onaylıdır.
- [ ] Kart verisi hiçbir zaman öğret.io sunucusuna/loguna girmez; hosted checkout/tokenization kullanılır.
- [ ] Finansal event ledger'ı append-only ve audit edilebilirdir.
- [ ] Fiyat/KDV/fatura bilgisi ve ticari unvan kullanıcıya ödeme öncesi gösterilir.
- [ ] Sandbox ve düşük tutarlı gerçek production işlem/iptal/refund testi yapılır.
- [ ] Günlük sağlayıcı–DB mutabakat raporu ve mismatch alarmı vardır.

---

## 10. KVKK, sözleşmeler ve kullanıcı hakları

> Bu bölüm teknik release kapısını tanımlar; hukuki görüş yerine geçmez. Şirket türü, iş modeli, veri kategorileri, yurt dışı aktarım ve güncel mevzuat yetkili hukuk danışmanı tarafından release öncesi doğrulanmalıdır.

### PR-LEGAL-001 — Veri envanteri ve hukuki temel — P0

- [ ] Veri sorumlusu ticari unvanı, adresi, iletişim kanalı ve varsa irtibat kişisi kesinleştirilir.
- [ ] Veri kategorisi × amaç × ilgili kişi × hukuki sebep × alıcı × yurt dışı aktarım × retention matrisi hazırlanır.
- [ ] VERBİS yükümlülüğü/istisnası hukuk danışmanı tarafından yazılı değerlendirilir.
- [ ] AWS/GitHub/SES/SMS/analytics/ödeme/destek sağlayıcıları veri işleyen/alıcı envanterine eklenir.
- [ ] Yurt dışı veri aktarım mekanizması ve sözleşmeleri güncel KVKK gerekliliklerine göre onaylanır.
- [ ] Veri ihlali değerlendirme ve bildirim prosedürü hazırlanır.

Resmî referanslar:

- [KVKK — Veri güvenliğine ilişkin yükümlülükler](https://www.kvkk.gov.tr/Icerik/2040/Veri-Guvenligine-Iliskin-Yukumlulukler)
- [KVKK — Veri Sorumluları Sicili Hakkında Yönetmelik](https://www.kvkk.gov.tr/Icerik/5442/VERI-SORUMLULARI-SICILI-HAKKINDA-YONETMELIK)
- [KVKK — Silme, yok etme veya anonim hale getirme yönetmeliği](https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK)

### PR-LEGAL-002 — Yasal metinler ve sürümleme — P0

- Aydınlatma metni, gizlilik politikası, öğrenci/öğretmen kullanım sözleşmesi, çerez politikası, iptal politikası ve platform sorumluluk açıklaması hukuk onaylıdır.
- Placeholder, “DersPlatform”/“öğret.io” marka farkı ve gerçekleşmeyen ödeme iddiaları temizlenir.
- Metinler DB/CMS veya versiyonlu tek kaynaktan sunulur; aynı belgenin çelişkili statik kopyaları kaldırılır.
- Her belge `version`, `effective_at`, locale, hash ve yayın durumu taşır.
- Kayıt anında kabul edilen zorunlu sözleşme versiyonu; user, IP, user-agent, zaman ve kanıt hash'iyle kaydedilir.
- Aydınlatma metni “kabul ettim” zorunluluğuna dönüştürülmez; gerçekten rıza gereken işlemler ayrı ve özgür tercihtir.

### PR-LEGAL-003 — Çerez ve tracking rızası — P0

- Zorunlu olmayan script/cookie rızadan önce yüklenmez.
- Analitik ve pazarlama ayrı kategoridir; “reddet” kabul kadar kolaydır.
- Kullanıcı tercihlerini her zaman açıp değiştirebilir/geri alabilir.
- Consent version, kategori ve zaman kaydı saklanır.
- CMP davranışı Chrome, Safari/ITP ve mobil web'de test edilir.

Resmî referans: [KVKK — Çerez Uygulamaları Hakkında Rehber](https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber)

### PR-LEGAL-004 — Veri sahibi talepleri — P0

- [ ] Hesap kapatma kullanıcı tarafından başlatılabilir ve yeniden doğrulanır.
- [ ] Yasal saklama zorunluluğu olmayan profil/kimlik/mesaj/analytics verisi politika doğrultusunda silinir veya anonimleşir.
- [ ] Yedeklerde silme davranışı ve tekrar sisteme dönmeme garantisi belgelenir.
- [ ] Kullanıcı makine okunabilir veri export'u isteyebilir.
- [ ] Düzeltme, itiraz ve iletişim başvuru kanalı; SLA ve kimlik doğrulama prosedürü vardır.
- [ ] Her talep ticket ve audit kaydıyla izlenir.

### PR-LEGAL-005 — Ticari elektronik ileti — P0/P1

- Transactional ve pazarlama iletileri ayrılır.
- Pazarlama e-posta/SMS onayı kanal bazlı, geri alınabilir ve ispatlanabilir olur.
- İYS kapsamı ve yükümlülüğü hukuk danışmanı tarafından değerlendirilir; gerekiyorsa entegrasyon ve ret senkronizasyonu tamamlanır.

Resmî referans: [Ticaret Bakanlığı — İleti Yönetim Sistemi](https://ticaret.gov.tr/ic-ticaret/ticari-elektronik-iletiler/ileti-yonetim-sistemi-iys)

---

## 11. Uygulama ve altyapı güvenliği

### PR-SEC-PLAT-001 — Secret ve config yönetimi — P0

- Production `JWT_SECRET`, DB/Redis/S3/ödeme anahtarları boş veya varsayılan değerde başlayamaz.
- Secret'lar AWS Secrets Manager/SSM, External Secrets veya eşdeğer sistemden workload identity ile alınır.
- Uzun ömürlü AWS key kullanılmaz; GitHub OIDC yaklaşımı runtime için de least-privilege rolle sürdürülür.
- Secret rotation runbook'u ve en az bir tatbikatı vardır.
- Git history ve image layer secret scan'i sıfır doğrulanmış bulguyla geçer.

### PR-SEC-PLAT-002 — HTTP/TLS ve browser güvenliği — P0

- TLS 1.2+ ve otomatik sertifika yenileme; HTTP -> HTTPS redirect.
- HSTS yalnız HTTPS ingress'te ve preload kararı test sonrası.
- CSP nonce/hash tabanlı; en az `default-src 'self'`, kontrollü connect/img/font kaynakları.
- `X-Content-Type-Options`, frame-ancestors/X-Frame-Options, Referrer-Policy ve Permissions-Policy.
- CORS exact origin allowlist; wildcard header yerine gereken header listesi.
- Request body/header limitleri ve güvenli timeout'lar ingress + uygulamada.
- Güvenlik header'ları otomatik smoke testle doğrulanır.

### PR-SEC-PLAT-003 — API güvenliği — P0

- Bean validation tüm request DTO'larında uygulanır; `Map<String,String>` kullanılan mutation endpoint'leri typed DTO'ya taşınır.
- Mass assignment, XSS output encoding, injection, SSRF, path traversal ve deserialization testleri vardır.
- Actuator'da public yalnız liveness/readiness; diğer endpoint'ler internal/authenticated olur.
- OpenAPI production public değil; güvenli internal erişim veya build artifact olarak yayınlanır.
- Hata gövdesi correlation ID içerir; stack trace/SQL/PII döndürmez.
- Rate limit endpoint riskine göre ayrılır: auth, reset, upload, search, message, reference ve admin.

### PR-SEC-PLAT-004 — Container ve supply chain — P0

- Base image'lar digest veya otomatik güncellenen güvenilir sabit sürüme pinlenir; `latest` production'da kullanılmaz.
- Runtime image non-root kullanıcı, read-only filesystem ve minimum capability ile çalışır.
- JRE kullanılır; JDK ve build araçları runtime image'da bulunmaz.
- SBOM üretilir, image imzalanır ve kritik/yüksek CVE politikası uygulanır.
- Dependency botu; npm/pnpm, Gradle, GitHub Actions ve Docker base image'ları kapsar.
- GitHub Actions SHA pinleme politikası risk değerlendirmesiyle uygulanır.

### PR-SEC-PLAT-005 — Güvenlik doğrulaması — P0

- SAST, dependency scan, secret scan ve container scan CI'da zorunlu.
- DAST staging üzerinde auth/public akışları tarar.
- OWASP ASVS tabanlı kontrol listesi ve manuel yetkilendirme testi tamamlanır.
- Production öncesi bağımsız pentest veya en azından dış ekip güvenlik incelemesi yapılır; P0/P1 bulgular kapanır.
- `security@ogret.io`, güvenlik bildirim süreci ve `/.well-known/security.txt` yayınlanır (P1).

---

## 12. Veritabanı, Redis ve veri dayanıklılığı

### PR-DATA-001 — PostgreSQL — P0

- Managed PostgreSQL, private network, TLS, encryption-at-rest ve least-privilege DB user.
- Uygulama kullanıcısında create/drop/superuser yetkisi yok; migration için ayrı rol değerlendirilmeli.
- Flyway migration production snapshot kopyasında test edilir; geri dönüş/forward-fix planı her riskli migration'da yazılır.
- Migration'lar lock süresi, tablo rewrite ve backward compatibility açısından incelenir.
- Connection pool replica/pod sayısına göre DB connection bütçesini aşmaz.
- Slow query log/`pg_stat_statements`, index ve vacuum alarmı vardır.
- Seed migration'larının production etkisi incelenir; örnek admin/test kullanıcıları kaldırılır veya güvenli bootstrap süreciyle değiştirilir.

### PR-DATA-002 — Backup ve restore — P0

Önerilen başlangıç hedefleri ürün/iş tarafından onaylanmalıdır:

- **RPO:** en fazla 1 saat
- **RTO:** en fazla 2 saat
- PITR: en az 7 gün
- Günlük snapshot: en az 30 gün
- Aylık arşiv: hukuki/finansal retention kararıyla

Kabul kriterleri:

- [ ] Backup şifreli, ayrı hesap/bölge erişim sınırına sahip ve silinmeye karşı korunur.
- [ ] En az bir tam restore staging'e yapılmış; süre, veri tutarlılığı ve uygulama smoke sonucu raporlanmıştır.
- [ ] Restore tatbikatı üç ayda bir takvimlidir.
- [ ] S3 private belgeler ve gerekli Redis kalıcılığı için ayrı kurtarma politikası vardır.
- [ ] Backup başarısızlığı alarm üretir.

### PR-DATA-003 — Redis — P0

- Managed/HA Redis, private endpoint, TLS/auth ve bellek politikası.
- Rate limit, token blacklist ve cache key namespace/TTL'leri dokümante edilir.
- Cache kaybı veri kaybı yaratmaz; token blacklist/session güvenliği için Redis persistence/alternatif store kararı açıkça verilir.
- Eviction, connection ve latency alarmları vardır.
- Cache stampede ve key cardinality sınırları test edilir.

---

## 13. Reliability, performans ve ölçek

### 13.1 Başlangıç SLO'ları — P0

| SLI | Başlangıç hedefi | Ölçüm |
|---|---:|---|
| Web/API aylık erişilebilirlik | %99,9 | Dış sentetik probe + ingress/API metriği |
| API 5xx oranı | <%1, kritik akışlarda <%0,5 | Route bazlı |
| Public read p95 | <500 ms | Sunucu latency, cache dahil |
| Mutation p95 | <800 ms | Auth/lesson/message ayrı |
| Web LCP p75 mobil | <2,5 sn | Gerçek kullanıcı ölçümü |
| INP p75 | <200 ms | Gerçek kullanıcı ölçümü |
| CLS p75 | <0,1 | Gerçek kullanıcı ölçümü |
| Mesaj kalıcı kayıt p95 | <1 sn | Server-side event |

SLO hedefi trafik ve maliyet verisiyle revize edilebilir; ölçüm olmadan “performant” kabul edilmez.

### PR-REL-001 — Health ve graceful behavior — P0

- `/actuator/health/liveness` process durumunu; readiness DB/Redis/zorunlu bağımlılık durumunu doğru yansıtır.
- Pod startup/readiness/liveness probe'ları tanımlıdır.
- SIGTERM'de yeni trafik durur, in-flight request tamamlanır, WebSocket kontrollü kapanır.
- Backend/frontend için en az iki replica hedefleniyorsa session/broker/cache davranışı testlidir.
- External provider timeout, retry with jitter, circuit breaker ve idempotency kuralları vardır.
- Redis/S3/SES/ödeme kesintisinde kullanıcıya yanlış başarı gösterilmez.

### PR-PERF-001 — Kapasite testi — P0/P1

- Trafik modeli: eşzamanlı kullanıcı, arama QPS, login burst, WebSocket bağlantı ve mesaj/saniye tahmini.
- Staging load testi hedef p95 ve error budget'ı karşılar.
- Spike, soak (en az 2 saat başlangıç), DB pool exhaustion ve Redis latency testleri yapılır.
- İlk production capacity + %100 headroom için kaynak limit/request ve autoscaling eşiği belirlenir.
- Büyük bundle, görsel ve üçüncü taraf script bütçeleri CI'da izlenir.

### PR-PERF-002 — Frontend — P1

- Route chunk ve ana bundle bütçesi tanımlanır; build raporu artifact olur.
- Görseller WebP/AVIF, boyutlandırılmış `srcset`, lazy-load ve width/height kullanır.
- Font preload/subset ve cache stratejisi doğrulanır.
- Static asset'ler content hash + immutable cache; `index.html` no-cache.
- CDN compression Brotli/Gzip ve cache hit oranı izlenir.

---

## 14. Gözlemlenebilirlik ve operasyon

### PR-OBS-001 — Structured logging — P0

- JSON log: timestamp, level, service, environment, version/commit, correlation ID, route, status, latency.
- User ID gerekiyorsa internal opaque ID ve erişim kontrollü; e-posta, telefon, token, parola, belge URL'si ve mesaj içeriği loglanmaz.
- Reverse proxy -> backend -> async/WebSocket event correlation zinciri korunur.
- Log retention ve erişim rolleri veri envanteriyle uyumludur.

### PR-OBS-002 — Metrik ve dashboard — P0

En az şu dashboard'lar gerekir:

1. Trafik: RPS, status, p50/p95/p99, top routes
2. Runtime: CPU, memory, GC, thread, connection pool
3. Data: DB latency/connections/locks, Redis latency/memory/eviction
4. Business: register, verified user, published tutor, lesson request/confirm/complete, subscription event
5. Provider: SES delivery/bounce, S3 error, payment webhook lag/failure
6. WebSocket: active connection, connect failure, send rate, broker backlog

### PR-OBS-003 — Alarm ve nöbet — P0

- Alarm severity: SEV1/SEV2/SEV3 tanımlıdır.
- Pager/telefon kanalı SEV1/2 için; yalnız e-posta kritik alarm için yeterli değildir.
- Örnek alarmlar: uptime, 5xx burst, latency SLO, DB doluluk/connection, backup failure, payment mismatch, auth abuse, SES complaint.
- Her alarm owner ve runbook link'i taşır; test alarmı gerçek alıcıya ulaşmıştır.
- Nöbetçi ve ikinci seviye escalation kişisi lansman haftası için belirlenir.

### PR-OPS-001 — Runbook seti — P0

En az aşağıdaki runbook'lar repoda veya kontrollü operasyon deposunda bulunmalıdır:

- Deploy ve rollback
- DB restore/PITR
- Secret/JWT key rotation
- Kullanıcı hesabı ele geçirilmesi
- Veri ihlali değerlendirme ve izolasyon
- Redis, DB, object storage, e-posta ve ödeme sağlayıcısı kesintisi
- WebSocket kapasite sorunu
- Admin hesabı kurtarma/break-glass
- Şüpheli içerik/kimlik belgesi erişimi
- Domain/DNS/sertifika yenileme arızası

---

## 15. CI/CD ve release mühendisliği

### PR-CI-001 — Pull request kapıları — P0

Her PR için zorunlu kontroller:

| Katman | Zorunlu kontroller |
|---|---|
| Web | install frozen lockfile, lint, typecheck, unit/component test, build |
| Backend | compile, unit, service/integration test, migration test, format/static analysis |
| E2E | Chromium kritik smoke her PR; tüm tarayıcılar nightly/release |
| Mobile | typecheck, lint, Jest, Expo doctor/build doğrulaması (mobil değiştiğinde) |
| Security | secret scan, SAST, dependency audit, SBOM, image scan |
| Docs/config | workflow, Docker, nginx, public ve migration değişikliklerini doğru path filter ile tetikleme |

- Branch protection direct push'ı engeller; en az bir review ve tüm required check'ler zorunludur.
- CI dışındaki worktree/cache/report klasörlerini lint/test kapsamından deterministik biçimde hariç tutar.
- Lockfile tek paket yöneticisi kararıyla yönetilir; kökte `pnpm-lock.yaml` ve `package-lock.json` çiftliği temizlenir veya gerekçelendirilir.
- Generated Playwright/test artifact'leri git dışında ve CI artifact retention ile tutulur.

### PR-CI-002 — Integration test ortamı — P0

- Testcontainers veya CI service ile gerçek PostgreSQL+Redis.
- Migration sıfır DB'ye uygulanır ve schema validate edilir.
- Kritik E2E route mock kullanmaz: register/verify/login/refresh, search, lesson request/confirm/cancel, message persistence, verification upload authorization.
- S3 için gerçek uyumlu test container veya LocalStack/MinIO; SES/ödeme için doğrulanmış sandbox/stub contract.
- Test verisi her run izole ve deterministiktir.

### PR-CD-001 — Artifact promotion — P0

- Build bir kez yapılır; SHA/digest'li aynı image staging'den production'a promote edilir.
- `latest` deploy kaynağı değildir.
- Image digest, SBOM, test sonucu ve migration listesi release kaydına bağlanır.
- Deploy yalnız başarılı CI workflow tamamlandıktan sonra başlar (`workflow_run`, reusable workflow veya korumalı environment).
- Production environment manuel onay ve yetkili reviewer gerektirir; acil durum prosedürü ayrıdır.

### PR-CD-002 — Güvenli rollout ve rollback — P0

- Pre-deploy DB backup/restore point ve migration compatibility kontrolü.
- Rolling/canary: önce düşük trafik, health+error+latency gözlemi, sonra tam trafik.
- Otomatik rollback eşiği ve manuel rollback komutu/runbook'u vardır.
- Frontend ve backend N/N-1 uyumlu olacak şekilde API değişiklikleri expand/contract yapılır.
- Rollback tatbikatı staging'de süre ölçülerek başarıyla tamamlanır.

---

## 16. Mobil uygulama release kapısı

Mobil production yayınlanacaksa aşağıdakiler **ek P0** sayılır:

### PR-MOB-001 — Build ve dağıtım

- [ ] `eas.json` veya eşdeğer reproducible iOS/Android build config'i
- [ ] Dev/preview/production bundle identifier ve environment ayrımı
- [ ] Signing certificate/keystore güvenli saklama ve erişim sahipliği
- [ ] CI'da Expo Doctor, TypeScript, lint, Jest ve preview build
- [ ] Internal TestFlight/Google Play testing track smoke testi
- [ ] OTA update politikası, runtime version uyumluluğu ve rollback

### PR-MOB-002 — Platform entegrasyonları

- [ ] Production API URL HTTPS ve build-time doğrulama; localhost fallback production build'de yasak
- [ ] Universal Link/App Link için Apple association ve Android `assetlinks.json`
- [ ] Push token kayıt/silme, izin UX'i, deep-link payload, logout cleanup
- [ ] WebSocket background/reconnect/token rotation testi
- [ ] Offline/timeout/airplane mode ve SecureStore hata senaryoları
- [ ] Kamera/fotoğraf/bildirim izin metinleri yalnız kullanılan yetkiler için

### PR-MOB-003 — Mağaza ve gizlilik

- [ ] App Store Privacy Labels ve Google Play Data Safety gerçek veri akışlarıyla uyumlu
- [ ] Privacy policy/support/account deletion URL'leri canlı
- [ ] Uygulama içinden hesap silme veya mağaza politikasına uygun erişilebilir akış
- [ ] Yaş derecelendirmesi, ekran görüntüleri, açıklama ve review hesabı
- [ ] Crash-free session metriği ve release alarmı

---

## 17. Kalite, erişilebilirlik ve tarayıcı desteği

### PR-QA-001 — Test piramidi — P0/P1

- Backend iş kuralları unit/service; repository ve security gerçek DB integration testleriyle kapsanır.
- Frontend kritik form/state/error davranışları component testlerine taşınır; E2E yalnız kullanıcı yolculuğunu doğrular.
- Contract testleri API response shape ve mobil/web uyumunu korur.
- Coverage yüzdesi tek başına kapı değildir; kritik akış matrisi %100 kapsanmalıdır.
- Flaky test karantinaya alınmaz; owner, issue ve kısa SLA ile düzeltilir.

### PR-QA-002 — Kritik E2E matrisi — P0

| Akış | Anonymous | Student | Tutor | Admin | Gerçek backend |
|---|---:|---:|---:|---:|---:|
| Kayıt/doğrulama/login/reset | ✓ | ✓ | ✓ | saldırı testi | ✓ |
| Arama/profil | ✓ | ✓ | ✓ | - | ✓ |
| Ders talep/onay/iptal/tamamla | - | ✓ | ✓ | gözlem | ✓ |
| Mesaj gönder/al/offline catch-up | - | ✓ | ✓ | politika | ✓ |
| İlan/onboarding | - | - | ✓ | inceleme | ✓ |
| Belge yükleme/onay/ret | - | - | ✓ | ✓ | ✓ |
| Abonelik/webhook/iptal | - | - | ✓ | audit | ödeme açılırsa ✓ |
| Hesap silme/export/consent | ✓/banner | ✓ | ✓ | audit | ✓ |

### PR-A11Y-001 — Erişilebilirlik — P1, kritik akışlarda P0

- WCAG 2.2 AA hedefi; kayıt, giriş, arama, ders talebi, ödeme ve yasal rıza kritik akışlarında P0.
- Klavye navigasyonu, görünür focus, modal focus trap/restore, label/error association.
- Renk kontrastı, zoom %200, screen reader ve reduced motion.
- Axe otomasyonu + en az VoiceOver/NVDA manuel smoke.

### PR-COMPAT-001 — Destek matrisi — P1

- Son iki Chrome/Edge/Firefox/Safari ve güncel iOS/Android Chrome başlangıç hedefi.
- Desteklenmeyen tarayıcı davranışı ve polyfill politikası.
- Desktop, tablet ve 320 px mobil genişlik smoke.

---

## 18. SEO, içerik ve kamuya açık yüzey

### PR-SEO-001 — Teknik SEO — P1

- Her public sayfa benzersiz title/description/canonical/OG/Twitter metadata.
- Sitemap yalnız 200 dönen canonical public URL'leri içerir ve dinamik tutor/blog sayfalarıyla güncellenir.
- `robots.txt`, staging noindex ve production index kuralı testlidir.
- Tutor, review, article, breadcrumb gibi structured data gerçek içeriğe bağlıdır; Rich Results testinden geçer.
- SPA içerikleri botlar için güvenilir render edilir: SSR/prerender/dynamic rendering kararı ve doğrulaması.
- 404 gerçek 404 semantiği/CDN davranışıyla ele alınır.

### PR-CONTENT-001 — İçerik ve güven

- Marka adı, domain, fiyat, komisyon ve ödeme yöntemi tüm sayfalarda tutarlı.
- Hakkımızda, iletişim, destek, SSS, güvenlik ve doğrulama açıklamaları gerçek operasyonu yansıtır.
- Sahte/seed öğretmen profilleri production aramasında görünmez.
- Blog yayın akışı draft/review/publish; XSS-safe rendering ve kaynak/tarih sahipliği taşır.
- İletişim formu gerçek ticket/mail kuyruğuna gider, spam koruması ve SLA vardır.

---

## 19. Analitik, ürün metrikleri ve feature flag

### PR-AN-001 — Consent-aware analytics — P1

- Analytics vendor ve hosting bölgesi veri envanterinde onaylıdır.
- Analytics yalnız gerekli hukuki temel/rıza sonrası başlar.
- PII event property olarak gönderilmez; opaque user ID ve deletion API/workflow kullanılır.
- Event sözlüğü version kontrollüdür.

Minimum event funnel:

```text
landing_view
-> search_started / tutor_profile_viewed
-> registration_started / registration_completed
-> email_verified
-> lesson_request_created
-> lesson_confirmed
-> lesson_completed
-> review_created
-> subscription_checkout_started / subscription_activated
```

### PR-AN-002 — Feature flag — P1

- Ödeme, yeni onboarding, yeni arama ve mobil özellikleri server-enforced flag ile kontrollü açılır.
- Flag default'u güvenli; provider kesintisinde davranış tanımlı.
- Kill switch owner ve runbook'u vardır.

---

## 20. Destek, moderasyon ve iş operasyonları

### PR-SUP-001 — Kullanıcı desteği — P0

- `destek@`/ticket sistemi, çalışma saatleri ve ilk yanıt hedefi yayınlanır.
- Hesap erişimi, sahte profil, taciz, belge itirazı, ders anlaşmazlığı ve ödeme sorunları için makro/runbook vardır.
- Support personeli minimum gerekli veriyi görür; tüm hassas erişim audit edilir.
- Kullanıcıdan parola/token/kimlik belgesini e-posta ile istememe politikası vardır.

### PR-TRUST-001 — Trust & Safety — P0/P1

- Profil, mesaj, yorum ve ders üzerinden report/block akışı.
- Yasaklı içerik ve davranış politikası; yaptırım seviyeleri.
- Kimlik belgesi inceleyen kişiler için eğitim, gizlilik ve erişim sınırı.
- Reşit olmayan kullanıcı senaryosu, veli onayı/iletişim ve güvenlik politikası hukuk/ürün tarafından açıkça kararlaştırılır.
- Acil durum, tehdit, taciz ve yasa dışı içerik escalation prosedürü.

---

## 21. DNS, domain, e-posta ve dış servis hazırlığı

### PR-EXT-001 — Domain ve edge — P0

- `ogret.io`, `www`, API/asset gerekirse subdomain; canonical redirect kararı.
- DNS hesabında MFA, registrar lock, en az iki yetkili ve kurtarma kodu.
- CDN/WAF, DDoS temel koruma, bot/rate limit ve origin yalnız CDN/ingress erişimi.
- TLS otomatik yenileme ve süresi 21/14/7 gün alarmı.
- Status page ve dış uptime probe farklı sağlayıcıdan.

### PR-EXT-002 — E-posta — P0

- Gönderici domain doğrulaması, SPF, DKIM, DMARC başlangıç politikası ve rapor izleme.
- `no-reply`, `support`, `security`, `privacy/KVKK` adres sahipliği.
- SES sandbox'tan çıkış, production quota ve region doğrulaması.
- Template preview, plain text fallback, unsubscribe yalnız pazarlama iletilerinde uygun biçimde.

### PR-EXT-003 — Vendor kaydı — P0

Her kritik sağlayıcı için owner, billing owner, support planı, data region, DPA/sözleşme, quota ve alternatif/fallback kaydedilir:

- Cloud/AWS, DNS/CDN, GitHub, PostgreSQL, Redis
- Object storage, SES, SMS
- Ödeme ve fatura
- Analytics/error monitoring/logging
- Destek/ticket ve mobil build/store hesapları

---

## 22. Maliyet ve kapasite kontrolü

### PR-COST-001 — Bütçe guardrail — P1

- Aylık sabit ve kullanıcı/trafik başı değişken maliyet modeli.
- AWS ve vendor budget alarmı: %50, %80, %100 tahmin/gerçek.
- S3 egress/storage lifecycle, log retention, DB instance ve Redis bellek bütçesi.
- SMS/e-posta/upload/search abuse için kullanıcı/gün ve global harcama limitleri.
- Production/staging kaynak owner/tag ve otomatik kaynak envanteri.

---

## 23. Uygulama planı ve bağımlılıklar

Tahminler küçük bir ekip için yön göstericidir; keşif sonrası ticket bazında güncellenmelidir.

### Faz A — Release kapsamı ve risk kapatma (3–5 gün)

- Ücretsiz beta mı ücretli release mi kararı
- Web-first/mobil release kararı
- Veri envanteri ve provider listesi
- P0 güvenlik bulgularının ticket'lanması
- Staging/prod sahiplik ve SLO kararı

**Çıkış kriteri:** Scope freeze + owner + tarih + kabul kriteri.

### Faz B — Kimlik, yetki, dosya, yasal yaşam döngüsü (2–4 hafta)

- PR-AUTH-001…005
- PR-AUTHZ-001…002
- PR-FILE-001
- PR-LEGAL-001…005
- Admin MFA ve audit

**Çıkış kriteri:** Security integration suite ve hukuk onaylı metinler.

### Faz C — Ürün akışları ve ödeme kararı (1–3 hafta)

- Ders state machine/concurrency
- Mesaj kalıcılığı ve abuse kontrolü
- Bildirim teslimatı
- Ücretsiz beta guard veya gerçek ödeme/webhook
- Support/moderation akışı

**Çıkış kriteri:** Gerçek backend kritik E2E matrisi yeşil.

### Faz D — Platform, CI/CD ve gözlemleme (2–3 hafta)

- Environment/secrets/network
- CI/security scan/artifact promotion
- Health, SLO dashboard, alarmlar
- Backup+restore, load test, rollback tatbikatı

**Çıkış kriteri:** Production simulation day başarıyla tamamlanmış.

### Faz E — Soft launch (en az 1 hafta)

- İç kullanıcı -> davetli öğretmen -> sınırlı öğrenci trafiği
- Günlük metrik, hata ve support değerlendirmesi
- Feature flag ile kademeli açılım
- SEV olaylarında rollout durdurma

**Çıkış kriteri:** 7 gün kritik olay/veri kaybı olmadan, SLO içinde çalışma.

### Faz F — Genel erişim ve mobil (ayrı)

- Web genel erişim
- SEO/analytics/growth P1'leri
- Mobil beta ve mağaza kapıları

---

## 24. Go/No-Go kontrol listesi

Release toplantısında bu bölüm kopyalanıp tarih/kanıt linkleriyle doldurulmalıdır.

### Güvenlik ve veri

- [ ] Public kayıtla admin/rol yükseltme mümkün değil
- [ ] Auth, refresh, reset, verification ve session revoke testleri yeşil
- [ ] Endpoint ownership/IDOR matrisi yeşil
- [ ] Private belgeler erişim kontrollü ve upload taramalı
- [ ] Secret/dependency/SAST/image scan kabul edilen eşikte
- [ ] Pentest P0/P1 bulgusu açık değil
- [ ] DB ve obje restore tatbikatı başarılı

### Ürün ve hukuk

- [ ] Kayıt -> doğrulama -> arama -> ders -> mesaj kritik yol yeşil
- [ ] Abonelik ücretsiz beta olarak kapalı veya gerçek ödeme doğrulanmış
- [ ] Yasal metinler, şirket bilgisi ve veri envanteri hukuk onaylı
- [ ] Consent, hesap silme ve veri export çalışıyor
- [ ] Support ve moderasyon kanalı canlı

### Platform ve operasyon

- [ ] CI required check'ler release SHA'sında yeşil
- [ ] Staging aynı image digest ile smoke/load/security testlerini geçti
- [ ] Production health/readiness ve minimum replica/capacity hazır
- [ ] Dashboard, alarm ve dış uptime probe canlı
- [ ] Rollback tatbikatı başarılı ve süre hedef içinde
- [ ] Nöbetçi/escalation ve runbook'lar hazır
- [ ] DNS/TLS/e-posta domain/ödeme provider production ayarları doğrulandı

### Son onay

| Rol | İsim | Karar | Tarih | Kanıt/not |
|---|---|---|---|---|
| Ürün sahibi |  | GO / NO-GO |  |  |
| Teknik sorumlu |  | GO / NO-GO |  |  |
| Operasyon/SRE |  | GO / NO-GO |  |  |
| Güvenlik sorumlusu |  | GO / NO-GO |  |  |
| Hukuk/uyum |  | GO / NO-GO |  |  |

Tek bir P0 `NO-GO` ise genel karar `NO-GO` olur. İstisna gerekiyorsa risk sahibi, süreli mitigation, geri alma planı ve kapanış tarihi yazılı olmadan istisna verilemez.

---

## 25. Ticket şablonu ve Definition of Done

Her spec maddesi aşağıdaki formatla iş takip sistemine açılmalıdır:

```md
ID / Başlık:
Öncelik:
Risk / kullanıcı etkisi:
Mevcut kanıt:
Kapsam:
Kapsam dışı:
Teknik yaklaşım:
Veri/migration etkisi:
Güvenlik/KVKK etkisi:
Observability:
Rollback:
Test planı:
Kabul kriterleri:
Owner:
Tahmin:
Bağımlılıklar:
Kanıt linkleri:
```

Bir ticket ancak:

- Kod + migration + config + dokümantasyon birlikte tamamlandıysa,
- Negatif/abuse/error senaryoları test edildiyse,
- Log/metrik/alarm eklendiyse,
- Staging kanıtı ve rollback yöntemi varsa,
- Gerekli security/ops/product review alındıysa,
- Kullanıcıya görünen metin ve destek dokümanı güncellendiyse

`Done` kabul edilir.

---

## 26. Bu incelemede kullanılan repo kanıtları

- `.github/workflows/ci.yml` — mevcut backend/frontend/E2E kontrolleri ve eksik quality/security gate'leri
- `.github/workflows/deploy.yml` — ECR + harici GitOps image güncelleme akışı
- `backend/src/main/resources/application*.yml` — prod profil, CORS, JWT, S3/SES ve DB config'i
- `backend/src/main/java/com/dersplatform/service/AuthService.java` — refresh blacklist, brute-force, verification ve reset davranışı
- `backend/src/main/java/com/dersplatform/config/SecurityConfig.java` — endpoint erişim ve CORS davranışı
- `backend/src/main/java/com/dersplatform/config/WebSocketConfig.java` — wildcard origin ve broker yapısı
- `backend/src/main/java/com/dersplatform/service/FileStorageService.java` — mevcut upload/presigned URL davranışı
- `backend/src/main/java/com/dersplatform/service/SubscriptionService.java` — ödeme doğrulamasız aktivasyon
- `src/app/api/client.ts` — web token saklama/refresh yaklaşımı
- `src/app/components/shared/CookieConsent.tsx` ve yasal sayfalar — mevcut rıza/metin davranışı
- `docker-compose.prod.yml`, `Dockerfile`, `backend/Dockerfile`, `nginx.conf` — container ve edge yaklaşımı
- `playwright.config.ts` ve `tests/**` — browser matrisi ve route-mock ağırlıklı E2E kapsamı
- `mobile/package.json`, `mobile/app.json`, `mobile/src/api/client.ts` — Expo/mobile mevcut durumu

### 26.1 17 Temmuz 2026 doğrulama notları

- `pnpm typecheck`: başarılı.
- `pnpm exec eslint src tests`: 0 hata, 82 uyarı.
- `pnpm lint`: `.wrongstack` altındaki çalışma kopyalarını da taradığı için 37 hata, 266 uyarı ile başarısız; lint kapsamı düzeltilmeli.
- Backend testleri bu yerel makinede Java runtime bulunmadığı için çalıştırılamadı; CI veya JDK'lı reproducible ortam kanıtı gerekir.
- Mobil Jest bu çalışma alanında mobil bağımlılıklar kurulu olmadığı için çalıştırılamadı; mobil CI henüz yok.
- Daha önceki frontend typecheck/build doğrulaması production readiness'in yalnız build bölümünü kanıtlar; güvenlik, integration, restore ve operasyon kapılarının yerine geçmez.

---

## 27. İlk açılması önerilen P0 iş paketi

1. `PR-SEC-001`: Public admin kaydını engelle ve rol testlerini ekle.
2. `PR-SEC-002`: Brute-force sayaç/kilit modelini düzelt ve Redis testini ekle.
3. `PR-SEC-003/004/005`: Verification/reset/session/token saklama tasarımını birlikte tamamla.
4. `PR-SEC-006/007/008`: WebSocket, file upload ve public/private DTO sınırlarını kapat.
5. `PR-BIZ-001`: Ücretsiz beta veya gerçek ödeme kararını kod seviyesinde uygula.
6. `PR-LEGAL-001…004`: Tek kaynaklı hukuki metin, consent, delete/export ve retention.
7. `PR-CICD-001…003`: CI başarısına bağlı deploy, tüm quality/security gate'leri ve gerçek integration E2E.
8. `PR-OPS-001/002`: Dashboard+alarm ile backup+restore kanıtı.
9. `PR-REL-001`: Staging progressive deploy ve rollback tatbikatı.

Bu sıra önce yetki/veri/para kaybı risklerini, sonra operasyonel release riskini kapatır.
