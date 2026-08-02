import type { Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'bumwejaychris@gmail.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'ChangeMe123!';

export async function login(page: Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD): Promise<void> {
  await page.goto('/');
  await page.getByPlaceholder('you@church.org').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

/**
 * MemberForm's <Field> renders a plain <label> as a sibling of its input/select
 * (not wrapping it, no htmlFor/id), so there's no accessible-name association
 * for getByLabel() to use. This locates the surrounding `.field` block by its
 * visible label text instead and returns the input/select inside it.
 */
export function fieldInput(page: Page, label: string) {
  return page.locator('.field').filter({ hasText: label }).locator('input, select').first();
}

/** Checks the first option in a MultiSelectChecklist (Talents, Spiritual Gifts, Occupations). */
export function checkFirstOption(page: Page, checklistLabel: string) {
  return page.locator('.field').filter({ hasText: checklistLabel }).first().locator('input[type="checkbox"]').first();
}
