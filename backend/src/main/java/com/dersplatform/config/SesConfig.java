package com.dersplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;

@Configuration
public class SesConfig {

    @Bean
    SesV2Client sesV2Client(@Value("${aws.ses.region}") String region) {
        // DefaultCredentialsProvider lets EKS IRSA supply short-lived credentials in production.
        return SesV2Client.builder()
                .region(Region.of(region))
                .build();
    }
}
