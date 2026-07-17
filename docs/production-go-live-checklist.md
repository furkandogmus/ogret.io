# Production Go-Live Kontrol Listesi

**Release modeli:** Web-first ücretsiz ilk sürüm
**Ödeme kararı:** öğret.io ödeme almaz, komisyon tahsil etmez ve ödeme aracılığı yapmaz. Ders ücreti ve ödeme koşulları öğrenci ile öğretmen arasında doğrudan belirlenir. Şirket/ödeme hesabının bulunmaması bu release için teknik blokaj değildir.

Bu belge repo içindeki güvenlik ve kalite düzeltmelerinden sonra, production trafiği açılmadan önce gerçek ortamda kanıtlanması gereken dış operasyonel kapıları listeler. Her maddeye sorumlu, tarih ve kanıt bağlantısı eklenmeden `GO` kararı verilmez.

## Zorunlu dış kapılar

| Kapı | Sorumlu | Kabul kanıtı | Durum |
|---|---|---|---|
| Veri sorumlusu unvanı ve tebligat adresi | Ürün + hukuk | Yasal sayfalardaki gerçek unvan/adres ve hukuk onayı | NO-GO |
| KVKK metinleri ve saklama/imha politikası | Hukuk | Versiyonlu nihai metin, veri işleme envanteri ve onay kaydı | NO-GO |
| Domain, DNS ve TLS | Operasyon | `ogret.io` ve API için geçerli sertifika, HTTPS yönlendirme ve HSTS kontrolü | NO-GO |
| Production secret'ları | Operasyon | Secret manager kaydı; güçlü JWT/DB/Redis/S3 anahtarları; varsayılan değer bulunmadığına dair startup kanıtı | NO-GO |
| E-posta teslimatı | Operasyon | SES/domain doğrulaması, SPF, DKIM, DMARC; kayıt doğrulama ve parola sıfırlama teslim testi | NO-GO |
| Veritabanı yedeği ve PITR | Operasyon | Otomatik yedek politikası ve tarihli başarılı restore tatbikatı | NO-GO |
| Obje depolama koruması | Operasyon | Private bucket public-access-block, encryption, versioning/lifecycle ve silme politikası | NO-GO |
| Malware tarayıcı | Operasyon | Güncel ClamAV imza veritabanı, EICAR reddi ve tarayıcı kesintisinde fail-closed testi | NO-GO |
| Gözlemlenebilirlik | Operasyon | Merkezi log, hata takibi, metrik/dashboard, alarm kanalları ve nöbet sorumlusu | NO-GO |
| Staging smoke/E2E | QA + teknik | Kayıt → e-posta doğrulama → profil/ilan → arama → ders talebi → mesaj → ders tamamlama testi | NO-GO |
| Güvenlik doğrulaması | Teknik + bağımsız test | SAST/dependency/image/secret scan sonuçları ve kritik-yüksek bulgu kalmadığına dair rapor | NO-GO |
| Rollback tatbikatı | Operasyon | Aynı image'ın staging deploy'u, health gate ve önceki sürüme başarılı dönüş kaydı | NO-GO |
| Branch protection | Repo yöneticisi | `main` için PR zorunluluğu ve CI kontrollerinin required olması | NO-GO |
| Admin erişimi | Ürün + teknik | En az iki kontrollü admin, MFA/break-glass prosedürü ve admin audit kontrolü | NO-GO |

## Release adayı doğrulaması

- [ ] Backend testleri ve paketleme yeşil.
- [ ] Web lint, TypeScript ve production build yeşil.
- [ ] Mobil mağaza release dışında; mobil beta açılacaksa ayrıca EAS, push, mağaza gizlilik ve dependency risk kapıları tamamlandı.
- [ ] Production config doğrulayıcı eksik/varsayılan kritik ayarlarda uygulamayı başlatmıyor.
- [ ] Abonelik API'si plan listesini boş döndürüyor ve aktivasyon isteğini `410 Gone` ile reddediyor.
- [ ] Web ve mobil arayüzlerde satın alma, fatura, ücretli plan veya platform içi ödeme CTA'sı yok.
- [ ] Kimlik belgesi private alanda, opaque anahtarla tutuluyor; signed URL yalnız yetkili akıştan üretiliyor.
- [ ] Hesap export ve hesap kapatma akışları production benzeri veride doğrulandı.
- [ ] Bildirimler yeniden girişten sonra okunmamış durumu koruyor.

## GO / NO-GO kaydı

| Rol | İsim | Karar | Tarih | Kanıt/Not |
|---|---|---|---|---|
| Ürün sahibi |  |  |  |  |
| Teknik sorumlu |  |  |  |  |
| Operasyon sorumlusu |  |  |  |  |
| Hukuk onayı |  |  |  |  |

Tüm zorunlu dış kapılar tamamlanmadan karar `NO-GO` olarak kalır.
