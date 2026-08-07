import { test, expect } from '@playwright/test';

// These tests only exercise the signed-out welcome/login screen, which
// renders with no API calls at all until you actually submit — so they run
// against the Vite dev server alone, no Laravel backend required.

test.describe('Welcome / sign-in screen (no backend required)', () => {
  test('shows the sign-in form for a signed-out visitor', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByPlaceholder('you@church.org')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('does not reveal any authenticated-only content before signing in', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Register New Member')).toHaveCount(0);
    await expect(page.getByText('Sign out')).toHaveCount(0);
  });

  test('"Forgot password?" with no email typed shows a hint instead of calling the API', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Forgot password?').click();
    await expect(page.getByText(/Enter your email above first/i)).toBeVisible();
  });

  test('submitting with empty fields does not fire a login request', async ({ page }) => {
    let requestFired = false;
    await page.route('**/api/v1/login', (route) => {
      requestFired = true;
      route.abort();
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Both inputs are `required`, so the browser blocks submission client-side.
    expect(requestFired).toBe(false);
  });
});
