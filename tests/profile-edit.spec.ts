import { test, expect } from '@playwright/test';
import { mockTutor, mockStudent, setupDefaultMocks } from './mocks';

test.describe('Profile Edit Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should display profile edit page with tabs', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle');

    // Should show greeting banner
    await expect(page.locator('text=Hoş geldin, Selim!')).toBeVisible();

    // Should show all 3 tabs for tutor
    await expect(page.locator('button:has-text("Profilim")')).toBeVisible();
    await expect(page.locator('button:has-text("Ders & Müsaitlik")')).toBeVisible();
    await expect(page.locator('button:has-text("Faturalarım")')).toBeVisible();
  });

  test('should not show Ders tab for student users', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/profil/duzenle');

    // Student should see Profilim and Faturalarım but not Ders
    await expect(page.locator('button:has-text("Profilim")')).toBeVisible();
    await expect(page.locator('button:has-text("Faturalarım")')).toBeVisible();
    await expect(page.locator('button:has-text("Ders & Müsaitlik")')).not.toBeVisible();
  });

  test('should show "Kurulum Sihirbazı" badge when onboarding=true', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle?onboarding=true');

    await expect(page.locator('text=Kurulum Sihirbazı')).toBeVisible();
  });

  test('should navigate between profile sub-tabs', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle');

    // Profilim tab should be active by default
    await expect(page.locator('text=Genel Bilgiler')).toBeVisible();

    // Click Ders & Müsaitlik tab
    await page.locator('button:has-text("Ders & Müsaitlik")').click();
    await expect(page.locator('text=Öğretmenlik İlan Bilgileri')).toBeVisible();
    await expect(page.locator('text=Biyografi')).toBeVisible();

    // Click Faturalarım tab
    await page.locator('button:has-text("Faturalarım")').click();
    await expect(page.locator('text=Ödeme Geçmişi & Faturalar')).toBeVisible();
    await expect(page.locator('text=Fatura No')).toBeVisible();
  });

  test('should show password change form and validate fields', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    // Mock password change API
    await page.route(/\/api\/v1\/users\/me\/password/, async (route) => {
      const data = route.request().postDataJSON();
      expect(data.currentPassword).toBe('oldpass123');
      expect(data.newPassword).toBe('newpass456');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/profil/duzenle');

    // Click "Şifremi değiştir" button
    await page.locator('button:has-text("Şifremi değiştir")').click();

    // Password form fields should appear
    await expect(page.locator('input[placeholder="Mevcut Şifre"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Yeni Şifre"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Yeni Şifre (Tekrar)"]')).toBeVisible();

    // Fill and submit
    await page.locator('input[placeholder="Mevcut Şifre"]').fill('oldpass123');
    await page.locator('input[placeholder="Yeni Şifre"]').fill('newpass456');
    await page.locator('input[placeholder="Yeni Şifre (Tekrar)"]').fill('newpass456');

    await page.locator('button:has-text("Güncelle")').click();

    // Should show success message
    await expect(page.locator('text=Şifreniz başarıyla güncellendi ✓')).toBeVisible();
  });

  test('should display billing invoices table', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle');

    await page.locator('button:has-text("Faturalarım")').click();

    // Verify invoice rows
    await expect(page.locator('text=INV-2026-003')).toBeVisible();
    await expect(page.locator('text=INV-2026-002')).toBeVisible();
    await expect(page.locator('text=Uzman Öğretmen Aboneliği (1 Aylık)').first()).toBeVisible();
  });

  test('should display tutor subject and availability section', async ({ page }) => {
    // Mock tutor API endpoints
    await page.route(/\/api\/v1\/tutors\/me\/subjects/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ subjectId: 'sub-math', subjectName: 'Matematik', id: 'rel-1' }]) });
    });
    await page.route(/\/api\/v1\/tutors\/me\/availability/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'av-1', dayOfWeek: 1, startTime: '09:00:00', endTime: '18:00:00', isActive: true }]) });
    });

    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle');

    // Click Ders tab
    await page.locator('button:has-text("Ders & Müsaitlik")').click();

    // Should show subject buttons (Matematik selected)
    await expect(page.locator('text=Verdiğiniz Dersler')).toBeVisible();

    // Availability section
    await expect(page.locator('text=Müsaitlik Takvimi')).toBeVisible();
  });
});
