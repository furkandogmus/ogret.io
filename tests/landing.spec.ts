import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept standard API requests
    await setupDefaultMocks(page);
    await page.goto('/');
  });

  test('should display the main hero section and header', async ({ page }) => {
    // Check page title / tagline
    await expect(page.locator('h1')).toContainText("Türkiye'nin En İyi");
    await expect(page.locator('h1')).toContainText("Özel Ders");

    // Check search inputs
    const searchInput = page.locator('input[placeholder="Hangi konuyu öğrenmek istiyorsunuz?"]');
    await expect(searchInput).toBeVisible();
    
    // Check stats are rendered
    await expect(page.locator('text=Uzman Öğretmen').first()).toBeVisible();
    await expect(page.locator('text=Mutlu Öğrenci').first()).toBeVisible();
  });

  test('should navigate to search page when clicking a popular subject or search button', async ({ page }) => {
    // Click on "Matematik" popüler button
    const mathPopularButton = page.locator('button:has-text("Matematik")').first();
    await mathPopularButton.click();
    
    // Should route to /arama
    await expect(page).toHaveURL(/\/arama/);
  });

  test('should render featured tutors from the API', async ({ page }) => {
    // Check that our mock tutor Selim Hoca is listed on the landing page
    const tutorCard = page.locator('text=Selim Hoca').first();
    await expect(tutorCard).toBeVisible();

    // Verify rating average and price are displayed
    await expect(page.locator('text=4.9').first()).toBeVisible();
    await expect(page.locator('text=500').first()).toBeVisible();
  });
});
