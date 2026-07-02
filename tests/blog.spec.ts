import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Blog Pages (Index & Post Detail)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should display blog index page with all posts listed', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.locator('h1')).toContainText('Blog');
    await expect(page.locator('text=Özel ders, eğitim ve öğrenme üzerine faydalı içerikler')).toBeVisible();

    // Verify all 4 blog posts are rendered
    await expect(page.locator('text=Online Özel Dersin Avantajları')).toBeVisible();
    await expect(page.locator('text=Sınav Başarısı İçin Etkili Ders Çalışma Stratejileri')).toBeVisible();
    await expect(page.locator('text=Yabancı Dil Öğrenmenin En Etkili Yolları')).toBeVisible();
    await expect(page.locator('text=Çocuğunuz İçin Doğru Özel Ders Öğretmenini Seçme Rehberi')).toBeVisible();
  });

  test('should show reading time and date for each blog post on index', async ({ page }) => {
    await page.goto('/blog');

    // Verify metadata shown
    await expect(page.locator('text=4 dk okuma').first()).toBeVisible();
    await expect(page.locator('text=5 dk okuma').first()).toBeVisible();
  });

  test('should navigate to blog post detail page by clicking', async ({ page }) => {
    await page.goto('/blog');

    // Click on first post
    await page.locator('text=Online Özel Dersin Avantajları').click();

    // Should navigate to blog post detail
    await expect(page).toHaveURL(/\/blog\/online-ozel-dersin-avantajlari/);
    await expect(page.locator('h1')).toContainText('Online Özel Dersin Avantajları');
  });

  test('should display blog post detail with full content', async ({ page }) => {
    await page.goto('/blog/online-ozel-dersin-avantajlari');

    // Verify header metadata
    await expect(page.locator('h1')).toContainText('Online Özel Dersin Avantajları');
    await expect(page.locator('text=15.03.2026')).toBeVisible();
    await expect(page.locator('text=4 dk okuma')).toBeVisible();

    // Verify content paragraphs are rendered
    await expect(page.locator('text=Son yıllarda dijital eğitim platformlarının yükselişiyle birlikte')).toBeVisible();
    await expect(page.locator('text=Esneklik: Online özel dersin en büyük avantajı')).toBeVisible();
  });

  test('should show related posts at the bottom of post detail', async ({ page }) => {
    await page.goto('/blog/online-ozel-dersin-avantajlari');

    // Related posts section
    await expect(page.locator('text=Benzer Yazılar')).toBeVisible();
    await expect(page.locator('text=Sınav Başarısı İçin Etkili Ders Çalışma Stratejileri')).toBeVisible();
  });

  test('should show 404 state for non-existent blog post slug', async ({ page }) => {
    await page.goto('/blog/olmayan-yazi');

    await expect(page.locator('text=Blog yazısı bulunamadı')).toBeVisible();
    await expect(page.locator('text=Aradığınız yazı mevcut değil.')).toBeVisible();
    await expect(page.locator('text=Blog\'a Dön')).toBeVisible();
  });

  test('should navigate back to blog index from post detail', async ({ page }) => {
    await page.goto('/blog/online-ozel-dersin-avantajlari');

    await page.locator('text=Blog\'a Dön').click();
    await expect(page).toHaveURL('/blog');
  });

  test('should display all blog posts with "Devamını Oku" links', async ({ page }) => {
    await page.goto('/blog');

    const readMoreLinks = page.locator('text=Devamını Oku');
    await expect(readMoreLinks).toHaveCount(4);
  });
});
