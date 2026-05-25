# Settings smoke tests (Playwright)

Prerequisites:

- Node.js + npm/pnpm
- Install Playwright and browsers:

```bash
npm install -D @playwright/test
npx playwright install
```

Run tests:

```bash
npx playwright test e2e/tests --reporter=list
```

Notes:

- Tests assume frontend (`http://localhost:3000`) and backend API (`/api/settings`) are running and reachable.
- If selectors don't match because of UI changes, update `e2e/tests/settings-smoke.spec.ts` to target appropriate labels/selectors.
