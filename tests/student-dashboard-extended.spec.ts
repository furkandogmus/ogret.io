import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, mockLessons, mockTutorsList, setupDefaultMocks } from './mocks';

test.describe('Student Dashboard Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Student Login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    // Mock lessons
    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLessons) });
    });
  });

  test('should display lesson stats cards', async ({ page }) => {
    await page.goto('/ogrenci-panel');

    await expect(page.locator('text=Toplam Ders')).toBeVisible();
    await expect(page.locator('text=Bu Ay Gerçekleşen')).toBeVisible();
  });

  test('should show upcoming lessons with "Katıl" and "İptal" buttons', async ({ page }) => {
    await page.goto('/ogrenci-panel');

    // Upcoming section
    await expect(page.locator('text=Yaklaşan Dersler')).toBeVisible();
    await expect(page.locator('text=Selim Hoca').first()).toBeVisible();

    // "Katıl" button for confirmed lesson with meeting link
    const katilBtn = page.locator('a:has-text("Katıl")').first();
    await expect(katilBtn).toBeVisible();
  });

  test('should show completed lessons with "Değerlendir" button', async ({ page }) => {
    await page.goto('/ogrenci-panel');

    // Scroll to past lessons
    await expect(page.locator('text=Geçmiş Dersler')).toBeVisible();

    // COMPLETED lesson should have "Değerlendir" button
    await expect(page.locator('button:has-text("Değerlendir")').first()).toBeVisible();
  });

  test('should open review modal and submit rating', async ({ page }) => {
    // Mock review creation
    await page.route(/\/api\/v1\/lessons\/.*\/review/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.rating).toBe(5);
      expect(data.comment).toContain('Harika');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'rev-new' }) });
    });

    await page.goto('/ogrenci-panel');

    // Click "Değerlendir" button for completed lesson
    await page.locator('button:has-text("Değerlendir")').first().click();

    // Review form should appear
    await expect(page.locator('textarea[placeholder*="Yorumunuz"]')).toBeVisible();

    // Click the 5th star button
    const starButtons = page.locator('button:has(svg.lucide-star)');
    await starButtons.last().click();

    // Type comment
    await page.locator('textarea[placeholder*="Yorumunuz"]').fill('Harika bir ders!');

    // Submit
    await page.locator('button:has-text("Gönder")').click();

    // Review form should close
    await expect(page.locator('textarea[placeholder*="Yorumunuz"]')).not.toBeVisible();
  });

  test('should show favorites sidebar section with empty state', async ({ page }) => {
    await page.route(/\/api\/v1\/favorites(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogrenci-panel');

    // Click "Öğretmenlerim" in sidebar
    await page.locator('button:has-text("Öğretmenlerim")').click();

    // Empty state
    await expect(page.locator('text=Favori öğretmeniniz bulunmuyor')).toBeVisible();
    await expect(page.locator('button:has-text("Öğretmenleri Keşfet")')).toBeVisible();
  });

  test('should navigate to search from favorites empty state', async ({ page }) => {
    await page.route(/\/api\/v1\/favorites(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogrenci-panel');
    await page.locator('button:has-text("Öğretmenlerim")').click();
    await page.locator('button:has-text("Öğretmenleri Keşfet")').click();

    await expect(page).toHaveURL(/\/arama/);
  });

  test('should show subscription section with student plan details', async ({ page }) => {
    await page.goto('/ogrenci-panel');

    await page.locator('button:has-text("Abonelik")').click();

    await expect(page.locator('text=öğret.io Standart Öğrenci')).toBeVisible();
    await expect(page.locator('text=Süresiz Ücretsiz Plan')).toBeVisible();
    await expect(page.locator('text=Abonelik Paketlerini İncele')).toBeVisible();
  });

  test('should navigate to subscription page from student panel', async ({ page }) => {
    await page.goto('/ogrenci-panel');
    await page.locator('button:has-text("Abonelik")').click();

    await page.locator('button:has-text("Abonelik Paketlerini İncele")').click();
    await expect(page).toHaveURL('/abonelik');
  });

  test('should show empty state when no lessons exist', async ({ page }) => {
    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/ogrenci-panel');

    await expect(page.locator('text=Henüz dersiniz bulunmuyor')).toBeVisible();
    await expect(page.locator('button:has-text("Öğretmen Ara")')).toBeVisible();
  });

  test('should use section query parameter for tab selection', async ({ page }) => {
    await page.goto('/ogrenci-panel?section=favorites');

    await expect(page.locator('h1')).toContainText('Öğretmenlerim');
  });
});

test.describe('Student Dashboard Favorites with Data', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.route(/\/api\/v1\/lessons(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('should display favorite tutors with details', async ({ page }) => {
    await page.route(/\/api\/v1\/favorites(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockTutor]) });
    });

    await page.goto('/ogrenci-panel');
    await page.locator('button:has-text("Öğretmenlerim")').click();

    await expect(page.locator('text=Selim Hoca').first()).toBeVisible();
    await expect(page.locator('text=₺500/saat').first()).toBeVisible();
  });

  test('should navigate to tutor profile from favorites', async ({ page }) => {
    await page.route(/\/api\/v1\/favorites(\?|$)/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockTutor]) });
    });

    await page.goto('/ogrenci-panel');
    await page.locator('button:has-text("Öğretmenlerim")').click();

    await page.locator('text=Selim Hoca').first().click();
    await expect(page).toHaveURL(/\/ogretmen\/user-tutor-1/);
  });
});
