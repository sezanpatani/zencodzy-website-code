import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  root: __dirname,
  publicDir: 'public',
  server: {
    port: 3000,
    strictPort: true,
    host: false, // Expose to network
    open: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    {
      name: 'inject-console-cleanup',
      transformIndexHtml(html) {
        return html.replace(
          '<head>',
          '<head>\n<script src="/assets/js/console-cleanup.js"></script>'
        );
      },
    },
  ],
  build: {
    outDir: resolve(__dirname, '..', 'dist'),
    emptyOutDir: true,
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['vite']
        }
      }
    },
  },
})
