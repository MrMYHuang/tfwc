import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/tfwc/',
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
      protocolImports: true,
    }),
    VitePWA({
      srcDir: 'src',
      filename: 'service-worker.ts',
      strategies: 'injectManifest',
      manifest: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,txt,woff2}'],
      },
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
}));
