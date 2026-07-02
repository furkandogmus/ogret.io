package com.dersplatform.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.retry.RetryPolicy;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@Slf4j
public class S3Config {

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.buckets.public}")
    private String publicBucket;

    @Value("${aws.s3.buckets.private}")
    private String privateBucket;

    @Bean
    @ConditionalOnProperty(name = "aws.s3.endpoint")
    public S3Client s3Client() {
        S3Client s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .region(Region.of(region))
                .forcePathStyle(true) // Required for MinIO / LocalStack path-style URLs
                .build();

        initializeBuckets(s3Client);

        return s3Client;
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .region(Region.of(region))
                .build();
    }

    private void initializeBuckets(S3Client s3Client) {
        // Initialize Public Bucket
        initializeBucket(s3Client, publicBucket, true);

        // Initialize Private Bucket
        initializeBucket(s3Client, privateBucket, false);
    }

    private void initializeBucket(S3Client s3Client, String bucketName, boolean isPublic) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("S3 Bucket already exists: {}", bucketName);
            if (isPublic) {
                setPublicBucketPolicy(s3Client, bucketName);
            }
        } catch (NoSuchBucketException e) {
            log.info("S3 Bucket does not exist, creating: {}", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());

            if (isPublic) {
                setPublicBucketPolicy(s3Client, bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to check/create bucket: " + bucketName, e);
        }
    }

    private void setPublicBucketPolicy(S3Client s3Client, String bucketName) {
        String policy = "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Sid\": \"PublicRead\",\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\n" +
                "        \"s3:GetObject\"\n" +
                "      ],\n" +
                "      \"Resource\": [\n" +
                "        \"arn:aws:s3:::" + bucketName + "/*\"\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        try {
            s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucketName)
                    .policy(policy)
                    .build());
            log.info("Successfully set public read policy for S3 bucket: {}", bucketName);
        } catch (Exception e) {
            log.error("Failed to set bucket policy for: " + bucketName, e);
        }
    }
}
