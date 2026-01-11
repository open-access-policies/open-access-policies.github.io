import { defineConfig, devices } from '@playwright/test';

/**
 * Persona-driven Playwright configuration for Open Access Policies site.
 *
 * Tests run against local Jekyll development server by default.
 * To test against production, change baseURL to 'https://openaccesspolicies.org'
 */
export default defineConfig({
  testDir: './tests/personas',

  // Run tests serially within each file (simulates continuous user session)
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Single worker to ensure persona tests run in sequence
  workers: 1,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Local Jekyll development server
    baseURL: process.env.TEST_URL || 'http://localhost:4000',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'on',

    // Video on failure
    video: 'on-first-retry',

    // Default timeout for actions
    actionTimeout: 10000,

    // Default timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports for Priya persona
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Local dev server configuration (optional - start Jekyll before tests)
  // Uncomment if you want Playwright to start the server automatically:
  // webServer: {
  //   command: 'bundle exec jekyll serve',
  //   url: 'http://localhost:4000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  // Output directory for test artifacts
  outputDir: 'tests/results/artifacts',

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },
});
