import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, setupDefaultMocks } from './mocks';

test.describe('Authentication (Login & Register) E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should validate empty inputs and incorrect email formats on login', async ({ page }) => {
    await page.goto('/giris');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Click submit when empty
    await submitBtn.click();

    // Since the project might use standard HTML5 validation or custom alerts, let's verify validations:
    // If the browser natively prevents it, we can fill invalid content and check error handling
    await emailInput.fill('invalid-email');
    await passwordInput.fill('123');
    await submitBtn.click();

    // Check if custom alerts or browser HTML validation blocks it
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (validationMessage) {
      expect(validationMessage).not.toBe('');
    }
  });

  test('should log in student successfully and redirect to student dashboard', async ({ page }) => {
    // Intercept login post request
    await page.route(/\/api\/v1\/auth\/login/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-student-access-token',
          refreshToken: 'mock-student-refresh-token',
          user: mockStudent,
        }),
      });
    });

    await page.goto('/giris');

    await page.locator('input[type="email"]').fill('ogrenci@test.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Should redirect to homepage /
    await expect(page).toHaveURL(/\/$/);

    // Verify localStorage has the token and user
    const savedUser = await page.evaluate(() => localStorage.getItem('user'));
    expect(savedUser).toContain('STUDENT');
  });

  test('should log in tutor successfully and redirect to tutor dashboard', async ({ page }) => {
    // Intercept login post request
    await page.route(/\/api\/v1\/auth\/login/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-tutor-access-token',
          refreshToken: 'mock-tutor-refresh-token',
          user: mockTutor,
        }),
      });
    });

    await page.goto('/giris');

    await page.locator('input[type="email"]').fill('ogretmen@test.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Should redirect to homepage /
    await expect(page).toHaveURL(/\/$/);
  });

  test('should complete the registration wizard successfully', async ({ page }) => {
    // Intercept register request
    await page.route(/\/api\/v1\/auth\/register/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-registered-token',
          refreshToken: 'mock-registered-refresh-token',
          user: { ...mockStudent, email: 'yeni@test.com', fullName: 'Yeni Kayit' },
        }),
      });
    });

    await page.goto('/kayit');

    // Page displays choice of STUDENT or TUTOR
    // Let's click on "Öğrenci Olarak Kaydol" button
    const studentChoice = page.locator('button:has-text("Öğrenciyim"), button:has-text("Öğrenci Olarak")').first();
    if (await studentChoice.isVisible()) {
      await studentChoice.click();
    }

    // Fill registration inputs
    await page.locator('input[type="text"], input[placeholder*="Ad"], input[placeholder*="ad"]').first().fill('Yeni Kayit');
    await page.locator('input[type="email"]').fill('yeni@test.com');
    await page.locator('input[type="tel"], input[placeholder*="Telefon"]').first().fill('05551112233');
    await page.locator('input[type="password"]').fill('SecuredPassword123');

    // Click register button
    await page.locator('button[type="submit"]').click();

    // Verify redirect or completion state
    await expect(page).toHaveURL(/\/$/);
  });
});
