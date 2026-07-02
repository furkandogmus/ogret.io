import { test, expect } from '@playwright/test';
import { mockAdmin, mockStudent, mockTutor, setupDefaultMocks } from './mocks';

test.describe('Navbar Role-Based Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should show login/register buttons when unauthenticated', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('button:has-text("Giriş Yap")')).toBeVisible();
    await expect(page.locator('button:has-text("Öğretmen Ol")')).toBeVisible();

    // Role-specific items should NOT be visible
    await expect(page.locator('a:has-text("Öğrenci Paneli")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Öğretmen Paneli")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  });

  test('should show student nav items when logged in as student', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/');

    // Student should see "Öğrenci Paneli" and "Mesajlar"
    await expect(page.locator('a:has-text("Öğrenci Paneli")')).toBeVisible();
    await expect(page.locator('a:has-text("Mesajlar")')).toBeVisible();
    await expect(page.locator('a:has-text("Öğretmen Paneli")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  });

  test('should show tutor nav items when logged in as tutor', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/');

    await expect(page.locator('a:has-text("Öğretmen Paneli")')).toBeVisible();
    await expect(page.locator('a:has-text("Mesajlar")')).toBeVisible();
    await expect(page.locator('a:has-text("Öğrenci Paneli")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  });

  test('should show admin nav items when logged in as admin', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-access-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh-token');
    }, { user: mockAdmin });

    await page.goto('/');

    await expect(page.locator('a:has-text("Admin")')).toBeVisible();
    await expect(page.locator('a:has-text("Öğrenci Paneli")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Öğretmen Paneli")')).not.toBeVisible();
  });

  test('should show profile dropdown with logout for authenticated user', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/');

    // Click avatar/profile button
    await page.locator('button:has(img), button:has(div.rounded-lg)').first().click();

    // Dropdown should appear
    await expect(page.locator('text=Profilim')).toBeVisible();
    await expect(page.locator('text=Çıkış Yap')).toBeVisible();
  });

  test('should logout and redirect to home', async ({ page }) => {
    // Manually set auth without addInitScript to avoid re-setting after page reload
    await page.goto('/giris');
    await page.evaluate((user) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, mockStudent);

    // Navigate to student panel (now authenticated)
    await page.goto('/ogrenci-panel');

    // Click Çıkış Yap from sidebar
    await page.locator('button:has-text("Çıkış Yap")').first().click();

    // Should redirect to / and clear localStorage
    await expect(page).toHaveURL('/');
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toBeNull();
  });
});

test.describe('AuthGuard Route Protection', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should redirect unauthenticated user to login for /ogrenci-panel', async ({ page }) => {
    await page.goto('/ogrenci-panel');
    await expect(page).toHaveURL('/giris');
  });

  test('should redirect unauthenticated user to login for /ogretmen-panel', async ({ page }) => {
    await page.goto('/ogretmen-panel');
    await expect(page).toHaveURL('/giris');
  });

  test('should redirect unauthenticated user to login for /mesajlar', async ({ page }) => {
    await page.goto('/mesajlar');
    await expect(page).toHaveURL('/giris');
  });

  test('should redirect unauthenticated user to login for /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/giris');
  });

  test('should redirect non-admin user from /admin to home', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/admin');
    await expect(page).toHaveURL('/');
  });

  test('should redirect non-tutor user from /ogretmen/ilan-olustur to home', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/ogretmen/ilan-olustur');
    await expect(page).toHaveURL('/');
  });

  test('should allow admin to access /admin', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-admin-access-token');
      localStorage.setItem('refreshToken', 'mock-admin-refresh-token');
    }, { user: mockAdmin });

    await page.route(/\/api\/v1\/admin\/dashboard/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalUsers: 100, totalTutors: 20, totalStudents: 80, totalLessons: 200, pendingVerifications: 0 }) });
    });
    await page.route(/\/api\/v1\/admin\/verifications/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Admin Paneli');
  });
});
