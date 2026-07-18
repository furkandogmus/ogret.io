import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Password Reset Flow (Forgot & Reset Password Pages)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should display forgot password form and send reset link', async ({ page }) => {
    // Intercept forgot password POST
    await page.route(/\/api\/v1\/auth\/forgot-password/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ deliveryEnabled: true }) });
    });

    await page.goto('/sifre-unuttum');

    await expect(page.locator('h1')).toContainText('Şifremi Unuttum');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sıfırlama Bağlantısı Gönder');

    // Fill email and submit
    await page.locator('input[type="email"]').fill('ogrenci@test.com');
    await page.locator('button[type="submit"]').click();

    // Should show success state
    await expect(page.locator('text=Hesap mevcutsa şifre sıfırlama bağlantısı gönderildi')).toBeVisible();
    await expect(page.locator('text=Giriş sayfasına dön')).toBeVisible();
  });

  test('should show error message when forgot password API fails', async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/forgot-password/, async (route) => {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'E-posta bulunamadı' }) });
    });

    await page.goto('/sifre-unuttum');
    await page.locator('input[type="email"]').fill('olmayan@test.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=E-posta bulunamadı')).toBeVisible();
  });

  test('should explain admin recovery when email delivery is disabled', async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/forgot-password/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ deliveryEnabled: false }),
      });
    });

    await page.goto('/sifre-unuttum');
    await page.locator('input[type="email"]').fill('ogrenci@test.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Bu kurulumda e-posta gönderimi kapalı.')).toBeVisible();
    await expect(page.getByText(/yönetim panelinden hesabınız için geçici şifre/)).toBeVisible();
  });

  test('should display invalid token state on reset page without token', async ({ page }) => {
    await page.goto('/sifre-sifirla');
    await expect(page.locator('text=Geçersiz veya eksik sıfırlama bağlantısı')).toBeVisible();
    await expect(page.locator('text=Giriş sayfasına dön')).toBeVisible();
  });

  test('should validate password fields on reset page', async ({ page }) => {
    await page.goto('/sifre-sifirla?token=valid-token-123');

    await expect(page.locator('h1')).toContainText('Yeni Şifre Belirleyin');

    // Type short password (less than 6 chars)
    await page.locator('input[placeholder="Yeni şifre"]').fill('123');
    await page.locator('input[placeholder="Yeni şifre (tekrar)"]').fill('123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Şifre en az 6 karakter olmalıdır')).toBeVisible();
  });

  test('should validate passwords match on reset page', async ({ page }) => {
    await page.goto('/sifre-sifirla?token=valid-token-123');

    await page.locator('input[placeholder="Yeni şifre"]').fill('newpassword123');
    await page.locator('input[placeholder="Yeni şifre (tekrar)"]').fill('differentpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Şifreler eşleşmiyor')).toBeVisible();
  });

  test('should complete password reset successfully', async ({ page }) => {
    await page.route(/\/api\/v1\/auth\/reset-password/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/sifre-sifirla?token=valid-token-123');

    await page.locator('input[placeholder="Yeni şifre"]').fill('YeniGucluSifre123');
    await page.locator('input[placeholder="Yeni şifre (tekrar)"]').fill('YeniGucluSifre123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Şifre Sıfırlandı')).toBeVisible();
    await expect(page.locator('text=Yönlendiriliyorsunuz...')).toBeVisible();
  });

  test('should toggle password visibility on reset page', async ({ page }) => {
    await page.goto('/sifre-sifirla?token=valid-token-123');

    const passwordInput = page.locator('input[placeholder="Yeni şifre"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
