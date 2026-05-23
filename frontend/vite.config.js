import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      react({
        // Fix React Fast Refresh issues
        fastRefresh: true,
      }),
    ],
    server: {
      port: 3000,
      host: true, // Listen on all addresses
      strictPort: false, // Allow fallback to next port if 3000 is busy
      hmr: {
        overlay: true, // Show error overlay
        clientPort: 3000, // Use same port for HMR client
        protocol: 'ws', // Explicit WebSocket protocol
        host: 'localhost', // Explicit host
      },
      watch: {
        usePolling: false, // Disable polling on Windows
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      // Add headers to prevent caching of dev files (development only)
      headers: isDevelopment ? {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      } : {},
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    build: {
      // Production build configuration
      outDir: 'dist',
      sourcemap: false, // Disable source maps in production for security
      minify: 'esbuild',
      target: 'es2015',
      // Add cache busting
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Manual chunks for better caching (function format for Rolldown)
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs')) {
                return 'chart-vendor';
              }
              return 'vendor';
            }
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    // Ensure proper base path for deployment
    base: '/',
  };
});
