import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, mockReviews, setupDefaultMocks } from './mocks';

test.describe('Tutor Profile Page & Booking Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Mock student login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    }, { user: mockStudent });
  });

  test('should display tutor details, bio, hourly rate, and support tabs switching', async ({ page }) => {
    // Navigate directly to Selim Hoca's profile page (user-tutor-1)
    await page.goto('/ogretmen/user-tutor-1');

    // Verify name, rating, rate
    await expect(page.locator('h1')).toContainText('Selim Hoca');
    await expect(page.locator('text=₺500').first()).toBeVisible();

    // Verify default "Hakkında" content is showing
    await expect(page.locator('text=Boğaziçi Üniversitesi Matematik Öğretmenliği')).toBeVisible();

    // Switch to Reviews tab
    await page.locator('button:has-text("Yorumlar")').click();

    // Verify mock reviews are visible
    await expect(page.locator('text=Selim Hoca sayesinde netlerim çok arttı')).toBeVisible();
    await expect(page.locator('text=Anonim')).toBeVisible();

    // Switch to Availability tab
    await page.locator('button:has-text("Uygunluk")').click();

    // Check availability calendar is showing grid/slots (Pzt, Sal, etc.)
    await expect(page.locator('text=Pzt')).toBeVisible();
    await expect(page.locator('text=Sal')).toBeVisible();
  });

  test('should complete the 4-step Lesson Request Modal wizard successfully', async ({ page }) => {
    // Intercept lesson creation POST request
    await page.route(/\/api\/v1\/lessons/, async (route) => {
      const requestBody = route.request().postDataJSON();
      expect(requestBody.tutorId).toBe('user-tutor-1');
      expect(requestBody.durationMinutes).toBeUndefined(); // Wait, let's verify duration is calculated into startTime/endTime or not needed.
      expect(requestBody.notes).toBe('Matematik sınavı için özel destek gerekiyor.');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'les-new-1',
          status: 'PENDING',
          lessonDate: requestBody.lessonDate,
          startTime: requestBody.startTime,
          endTime: requestBody.endTime,
          price: 500,
          student: mockStudent,
          tutor: mockTutor,
        }),
      });
    });

    await page.goto('/ogretmen/user-tutor-1');

    // Click "Ders Talep Et" button
    await page.locator('button:has-text("Ders Talep Et")').click();

    // Modal title should appear
    await expect(page.locator('h2')).toContainText('Ders Talep Et');

    // --- STEP 1: Subject & Duration Selection ---
    // Select Subject (e.g. Matematik)
    const mathBtn = page.locator('button:has-text("Matematik")').first();
    await mathBtn.click();
    
    // Choose 60 mins duration (already default or click it)
    await page.locator('button:has-text("60 dk")').click();
    
    // Click "Devam Et"
    await page.locator('button:has-text("Devam Et")').click();

    // --- STEP 2: Date & Time Selection ---
    // Check that we are on step 2
    await expect(page.locator('text=Adım 2 / 4')).toBeVisible();
    
    // Pick date (Bugün or Yarın)
    await page.locator('button:has-text("Bugün"), button:has-text("Yarın")').first().click();

    // Select hour (e.g. 14:00)
    await page.locator('button:has-text("14:00")').click();
    
    // Click "Devam Et"
    await page.locator('button:has-text("Devam Et")').click();

    // --- STEP 3: Message Text ---
    await expect(page.locator('text=Adım 3 / 4')).toBeVisible();
    
    // Type note
    await page.locator('textarea').fill('Matematik sınavı için özel destek gerekiyor.');
    
    // Click "Talep Gönder"
    await page.locator('button:has-text("Talep Gönder")').click();

    // --- STEP 4: Confirmation / Success ---
    await expect(page.locator('text=Talep Gönderildi!')).toBeVisible();
    await expect(page.locator('text=Selim Hoca talebinizi inceleyecek')).toBeVisible();

    // Verify summary values
    await expect(page.locator('text=60 dakika')).toBeVisible();
    await expect(page.locator('text=₺500').first()).toBeVisible();

    // Click Close
    await page.locator('button:has-text("Kapat")').click();

    // Modal should close (check header is no longer visible)
    await expect(page.locator('h2:has-text("Ders Talep Et")')).not.toBeVisible();
  });
});
