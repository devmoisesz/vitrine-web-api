import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    e2eDatabaseUrls: Record<string, string>;
  }
}
