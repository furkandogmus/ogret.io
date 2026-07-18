package com.dersplatform.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class S3ConfigTest {

    @Test
    void minioPresignerKeepsBucketInPathForSameOriginProxy() {
        S3Config config = new S3Config();
        ReflectionTestUtils.setField(config, "endpoint", "http://minio:9000");
        ReflectionTestUtils.setField(config, "accessKey", "minioadmin");
        ReflectionTestUtils.setField(config, "secretKey", "minioadminpassword");
        ReflectionTestUtils.setField(config, "region", "us-east-1");

        try (var presigner = config.s3Presigner()) {
            var presigned = presigner.presignGetObject(GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(GetObjectRequest.builder()
                            .bucket("dersplatform-private")
                            .key("identity-documents/document.png")
                            .build())
                    .build());

            assertThat(presigned.url().getHost()).isEqualTo("minio");
            assertThat(presigned.url().getPath())
                    .isEqualTo("/dersplatform-private/identity-documents/document.png");
        }
    }
}
