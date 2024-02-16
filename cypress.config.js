import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    supportFile: 'tests/e2e/support/index.js',
    chromeWebSecurity: false,
    screenshotOnRunFailure: false,
    video: false,
  },
});
