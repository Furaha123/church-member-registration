import { test, expect } from '@playwright/test';
import { login } from './helpers';

// Needs the live, seeded backend. Some assertions are skipped gracefully if
// the directory happens to be empty (e.g. a completely fresh database before
// register-member.spec.ts has ever run).

test.describe('Member directory (requires a live, seeded backend)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'View All Members' }).click();
    await expect(page.getByRole('heading', { name: 'Member Directory' })).toBeVisible();
  });

  test('lists members and search narrows / clears results', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/directory-01-list.png', fullPage: true });

    const searchBox = page.getByPlaceholder(/Search by name/i);
    await searchBox.fill('zzzz-no-such-member-zzzz');
    await expect(page.getByText('No members match your search.')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/directory-02-empty-search.png', fullPage: true });

    await searchBox.fill('');
    await expect(page.getByText('No members match your search.')).toHaveCount(0);
  });

  test('can open a member profile and navigate back to the directory', async ({ page }) => {
    const rows = page.locator('.member-table tbody tr');
    const count = await rows.count();
    test.skip(count === 0, 'No members registered yet to view');

    await rows.first().getByTitle('View details').click();
    await expect(page.getByRole('button', { name: '← Back to Members' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/directory-03-profile.png', fullPage: true });

    await page.getByRole('button', { name: '← Back to Members' }).click();
    await expect(page.getByRole('heading', { name: 'Member Directory' })).toBeVisible();
  });

  test('can open a member in edit mode with fields pre-filled', async ({ page }) => {
    const rows = page.locator('.member-table tbody tr');
    const count = await rows.count();
    test.skip(count === 0, 'No members registered yet to edit');

    const firstRowName = await rows.first().locator('.member-cell .name').innerText();
    await rows.first().getByTitle('Edit member').click();

    await expect(page.getByRole('heading', { name: 'Update Member' })).toBeVisible();
    // First/last name inputs should already contain the existing member's name.
    await expect(page.locator('.field').filter({ hasText: 'First Name' }).locator('input')).toHaveValue(
      firstRowName.split(' ')[0],
    );
    await page.screenshot({ path: 'e2e/screenshots/directory-04-edit.png', fullPage: true });
  });
});
