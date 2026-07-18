package com.dersplatform.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductionConfigurationValidatorTest {

    @Test
    void acceptsExplicitStrongProductionConfiguration() {
        assertThatCode(() -> validatorWithStrongConfiguration().validate())
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsDefaultObjectStorageCredentials() {
        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(
                strongEnvironment().withProperty("aws.s3.access-key", "minioadmin"));

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("object-storage");
    }

    @Test
    void rejectsLocalhostProductionUrls() {
        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(
                strongEnvironment().withProperty("app.base-url", "https://localhost"));

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("HTTPS URL");
    }

    @Test
    void acceptsProductionConfigurationWithEmailDisabled() {
        MockEnvironment environment = strongEnvironment()
                .withProperty("app.email.enabled", "false")
                .withProperty("aws.ses.from-email", "");

        assertThatCode(() -> new ProductionConfigurationValidator(environment).validate())
                .doesNotThrowAnyException();
    }

    @Test
    void requiresSenderOnlyWhenEmailIsEnabled() {
        MockEnvironment environment = strongEnvironment()
                .withProperty("app.email.enabled", "true")
                .withProperty("aws.ses.from-email", "");

        assertThatThrownBy(() -> new ProductionConfigurationValidator(environment).validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("aws.ses.from-email");
    }

    private ProductionConfigurationValidator validatorWithStrongConfiguration() {
        return new ProductionConfigurationValidator(strongEnvironment());
    }

    private MockEnvironment strongEnvironment() {
        return new MockEnvironment()
                .withProperty("app.jwt.secret", "a-unique-production-jwt-secret-that-is-longer-than-forty-eight-characters")
                .withProperty("spring.datasource.password", "database-password-strong")
                .withProperty("spring.data.redis.password", "redis-password-strong")
                .withProperty("aws.s3.access-key", "storage-service-user")
                .withProperty("aws.s3.secret-key", "storage-secret-strong")
                .withProperty("app.upload.malware-scan-enabled", "true")
                .withProperty("app.base-url", "https://ogret.io")
                .withProperty("aws.s3.public-url", "https://files.ogret.io")
                .withProperty("aws.ses.from-email", "noreply@ogret.io")
                .withProperty("app.cors.allowed-origins", "https://ogret.io,https://www.ogret.io");
    }
}
