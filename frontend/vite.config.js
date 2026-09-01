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
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-routing': ['react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-icons'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-other': ['axios', 'socket.io-client', 'date-fns'],
        },
      },
    },
  },
  // SEO-friendly paths
  define: {
    'process.env.VITE_SEO_ENABLED': true,
  },
})
