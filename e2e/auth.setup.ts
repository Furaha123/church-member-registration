import { test as setup, expect } from '@playwright/test';
import { login, ADMIN_EMAIL, ADMIN_PASSWORD, fieldInput, checkFirstOption, authFile } from './helpers';

// Logs in once via the real UI and saves the resulting localStorage token/user
// as storageState, so register-member/member-directory/validation specs can
// start already authenticated instead of each calling /login themselves.
// Only welcome.spec.ts and login.spec.ts still exercise real logins (they're
// testing the login mechanism itself) — that keeps total /login calls per
// run comfortably under the backend's 5-per-minute-per-IP throttle
// (RateLimiter::for('login', ...) in AppServiceProvider.php).
//
// Also seeds one member if the directory is completely empty, so
// member-directory.spec.ts has something to view/edit regardless of whether
// register-member.spec.ts happened to run first.

setup('authenticate as admin', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'View All Members' }).click();
  await expect(page.getByRole('heading', { name: 'Member Directory' })).toBeVisible();

  const hasMembers = (await page.locator('.member-table tbody tr').count()) > 0;
  if (!hasMembers) {
    await page.getByRole('button', { name: 'New Member' }).click();
    await fieldInput(page, 'First Name').fill('Seed');
    await fieldInput(page, 'Last Name').fill('Member');
    await fieldInput(page, 'Gender').selectOption({ label: 'MALE' });
    await fieldInput(page, 'Marital Status').selectOption({ label: 'SINGLE' });
    await page.getByRole('button', { name: 'Next Step' }).click();

    await checkFirstOption(page, 'Talents').check();
    await checkFirstOption(page, 'Spiritual Gifts').check();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();

    await page.getByRole('button', { name: 'Submit Registration' }).click();
    await expect(page.getByRole('heading', { name: 'Seed Member' })).toBeVisible({ timeout: 10_000 });
  }

  await page.context().storageState({ path: authFile });
});
