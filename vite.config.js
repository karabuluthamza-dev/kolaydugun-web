import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'production' && ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
    }),
  ],
  esbuild: {
    // Temporarily disabled console dropping for debugging production issues
    drop: [],
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Letting Vite handle chunks automatically for maximum stability during debug
      }
    }
  },
  optimizeDeps: {
    entries: ['./index.html', './src/main.jsx']
  }
}))
