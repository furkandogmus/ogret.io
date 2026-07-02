import { test, expect } from '@playwright/test';
import { setupDefaultMocks, mockListings } from './mocks';

test.describe('Search Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
    await page.goto('/arama');
  });

  test('should display total search results and result cards', async ({ page }) => {
    // Should show 2 results by default (from mockListings)
    await expect(page.locator('text=2 ilan bulundu')).toBeVisible();

    // Verify mock tutor cards are rendered
    await expect(page.locator('text=Selim Hoca')).toBeVisible();
    await expect(page.locator('text=Elif İngilizce')).toBeVisible();
  });

  test('should search by tutor name or subject text input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="İlan veya ders ara..."]');
    
    // Search for "Selim" — mock returns only matching listing
    await page.route(/\/api\/v1\/tutors\/listings(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [mockListings[0]], page: 0, totalPages: 1, totalElements: 1 }),
      });
    });

    await searchInput.fill('Selim');
    await searchInput.press('Enter');

    // Should now show 1 result
    await expect(page.locator('text=1 ilan bulundu')).toBeVisible();
    await expect(page.locator('text=Selim Hoca')).toBeVisible();
    await expect(page.locator('text=Elif İngilizce')).not.toBeVisible();
  });

  test('should show filter options and handle filtering by subject, price, and rating', async ({ page }) => {
    // Open filters panel
    const filterToggleButton = page.locator('button:has(svg.lucide-sliders-horizontal)');
    await filterToggleButton.click();

    // Verify filter categories block is shown
    await expect(page.locator('text=Ders Kategorisi')).toBeVisible();
    await expect(page.locator('text=Max Saatlik Ücret')).toBeVisible();
    await expect(page.locator('text=Min Puan')).toBeVisible();

    // Select "İngilizce" category (Mock subject ID for İngilizce should be returned by subjects API)
    // In our mocks, mockSubjects contains { id: 'sub-eng', name: 'İngilizce' }
    // Let's mock a get list API intercept for list listings that filters subjects
    await page.route(/\/api\/v1\/tutors\/listings(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [mockListings[1]], page: 0, totalPages: 1, totalElements: 1 }), // returns only Elif İngilizce listing
      });
    });

    const engSubjectBtn = page.locator('button:has-text("İngilizce")');
    await engSubjectBtn.click();

    // Verify that we only show Elif English
    await expect(page.locator('text=1 ilan bulundu')).toBeVisible();
    await expect(page.locator('text=Elif İngilizce')).toBeVisible();
    await expect(page.locator('text=Selim Hoca')).not.toBeVisible();
  });

  test('should filter by online status checkbox toggle', async ({ page }) => {
    // Open filters panel
    await page.locator('button:has(svg.lucide-sliders-horizontal)').click();

    // Toggle "Sadece Online Olanlar" checkbox
    // Elif is offline (online: false), Selim is online (online: true). Clicking this should filter out Elif.
    const onlineCheckbox = page.locator('span:has-text("Sadece Online Olanlar")').locator('xpath=..').locator('.w-9.h-5');
    
    // Check it by clicking the visible toggle div
    await onlineCheckbox.click();

    // Should only show Selim
    await expect(page.locator('text=Selim Hoca')).toBeVisible();
    await expect(page.locator('text=Elif İngilizce')).not.toBeVisible();
  });

  test('should sort results using select dropdown', async ({ page }) => {
    // Intercept API call with sorting price ascending
    await page.route(/\/api\/v1\/tutors\/listings(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [mockListings[1], mockListings[0]], page: 0, totalPages: 1, totalElements: 2 }), // Elif (400) first, then Selim (500)
      });
    });

    const sortSelect = page.locator('select');
    await sortSelect.selectOption('price_asc');

    // Verify order of cards
    const tutorNames = page.locator('h3.font-semibold');
    await expect(tutorNames.first()).toHaveText('Elif İngilizce');
    await expect(tutorNames.nth(1)).toHaveText('Selim Hoca');
  });
});
