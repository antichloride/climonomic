import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false,
    fs: {
      // Allow serving files from root to access pkg-web
      allow: ['..'],
    },
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['../../pkg-web'],
  },
});
