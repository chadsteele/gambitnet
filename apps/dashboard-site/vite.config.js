import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/gambitnet/',
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        teamLab: resolve(__dirname, 'team-lab.html'),
      },
    },
  },
});
