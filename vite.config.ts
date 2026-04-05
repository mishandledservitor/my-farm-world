import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  define: {
    VITE_APP_VERSION: JSON.stringify('0.1.0'),
  },
  server: {
    port: Number(process.env.VITE_PORT) || 3000,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
