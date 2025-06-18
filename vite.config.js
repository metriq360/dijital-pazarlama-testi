import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { // Bu yeni kısım
    include: ['react-markdown'], // `react-markdown`'ı açıkça optimize etmesini söylüyoruz
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
