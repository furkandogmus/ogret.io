import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Register Page Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should toggle between student and tutor role', async ({ page }) => {
    await page.goto('/kayit');

    // Default should be Öğrenci
    const ogrenciBtn = page.locator('button:has-text("Öğrenci")');
    const ogretmenBtn = page.locator('button:has-text("Öğretmen")');

    // Öğrenci should be active by default
    await expect(ogrenciBtn).toHaveClass(/text-foreground/);

    // Click Öğretmen
    await ogretmenBtn.click();
    await expect(ogretmenBtn).toHaveClass(/text-foreground/);
  });

  test('should navigate to login page from register', async ({ page }) => {
    await page.goto('/kayit');

    await page.locator('a:has-text("Giriş Yap")').click();
    await expect(page).toHaveURL('/giris');
  });

  test('should pre-select tutor role from URL parameter', async ({ page }) => {
    await page.goto('/kayit?role=tutor');

    // Öğretmen tab should be active
    const ogretmenBtn = page.locator('button:has-text("Öğretmen")');
    await expect(ogretmenBtn).toHaveClass(/text-foreground/);
  });

  test('should show validation errors on empty form submit', async ({ page }) => {
    await page.goto('/kayit');

    await page.locator('button[type="submit"]').click();

    // Should show validation error messages
    await expect(page.locator('text=Ad soyad gerekli').or(page.locator('text=Bu alan zorunlu'))).toBeVisible();
  });
});

test.describe('Login Page Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/giris');

    await page.locator('a:has-text("Şifremi Unuttum")').click();
    await expect(page).toHaveURL('/sifre-unuttum');
  });

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/giris');

    await page.locator('a:has-text("Kayıt Ol")').click();
    await expect(page).toHaveURL('/kayit');
  });

  test('should toggle password visibility on login', async ({ page }) => {
    await page.goto('/giris');

    const passwordField = page.locator('input[name="password"]');
    await expect(passwordField).toHaveAttribute('type', 'password');

    const toggleBtn = page.locator('button svg.lucide-eye').first();
    await toggleBtn.click();

    await expect(passwordField).toHaveAttribute('type', 'text');
  });
});
