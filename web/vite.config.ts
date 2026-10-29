import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  base: './', // relative assets path so it can be deployed on GitHub pages, Vercel, Netlify, or subpaths seamlessly
});

