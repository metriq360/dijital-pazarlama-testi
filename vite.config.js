import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { // `react-markdown` gibi kütüphanelerin doğru derlenmesini sağlar
    include: ['react-markdown'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/], // Bağımlılık çözünürlüğü için önemlidir
    },
  },
});
