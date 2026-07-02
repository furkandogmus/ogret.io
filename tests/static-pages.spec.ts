import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Static Pages (404, FAQ, About, Contact)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/olmayan-sayfa');

    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Sayfa Bulunamadı');
    await expect(page.locator('button:has-text("Ana Sayfa")')).toBeVisible();
    await expect(page.locator('button:has-text("Öğretmen Ara")')).toBeVisible();
  });

  test('should navigate to home from 404 page', async ({ page }) => {
    await page.goto('/olmayan-sayfa');

    await page.locator('button:has-text("Ana Sayfa")').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to search from 404 page', async ({ page }) => {
    await page.goto('/olmayan-sayfa');

    await page.locator('button:has-text("Öğretmen Ara")').click();
    await expect(page).toHaveURL(/\/arama/);
  });

  test('should display FAQ page with expandable accordion', async ({ page }) => {
    await page.goto('/sikca-sorulan-sorular');

    await expect(page.locator('h1')).toContainText('Sıkça Sorulan Sorular');
    await expect(page.locator('text=öğret.io nedir?')).toBeVisible();
    await expect(page.locator('text=Nasıl öğretmen bulabilirim?')).toBeVisible();
    await expect(page.locator('text=Ödeme nasıl yapılıyor?')).toBeVisible();

    // Click first question to expand
    await page.locator('summary:has-text("öğret.io nedir?")').click();
    await expect(page.locator('text=öğret.io, öğrencilerle alanında uzman öğretmenleri buluşturan online bir özel ders platformudur.')).toBeVisible();
  });

  test('should display About page with stats and values', async ({ page }) => {
    await page.goto('/hakkimizda');

    await expect(page.locator('h1')).toContainText('Hakkımızda');
    await expect(page.locator('text=500+')).toBeVisible();
    await expect(page.locator('text=10.000+')).toBeVisible();
    await expect(page.locator('text=4.8/5')).toBeVisible();
    await expect(page.locator('text=%100')).toBeVisible();
    await expect(page.locator('text=Misyonumuz')).toBeVisible();
    await expect(page.locator('text=Vizyonumuz')).toBeVisible();
    await expect(page.locator('text=Değerlerimiz')).toBeVisible();
  });

  test('should display Contact page with info details', async ({ page }) => {
    await page.goto('/iletisim');

    await expect(page.locator('h1')).toContainText('İletişim');
    await expect(page.locator('text=info@ogret.io')).toBeVisible();
    await expect(page.locator('text=İstanbul, Türkiye')).toBeVisible();
    await expect(page.locator('text=Hafta içi 09:00 - 18:00')).toBeVisible();
  });

  test('should display Privacy page', async ({ page }) => {
    await page.goto('/gizlilik');

    await expect(page.locator('h1')).toContainText('Gizlilik Politikası');
    await expect(page.locator('text=Toplanan Bilgiler')).toBeVisible();
    await expect(page.locator('text=Bilgilerin Kullanımı')).toBeVisible();
  });

  test('should display Terms page', async ({ page }) => {
    await page.goto('/kullanim-kosullari');

    await expect(page.locator('h1')).toContainText('Kullanım Koşulları');
    await expect(page.locator('text=Hesap Kaydı')).toBeVisible();
    await expect(page.locator('text=İptal ve İade')).toBeVisible();
  });
});
