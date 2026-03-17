import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vpic': {
        target: 'https://vpic.nhtsa.dot.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vpic/, '/api/vehicles'),
        secure: true,
      },
      '/api/nhtsa': {
        target: 'https://api.nhtsa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nhtsa/, ''),
        secure: true,
      },
    },
  },
})
