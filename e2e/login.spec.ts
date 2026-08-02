import { test, expect } from '@playwright/test';

// Unlike welcome.spec.ts, these tests need the real Laravel backend running
// (docker-compose up) and seeded so a known admin user exists:
//
//   docker-compose exec app php artisan migrate:fresh --seed
//
// which (per AdminSeeder.php + ADMIN_SEED_PASSWORD in .env.docker) creates
// bumwejaychris@gmail.com. Override E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD if
// your local setup seeds different credentials.

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'bumwejaychris@gmail.com';
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'ChangeMe123!';

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/');
  await page.getByPlaceholder('you@church.org').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test.describe('Login flow (requires a live, seeded backend)', () => {
  test('signs in with valid credentials and reaches the authenticated home screen', async ({ page }) => {
    await login(page, EMAIL, PASSWORD);

    await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Register New Member' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View All Members' })).toBeVisible();
  });

  test('shows the backend\'s error message on a wrong password', async ({ page }) => {
    await login(page, EMAIL, 'definitely-the-wrong-password');

    await expect(page.getByText(/credentials are incorrect/i)).toBeVisible({ timeout: 10_000 });
  });

  test('can sign out and land back on the sign-in screen', async ({ page }) => {
    await login(page, EMAIL, PASSWORD);
    await expect(page.getByText(/Welcome back,/)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
});
