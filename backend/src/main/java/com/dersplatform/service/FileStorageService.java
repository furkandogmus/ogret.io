package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
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
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    @Value("${aws.s3.public-url}")
    private String publicUrl;

    @Value("${aws.s3.buckets.public}")
    private String publicBucket;

    @Value("${aws.s3.buckets.private}")
    private String privateBucket;

    public String uploadFile(MultipartFile file, boolean isPublic) {
        if (file.isEmpty()) {
            throw ApiException.badRequest("Yüklenen dosya boş olamaz");
        }

        String bucketName = isPublic ? publicBucket : privateBucket;
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String fileKey = UUID.randomUUID().toString() + fileExtension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("Successfully uploaded file {} to bucket {}", fileKey, bucketName);

            return trimUrl(publicUrl) + "/" + bucketName + "/" + fileKey;

        } catch (IOException e) {
            log.error("Failed to read file input stream", e);
            throw ApiException.internalServerError("Dosya okunurken bir hata oluştu");
        } catch (Exception e) {
            log.error("S3 upload failed for file " + fileKey, e);
            throw ApiException.internalServerError("Dosya depolama sunucusuna yüklenemedi");
        }
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
            String key = path.substring(firstSlash + 1);

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());

            log.info("Successfully deleted file {} from bucket {}", key, bucket);
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
}
