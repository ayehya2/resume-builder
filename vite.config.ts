import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy LaTeX compilation requests to the latex-on-http API
      // This avoids CORS issues and provides real pdfTeX compilation
      '/api/latex': {
        target: 'https://latex.ytotech.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/latex/, '/builds/sync'),
      },
    },
  },
})
