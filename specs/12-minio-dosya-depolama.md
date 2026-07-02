# Spec 12 — MinIO Dosya Depolama (base64 → S3 Geçişi)

**Öncelik:** 🟡 Yüksek
**Tahmini Süre:** 3 gün
**Bağımlılık:** MinIO Docker'da çalışıyor, backend S3Config hazır

---

## Amaç

Profil fotoğrafları, kimlik belgeleri ve ilan görsellerini base64 yerine MinIO (S3-compatible) üzerinden yönetmek. Veritabanı yükünü azaltmak, ölçeklenebilir depolama altyapısı kurmak.

---

## Mevcut Durum

- S3/MinIO altyapısı Docker'da hazır (`docker-compose.yml`)
- `S3Config.java` mevcut (bucket initialization)
- `FileStorageService.java` mevcut (presigned URL, upload, delete)
- `FileController.java` mevcut (`POST /api/v1/files/upload`)
- **Frontend hala base64 kullanıyor** → avatar'lar `data:image/...` olarak DB'de saklanıyor
- Kimlik belgeleri mock olarak çalışıyor

---

## Yapılacaklar

### 1. Frontend Dosya Upload Entegrasyonu

- [ ] `api/services.ts`'ye yeni fonksiyon:

```typescript
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/v1/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.fileUrl; // MinIO URL (presigned)
};
```

- [ ] Avatar yükleme: drag & drop alanı, preview, crop
  - Kayıtlı dosya tipi: JPEG, PNG, WebP
  - Maksimum boyut: 5MB
  - Otomatik yeniden boyutlandırma (client-side canvas ile 400x400)
- [ ] Kimlik belgesi yükleme: JPEG, PNG, PDF (maks 10MB)
- [ ] İlan görseli yükleme: JPEG, PNG, WebP (maks 5MB, en fazla 5 görsel)

### 2. Backend Upload Geliştirme

- [ ] Mevcut `FileController.upload()`'u multipart/form-data ile çalışacak şekilde güncelle
- [ ] Dosya validasyonu:
  - [ ] MIME type kontrolü (magic bytes ile)
  - [ ] Boyut kontrolü
  - [ ] Dosya adı temizleme (path traversal, özel karakterler)
- [ ] Dosya kaydetme:

```java
public String uploadFile(MultipartFile file, UUID userId) {
    String key = userId + "/" + UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
    s3Client.putObject(bucketName, key, file.getInputStream(), file.getSize(), getObjectMetadata(file));
    return s3Client.utilities().getUrl(bucketName, key).toString();
}
```

- [ ] Dosya silme: `DELETE /api/v1/files/{key}`
- [ ] Eski avatar'ı sil (yeni yüklenince eskiyi temizle)

### 3. Presigned URL ile Güvenli Erişim

- [ ] Public dosyalar (avatar, ilan görselleri) → public bucket
- [ ] Private dosyalar (kimlik belgesi) → private bucket + presigned URL
- [ ] Presigned URL geçerlilik süresi: 1 saat (ihtiyaca göre ayarlanır)

```java
public String getPresignedUrl(String key) {
    GetObjectRequest request = GetObjectRequest.builder()
        .bucket(privateBucketName)
        .key(key)
        .build();
    GetPresignedObjectUrlRequest presignRequest = GetPresignedObjectUrlRequest.builder()
        .signatureDuration(Duration.ofHours(1))
        .getObjectRequest(request)
        .build();
    return s3Client.utilities().getPresignedObjectUrl(presignRequest);
}
```

### 4. Veritabanı Migration

- [ ] `users.avatar_url` → MinIO URL'si olarak güncelle (base64 değil)
- [ ] `tutor_verifications.document_url` → MinIO URL'si
- [ ] `tutor_listings` → görsel alanı ekle (opsiyonel)

### 5. Eski Base64 Verileri Migration

- [ ] Migration script: DB'deki tüm base64 avatar'ları MinIO'ya yükle
- [ ] Script çalışma şekli:
  1. Tüm kullanıcıları tara (`avatar_url` LIKE 'data:%')
  2. Base64'ü decode et
  3. MinIO'ya yükle (key: `migration/{userId}/avatar.jpg`)
  4. `avatar_url`'i MinIO URL'si ile güncelle
- [ ] Script tek seferlik çalışır (`@PostConstruct` veya CLI command)

### 6. Frontend Avatar Bileşeni Güncelleme

- [ ] Mevcut `Avatar.tsx` bileşenini güncelle:
  - [ ] Base64 yerine MinIO URL'si kullan
  - [ ] Fallback: ilk harf (mevcut)
  - [ ] Lazy loading (`loading="lazy"`)
  - [ ] Hata durumunda fallback göster
- [ ] `ImageWithFallback.tsx` bileşenini kullan

### 7. Admin Doğrulama Belgesi Görüntüleme

- [ ] Admin panelinde kimlik belgelerini görüntüleme:
  - [ ] Presigned URL ile güvenli erişim
  - [ ] Fotoğraf önizleme (JPEG/PNG)
  - [ ] PDF görüntüleme (embed PDF viewer)
  - [ ] İndirme butonu

---

## Dosya Türleri ve Kısıtlamalar

| Tür | Format | Max Boyut | Bucket | Erişim |
|-----|--------|-----------|--------|--------|
| Avatar | JPEG, PNG, WebP | 5MB | public | Public |
| Kimlik belgesi | JPEG, PNG, PDF | 10MB | private | Presigned URL |
| Sertifika/diploma | JPEG, PNG, PDF | 10MB | private | Presigned URL |
| İlan görseli | JPEG, PNG, WebP | 5MB | public | Public |
| Mesaj dosyası | Her tür | 20MB | private | Presigned URL |

---

## MinIO Yapılandırması

```yaml
# docker-compose.yml (mevcut, kontrol)
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  ports:
    - "9000:9000"
    - "9001:9001"
  volumes:
    - minio_data:/data
  environment:
    MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
    MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
```

```yaml
# application.yml (mevcut, kontrol)
s3:
  endpoint: http://localhost:9000
  access-key: ${MINIO_ACCESS_KEY}
  secret-key: ${MINIO_SECRET_KEY}
  bucket-name: ogret-public
  private-bucket-name: ogret-private
```

---

## Kabul Kriterleri

- [ ] Avatar yükleme: drag & drop, preview, MinIO'ya kaydetme
- [ ] Kimlik belgesi yükleme: MinIO'ya kaydetme, presigned URL ile erişim
- [ ] Eski base64 avatar'lar MinIO'ya taşınmış
- [ ] Avatar boyut limiti ve format kontrolü çalışıyor
- [ ] Dosya adı güvenliği (path traversal engellenmiş)
- [ ] Avatar lazy loading çalışıyor
- [ ] Admin: doğrulama belgeleri görüntülenebiliyor
- [ ] Mevcut base64 yedek olarak çalışıyor (MinIO yoksa fallback)

---

## Test

- [ ] Unit test: dosya validasyonu (MIME, boyut, isim)
- [ ] Integration test: MinIO'ya yükleme, okuma, silme
- [ ] Integration test: presigned URL oluşturma ve erişim
- [ ] Frontend: avatar yükleme UI testi
- [ ] Frontend: avatar görüntüleme (lazy loading)
- [ ] Migration test: base64 → MinIO geçişi
- [ ] Güvenlik: path traversal testi (`../../etc/passwd`)
