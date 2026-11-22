import { expect, test } from '@playwright/test';

test('home shows the main sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gia phả' })).toBeVisible();
  await expect(page.getByTestId('home-tree')).toContainText('Cây gia phả');
  await expect(page.getByTestId('home-calendar')).toContainText('Lịch âm dương');
  await expect(page.getByTestId('home-invite')).toBeVisible();
});

test('large text setting is remembered after reload', async ({ page }) => {
  await page.goto('/#/settings');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-bigtext', '0');
  await page
    .locator('.setting-row', { hasText: 'Chữ to' })
    .getByRole('button', { name: 'Bật' })
    .click();
  await expect(root).toHaveAttribute('data-bigtext', '1');
  await page.reload();
  await expect(root).toHaveAttribute('data-bigtext', '1');
});

test('language switch to English and back', async ({ page }) => {
  await page.goto('/#/settings');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Tiếng Việt' }).click();
  await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
});

test('tapping the title 5 times opens the error log', async ({ page }) => {
  await page.goto('/');
  const title = page.getByRole('heading', { name: 'Gia phả' });
  for (let i = 0; i < 5; i++) await title.click();
  await expect(page.locator('.log-view')).toContainText('[nav] route');
});
