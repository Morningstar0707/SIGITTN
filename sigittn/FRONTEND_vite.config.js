/**
 * FRONTEND — vite.config.js  (reemplaza el original)
 * Habilita PWA con Service Worker automático.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // 'autoUpdate': el SW se actualiza en segundo plano sin pedir confirmación
      registerType: 'autoUpdate',

      // Genera sw.js y manifest automáticamente
      injectRegister: 'auto',

      // Archivos a pre-cachear (generados por Vite en el build)
      workbox: {
        // Cachea el JS/CSS/HTML generado por Vite
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],

        // Cache-first para assets estáticos (logo, fuentes, íconos)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // API del backend: Network-first (datos siempre frescos, fallback a caché)
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },

      // Web App Manifest — lo que el navegador usa para "Instalar aplicación"
      manifest: {
        name: 'SIGITTN — Terminal de Neiva',
        short_name: 'SIGITTN',
        description: 'Sistema de Gestión de Infraestructura del Terminal de Transporte de Neiva',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',        // Sin barra del navegador al instalar
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          {
            // Coloca un PNG de 192×192 en public/icons/icon-192.png
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            // Coloca un PNG de 512×512 en public/icons/icon-512.png
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard de tickets',
          },
        ],
      },

      // En desarrollo muestra el SW en la consola (desactívalo si molesta)
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
