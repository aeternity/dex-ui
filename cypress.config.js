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
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
  viewportHeight: 800,
  viewportWidth: 400,
  defaultCommandTimeout: 20000,
});
