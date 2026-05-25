import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    actionTimeout: 10000,
  },
});
