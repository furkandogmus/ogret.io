import { test, expect } from '@playwright/test';
import { mockAdmin, mockTutor, setupDefaultMocks } from './mocks';

test.describe('References / Recommendations E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should submit a reference successfully as external user', async ({ page }) => {
    // Intercept POST request for creating reference
    await page.route(/\/api\/v1\/tutors\/user-tutor-1\/references/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.recommenderName).toBe('Mert Yılmaz');
      expect(data.recommenderEmail).toBe('mert@test.com');
      expect(data.recommenderTitle).toBe('Eski Öğrenci');
      expect(data.comment).toBe('Harika bir öğretmen, kesinlikle tavsiye ederim!');

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ref-mock-1',
          tutorId: 'user-tutor-1',
          tutorName: 'Selim Hoca',
          recommenderName: 'Mert Yılmaz',
          recommenderEmail: 'mert@test.com',
          recommenderTitle: 'Eski Öğrenci',
          comment: 'Harika bir öğretmen, kesinlikle tavsiye ederim!',
          status: 'PENDING',
          createdAt: '2026-07-02T12:00:00Z'
        }),
      });
    });

    await page.goto('/tutors/user-tutor-1/recommend');

    // Verify page headers
    await expect(page.locator('h1')).toContainText('Selim Hoca için Tavsiye Yaz');

    // Fill in the form
    await page.locator('input[placeholder="Ad Soyad"]').fill('Mert Yılmaz');
    await page.locator('input[placeholder="ornek@email.com"]').fill('mert@test.com');
    await page.locator('select').selectOption('Eski Öğrenci');
    await page.locator('textarea').fill('Harika bir öğretmen, kesinlikle tavsiye ederim!');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Verify success screen
    await expect(page.locator('h1')).toContainText('Tavsiyeniz Alındı!');
    await expect(page.locator('text=onayladıktan sonra')).toBeVisible();
  });

  test('should display and allow admin to approve a reference', async ({ page }) => {
    // Set local storage to Admin role
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh');
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
          pendingVerifications: 0,
        }),
      });
    });

    // Mock verifications
    await page.route(/\/api\/v1\/admin\/verifications/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    const mockPendingReferences = [
      {
        id: 'ref-1',
        tutorId: 'user-tutor-1',
        tutorName: 'Selim Hoca',
        recommenderName: 'Mert Yılmaz',
        recommenderEmail: 'mert@test.com',
        recommenderTitle: 'Eski Öğrenci',
        comment: 'Harika bir öğretmen, kesinlikle tavsiye ederim!',
        status: 'PENDING',
        createdAt: '2026-07-02T12:00:00Z',
      },
    ];

    // Mock pending references request
    await page.route(/\/api\/v1\/admin\/references/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingReferences),
      });
    });

    // Intercept approval request PUT
    await page.route(/\/api\/v1\/admin\/references\/ref-1/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.approved).toBe(true);

      await route.fulfill({ status: 200 });
    });

    await page.goto('/admin');

    // Click "Referanslar" tab button
    await page.locator('button:has-text("Referanslar")').click();

    // Verify table content
    await expect(page.locator('text=Selim Hoca')).toBeVisible();
    await expect(page.locator('text=Mert Yılmaz')).toBeVisible();
    await expect(page.locator('text=Eski Öğrenci')).toBeVisible();
    await expect(page.locator('text=Harika bir öğretmen')).toBeVisible();

    // Mock pending references request to return empty list after approval
    await page.route(/\/api\/v1\/admin\/references/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Click Approve button (check circle button)
    const approveBtn = page.locator('button.text-green-600').first();
    await approveBtn.click();

    // Verify empty state
    await expect(page.locator('text=Bekleyen referans/tavsiye bulunmuyor')).toBeVisible();
  });

  test('should display approved references on tutor profile page', async ({ page }) => {
    const mockApprovedReferences = [
      {
        id: 'ref-1',
        tutorId: 'user-tutor-1',
        tutorName: 'Selim Hoca',
        recommenderName: 'Mert Yılmaz',
        recommenderTitle: 'Eski Öğrenci',
        comment: 'Harika bir öğretmen, kesinlikle tavsiye ederim!',
        status: 'APPROVED',
        createdAt: '2026-07-02T12:00:00Z',
      },
    ];

    // Mock approved references request
    await page.route(/\/api\/v1\/tutors\/user-tutor-1\/references/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApprovedReferences),
      });
    });

    await page.goto('/ogretmen/user-tutor-1');

    // Verify tab buttons include "Referanslar (1)"
    const refTabBtn = page.locator('button:has-text("Referanslar")').first();
    await expect(refTabBtn).toContainText('Referanslar (1)');

    // Click tab
    await refTabBtn.click();

    // Verify reference detail is rendered
    await expect(page.locator('text=Mert Yılmaz')).toBeVisible();
    await expect(page.locator('span:has-text("Eski Öğrenci")')).toBeVisible();
    await expect(page.locator('text=Harika bir öğretmen, kesinlikle tavsiye ederim!')).toBeVisible();

    // Verify CTA "Tavsiye Yaz" button is visible
    const writeRefBtn = page.locator('button:has-text("Tavsiye Yaz")');
    await expect(writeRefBtn).toBeVisible();
  });
});
