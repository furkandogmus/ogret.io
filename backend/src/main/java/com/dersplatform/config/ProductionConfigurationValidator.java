package com.dersplatform.config;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.util.Arrays;

@Component
@Profile("prod")
public class ProductionConfigurationValidator {

    private final Environment environment;

    public ProductionConfigurationValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void validate() {
        String jwtSecret = required("app.jwt.secret");
        if (jwtSecret.length() < 48 || jwtSecret.contains("dersplatform-jwt-secret")) {
            throw new IllegalStateException("Production JWT secret must be unique and at least 48 characters");
        }

        String databasePassword = required("spring.datasource.password");
        if (databasePassword.length() < 16 || "dersplatform".equals(databasePassword)) {
            throw new IllegalStateException("Production database password must be unique and at least 16 characters");
        }

        if (required("spring.data.redis.password").length() < 16) {
            throw new IllegalStateException("Production Redis password must be at least 16 characters");
        }

        String storageAccessKey = required("aws.s3.access-key");
        String storageSecretKey = required("aws.s3.secret-key");
        if ("minioadmin".equals(storageAccessKey) || "minioadminpassword".equals(storageSecretKey)
                || storageSecretKey.length() < 16) {
            throw new IllegalStateException("Default or weak object-storage credentials are forbidden in production");
        }

        if (!environment.getProperty("app.upload.malware-scan-enabled", Boolean.class, false)) {
            throw new IllegalStateException("Malware scanning must be enabled in production");
        }

        requireHttpsUrl("app.base-url");
        requireHttpsUrl("aws.s3.public-url");
        String fromEmail = required("aws.ses.from-email");
        if (!fromEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalStateException("Production sender email is invalid");
        }

        String origins = required("app.cors.allowed-origins");
        Arrays.stream(origins.split(","))
                .map(String::trim)
                .forEach(origin -> {
                    URI uri = URI.create(origin);
                    if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                            || "localhost".equalsIgnoreCase(uri.getHost()) || origin.contains("*")) {
                        throw new IllegalStateException("Production CORS origins must be explicit HTTPS origins");
                    }
                });
    }

    private String required(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required production property: " + key);
        }
        return value;
    }

    private void requireHttpsUrl(String key) {
        URI uri = URI.create(required(key));
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                || "localhost".equalsIgnoreCase(uri.getHost())) {
            throw new IllegalStateException(key + " must be an HTTPS URL in production");
        }
    }
}
