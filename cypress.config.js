import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:5173',
    supportFile: 'tests/e2e/support/index.js',
  },
  chromeWebSecurity: false,
  video: false,
  screenshotOnRunFailure: false,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  viewportHeight: 667,
  viewportWidth: 375,
});
