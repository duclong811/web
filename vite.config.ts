import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      ignored: ['**/.vs/**', '**/backend/**'],
    },
  },
})
