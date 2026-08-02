import { defineConfig, devices } from '@playwright/test';
import { authFile } from './e2e/helpers';

// Same port Vite's dev server uses by default (see vite.config.ts) — override
// with PORT if you run the dev server elsewhere.
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Every test gets a screenshot attached to the HTML report (not just
    // failures) — run `npx playwright show-report` after a run to view them.
    screenshot: 'on',
  },

  projects: [
    // Logs in once (and seeds one member if the directory is empty), saving
    // storageState for the 'authenticated' project below.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // welcome.spec.ts and login.spec.ts are testing the sign-in mechanism
    // itself, so they intentionally start signed out and log in for real.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /(welcome|login)\.spec\.ts/,
    },

    // Everything else just needs to *be* signed in, so it reuses the
    // storageState from 'setup' instead of calling /login again — the
    // backend throttles /login to 5 attempts/minute/IP, which running every
    // spec's own login concurrently blew straight through.
    {
      name: 'chromium-authenticated',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      testMatch: /(register-member|member-directory|validation)\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],

  // Starts `npm run dev` automatically if nothing is already listening on
  // BASE_URL, and reuses your already-running dev server otherwise (the
  // common case while you're actively developing against it).
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
