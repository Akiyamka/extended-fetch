import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/extended-fetch.ts'),
      name: 'ExtendedFetch',
      formats: ['es'],
      fileName: 'extended-fetch',
      sourcemap: true,
      // Reduce bloat from legacy polyfills.
      target: 'esnext',
      // Leave minification up to applications.
      minify: false,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: [],
    },
  },
  plugins: [dts()],
})
