import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Every file starts Payload, and a schema push is not safe to run twice at once.
    fileParallelism: false,
    // Starting Payload takes longer than the default 10 s on a CI machine.
    hookTimeout: 60_000,
  },
})
