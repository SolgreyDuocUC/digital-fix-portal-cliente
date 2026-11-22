import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// El navegador solo habla con el backend del portal; este a su vez consulta ms-catalog y ms-workorders.
const proxy = {
  '/api/v1': {
    target: process.env.VITE_PROXY_BACKEND ?? 'http://localhost:8090',
    changeOrigin: true,
  },
}

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
    proxy,
  },
  preview: {
    proxy,
  },
})