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

    // Billing is intentionally absent in the free first release.
    await expect(page.locator('button:has-text("Profilim")')).toBeVisible();
    await expect(page.locator('button:has-text("Ders & Müsaitlik")')).toBeVisible();
    await expect(page.locator('button:has-text("Faturalarım")')).not.toBeVisible();
  });

  test('renders the authoritative completion score and never claims optional verification', async ({ page }) => {
    const partialTutor = {
      ...mockTutor,
      identityVerified: false,
      profileComplete: false,
      profileCompletionScore: 70,
      profileCompletion: {
        ...mockTutor.profileCompletion,
        score: 70,
        complete: false,
        completedItems: 7,
        items: mockTutor.profileCompletion.items.map((item) => (
          ['avatarUrl', 'activeListing', 'availability'].includes(item.key)
            ? { ...item, completed: false }
            : item
        )),
      },
    };
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
    }, { user: partialTutor });

    await page.goto('/profil/duzenle');

    await expect(page.getByTestId('profile-completion-score')).toHaveText('%70');
    await expect(page.getByRole('progressbar', { name: 'Profil tamamlanma yüzdesi' })).toHaveAttribute('aria-valuenow', '70');
    await expect(page.getByText('Haftalık müsaitlik', { exact: true })).toBeVisible();
    await expect(page.getByText('Kimlik onaylandı', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Diploma onaylandı', { exact: true })).toHaveCount(0);
    await expect(page.getByText('İsteğe bağlı doğrulamayı başlat', { exact: true })).toBeVisible();
  });

  test('should not show Ders tab for student users', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-student-access-token');
      localStorage.setItem('refreshToken', 'mock-student-refresh-token');
    }, { user: mockStudent });

    await page.goto('/profil/duzenle');

    // Student only sees profile settings.
    await expect(page.locator('button:has-text("Profilim")')).toBeVisible();
    await expect(page.locator('button:has-text("Faturalarım")')).not.toBeVisible();
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

    await page.locator('button:has-text("Profilim")').click();
    await expect(page.locator('text=Genel Bilgiler')).toBeVisible();
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

  test('should not display billing or invoice UI in free release', async ({ page }) => {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    await page.goto('/profil/duzenle');

    await expect(page.locator('button:has-text("Faturalarım")')).not.toBeVisible();
    await expect(page.locator('text=Ödeme Geçmişi & Faturalar')).not.toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Haftalık Müsaitlik' })).toBeVisible();
  });

  test('uploads, renders and removes a same-origin profile photo', async ({ page }) => {
    const avatarUrl = '/storage/dersplatform-public/avatars/11111111-1111-1111-1111-111111111111.png';
    const tutorWithoutAvatar = { ...mockTutor, avatarUrl: undefined };
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zlq8AAAAASUVORK5CYII=',
      'base64',
    );
    let uploadCalled = false;
    let removeCalled = false;

    await page.route(/\/api\/v1\/users\/me\/avatar$/, async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        uploadCalled = true;
        expect(route.request().headers()['content-type']).toContain('multipart/form-data; boundary=');
        expect(route.request().postDataBuffer()?.toString('latin1')).toContain('avatar.png');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...tutorWithoutAvatar, avatarUrl }),
        });
        return;
      }
      if (method === 'DELETE') {
        removeCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(tutorWithoutAvatar),
        });
        return;
      }
      await route.abort();
    });
    await page.route(`**${avatarUrl}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'image/png', body: png });
    });
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: tutorWithoutAvatar });

    await page.goto('/profil/duzenle');
    const profilePhotoCard = page.getByRole('heading', { name: 'Profil Resmi' }).locator('..');
    await profilePhotoCard.getByLabel('Profil fotoğrafı seç').setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: png,
    });

    const renderedAvatar = profilePhotoCard.getByRole('img', { name: 'Selim Hoca' });
    await expect(renderedAvatar).toHaveAttribute('src', avatarUrl);
    await expect.poll(() => renderedAvatar.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(uploadCalled).toBe(true);

    page.once('dialog', (dialog) => dialog.accept());
    await profilePhotoCard.getByRole('button', { name: 'Fotoğrafı kaldır' }).click();
    await expect(renderedAvatar).toHaveCount(0);
    expect(removeCalled).toBe(true);
  });
});
