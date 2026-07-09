import swc from 'unplugin-swc';
import { configDefaults, defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    exclude: [
      ...configDefaults.exclude,
      '**/*.e2e.spec.ts',
    ]
  },
  plugins: [
    tsConfigPaths(),
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});