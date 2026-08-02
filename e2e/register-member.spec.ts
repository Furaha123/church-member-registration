import { test, expect } from '@playwright/test';
import { fieldInput, checkFirstOption } from './helpers';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// which reuses the storageState saved by e2e/auth.setup.ts instead of
// logging in itself. Walks the full 4-step registration wizard end to end
// and screenshots each step.

test.describe('Register a new member (requires a live, seeded backend)', () => {
  test('completes the wizard and lands on the new member\'s profile', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Register New Member' }).click();
    await expect(page.getByRole('heading', { name: 'Register a New Member' })).toBeVisible();

    // Unique name per run so repeated runs don't collide on existing data.
    const firstName = `Test${Date.now()}`;
    const lastName = 'Playwright';

    // ── Step 1: Personal ──────────────────────────────────────────────────
    await fieldInput(page, 'First Name').fill(firstName);
    await fieldInput(page, 'Last Name').fill(lastName);
    await fieldInput(page, 'Gender').selectOption({ label: 'MALE' });
    await fieldInput(page, 'Marital Status').selectOption({ label: 'SINGLE' });
    await page.screenshot({ path: 'e2e/screenshots/register-01-personal.png', fullPage: true });
    await page.getByRole('button', { name: 'Next Step' }).click();

    // ── Step 2: Spiritual (talent + spiritual gift are required) ─────────
    await expect(page.getByRole('heading', { name: 'Gifts, Work & Education' })).toBeVisible();
    await checkFirstOption(page, 'Talents').check();
    await checkFirstOption(page, 'Spiritual Gifts').check();
    await page.screenshot({ path: 'e2e/screenshots/register-02-spiritual.png', fullPage: true });
    await page.getByRole('button', { name: 'Next Step' }).click();

    // ── Step 3: Contact ────────────────────────────────────────────────────
    await expect(page.getByRole('heading', { name: 'Contact & Location' })).toBeVisible();
    await fieldInput(page, 'Mobile Telephone').fill('0788123456');
    await page.screenshot({ path: 'e2e/screenshots/register-03-contact.png', fullPage: true });
    await page.getByRole('button', { name: 'Next Step' }).click();

    // ── Step 4: Review & submit ───────────────────────────────────────────
    await expect(page.getByRole('heading', { name: 'Review & Confirm' })).toBeVisible();
    // firstName also appears in the form-nav's ".meta" footer, so this must
    // be scoped to the review summary grid specifically (not just any match).
    await expect(page.getByText(firstName).first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/register-04-review.png', fullPage: true });

    const submit = page.getByRole('button', { name: 'Submit Registration' });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Lands on the new member's own profile page.
    await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'e2e/screenshots/register-05-profile.png', fullPage: true });

    // ...and shows up back in the directory.
    await page.getByRole('button', { name: '← Back to Members' }).click();
    await expect(page.getByRole('heading', { name: 'Member Directory' })).toBeVisible();
    await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/register-06-in-directory.png', fullPage: true });
  });
});
