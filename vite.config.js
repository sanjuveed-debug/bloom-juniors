import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolveDevApiTarget } from './scripts/dev-api-target.mjs'

const devApiTarget = resolveDevApiTarget(process.env.BLOOM_DEV_API_TARGET || '')

export default defineConfig({
  server: {
    proxy: devApiTarget ? { '/api': { target: devApiTarget, changeOrigin: true } } : {},
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: { main: 'index.html', meetYaagvi: 'meet-yaagvi.html', meetYaagviDirect: 'blog/meet-yaagvi/index.html' },
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
    {
      name: 'bloom-local-api-only',
      configureServer(server) {
        if (devApiTarget) return
        server.middlewares.use('/api', (_request, response) => {
          response.statusCode = 503
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Local API backend is not configured.' }))
        })
      },
    },
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon-bloom-v3.svg', 'bloom-v3-touch.png', 'offline.html'],
      workbox: {
        importScripts: ['/push-handler.js'],
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
          { src: 'bloom-v3-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'bloom-v3-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'bloom-v3-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
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
            icons: [{ src: 'bloom-v3-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ]
})
