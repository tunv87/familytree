/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

const buildTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/
  base: process.env.VITE_BASE ?? '/familytree/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // registered from src/lib/pwa.ts so we can re-check for updates on resume
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gia phả',
        short_name: 'Gia phả',
        description: 'Cây gia phả và lịch âm dương của dòng họ',
        lang: 'vi',
        theme_color: '#a8322d',
        background_color: '#fbf6ec',
        display: 'standalone',
        // the family tree is easier to read in landscape, so allow rotating
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        globPatterns: [
          '**/*.{js,css,html,svg,png}',
          '**/nunito-{latin,latin-ext,vietnamese}-*-normal-*.woff2',
        ],
      },
    }),
  ],
  server: { host: true, port: 5173 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
});
