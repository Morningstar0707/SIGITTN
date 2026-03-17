import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // Actualiza el SW en segundo plano sin interrumpir al usuario
      registerType: 'autoUpdate',

      // Inyectar el script de registro automáticamente en index.html
      injectRegister: 'auto',

      // Archivos que el SW pre-cachea en el build
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],

      workbox: {
        // Pre-cachear todo el bundle generado por Vite
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],

        // Estrategia para llamadas a la API del backend
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
              networkTimeoutSeconds: 10,
            },
          },
        ],

        // Evitar errores de navegación offline
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },

      // Web App Manifest — define cómo se ve la app al instalarla
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
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Activa el SW también en desarrollo (para probar)
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
