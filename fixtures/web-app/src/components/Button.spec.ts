import { test, expect } from '@playwright/test';

test.describe('Button', () => {
  test('should load without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL('/error');
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    // TODO: Add specific accessibility checks for Button
  });
});
