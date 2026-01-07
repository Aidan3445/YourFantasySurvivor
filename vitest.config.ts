import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      // Use happy-dom for React hook tests
      ['src/hooks/**/*.test.ts', 'happy-dom'],
      ['src/hooks/**/*.test.tsx', 'happy-dom'],
    ],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/components/**',
        'src/app/**/*.tsx',
        'src/types/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/__mocks__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'vitest.setup.ts',
        '.next/',
        'dist/',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
