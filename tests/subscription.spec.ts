import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './mocks';

test.describe('Free First Release Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page);
  });

  test('should clearly state that the platform is free', async ({ page }) => {
    await page.goto('/abonelik');
    await expect(page.getByRole('heading', { name: 'Herkes için ücretsiz' })).toBeVisible();
    await expect(page.getByText('Ücretsiz platform erişimi')).toBeVisible();
    await expect(page.getByText('Platform içi ödeme yok')).toBeVisible();
  });

  test('should explain direct lesson fee arrangements', async ({ page }) => {
    await page.goto('/abonelik');
    await expect(page.getByText(/Ders ücreti, ödeme zamanı ve yöntemi/)).toBeVisible();
    await expect(page.getByText(/tarafı, emanetçisi veya garantörü değildir/)).toBeVisible();
  });

  test('should expose no purchase or subscribe action', async ({ page }) => {
    await page.goto('/abonelik');
    await expect(page.getByRole('button', { name: /Abone Ol|Satın Al|Ödeme Yap/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Öğretmenleri keşfet' })).toBeVisible();
  });
});
