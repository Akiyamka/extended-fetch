/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: './test/global-setup.mjs',
    browser: {
      enabled: true,
      headless: true,
      screenshotFailures: false,
      // Pin the dev-server port so the browser's origin matches the CORS
      // allow-list baked into the mock server (`TEST_SRV_HOST` in constants.json).
      api: { port: 5173 },
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
    coverage: {
      provider: 'istanbul',
    },
  },
})