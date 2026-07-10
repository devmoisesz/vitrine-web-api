import { randomUUID } from 'node:crypto';

export function makeEmail() {
  return `user${randomUUID().replace(/-/g, '')}@example.com`;
}