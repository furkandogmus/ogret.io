import { test, expect } from '@playwright/test';
import { mockAdmin, mockVerifications, setupDefaultMocks } from './mocks';

test.describe('Admin Dashboard Extended', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-access-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh-token');
    }, { user: mockAdmin });

    await page.route(/\/api\/v1\/admin\/dashboard/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 154, totalTutors: 45, totalStudents: 109,
          totalLessons: 342, pendingVerifications: 2,
        }),
      });
    });
  });

  test('should reject a verification and remove it from list', async ({ page }) => {
    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      if (route.request().method() === 'PUT') {
        // this is the reject/approve call
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockVerifications) });
    });

    // Mock reject API
    await page.route(/\/api\/v1\/admin\/verifications\/ver-1/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.approved).toBe(false);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.goto('/admin');

    // Click "Doğrulamalar" tab
    await page.locator('button:has-text("Doğrulamalar")').click();
    await expect(page.locator('text=Elif İngilizce')).toBeVisible();

    // Mock verifications to return empty after reject
    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Click reject (X) button - it's the red button
    const rejectBtn = page.locator('button.text-red-600').first();
    await rejectBtn.click();

    // Empty state
    await expect(page.locator('text=Bekleyen doğrulama bulunmuyor')).toBeVisible();
  });

  test('should show all stat cards on dashboard tab', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Toplam Kullanıcı')).toBeVisible();
    await expect(page.locator('text=Öğretmen').first()).toBeVisible();
    await expect(page.locator('text=Toplam Ders')).toBeVisible();

    // Verify numbers
    await expect(page.locator('text=154')).toBeVisible();
    await expect(page.locator('text=45')).toBeVisible();
    await expect(page.locator('text=342')).toBeVisible();
  });

  test('should switch between dashboard tabs', async ({ page }) => {
    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockVerifications) });
    });

    await page.goto('/admin');

    // Default tab is dashboard - stats visible
    await expect(page.locator('text=154')).toBeVisible();

    // Switch to Doğrulamalar
    await page.locator('button:has-text("Doğrulamalar")').click();
    await expect(page.locator('text=Elif İngilizce')).toBeVisible();
  });
});

test.describe('Admin Dashboard References Tab', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-access-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh-token');
    }, { user: mockAdmin });

    await page.route(/\/api\/v1\/admin\/dashboard/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalUsers: 100, totalTutors: 20, totalStudents: 80, totalLessons: 150, pendingVerifications: 1 }) });
    });

    await page.route(/\/api\/v1\/admin\/verifications(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('should display and reject pending references', async ({ page }) => {
    const mockPendingRefs = [
      { id: 'ref-reject-1', tutorId: 'user-tutor-2', tutorName: 'Elif İngilizce', recommenderName: 'Ayşe K.', recommenderEmail: 'ayse@test.com', recommenderTitle: 'Veli', comment: 'Çok iyi öğretmen', status: 'PENDING', createdAt: '2026-07-01T12:00:00Z' },
    ];

    await page.route(/\/api\/v1\/admin\/references/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPendingRefs) });
    });

    // Mock reject reference
    await page.route(/\/api\/v1\/admin\/references\/ref-reject-1/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.approved).toBe(false);
      await route.fulfill({ status: 200 });
    });

    await page.goto('/admin');

    // Click "Referanslar" tab
    await page.locator('button:has-text("Referanslar")').click();
    await expect(page.locator('text=Ayşe K.')).toBeVisible();

    // Mock refs to return empty after reject
    await page.route(/\/api\/v1\/admin\/references/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Click reject (X) button
    const rejectRefBtn = page.locator('button.text-red-600').first();
    await rejectRefBtn.click();

    await expect(page.locator('text=Bekleyen referans/tavsiye bulunmuyor')).toBeVisible();
  });
});
