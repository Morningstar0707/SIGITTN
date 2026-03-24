import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // ── Usar sw.js personalizado con handler de push ──────────────
      strategies:   'injectManifest',
      srcDir:       'src',
      filename:     'sw.js',
      // ─────────────────────────────────────────────────────────────

      registerType: 'autoUpdate',
      injectRegister: 'auto',

      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],

      // Configuración para injectManifest (equivale al workbox anterior)
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
      },

      manifest: {
        name: 'SIGITTN — Terminal de Neiva',
        short_name: 'SIGITTN',
        description: 'Sistema de Gestión de Infraestructura del Terminal de Transporte de Neiva',
        theme_color: '#0b1526',
        background_color: '#0b1526',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  preview: {
    host: true,
    allowedHosts: ['sigrid-catalectic-trappedly.ngrok-free.dev'],
  },
})