import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['**/*.e2e.spec.ts'], // Roda apenas arquivos E2E
    globals: true,
    setupFiles: ['./test/setup-e2e.ts'], // Caminho para o arquivo de setup
    fileParallelism: false,
    hookTimeout: 60000, 
    testTimeout: 60000,
  },
});