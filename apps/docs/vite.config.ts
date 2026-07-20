import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const kit = (path: string) =>
  fileURLToPath(new URL(`../../packages/framekit/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    // Point the kit at its source so the docs app gets instant HMR
    // while editing components — no rebuild step during development.
    alias: [
      {
        find: '@presentstandards/framekit-ui/styles.css',
        replacement: kit('src/styles/index.css'),
      },
      {
        find: '@presentstandards/framekit-ui/tokens.css',
        replacement: kit('src/styles/tokens.css'),
      },
      { find: '@presentstandards/framekit-ui/fonts.css', replacement: kit('src/styles/fonts.css') },
      { find: '@presentstandards/framekit-ui', replacement: kit('src/index.ts') },
    ],
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5180,
    strictPort: true,
  },
});
