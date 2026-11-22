import { expect, test } from '@playwright/test';

test('first open: invites to open a link or create a family', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gia phả' })).toBeVisible();
  await expect(page.getByTestId('family-status')).toContainText('mở link');
  await expect(page.getByTestId('home-new-family')).toBeVisible();
  await page.getByTestId('home-new-family').click();
  await expect(page.getByText('Cần đăng nhập Google')).toBeVisible();
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

test('settings offers Google sign-in for admins', async ({ page }) => {
  await page.goto('/#/settings');
  await expect(page.getByTestId('account')).toContainText('Quản trị gia phả');
  await expect(page.getByTestId('sign-in-google')).toBeEnabled();
});
