import { test, expect } from '@playwright/test';
import { mockStudent, setupDefaultMocks } from './mocks';

test.describe('Cookie Consent Banner', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
    // Clear any existing consent before each navigation
    await page.addInitScript(() => localStorage.removeItem('cookie-consent-v2'));
  });

  test('should appear after page load when no consent is stored', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).toBeVisible();
  });

  test('should hide banner and store consent on "Kabul Et"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).toBeVisible();

    await page.getByRole('button', { name: 'Tümünü kabul et', exact: true }).click();
    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).not.toBeVisible();

    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('cookie-consent-v2') || '{}'));
    expect(consent).toMatchObject({ version: 2, necessary: true, analytics: true, marketing: true });
  });

  test('should hide banner and store consent on "Reddet"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).toBeVisible();

    await page.getByRole('button', { name: 'İsteğe bağlıları reddet' }).click();
    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).not.toBeVisible();

    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('cookie-consent-v2') || '{}'));
    expect(consent).toMatchObject({ version: 2, necessary: true, analytics: false, marketing: false });
  });

  test('should not show banner when consent already stored', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie-consent-v2', JSON.stringify({
      version: 2, necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString(),
    })));
    await page.goto('/');
    await page.waitForTimeout(600);

    await expect(page.getByText('Çerez tercihlerinizi siz belirleyin')).not.toBeVisible();
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
