import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Same alias shadcn/ui expects, so `npx shadcn add …` drops in cleanly.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Same-origin in dev: no CORS, and the API URL stays relative everywhere.
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
});
