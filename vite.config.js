import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/extended-fetch.ts'),
      name: 'ExtendedFetch',
      // the proper extensions will be added
      fileName: 'extended-fetch',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: [],
    },
  },
})