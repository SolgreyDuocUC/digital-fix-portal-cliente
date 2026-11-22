import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/catalog': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/api/workorders': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/ordenes-trabajo': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
})