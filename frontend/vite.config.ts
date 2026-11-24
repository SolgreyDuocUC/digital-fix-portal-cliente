import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Proxies de desarrollo:
 *
 *  /api/v1        → backend portal (8091)  — auth, usuarios, pedidos/checkout, cupones
 *  /ms-catalog    → ms-catalog  (8088)     — catálogo de repuestos y servicios (consulta directa)
 *
 * En producción se usan las variables VITE_API_URL, VITE_MS_CATALOG_URL.
 */
const proxy = {
  '/api/v1': {
    target: process.env.VITE_PROXY_BACKEND ?? 'http://localhost:8091',
    changeOrigin: true,
  },
  '/ms-catalog': {
    target: process.env.VITE_PROXY_MS_CATALOG ?? 'http://localhost:8088',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/ms-catalog/, ''),
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
