// Bulk-create members through the real UI — not a Playwright *test* (no
// .spec/.test suffix, so `npm run test:e2e` never picks this up), just a
// standalone script that drives a browser the same way the tests do.
//
// Usage:
//   npm run seed:members -- 10
//   HEADED=1 npm run seed:members -- 3   # watch it happen in a real window
//
// Reuses the session saved by `npx playwright test --project=setup` if
// present (e2e/.auth/admin.json); otherwise logs in for real first.

import * as fs from 'node:fs';
import { chromium } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, authFile, checkFirstOption, fieldInput, login } from './helpers';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const COUNT = Number(process.argv[2] ?? 5);

const FIRST_NAMES = ['Jean', 'Marie', 'Eric', 'Alice', 'Emmanuel', 'Claudine', 'Patrick', 'Grace', 'Samuel', 'Diane'];
const LAST_NAMES = ['Uwase', 'Mugisha', 'Ingabire', 'Niyonzima', 'Umutoni', 'Habimana', 'Mukamana', 'Nkurunziza'];
const GENDERS = ['MALE', 'FEMALE'];
const MARITAL_STATUSES = ['SINGLE', 'MARRIED', 'ENGAGED', 'WIDOWED', 'DIVORCED'];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randomPhone(): string {
  const prefix = pick(['078', '079', '072', '073']);
  const rest = Math.floor(1_000_000 + Math.random() * 8_999_999);
  return `${prefix}${rest}`;
}

async function main(): Promise<void> {
  if (!Number.isFinite(COUNT) || COUNT < 1) {
    console.error('Usage: npm run seed:members -- <count>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
  const hasSavedSession = fs.existsSync(authFile);
  const context = hasSavedSession ? await browser.newContext({ storageState: authFile }) : await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);
  if (!hasSavedSession) {
    console.log(`No saved session found (${authFile}) — signing in as ${ADMIN_EMAIL}`);
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  }
  await page.getByText(/Welcome back,/).waitFor({ timeout: 10_000 });

  for (let i = 1; i <= COUNT; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);

    await page.getByRole('button', { name: 'Register New Member' }).click();

    await fieldInput(page, 'First Name').fill(firstName);
    await fieldInput(page, 'Last Name').fill(lastName);
    await fieldInput(page, 'Gender').selectOption({ label: pick(GENDERS) });
    await fieldInput(page, 'Marital Status').selectOption({ label: pick(MARITAL_STATUSES) });
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Talents + spiritual gifts are required; just take whatever's first.
    await checkFirstOption(page, 'Talents').check();
    await checkFirstOption(page, 'Spiritual Gifts').check();
    await page.getByRole('button', { name: 'Next Step' }).click();

    await fieldInput(page, 'Mobile Telephone').fill(randomPhone());
    await page.getByRole('button', { name: 'Next Step' }).click();

    await page.getByRole('button', { name: 'Submit Registration' }).click();
    await page.getByRole('heading', { name: `${firstName} ${lastName}` }).waitFor({ timeout: 10_000 });
    console.log(`[${i}/${COUNT}] Created ${firstName} ${lastName}`);

    await page.getByRole('button', { name: '← Back to Members' }).click();
  }

  await browser.close();
  console.log(`Done — created ${COUNT} member(s).`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
