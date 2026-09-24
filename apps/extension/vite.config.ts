import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        settings: resolve(__dirname, 'src/settings/index.html'),
        offscreen: resolve(__dirname, 'src/offscreen/orchestrator.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/llm-bridge.ts'),
      },
      output: { entryFileNames: 'src/[name]/[name].js' },
    },
  },
});
