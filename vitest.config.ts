/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { getDevCert } from './test/dev-cert.mjs'

// Serve the test page over HTTPS so `Secure` cookies and other origin-bound
// features behave the same way they would in production. The mock server uses
// the same self-signed cert; Playwright contexts trust it because the
// provider forces `ignoreHTTPSErrors: true` for all browsers.
const devCert = await getDevCert()

export default defineConfig({
  server: {
    https: devCert,
  },
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