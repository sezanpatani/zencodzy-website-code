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
    host: true,
    hmr: true,
    open: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
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
        // 1. Inject Scripts into Head (Cleanup + ImportMap)
        let newHtml = html.replace(
          '<head>',
          `<head>
           <script type="importmap">
           {
             "imports": {
               "https://edit.framer.com/init.mjs": "/assets/js/framer-init-fix.js"
             }
           }
           </script>
           <script src="/assets/js/console-fix.js"></script>
           <script defer src="/assets/js/form-handler.js"></script>`
        );

        // 2. Inject fallback ROOT div into Body (At the very top)
        // This ensures document.getElementById('root') works immediately
        newHtml = newHtml.replace(
          '<body>',
          '<body><div id="root"></div><div id="app"></div>'
        );

        return newHtml;
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
