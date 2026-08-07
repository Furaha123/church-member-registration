# Church Member Registration

A React + TypeScript frontend for registering and managing church members — directory listing, member profiles, and a multi-section registration/edit form (personal info, education, family members, department involvement). Talks to a separate Laravel API backend for authentication and data.

## Prerequisites

- Node.js 18+
- The [church-member Laravel API backend](.) running and reachable (see Backend section below)

## Setup

```bash
npm install
```

Copy the env template and point it at your backend:

```bash
cp .env.example .env
```

`.env` sets `VITE_API_BASE_URL`, e.g.:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Running the app

```bash
npm run dev
```

This starts the Vite dev server at **http://localhost:5173**. The app requires the Laravel backend to be running at the URL configured in `VITE_API_BASE_URL` — login and the member directory both depend on it.

Other scripts:

| Command | Purpose |
|---|---|
| `npm run build` | Type-check and build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run the TypeScript compiler with no emit |

## End-to-end tests

Tests are written with [Playwright](https://playwright.dev) and cover login, registration, the member directory, and form validation.

```bash
npx playwright install   # first time only, installs browser binaries
npm run test:e2e         # headless run
npm run test:e2e:ui      # interactive UI mode
```

The Playwright config automatically starts the dev server if nothing is already listening on port 5173, and reuses it if it's already running. Tests run against the backend configured in `.env`, and the `setup` project logs in once and reuses that session across specs (the backend throttles `/login` to 5 attempts/minute/IP).

After a run, view the HTML report (includes a screenshot per test):

```bash
npx playwright show-report
```

To seed test members via the UI (useful for local testing against an empty directory):

```bash
npm run seed:members -- <count>
```

## Backend

This repo is frontend-only. It expects a Laravel API exposing routes under `/api/v1` (see `.env.example`) for authentication (`auth:sanctum`) and member CRUD. Run that API separately before starting this app.
