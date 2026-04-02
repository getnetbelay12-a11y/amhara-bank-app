import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }

            return 'vendor';
          }

          if (!id.includes('/src/')) {
            return undefined;
          }

          if (id.includes('/src/core/')) {
            return 'core';
          }

          if (id.includes('/src/shared/')) {
            return 'shared-ui';
          }

          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
