import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor'
          if (id.includes('node_modules/framer-motion/')) return 'motion'
          if (id.includes('node_modules/@supabase/')) return 'supabase'
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'bm-apple-touch-icon.png', 'masked-icon.svg', 'offline.html'],
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/blog\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            // Audio files — CacheFirst so phonics sounds work offline on classroom tablets.
            urlPattern: /\.(?:mp3|wav|ogg|m4a|aac)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bloom-audio',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [200] },
            }
          }
        ]
      },
      manifest: {
        name: 'Bloom Juniors',
        short_name: 'Bloom Juniors',
        description: 'British curriculum learning app for ages 3-9. Phonics, maths, stories, science and more.',
        theme_color: '#C2410C',
        background_color: '#FFF7ED',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/?source=pwa',
        id: '/',
        lang: 'en',
        categories: ['education', 'kids'],
        icons: [
          { src: 'bj-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'bj-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'bj-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          {
            src: 'og-preview.png',
            sizes: '1200x630',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Bloom Juniors — Turn Screen Time into Learning Time'
          }
        ],
        shortcuts: [
          {
            name: 'Start Learning',
            short_name: 'Learn',
            description: 'Jump straight into learning',
            url: '/?shortcut=learn',
            icons: [{ src: 'bj-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ]
})
