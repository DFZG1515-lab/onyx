import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Onyx',
        short_name: 'Onyx',
        description: '¿Me alcanza? Control de gastos por quincena, con meses sin intereses.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F1F2F0',
        theme_color: '#F1F2F0',
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Nuevo gasto', short_name: 'Nuevo gasto', url: '/?nuevo=1', icons: [{ src: '/icono-192.png', sizes: '192x192', type: 'image/png' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        // Los íconos del manifest ya entran al precache por su cuenta.
        globIgnores: ['**/icono-*.png'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    // Vitest vacía los imports de CSS; tokens.css se lee como texto en su prueba de contraste.
    css: { include: [/tokens\.css/] },
  },
})
