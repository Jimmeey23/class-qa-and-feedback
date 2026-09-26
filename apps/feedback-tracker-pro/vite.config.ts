import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  base: '/power-cycle/',
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'], alias: { '@': path.resolve(here, 'src') } },
  server: { host: '0.0.0.0', port: 5173, proxy: { '/api': 'http://localhost:8787' } },
  build: { target: 'esnext' },
});
