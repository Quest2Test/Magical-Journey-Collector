import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const imageProxyPlugin = () => ({
  name: 'vite-image-proxy',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method !== 'GET' || !req.url?.startsWith('/api/image-proxy')) {
        return next()
      }

      const query = req.url.split('?')[1] || ''
      const targetUrl = new URLSearchParams(query).get('url')
      if (!targetUrl || !targetUrl.startsWith('https://cards.lorcast.io')) {
        res.statusCode = 403
        res.end('Forbidden')
        return
      }

      try {
        const upstream = await fetch(targetUrl)
        if (!upstream.ok) {
          res.statusCode = upstream.status
          res.end(await upstream.text().catch(() => upstream.statusText))
          return
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
        res.setHeader('Content-Type', contentType)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        const buffer = Buffer.from(await upstream.arrayBuffer())
        res.end(buffer)
      } catch (error) {
        res.statusCode = 502
        res.end('Bad Gateway')
      }
    })
  },
  configurePreviewServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method !== 'GET' || !req.url?.startsWith('/api/image-proxy')) {
        return next()
      }

      const query = req.url.split('?')[1] || ''
      const targetUrl = new URLSearchParams(query).get('url')
      if (!targetUrl || !targetUrl.startsWith('https://cards.lorcast.io')) {
        res.statusCode = 403
        res.end('Forbidden')
        return
      }

      try {
        const upstream = await fetch(targetUrl)
        if (!upstream.ok) {
          res.statusCode = upstream.status
          res.end(await upstream.text().catch(() => upstream.statusText))
          return
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
        res.setHeader('Content-Type', contentType)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        const buffer = Buffer.from(await upstream.arrayBuffer())
        res.end(buffer)
      } catch (error) {
        res.statusCode = 502
        res.end('Bad Gateway')
      }
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), imageProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0'
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          framer: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          radix: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ]
        }
      }
    }
  },
})