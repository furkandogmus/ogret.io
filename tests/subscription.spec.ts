import { test, expect } from '@playwright/test';
import { mockTutor, mockStudent, setupDefaultMocks } from './mocks';

test.describe('Subscription Plans Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  const mockPlans = [
    { id: 'plan-basic', name: 'Basic', price: 149, features: ['Profil oluşturma', 'Haftada 5 ders talebi', 'Temel istatistikler'] },
    { id: 'plan-premium', name: 'Premium', price: 299, features: ['Öncelikli sıralama', 'Sınırsız ders talebi', 'Detaylı analitik', 'Öncelikli destek'] },
    { id: 'plan-vip', name: 'VIP', price: 599, features: ['En üst sıralama', 'Özel profil rozeti', 'VIP destek hattı', 'Özel eğitim danışmanı', 'İlk 5 arama sonucu garantisi'] },
  ];

  const mockSubscription = {
    id: 'sub-1',
    planType: 'Premium',
    price: 299,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-07-01T00:00:00Z',
    isActive: true,
    paymentMethod: 'havale',
  };

  test('should prompt non-tutor users to log in', async ({ page }) => {
    // Mock student login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/abonelik');

    await expect(page.locator('text=Öğretmen Abonelik Planları')).toBeVisible();
    await expect(page.locator('text=Abonelik planlarını görüntülemek için öğretmen hesabıyla giriş yapmalısınız')).toBeVisible();
    await expect(page.locator('button:has-text("Giriş Yap")')).toBeVisible();
  });

  test('should display subscription plans for tutor users', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.route(/\/api\/v1\/subscriptions\/plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPlans) });
    });
    await page.route(/\/api\/v1\/subscriptions\/me/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
    });

    await page.goto('/abonelik');

    // Should show all 3 plans
    await expect(page.locator('h1')).toContainText('Abonelik Planları');
    await expect(page.locator('text=Basic')).toBeVisible();
    await expect(page.locator('text=Premium')).toBeVisible();
    await expect(page.locator('text=VIP')).toBeVisible();

    // Verify plan prices
    await expect(page.locator('text=₺149').first()).toBeVisible();
    await expect(page.locator('text=₺299').first()).toBeVisible();
    await expect(page.locator('text=₺599').first()).toBeVisible();

    // Verify "EN POPÜLER" badge on Premium
    await expect(page.locator('text=EN POPÜLER')).toBeVisible();

    // All plans should have "Abone Ol" buttons
    await expect(page.locator('button:has-text("Abone Ol")')).toHaveCount(3);
  });

  test('should show active subscription banner and handle cancellation', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.route(/\/api\/v1\/subscriptions\/plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPlans) });
    });
    await page.route(/\/api\/v1\/subscriptions\/me/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSubscription) });
    });
    await page.route(/\/api\/v1\/subscriptions\/cancel/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/abonelik');

    // Active subscription banner should be visible
    await expect(page.locator('text=Aktif Aboneliğiniz')).toBeVisible();
    await expect(page.locator('text=Premium — ₺299/ay')).toBeVisible();

    // Premium card should show "Aktif" instead of "Abone Ol"
    const premiumCard = page.locator('text=Premium').first();
    await expect(premiumCard).toBeVisible();

    // Click "İptal Et"
    await page.locator('button:has-text("İptal Et")').click();

    // Expect cancel to work - subscription banner disappears
    await expect(page.locator('text=Aktif Aboneliğiniz')).not.toBeVisible();
  });

  test('should handle subscribe action successfully', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.route(/\/api\/v1\/subscriptions\/plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPlans) });
    });
    await page.route(/\/api\/v1\/subscriptions\/me/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
    });

    // Intercept subscribe POST - redirect to /abonelik after
    await page.route(/\/api\/v1\/subscriptions$/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.planType).toBe('VIP');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSubscription) });
    });

    await page.goto('/abonelik');

    // Subscribe to VIP
    const vipButton = page.locator('button:has-text("Abone Ol")').last();
    await vipButton.click();

    // Should show success toast and subscription banner
    await expect(page.locator('text=Aktif Aboneliğiniz')).toBeVisible();
  });
});
