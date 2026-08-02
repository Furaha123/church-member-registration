import { test, expect } from '@playwright/test';
import { fieldInput, checkFirstOption } from './helpers';

// Runs in the 'chromium-authenticated' project (reuses the storageState from
// e2e/auth.setup.ts). Never actually submits — purely exercises the frontend
// mobile-number validation added alongside the fax_number cleanup.

test.describe('Mobile number validation (requires a live, seeded backend)', () => {
  test('rejects letters in the mobile number and blocks submission', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Register New Member' }).click();
    await fieldInput(page, 'First Name').fill('Validation');
    await fieldInput(page, 'Last Name').fill('Test');
    await fieldInput(page, 'Gender').selectOption({ label: 'MALE' });
    await fieldInput(page, 'Marital Status').selectOption({ label: 'SINGLE' });
    await page.getByRole('button', { name: 'Next Step' }).click();

    await checkFirstOption(page, 'Talents').check();
    await checkFirstOption(page, 'Spiritual Gifts').check();
    await page.getByRole('button', { name: 'Next Step' }).click();

    await fieldInput(page, 'Mobile Telephone').fill('Culpa ut similique');
    await expect(page.getByText(/Numbers only/i)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/validation-01-mobile-error.png', fullPage: true });

    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible();

    // Submit stays disabled and the review screen explains why.
    await expect(page.getByRole('button', { name: 'Submit Registration' })).toBeDisabled();
    await expect(page.getByText(/numbers only/i)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/validation-02-review-blocked.png', fullPage: true });

    // Fixing it with a real phone number clears the block.
    await page.getByRole('button', { name: '← Previous' }).click();
    await fieldInput(page, 'Mobile Telephone').fill('0788123456');
    await expect(page.getByText(/Numbers only/i)).toHaveCount(0);
    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(page.getByRole('button', { name: 'Submit Registration' })).toBeEnabled();
    await page.screenshot({ path: 'e2e/screenshots/validation-03-review-fixed.png', fullPage: true });
  });
});
