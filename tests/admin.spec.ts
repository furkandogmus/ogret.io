import { test, expect } from '@playwright/test';
import { mockAdmin, mockVerifications, setupDefaultMocks } from './mocks';

test.describe('Admin Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Mock Admin Login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-access-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh-token');
    }, { user: mockAdmin });

    // Mock admin dashboard stats
    await page.route(/\/api\/v1\/admin\/dashboard/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 154,
          totalTutors: 45,
          totalStudents: 109,
          totalLessons: 342,
          pendingVerifications: 1,
        }),
      });
    });

    // Mock admin verifications
    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockVerifications),
      });
    });
  });

  test('should redirect non-admin users to homepage', async ({ page }) => {
    // Override local storage to non-admin (null or STUDENT role)
    await page.addInitScript(() => {
      localStorage.removeItem('user');
    });

    await page.goto('/admin');
    await expect(page).toHaveURL('/giris');
  });

  test('should display platform statistics card view on default tab', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('h1')).toContainText('Admin Paneli');
    
    // Check key card numbers from mock dashboard stats
    await expect(page.locator('text=154')).toBeVisible(); // total users
    await expect(page.locator('text=Toplam Kullanıcı')).toBeVisible();

    await expect(page.locator('text=45')).toBeVisible(); // total tutors
    await expect(page.locator('text=Öğretmen').first()).toBeVisible();

    await expect(page.locator('text=342')).toBeVisible(); // total lessons
    await expect(page.locator('text=Toplam Ders')).toBeVisible();
  });

  test('should load pending verifications list and handle approve action', async ({ page }) => {
    // Intercept approval request PUT
    await page.route(/\/api\/v1\/admin\/verifications\/ver-1/, async (route) => {
      const requestData = route.request().postDataJSON();
      expect(requestData.approved).toBe(true);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/admin');

    // Click "Doğrulamalar" tab button
    await page.locator('button:has-text("Doğrulamalar")').click();

    // Verify verification request for Elif İngilizce is listed
    await expect(page.locator('text=Elif İngilizce')).toBeVisible();
    await expect(page.locator('text=DIPLOMA')).toBeVisible();

    // REDEFINE mock verifications to return empty list before click
    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Click Approve button (text-green-600)
    const approveBtn = page.locator('button.text-green-600').first();
    await approveBtn.click();

    // Check empty state
    await expect(page.locator('text=Bekleyen doğrulama bulunmuyor')).toBeVisible();
  });
});
