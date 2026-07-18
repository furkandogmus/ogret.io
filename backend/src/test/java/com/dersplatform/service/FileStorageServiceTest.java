package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.enums.UploadPurpose;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {
    @Mock private S3Client s3Client;
    @Mock private S3Presigner s3Presigner;
    @Mock private MalwareScanner malwareScanner;

    private FileStorageService service;

    @BeforeEach
    void setUp() {
        service = new FileStorageService(s3Client, s3Presigner, malwareScanner);
        ReflectionTestUtils.setField(service, "publicUrl", "https://files.example.com");
        ReflectionTestUtils.setField(service, "publicBucket", "public-files");
        ReflectionTestUtils.setField(service, "privateBucket", "private-files");
        org.mockito.Mockito.lenient().when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());
    }

    @Test
    void uploadAvatar_ReencodesScansAndReturnsManagedPublicUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", createPng());

        String result = service.uploadFile(file, UploadPurpose.AVATAR);

        assertThat(result).matches("https://files\\.example\\.com/public-files/avatars/[0-9a-f-]{36}\\.png");
        verify(malwareScanner).scan(any(byte[].class));
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadAvatar_SupportsSameOriginStoragePath() throws Exception {
        ReflectionTestUtils.setField(service, "publicUrl", "/storage");
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", createPng());

        String result = service.uploadFile(file, UploadPurpose.AVATAR);

        assertThat(result).matches("/storage/public-files/avatars/[0-9a-f-]{36}\\.png");
        assertThat(service.isManagedPublicAvatarUrl(result)).isTrue();
    }

    @Test
    void uploadIdentityDocument_ReturnsOpaqueKeyInsteadOfStorageUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "identity.pdf", "application/pdf", "%PDF-1.4\nfixture".getBytes());

        String result = service.uploadFile(file, UploadPurpose.IDENTITY_DOCUMENT);

        assertThat(result).matches("identity-document:[0-9a-f-]{36}\\.pdf");
        assertThat(service.isManagedPrivateIdentityDocumentUrl(result)).isTrue();
        verify(malwareScanner).scan(any(byte[].class));
    }

    @Test
    void uploadFile_RejectsMismatchedClaimedMimeType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", createPng());

        assertThatThrownBy(() -> service.uploadFile(file, UploadPurpose.AVATAR))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("eşleşmiyor");
    }

    private byte[] createPng() throws Exception {
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
