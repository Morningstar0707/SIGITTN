import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import { VitePWA }      from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest → usamos nuestro sw.js personalizado
      // (el plugin inyecta el precache manifest en self.__WB_MANIFEST)
      strategies: 'injectManifest',
      srcDir:     'src',
      filename:   'sw.js',

      registerType: 'autoUpdate',

      // Workbox config para injectManifest
      injectManifest: {
        // Archivos que Workbox precacheará automáticamente
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },

      // Manifest de la PWA
      manifest: {
        name:             'SIGITTN — Terminal de Transporte de Neiva',
        short_name:       'SIGITTN',
        description:      'Sistema de Gestión de Infraestructura TTN',
        theme_color:      '#0b1526',
        background_color: '#0b1526',
        display:          'standalone',
        start_url:        '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },

      // Evitar warnings en desarrollo
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],

  server: {
    port: 5173,
  },
})
