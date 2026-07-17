import { test, expect } from '@playwright/test';
import { mockTutor, setupDefaultMocks } from './mocks';

test.describe('Create Listing Wizard (6-Step Tutor Listing Creation)', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);

    // Tutor Login
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-tutor-access-token');
      localStorage.setItem('refreshToken', 'mock-tutor-refresh-token');
    }, { user: mockTutor });

    // Mock listing creation POST
    await page.route(/\/api\/v1\/tutors\/me\/listings/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'list-new-1',
            tutorId: 'user-tutor-1',
            subjectId: 'sub-math',
            title: 'Matematik Özel Ders İlanı',
            status: 'ACTIVE',
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });
  });

  test('should display step 1 (subject selection) with available subjects', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');

    await expect(page.locator('h1')).toContainText('Hangi alanda ders vermek istiyorsunuz?');
    await expect(page.locator('text=Matematik')).toBeVisible();
    await expect(page.locator('text=İngilizce')).toBeVisible();
    await expect(page.locator('text=Yazılım')).toBeVisible();
    await expect(page.locator('text=Fizik')).toBeVisible();
    await expect(page.locator('text=Adım 1 / 6')).toBeVisible();
  });

  test('should navigate through steps 1-2 (select subject -> lesson details)', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');

    // Step 1: Click Matematik
    await page.locator('button:has-text("Matematik")').first().click();

    // Should auto-advance to step 2
    await expect(page.locator('text=Adım 2 / 6')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dersler Hakkında' })).toBeVisible();
    await expect(page.locator('input[placeholder*="Boğaziçi"]')).toHaveValue('Matematik Özel Ders İlanı');
  });

  test('should validate word count on step 2 (lesson description)', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');
    await page.locator('button:has-text("Matematik")').first().click();

    // Click "İleri" without filling description
    await page.locator('button:has-text("İleri")').click();

    // Should show word count validation (less than 50 words)
    const wordCount = page.locator('text=/0 \\/ 50 Kelime/');
    await expect(wordCount).toBeVisible();
  });

  test('should complete all 6 steps and publish listing successfully', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');

    // Step 1: Select subject
    await page.locator('button:has-text("Matematik")').first().click();

    // Step 2: Fill lesson details (need 50+ words)
    await page.locator('textarea').first().fill(
      'Herkese merhaba, ben matematik öğretmeniyim. ' +
      'Derslerimde öğrencilerin seviyesine göre özel bir program uyguluyorum. ' +
      'Her öğrencinin öğrenme hızı farklıdır ve ben buna saygı duyarım. ' +
      'Amacım matematiği sevdirmek ve öğrencilerin başarısını artırmaktır. ' +
      'Yıllardır bu işi yapıyorum ve çok deneyimliyim. Konuları bol örnekle pekiştiriyor, ' +
      'düzenli gelişim takibi yapıyorum. Öğrenmeyi birlikte kolaylaştırıyoruz. Haydi gelin birlikte çalışalım!'
    );
    await page.locator('button:has-text("İleri")').click();

    // Step 3: Fill about tutor
    await expect(page.locator('text=Adım 3 / 6')).toBeVisible();
    await page.locator('textarea').first().fill(
      'Boğaziçi Üniversitesi Matematik Bölümü mezunuyum. ' +
      '10 yıldır özel ders veriyorum ve yüzlerce öğrenci yetiştirdim. ' +
      'LGS, YKS ve TYT gibi sınavlarda uzmanım. ' +
      'Öğrencilerimle birebir ilgilenir ve her ders sonunda ödev veririm. ' +
      'Sabırlı ve anlayışlı bir öğretmenim. Her öğrencinin güçlü yönlerine göre çalışma ' +
      'planı hazırlıyor ve ilerlemeyi düzenli olarak değerlendiriyorum. Referanslarımı görmekten çekinmeyin!'
    );
    await page.locator('button:has-text("İleri")').click();

    // Step 4: Select formats
    await expect(page.locator('text=Adım 4 / 6')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dersin Verileceği Yer' })).toBeVisible();
    // Online is already checked, now also check tutor home
    await page.getByText('Evinizde', { exact: true }).click();
    await page.locator('button:has-text("İleri")').click();

    // Step 5: Select languages
    await expect(page.locator('text=Adım 5 / 6')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Konuşulan Diller' })).toBeVisible();
    await page.getByText('İngilizce', { exact: true }).click();
    await page.locator('button:has-text("İleri")').click();

    // Step 6: Set hourly rate and publish
    await expect(page.locator('text=Adım 6 / 6')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Saatlik Ücret' })).toBeVisible();
    const rateInput = page.locator('input[type="number"]');
    await rateInput.fill('600');
    await page.locator('button:has-text("İlanı Yayınla")').click();

    // Should show success screen
    await expect(page.locator('text=Tebrikler! İlanınız Yayında')).toBeVisible();
    await expect(page.locator('text=Panele Git')).toBeVisible();
  });

  test('should validate contact info is not shared in description', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');
    await page.locator('button:has-text("Matematik")').first().click();

    // Fill with email in description
    const longText = 'A'.repeat(300);
    await page.locator('textarea').first().fill(`Benim email adresim: test@example.com. ${longText}`);
    await page.locator('button:has-text("İleri")').click();

    // Should not advance to step 3 since contact info detected
    await expect(page.locator('text=Adım 2 / 6')).toBeVisible();
  });

  test('should allow going back to previous steps', async ({ page }) => {
    await page.goto('/ogretmen/ilan-olustur');
    await page.locator('button:has-text("Matematik")').first().click();
    await expect(page.locator('text=Adım 2 / 6')).toBeVisible();

    // Click "Geri" button
    await page.locator('button:has-text("Geri")').click();
    await expect(page.locator('text=Adım 1 / 6')).toBeVisible();
  });
});
