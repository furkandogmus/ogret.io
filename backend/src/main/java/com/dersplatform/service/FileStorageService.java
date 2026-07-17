package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.enums.UploadPurpose;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final MalwareScanner malwareScanner;

    @Value("${aws.s3.public-url}")
    private String publicUrl;

    @Value("${aws.s3.buckets.public}")
    private String publicBucket;

    @Value("${aws.s3.buckets.private}")
    private String privateBucket;

    private static final long MAX_AVATAR_BYTES = 5L * 1024 * 1024;
    private static final long MAX_DOCUMENT_BYTES = 10L * 1024 * 1024;

    public String uploadFile(MultipartFile file, UploadPurpose purpose) {
        if (file.isEmpty()) {
            throw ApiException.badRequest("Yüklenen dosya boş olamaz");
        }

        if (purpose == null) {
            throw ApiException.badRequest("Dosya kullanım amacı gerekli");
        }

        long maxBytes = purpose == UploadPurpose.AVATAR ? MAX_AVATAR_BYTES : MAX_DOCUMENT_BYTES;
        if (file.getSize() > maxBytes) {
            throw ApiException.badRequest("Dosya izin verilen boyutu aşıyor");
        }

        byte[] original;
        try {
            original = file.getBytes();
        } catch (IOException exception) {
            throw ApiException.badRequest("Dosya içeriği okunamadı");
        }

        DetectedFile detected = detectAndValidate(original, file.getContentType(), purpose);
        byte[] safeContent = sanitize(original, detected);
        malwareScanner.scan(safeContent);

        String bucketName = purpose == UploadPurpose.AVATAR ? publicBucket : privateBucket;
        String prefix = purpose == UploadPurpose.AVATAR ? "avatars/" : "identity-documents/";
        String fileKey = prefix + UUID.randomUUID() + detected.extension();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(detected.contentType())
                    .contentDisposition(purpose == UploadPurpose.AVATAR ? "inline" : "attachment")
                    .cacheControl(purpose == UploadPurpose.AVATAR
                            ? "public, max-age=31536000, immutable"
                            : "private, no-store")
                    .metadata(Map.of("upload-purpose", purpose.name().toLowerCase(Locale.ROOT)))
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(safeContent));

            log.info("Successfully uploaded file {} to bucket {}", fileKey, bucketName);

            if (purpose == UploadPurpose.IDENTITY_DOCUMENT) {
                return "identity-document:" + fileKey.substring("identity-documents/".length());
            }
            return trimUrl(publicUrl) + "/" + bucketName + "/" + fileKey;

        } catch (Exception e) {
            log.error("S3 upload failed for file " + fileKey, e);
            throw ApiException.internalServerError("Dosya depolama sunucusuna yüklenemedi");
        }
    }

    private DetectedFile detectAndValidate(byte[] content, String claimedType, UploadPurpose purpose) {
        byte[] header = java.util.Arrays.copyOf(content, Math.min(content.length, 16));
        int read = header.length;

        if (read < 4) {
            throw ApiException.badRequest("Dosya içeriği geçersiz");
        }

        DetectedFile detected;
        if (startsWith(header, new int[]{0xFF, 0xD8, 0xFF})) {
            detected = new DetectedFile("image/jpeg", ".jpg");
        } else if (startsWith(header, new int[]{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A})) {
            detected = new DetectedFile("image/png", ".png");
        } else if (startsWith(header, new int[]{0x25, 0x50, 0x44, 0x46, 0x2D})) {
            detected = new DetectedFile("application/pdf", ".pdf");
        } else {
            throw ApiException.badRequest("Desteklenmeyen veya içeriği doğrulanamayan dosya türü");
        }

        if (purpose == UploadPurpose.AVATAR && !detected.contentType().startsWith("image/")) {
            throw ApiException.badRequest("Profil fotoğrafı yalnızca JPEG veya PNG olabilir");
        }
        if (purpose == UploadPurpose.IDENTITY_DOCUMENT
                && !List.of("image/jpeg", "image/png", "application/pdf").contains(detected.contentType())) {
            throw ApiException.badRequest("Kimlik belgesi yalnızca JPEG, PNG veya PDF olabilir");
        }

        if (claimedType != null && !claimedType.isBlank()
                && !claimedType.equalsIgnoreCase(detected.contentType())) {
            throw ApiException.badRequest("Dosyanın bildirilen türü ile içeriği eşleşmiyor");
        }
        return detected;
    }

    private byte[] sanitize(byte[] content, DetectedFile detected) {
        if (!detected.contentType().startsWith("image/")) {
            return content;
        }
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(content));
            if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0
                    || (long) image.getWidth() * image.getHeight() > 25_000_000L) {
                throw ApiException.badRequest("Görsel boyutları geçersiz veya çok büyük");
            }
            String format = detected.contentType().equals("image/png") ? "png" : "jpg";
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            if (!ImageIO.write(image, format, output)) {
                throw ApiException.badRequest("Görsel güvenli biçime dönüştürülemedi");
            }
            return output.toByteArray();
        } catch (ApiException exception) {
            throw exception;
        } catch (IOException exception) {
            throw ApiException.badRequest("Görsel içeriği doğrulanamadı");
        }
    }

    private boolean startsWith(byte[] source, int[] signature) {
        if (source.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((source[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private String trimUrl(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String getBucketKeyFromUrl(String fileUrl, String baseUrl) {
        String path = fileUrl.replace(trimUrl(baseUrl), "");
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        return path;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        if (fileUrl.startsWith("identity-document:")) {
            deleteObject(privateBucket, "identity-documents/" + fileUrl.substring("identity-document:".length()));
            return;
        }

        String baseUrl = trimUrl(publicUrl);

        if (!fileUrl.startsWith(baseUrl)) {
            log.warn("Attempted to delete file with URL not matching public-url: {}", fileUrl);
            return;
        }

        String path = getBucketKeyFromUrl(fileUrl, baseUrl);

        try {
            int firstSlash = path.indexOf("/");
            if (firstSlash == -1) {
                log.warn("Invalid file URL format for deletion: {}", fileUrl);
                return;
            }

            String bucket = path.substring(0, firstSlash);
            if (!bucket.equals(publicBucket) && !bucket.equals(privateBucket)) {
                log.warn("Attempted to delete file from unmanaged bucket: {}", bucket);
                return;
            }
            String key = path.substring(firstSlash + 1);

            deleteObject(bucket, key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: " + fileUrl, e);
        }
    }

    public String generatePresignedUrl(String fileUrlOrKey) {
        if (fileUrlOrKey == null || fileUrlOrKey.isBlank()) {
            return null;
        }

        String key = fileUrlOrKey;
        String bucket = privateBucket;

        if (fileUrlOrKey.startsWith("identity-document:")) {
            key = "identity-documents/" + fileUrlOrKey.substring("identity-document:".length());
        }

        String baseUrl = trimUrl(publicUrl);

        if (fileUrlOrKey.startsWith("http://") || fileUrlOrKey.startsWith("https://")) {
            if (!fileUrlOrKey.startsWith(baseUrl)) {
                return fileUrlOrKey;
            }
            String path = getBucketKeyFromUrl(fileUrlOrKey, baseUrl);
            int firstSlash = path.indexOf("/");
            if (firstSlash != -1) {
                bucket = path.substring(0, firstSlash);
                key = path.substring(firstSlash + 1);
            }
        }

        final String finalBucket = bucket;
        final String finalKey = key;

        try {
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(builder -> builder.bucket(finalBucket).key(finalKey))
                    .build();

            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for: " + fileUrlOrKey, e);
            return fileUrlOrKey; // Fallback to original URL
        }
    }

    public boolean isManagedPublicAvatarUrl(String url) {
        return isManagedUrl(url, publicBucket, "avatars/");
    }

    public boolean isManagedPrivateIdentityDocumentUrl(String url) {
        return url != null && url.matches("identity-document:[0-9a-fA-F-]{36}\\.(jpg|png|pdf)");
    }

    private void deleteObject(String bucket, String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        log.info("Successfully deleted file {} from bucket {}", key, bucket);
    }

    private boolean isManagedUrl(String url, String bucket, String prefix) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String expectedPrefix = trimUrl(publicUrl) + "/" + bucket + "/" + prefix;
        return url.startsWith(expectedPrefix) && !url.substring(expectedPrefix.length()).contains("/");
    }

    private record DetectedFile(String contentType, String extension) {}
}
