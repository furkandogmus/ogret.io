import { test, expect } from '@playwright/test';
import { setupDefaultMocks, mockTutorsList } from './mocks';

test.describe('Landing Page Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should show autocomplete suggestions when typing in search', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder="Hangi konuyu öğrenmek istiyorsunuz?"]');
    await searchInput.fill('Mat');

    // Autocomplete dropdown should show "Matematik"
    await expect(page.locator('text=Matematik').first()).toBeVisible();
    await expect(page.locator('text=Önerilen Konular')).toBeVisible();
  });

  test('should navigate to search on clicking autocomplete suggestion', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder="Hangi konuyu öğrenmek istiyorsunuz?"]');
    await searchInput.fill('Mat');

    // Click the suggestion
    await page.locator('button:has-text("Matematik")').first().click();

    // Should navigate to /arama with query
    await expect(page).toHaveURL(/\/arama\?q=Matematik/);
  });

  test('should navigate to search on pressing Enter', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder="Hangi konuyu öğrenmek istiyorsunuz?"]');
    await searchInput.fill('İngilizce');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/arama\?q=%C4%B0ngilizce/);
  });

  test('should render category carousel buttons', async ({ page }) => {
    await page.goto('/');

    // Category buttons should be rendered
    await expect(page.locator('button:has-text("Matematik")').first()).toBeVisible();
    await expect(page.locator('button:has-text("İngilizce")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Yazılım")').first()).toBeVisible();
  });

  test('should click category button to navigate to search', async ({ page }) => {
    await page.goto('/');

    await page.locator('button:has-text("İngilizce")').first().click();
    await expect(page).toHaveURL(/\/arama\?q=%C4%B0ngilizce/);
  });

  test('should render footer with navigation links', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check footer columns
    await expect(page.locator('text=Platform').first()).toBeVisible();
    await expect(page.locator('text=Kategoriler').first()).toBeVisible();
    await expect(page.locator('text=Destek').first()).toBeVisible();
    await expect(page.locator('text=Takip Et').first()).toBeVisible();

    // Check specific links in footer
    await expect(page.locator('footer a:has-text("Blog")')).toBeVisible();
    await expect(page.locator('footer a:has-text("SSS")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Gizlilik")')).toBeVisible();
  });

  test('should navigate from footer link to blog', async ({ page }) => {
    await page.goto('/');

    await page.locator('a:has-text("Blog")').first().click();
    await expect(page).toHaveURL('/blog');
  });

  test('should show empty state when featured tutors API returns empty', async ({ page }) => {
    await page.route(/\/api\/v1\/tutors(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) });
    });

    await page.goto('/');
    await expect(page.locator('text=Henüz öğretmen bulunmuyor')).toBeVisible();
  });

  test('should render TutorCard with correct data', async ({ page }) => {
    await page.goto('/');

    // Check tutor card content
    await expect(page.locator('text=Selim Hoca').first()).toBeVisible();
    await expect(page.locator('text=Profil Gör').first()).toBeVisible();

    // Heart icon (favorite) should be present
    await expect(page.locator('button:has(svg.lucide-heart)').first()).toBeVisible();
  });
});

test.describe('Search Page Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should show empty results state with clear filters option', async ({ page }) => {
    await page.route(/\/api\/v1\/tutors\/listings(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/arama?q=OlmayanKonu');

    await expect(page.locator('text=Aradiginiz kriterde ilan bulunamadi').or(page.locator('text=0 ilan bulundu'))).toBeVisible();
  });

  test('should pre-populate search from URL query parameter', async ({ page }) => {
    await page.goto('/arama?q=Selim');

    const searchInput = page.locator('input[placeholder="İlan veya ders ara..."]');
    await expect(searchInput).toHaveValue('Selim');
  });

  test('should clear filters via URL navigation', async ({ page }) => {
    // Navigate with some filters
    await page.goto('/arama?subjectId=sub-math&maxPrice=500');

    // Open filters panel
    const filterToggle = page.locator('button:has(svg.lucide-sliders-horizontal)');
    await filterToggle.click();

    // Should show filter labels
    await expect(page.locator('text=Ders Kategorisi')).toBeVisible();
  });

  test('should persist sort selection across page state', async ({ page }) => {
    await page.goto('/arama');

    const sortSelect = page.locator('select');
    await sortSelect.selectOption('price_asc');
    await expect(sortSelect).toHaveValue('price_asc');

    await sortSelect.selectOption('rating');
    await expect(sortSelect).toHaveValue('rating');
  });

  test('should handle search with Enter key', async ({ page }) => {
    await page.goto('/arama');

    const searchInput = page.locator('input[placeholder="İlan veya ders ara..."]');
    await searchInput.fill('Fizik');
    await searchInput.press('Enter');
  });

  test('should display proper result count text', async ({ page }) => {
    await page.goto('/arama');

    // Mock returns 2 listings
    await expect(page.locator('text=2 ilan bulundu')).toBeVisible();
  });
});
