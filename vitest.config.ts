/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/global-setup.mjs',
    browser: {
      enabled: true,
      name: 'chrome',
    },
  },
})
