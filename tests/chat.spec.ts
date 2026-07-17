import { test, expect } from '@playwright/test';
import { mockStudent, mockTutor, mockMessages, setupDefaultMocks } from './mocks';

test.describe('Messaging / Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept standard static API requests
    await setupDefaultMocks(page);

    // Mock Login by setting local storage directly
    await page.addInitScript(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    }, { user: mockStudent });
  });

  test('should display empty state when there are no conversations', async ({ page }) => {
    await page.route('**/api/v1/messages/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/mesajlar');

    // Verify empty state messages
    await expect(page.locator('text=Henüz mesajınız yok')).toBeVisible();
    await expect(page.locator('text=Bir konuşma seçin veya yeni bir mesaj başlatın')).toBeVisible();
  });

  test('should load conversations, show unread badge, and display message history upon click', async ({ page }) => {
    await page.route('**/api/v1/messages/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'msg-unread-1',
            senderId: 'user-tutor-1',
            senderName: 'Selim Hoca',
            receiverId: 'user-student-1',
            receiverName: 'Ahmet Öğrenci',
            content: 'Önümüzdeki Salı günü ders yapabiliriz.',
            messageType: 'TEXT',
            read: false,
            createdAt: '2026-07-02T10:00:00Z',
          }
        ]),
      });
    });

    // Mock conversation detail fetch
    await page.route('**/api/v1/messages?with=user-tutor-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMessages),
      });
    });

    await page.goto('/mesajlar');

    // Verify conversation list item for Selim Hoca is shown
    const convItem = page.locator('button:has-text("Selim Hoca")');
    await expect(convItem).toBeVisible();
    await expect(convItem.locator('text=Önümüzdeki Salı günü ders yapabiliriz.')).toBeVisible();

    // Verify unread badge count is displayed (value should be 1)
    const badge = convItem.locator('span.bg-primary');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');

    // Click on the conversation
    await convItem.click();

    // The chat list should fetch & display history
    await expect(page.locator('text=Merhaba hocam, Matematik dersi almak istiyorum.')).toBeVisible();
    await expect(page.locator('text=Merhaba Ahmet, tabii ki yardımcı olabilirim.')).toBeVisible();
  });

  test('should handle sending messages and update chat list optimistically', async ({ page }) => {
    await page.route('**/api/v1/messages/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMessages),
      });
    });

    // Mock conversation detail fetch
    await page.route('**/api/v1/messages?with=user-tutor-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMessages),
      });
    });

    await page.goto('/mesajlar');

    // Open conversation
    await page.locator('button:has-text("Selim Hoca")').click();

    // Check input and send button
    const chatInput = page.locator('input[placeholder="Mesaj yazın..."]');
    const sendButton = page.locator('button:has(svg.lucide-send)');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeDisabled();

    // Type a message
    await chatInput.fill('Harika hocam, talebi gönderdim!');
    await expect(sendButton).toBeEnabled();

    // Press enter or click send
    await chatInput.press('Enter');

    // Optimistic UI updates should render the message in the chat immediately
    await expect(page.locator('.max-w-\\[75\\%\\]:has-text("Harika hocam, talebi gönderdim!")').first()).toBeVisible();

    // Input field should be cleared
    await expect(chatInput).toHaveValue('');

    // Last message preview in conversation list should update
    const convItem = page.locator('button:has-text("Selim Hoca")');
    await expect(convItem.locator('text=Harika hocam, talebi gönderdim!')).toBeVisible();
  });

  test('should support starting a new conversation via user search', async ({ page }) => {
    await page.route('**/api/v1/messages/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Mock user search
    await page.route('**/api/v1/users?q=Elif', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user-tutor-2',
            email: 'elif@test.com',
            fullName: 'Elif Hoca',
            role: 'TUTOR',
            phone: '5552223344',
            verified: true,
            profileComplete: true,
            identityVerified: true,
          }
        ]),
      });
    });

    await page.goto('/mesajlar');

    // Click UserPlus icon to toggle search mode
    const searchToggleButton = page.locator('button:has(svg.lucide-user-plus)');
    await searchToggleButton.click();

    // Input placeholder should change to "Kullanıcı ara..."
    const searchInput = page.locator('input[placeholder="Kullanıcı ara..."]');
    await expect(searchInput).toBeVisible();

    // Search for "Elif"
    await searchInput.fill('Elif');

    // Results dropdown item should appear
    const searchResultItem = page.locator('button:has-text("Elif Hoca")');
    await expect(searchResultItem).toBeVisible();
    await expect(searchResultItem.locator('text=Öğretmen')).toBeVisible();

    // Click the result to start conversation
    await searchResultItem.click();

    // Check that conversation header loads Elif Hoca
    await expect(page.locator('div.font-medium.text-foreground.text-sm:has-text("Elif Hoca")')).toBeVisible();
    await expect(page.locator('text=Henüz mesaj yok. İlk mesajı gönderin!')).toBeVisible();
  });
});
