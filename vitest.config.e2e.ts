import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['**/*.e2e.spec.ts'], // Roda apenas arquivos E2E
    globals: true,
    globalSetup: ['./test/global-setup-e2e.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    pool: 'forks',
    isolate: true,
    fileParallelism: true,
    maxWorkers: 2,
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
