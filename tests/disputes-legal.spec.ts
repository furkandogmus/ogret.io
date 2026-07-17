import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, setupDefaultMocks } from './mocks';

test.describe('Disputes Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });
  });

  const mockDisputes = [
    { id: 'disp-1', subject: 'Ödeme İhtilafı', description: 'Ders ücreti konusunda anlaşmazlık yaşıyoruz.', status: 'OPEN', priority: 'HIGH', createdAt: '2026-07-01T10:00:00Z', respondent: { id: 'user-tutor-1', fullName: 'Selim Hoca' } },
    { id: 'disp-2', subject: 'İptal Sorunu', description: 'Ders son dakika iptal edildi.', status: 'RESOLVED', priority: 'MEDIUM', createdAt: '2026-06-25T14:00:00Z', respondent: { id: 'user-tutor-1', fullName: 'Selim Hoca' } },
  ];

  test('should show empty state when no disputes exist', async ({ page }) => {
    await page.route(/\/disputes/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) });
      }
    });

    await page.goto('/anlasmazlik');

    await expect(page.locator('h1')).toContainText('İhtilaflar');
    await expect(page.locator('text=Henüz ihtilaf kaydı bulunmuyor.')).toBeVisible();
  });

  test('should display disputes list with tabs and expand details', async ({ page }) => {
    await page.route(/\/disputes/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: mockDisputes }) });
      }
    });

    await page.goto('/anlasmazlik');

    // Verify both disputes are in the list
    await expect(page.locator('text=Ödeme İhtilafı')).toBeVisible();
    await expect(page.locator('text=İptal Sorunu')).toBeVisible();

    // Verify status badges
    await expect(page.locator('text=Açık').first()).toBeVisible();
    await expect(page.locator('text=Çözüldü').first()).toBeVisible();

    // Click to expand first dispute
    await page.locator('button:has-text("Ödeme İhtilafı")').click();
    await expect(page.locator('text=Ders ücreti konusunda anlaşmazlık yaşıyoruz.')).toBeVisible();
    await expect(page.locator('text=Karşı taraf: Selim Hoca')).toBeVisible();
  });

  test('should toggle between "mine" and "against" tabs', async ({ page }) => {
    await page.route(/\/disputes/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [] }) });
    });

    await page.goto('/anlasmazlik');

    const mineTab = page.locator('button:has-text("Açtığım İhtilaflar")');
    const againstTab = page.locator('button:has-text("Hakkımdaki İhtilaflar")');

    await expect(mineTab).toHaveClass(/bg-primary/);
    await againstTab.click();
    await expect(againstTab).toHaveClass(/bg-primary/);
  });

  test('should create a new dispute via the form', async ({ page }) => {
    let getCount = 0;
    await page.route(/\/disputes/, async (route) => {
      if (route.request().method() === 'GET') {
        getCount++;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: getCount > 1 ? mockDisputes : [] }) });
      } else if (route.request().method() === 'POST') {
        const data = route.request().postDataJSON();
        expect(data.lessonId).toBe('les-1');
        expect(data.subject).toBe('Ders İptal Ücreti');
        expect(data.description).toBe('Öğretmen son anda iptal etti ama ücret kesildi.');
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'disp-new-1' }) });
      }
    });

    await page.goto('/anlasmazlik');

    // Click "Yeni İhtilaf" button
    await page.locator('button:has-text("Yeni İhtilaf")').click();

    // Fill form
    await page.locator('input[placeholder="Ders ID"]').fill('les-1');
    await page.locator('input[placeholder="Konu"]').fill('Ders İptal Ücreti');
    await page.locator('textarea').fill('Öğretmen son anda iptal etti ama ücret kesildi.');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verify disputes list refreshes
    await expect(page.locator('text=Ödeme İhtilafı')).toBeVisible();
  });
});

test.describe('Legal Pages (Privacy, Terms, KVKK, Cookies)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should display privacy policy on /gizlilik', async ({ page }) => {
    await page.goto('/gizlilik');

    await expect(page.locator('h1')).toContainText('Gizlilik Politikası');
    await expect(page.locator('text=Son güncelleme: 17 Temmuz 2026')).toBeVisible();
  });

  test('should display terms of use on /kullanim-kosullari', async ({ page }) => {
    await page.goto('/kullanim-kosullari');

    await expect(page.locator('h1')).toContainText('Kullanım Koşulları');
    await expect(page.locator('text=Hesap Kaydı')).toBeVisible();
    await expect(page.locator('text=Ders Verme ve Alma')).toBeVisible();
  });

  test('should display legal page for each slug on /yasal/:slug', async ({ page }) => {
    const slugs = [
      { slug: 'gizlilik-politikasi', title: 'Gizlilik Politikası' },
      { slug: 'kullanim-kosullari', title: 'Kullanım Koşulları' },
      { slug: 'kvkk-aydinlatma', title: 'KVKK Aydınlatma Metni' },
      { slug: 'cerez-politikasi', title: 'Çerez Politikası' },
    ];

    for (const { slug, title } of slugs) {
      await page.goto(`/yasal/${slug}`);
      await expect(page.locator('h1')).toContainText(title);
      await expect(page.locator('text=Ana sayfaya dön')).toBeVisible();
    }
  });

  test('should show not found state for invalid legal slug', async ({ page }) => {
    await page.goto('/yasal/olmayan-sayfa');

    await expect(page.locator('text=Sayfa Bulunamadı')).toBeVisible();
    await expect(page.locator('text=Aradığınız yasal sayfa mevcut değil.')).toBeVisible();
  });
});
