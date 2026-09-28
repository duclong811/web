import { expect, test } from '@playwright/test';

test('guest can open the landing page without authentication', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AI-SMARTSERVE|Handcrafted Menu/i);
  await expect(page.locator('body')).toBeVisible();
});

test('protected admin route redirects an anonymous user to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
