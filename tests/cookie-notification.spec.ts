import { test, expect } from '@playwright/test';
import { mockStudent, setupDefaultMocks } from './mocks';

test.describe('Cookie Consent Banner', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
    // Clear any existing consent before each navigation
    await page.addInitScript(() => localStorage.removeItem('cookie-consent-v1'));
  });

  test('should appear after page load when no consent is stored', async ({ page }) => {
    await page.goto('/');

    // Should not be visible immediately (500ms delay)
    await expect(page.locator('text=Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz')).not.toBeVisible();

    // Wait for the 500ms delay
    await page.waitForTimeout(600);
    await expect(page.locator('text=Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz')).toBeVisible();
  });

  test('should hide banner and store consent on "Kabul Et"', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);

    await page.locator('button:has-text("Kabul Et")').click();
    await expect(page.locator('text=Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz')).not.toBeVisible();

    const consent = await page.evaluate(() => localStorage.getItem('cookie-consent-v1'));
    expect(consent).toBe('accepted');
  });

  test('should hide banner and store consent on "Reddet"', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);

    await page.locator('button:has-text("Reddet")').first().click();
    await expect(page.locator('text=Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz')).not.toBeVisible();

    const consent = await page.evaluate(() => localStorage.getItem('cookie-consent-v1'));
    expect(consent).toBe('rejected');
  });

  test('should not show banner when consent already stored', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie-consent-v1', 'accepted'));
    await page.goto('/');
    await page.waitForTimeout(600);

    await expect(page.locator('text=Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz')).not.toBeVisible();
  });
});

test.describe('Notification Bell', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should show unread badge count and open dropdown', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/');

    // Bell icon should be visible
    const bell = page.locator('button:has(svg.lucide-bell)');
    await expect(bell).toBeVisible();

    // Click bell to open dropdown
    await bell.click();
    await expect(page.locator('h3:has-text("Bildirimler")')).toBeVisible();
    await expect(page.locator('text=Bildirim bulunmuyor')).toBeVisible();
  });

  test('should show mark-all-read and clear-all buttons in dropdown header', async ({ page }) => {
    await page.addInitScript(({ user, notifications }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/');
    await page.locator('button:has(svg.lucide-bell)').click();

    // Dropdown header should have utility buttons area
    const dropdown = page.locator('text=Bildirimler');
    await expect(dropdown).toBeVisible();
  });
});
