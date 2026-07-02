import { test, expect } from '@playwright/test';
import { mockTutor, mockStudent, setupDefaultMocks } from './mocks';

test.describe('Email Verification Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should show loading state initially then success after verification', async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/verify-email/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.token).toBe('valid-token-abc');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/email-dogrula?token=valid-token-abc');

    // Should show loading first
    await expect(page.locator('text=Doğrulanıyor...')).toBeVisible();

    // Then success
    await expect(page.locator('text=E-posta Doğrulandı')).toBeVisible();
    await expect(page.locator('text=E-posta adresiniz başarıyla doğrulandı!')).toBeVisible();
    await expect(page.locator('button:has-text("Giriş Yap")')).toBeVisible();
  });

  test('should show error when verification token is missing', async ({ page }) => {
    await page.goto('/email-dogrula');

    await expect(page.locator('text=Doğrulama Başarısız')).toBeVisible();
    await expect(page.locator('text=Doğrulama linki geçersiz')).toBeVisible();
  });

  test('should show error when verification API fails', async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/verify-email/, async (route) => {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Link süresi dolmuş' }) });
    });

    await page.goto('/email-dogrula?token=expired-token');

    await expect(page.locator('text=Doğrulama Başarısız')).toBeVisible();
    await expect(page.locator('text=Link süresi dolmuş olabilir')).toBeVisible();
  });
});

test.describe('Identity Verification Page (Tutor)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Mock file upload
    await page.route(/\/api\/v1\/files\/upload/, async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:9000/dersplatform-public/mock-doc.pdf' }),
      });
    });

    // Mock verification submit
    await page.route(/\/api\/v1\/verifications/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.documentType).toBeTruthy();
      expect(data.documentUrl).toBeTruthy();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'ver-new-1', status: 'PENDING' }) });
    });
  });

  test('should restrict page for non-tutor users', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/dogrulama');

    await expect(page.locator('text=Bu sayfa yalnızca öğretmenler içindir.')).toBeVisible();
  });

  test('should display document type selection and file upload area', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/dogrulama');

    await expect(page.locator('h1')).toContainText('Kimlik Doğrulama');
    await expect(page.locator('text=Kimlik Kartı')).toBeVisible();
    await expect(page.locator('text=Diploma')).toBeVisible();
    await expect(page.locator('text=Sertifika')).toBeVisible();
    await expect(page.locator('text=PDF, JPG veya PNG — Max 10MB')).toBeVisible();
  });

  test('should show already verified banner when identity is verified', async ({ page }) => {
    const verifiedTutor = { ...mockTutor, identityVerified: true };

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: verifiedTutor });

    await page.goto('/dogrulama');

    await expect(page.locator('text=Kimliğiniz Doğrulandı')).toBeVisible();
  });

  test('should switch between document type buttons', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/dogrulama');

    // Identify Card should be selected by default
    const kimlikBtn = page.locator('button:has-text("Kimlik Kartı")');
    await expect(kimlikBtn).toHaveClass(/border-primary/);

    // Click Diploma
    await page.locator('button:has-text("Diploma")').click();
    await expect(page.locator('button:has-text("Diploma")')).toHaveClass(/border-primary/);
  });

  test('should complete verification submission successfully', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/dogrulama');

    // Trigger file selection
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'kimlik.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });

    // Verify file uploaded indicator
    await expect(page.locator('text=Dosya yüklendi')).toBeVisible();

    // Submit
    await page.locator('button:has-text("Doğrulama Başvurusu Gönder")').click();

    // Should show success
    await expect(page.locator('text=Başvuru Alındı')).toBeVisible();
    await expect(page.locator('text=Kimlik doğrulama belgeniz admin ekibimiz tarafından incelenecektir')).toBeVisible();
    await expect(page.locator('button:has-text("Paneli Dön")')).toBeVisible();
  });

  test('should disable submit button when no file is selected', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/dogrulama');

    const submitBtn = page.locator('button:has-text("Doğrulama Başvurusu Gönder")');
    await expect(submitBtn).toBeDisabled();
  });
});
