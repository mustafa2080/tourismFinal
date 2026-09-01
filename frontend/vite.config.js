import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  // SEO and Performance optimizations
  build: {
    // Improve tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'vendor-routing'
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor-ui'
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) return 'vendor-form'
            if (id.includes('@tanstack/react-query')) return 'vendor-query'
            if (id.includes('axios') || id.includes('socket.io-client') || id.includes('date-fns')) return 'vendor-other'
          }
        },
      },
    },
  },
  // SEO-friendly paths
  define: {
    'process.env.VITE_SEO_ENABLED': true,
  },
})
