import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { apiFalsa } from './mock/pluginApiFalsa.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const modoMock = mode === 'mock'
  return {
    plugins: [react(), tailwindcss(), ...(modoMock ? [apiFalsa()] : [])],
    server: modoMock
      ? {}
      : {
          proxy: {
            '/api': 'http://localhost:8080',
          },
        },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/teste/setup.ts'],
      css: false,
    },
  }
})
