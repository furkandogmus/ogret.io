import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, mockLessons, mockTutorsList, setupDefaultMocks } from './mocks';

test.describe('Student & Tutor Dashboards E2E Tests', () => {
  
  test.describe('Student Dashboard Flows', () => {
    test.beforeEach(async ({ page }) => {
      await setupDefaultMocks(page);

      // Student Login
      await page.addInitScript(({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', 'mock-student-access-token');
        localStorage.setItem('refreshToken', 'mock-student-refresh-token');
      }, { user: mockStudent });

      // Mock list lessons for student
      await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockLessons),
        });
      });

      // Mock favorites
      await page.route(/\/api\/v1\/favorites(\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mockTutor]),
        });
      });
    });

    test('should render student lessons list and stats', async ({ page }) => {
      await page.goto('/ogrenci-panel');

      // Verify page titles and stats
      await expect(page.locator('h1')).toContainText('Derslerim');
      
      // Select sections or verify lessons count
      // Mock lessons: mockLessons has 1 pending, 1 confirmed, 1 completed.
      // Confirmed/In-progress matches "Yaklaşan Dersler" or similar.
      // Selim Hoca card should show
      await expect(page.locator('text=Selim Hoca').first()).toBeVisible();
      await expect(page.locator('text=Matematik').first()).toBeVisible();
    });

    test('should show favorite tutors and support navigation', async ({ page }) => {
      await page.goto('/ogrenci-panel');

      // Click "Öğretmenlerim" sidebar item
      await page.locator('button:has-text("Öğretmenlerim")').click();

      // Check if Selim Hoca is listed as favorite tutor
      await expect(page.locator('text=Selim Hoca').first()).toBeVisible();

      // Mock remove favorite
      await page.route('**/api/v1/favorites/user-tutor-1', async (route) => {
        expect(route.request().method()).toBe('DELETE');
        await route.fulfill({ status: 200 });
      });

      // Let's assert that the favorites section heading is rendered
      await expect(page.locator('h1:has-text("Öğretmenlerim")')).toBeVisible();
    });
  });

  test.describe('Tutor Dashboard Flows', () => {
    test.beforeEach(async ({ page }) => {
      await setupDefaultMocks(page);

      // Tutor Login
      await page.addInitScript(({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', 'mock-tutor-access-token');
        localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
      }, { user: mockTutor });

      // Mock list lessons for tutor
      await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockLessons),
        });
      });
    });

    test('should render tutor dashboard stats, earnings summary, and handle accept request action', async ({ page }) => {
      // Mock lesson confirm PUT call
      // Mock lesson confirm PUT call
      await page.route(/\/api\/v1\/lessons\/les-1\/confirm/, async (route) => {
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockLessons[0], status: 'CONFIRMED' }),
        });
      });

      await page.goto('/ogretmen-panel');

      // Verify header and summary card values
      await expect(page.locator('h1')).toContainText('Öğretmen Paneli');
      
      // Bu Ay Gelir should be 400 (from 1 completed lesson price: 400)
      await expect(page.locator('text=₺400').first()).toBeVisible();

      // Confirm there is 1 pending request shown (mockLessons[0] is pending)
      await expect(page.locator('text=Bekleyen Ders Talepleri')).toBeVisible();
      await expect(page.locator('text=Ahmet Öğrenci').first()).toBeVisible();

      // REDEFINE mock lessons to show confirmed before clicking
      await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { ...mockLessons[0], status: 'CONFIRMED' },
            mockLessons[1],
            mockLessons[2],
          ]),
        });
      });

      // Click the check/approve button
      const confirmButton = page.getByRole('button', { name: /ders talebini onayla/ });
      await confirmButton.click();

      // Wait for page refresh
      await expect(page.locator('text=Bekleyen Ders Talepleri')).not.toBeVisible();
    });

    test('should handle reject/cancel request action', async ({ page }) => {
      let lessonCancelled = false;

      // Keep the list response stateful so WebKit cannot race a post-navigation
      // route replacement during the cookie-session bootstrap.
      await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { ...mockLessons[0], status: lessonCancelled ? 'CANCELLED' : 'PENDING' },
            mockLessons[1],
            mockLessons[2],
          ]),
        });
      });

      // Mock lesson cancel PUT call
      await page.route(/\/api\/v1\/lessons\/les-1\/cancel/, async (route) => {
        expect(route.request().method()).toBe('PUT');
        lessonCancelled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockLessons[0], status: 'CANCELLED' }),
        });
      });

      await page.goto('/ogretmen-panel');

      const rejectButton = page.getByRole('button', { name: /ders talebini reddet/ });
      await rejectButton.click();

      await expect(page.locator('text=Bekleyen Ders Talepleri')).not.toBeVisible();
    });
  });
});
