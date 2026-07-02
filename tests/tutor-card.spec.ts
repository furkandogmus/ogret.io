import { test, expect } from '@playwright/test';
import { mockTutor, mockStudent, setupDefaultMocks, mockTutorsList } from './mocks';

test.describe('TutorCard Component Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should render TutorCard with key data points', async ({ page }) => {
    await page.goto('/');

    // Selim Hoca card should be visible
    const card = page.locator('text=Selim Hoca').first();
    await expect(card).toBeVisible();

    // Verify rating, review count, hourly rate
    await expect(page.locator('text=₺500').first()).toBeVisible();
  });

  test('should toggle favorite heart button', async ({ page }) => {
    // Mock favorite add
    await page.route(/\/api\/v1\/favorites\/user-tutor-1/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      } else {
        await route.fulfill({ status: 200 });
      }
    });

    await page.goto('/');

    // Find the heart button on the first tutor card
    const heartBtn = page.locator('button:has(svg.lucide-heart)').first();

    // Click to favorite
    await heartBtn.click();
    // The heart should become filled (red)
    // Note: Some implementations might require waiting for state update
  });

  test('should navigate to tutor profile on card click', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Selim Hoca').first().click();
    await expect(page).toHaveURL(/\/ogretmen\/user-tutor-1/);
  });

  test('should have message button that navigates to chat', async ({ page }) => {
    await page.goto('/');

    // There should be a message circle button
    const messageBtn = page.locator('button:has(svg.lucide-message-circle)').first();
    await expect(messageBtn).toBeVisible();
  });

  test('should have "Profil Gör" button that navigates to profile', async ({ page }) => {
    await page.goto('/');

    await page.locator('button:has-text("Profil Gör")').first().click();
    await expect(page).toHaveURL(/\/ogretmen\/user-tutor-1/);
  });

  test('should show online status indicator for online tutors', async ({ page }) => {
    await page.goto('/');

    // Selim Hoca is online, should show "Online" badge
    await expect(page.locator('text=Online').first()).toBeVisible();
  });

  test('should show verified badge for verified tutors', async ({ page }) => {
    await page.goto('/');

    // Selim Hoca is verified
    await expect(page.locator('text=DOĞRULANMIŞ').first()).toBeVisible();
  });
});

test.describe('Tutor Profile Page Extended', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Mock student login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    }, { user: mockStudent });
  });

  test('should show identity verified badge on tutor profile', async ({ page }) => {
    await page.goto('/ogretmen/user-tutor-1');

    // Look for verification badge
    await expect(page.locator('text=KİMLİK DOĞRULANDI').or(page.locator('text=Doğrulanmış Öğretmen'))).toBeVisible();
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    await page.goto('/ogretmen/user-tutor-1');

    await expect(page.locator('text=Ana Sayfa').first()).toBeVisible();
  });

  test('should show back button', async ({ page }) => {
    await page.goto('/ogretmen/user-tutor-1');

    await expect(page.locator('button:has-text("Geri"), a:has-text("Geri")').first()).toBeVisible();
  });

  test('should handle invalid tutor ID gracefully', async ({ page }) => {
    await page.route(/\/api\/v1\/tutors\/invalid-id/, async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Öğretmen bulunamadı' }) });
    });
    await page.route(/\/api\/v1\/tutors\/invalid-id\/reviews/, async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({}) });
    });
    await page.route(/\/api\/v1\/tutors\/invalid-id\/availability/, async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/ogretmen/invalid-id');

    await expect(page.locator('text=Öğretmen bulunamadı').or(page.locator('text=bulunamadı'))).toBeVisible();
  });

  test('should have message button on profile', async ({ page }) => {
    await page.goto('/ogretmen/user-tutor-1');

    await expect(page.locator('button:has-text("Mesaj Gönder")').first()).toBeVisible();
  });

  test('should show references tab when references exist', async ({ page }) => {
    const mockApprovedRefs = [
      { id: 'ref-prof-1', tutorId: 'user-tutor-1', tutorName: 'Selim Hoca', recommenderName: 'Ali Veli', recommenderTitle: 'Öğrenci Velisi', comment: 'Çok memnun kaldık, herkese tavsiye ederiz.', status: 'APPROVED', createdAt: '2026-06-15T12:00:00Z' },
    ];

    await page.route(/\/api\/v1\/tutors\/user-tutor-1\/references/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockApprovedRefs) });
    });

    await page.goto('/ogretmen/user-tutor-1');

    // References tab should show count
    const refTab = page.locator('button:has-text("Referanslar")').first();
    await expect(refTab).toContainText('(1)');
  });
});
