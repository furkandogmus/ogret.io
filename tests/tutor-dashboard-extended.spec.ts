import { test, expect } from '@playwright/test';
import { mockTutor, mockLessons, setupDefaultMocks } from './mocks';

test.describe('Tutor Dashboard Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    // Mock lessons
    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLessons) });
    });
  });

  test('should show recorded lesson totals without claiming payment tracking', async ({ page }) => {
    await page.goto('/ogretmen-panel');

    await expect(page.locator('text=Aylık Ders Tutarı')).toBeVisible();
    await expect(page.locator('text=ödeme takibi değildir')).toBeVisible();
    await expect(page.locator('text=₺400').first()).toBeVisible();
  });

  test('should show the free release and direct payment notice', async ({ page }) => {
    await page.goto('/ogretmen-panel');

    await expect(page.locator('text=İlk sürüm ücretsiz')).toBeVisible();
    await expect(page.locator('text=Ders ücretini ve ödeme yöntemini öğrencinizle doğrudan kararlaştırın.')).toBeVisible();
  });

  test('should display and interact with "Öğrencilerim" section', async ({ page }) => {
    await page.goto('/ogretmen-panel');

    // Click "Öğrencilerim" in sidebar
    await page.locator('button:has-text("Öğrencilerim")').click();

    // Should show student list
    await expect(page.locator('text=Ahmet Öğrenci').first()).toBeVisible();
    await expect(page.locator('text=3 ders')).toBeVisible();

    // "Mesaj Gönder" button should be present
    await expect(page.locator('button:has-text("Mesaj Gönder")')).toBeVisible();
  });

  test('should navigate to messages from student list', async ({ page }) => {
    await page.goto('/ogretmen-panel');
    await page.locator('button:has-text("Öğrencilerim")').click();

    await page.locator('button:has-text("Mesaj Gönder")').click();
    await expect(page).toHaveURL(/\/mesajlar/);
  });

  test('should show references section with copy-link functionality', async ({ page }) => {
    // Mock references
    await page.route(/\/api\/v1\/tutors\/me\/references/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogretmen-panel');

    // Click "Referanslarım" in sidebar
    await page.locator('button:has-text("Referanslarım")').click();

    // Reference section heading
    await expect(page.locator('text=Referanslarım ve Tavsiyeler')).toBeVisible();

    // Copy link input and button
    await expect(page.locator('input[readonly]')).toBeVisible();
    await expect(page.locator('button:has-text("Linki Kopyala")')).toBeVisible();
  });

  test('should show listings section with "Yeni İlan Aç" button', async ({ page }) => {
    // Mock empty listings
    await page.route(/\/api\/v1\/tutors\/me\/listings(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogretmen-panel');

    // Click "İlanlarım" in sidebar
    await page.locator('button:has-text("İlanlarım")').click();

    await expect(page.locator('text=Özel Ders İlanlarım')).toBeVisible();
    await expect(page.locator('button:has-text("Yeni İlan Aç")')).toBeVisible();

    // Empty state
    await expect(page.locator('text=Henüz bir ilanınız bulunmuyor')).toBeVisible();
    await expect(page.locator('button:has-text("İlk İlanını Oluştur")')).toBeVisible();
  });

  test('should navigate to create listing from empty state', async ({ page }) => {
    await page.route(/\/api\/v1\/tutors\/me\/listings(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogretmen-panel');
    await page.locator('button:has-text("İlanlarım")').click();
    await page.locator('button:has-text("İlk İlanını Oluştur")').click();

    await expect(page).toHaveURL('/ogretmen/ilan-olustur');
  });

  test('should show pending requests with count badge', async ({ page }) => {
    await page.goto('/ogretmen-panel');

    // Pending requests should be shown
    await expect(page.locator('text=Bekleyen Ders Talepleri')).toBeVisible();
    await expect(page.locator('text=Ahmet Öğrenci').first()).toBeVisible();
  });

  test('should add meeting link for confirmed lessons', async ({ page }) => {
    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLessons.map((lesson) => lesson.id === 'les-2' ? { ...lesson, meetingLink: undefined } : lesson)),
      });
    });
    // Mock meeting link update
    await page.route(/\/api\/v1\/lessons\/les-2\/meeting-link/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.meetingLink).toBe('https://zoom.us/j/123456');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/ogretmen-panel');

    // Find the meeting link input for the confirmed lesson
    const meetingInput = page.locator('input[placeholder*="Zoom/Meet linki"]').first();
    await expect(meetingInput).toBeVisible();

    // Type a meeting link
    await meetingInput.fill('https://zoom.us/j/123456');

    // Click the link button
    await page.locator('button:has(svg.lucide-link)').first().click();
  });

  test('should show onboarding flow when no listings and no lessons', async ({ page }) => {
    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/api\/v1\/tutors\/me\/listings(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogretmen-panel');

    // Onboarding welcome
    await expect(page.locator('text=Öğretmen Paneline Hoş Geldiniz!')).toBeVisible();

    // 3-step guide
    await expect(page.locator('text=Profilim')).toBeVisible();
    await expect(page.locator('text=İlan Oluştur').first()).toBeVisible();
    await expect(page.locator('text=Doğrulama Yap')).toBeVisible();

    // CTA
    await expect(page.locator('button:has-text("Hemen İlan Oluştur")')).toBeVisible();
  });
});
