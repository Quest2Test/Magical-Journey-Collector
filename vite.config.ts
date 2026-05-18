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
  plugins: [react(), splitVendorChunkPlugin(), imageProxyPlugin()],
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-framer-motion';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react/') || id.includes('react-dom/')) return 'vendor-react';
          }
        }
      }
    }
  },
})