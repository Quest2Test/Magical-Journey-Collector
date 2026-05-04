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
    reportCompressedSize: false,
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|gif|svg|webp|ico/.test(ext)) {
              return `images/[name]-[hash][extname]`;
            } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            } else if (ext === 'css') {
              return `css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      ],
      external: [],
    },
    chunkSizeWarningLimit: 750,
    cssCodeSplit: true,
  },
})