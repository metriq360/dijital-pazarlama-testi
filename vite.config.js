import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Bu kısım, Rollup'ın CommonJS modüllerini (react-markdown gibi)
    // doğru bir şekilde işlemesini ve uygulamanıza dahil etmesini sağlar.
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
