import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // écoute sur toutes les interfaces (Docker)
    port: 3000,      // port 3000 pour correspondre au mapping Docker
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,      // pareil pour preview/build
    strictPort: true,
  },
});
