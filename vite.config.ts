import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          // Long-lived vendor chunks: they change far less often than app code,
          // so returning visitors keep them cached.
          manualChunks: {
            react: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
            motion: ['motion'],
          },
        },
      },
    },
  };
});
