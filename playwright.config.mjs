import { defineConfig } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL || 'http://127.0.0.1:4175';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL,
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure'
  },
  webServer: externalBaseURL ? undefined : {
    command: 'node tests/static-server.mjs',
    url: 'http://127.0.0.1:4175/admin.html',
    reuseExistingServer: true,
    timeout: 15_000
  }
});
