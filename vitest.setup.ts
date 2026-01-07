import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock server-only package to allow importing server components in tests
vi.mock('server-only', () => ({}));

// Mock environment variables for testing using Vitest's stubEnv
beforeAll(() => {
  vi.stubEnv('POSTGRES_URL', 'postgresql://test:test@localhost:5432/test');
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('SKIP_ENV_VALIDATION', 'true');
});

afterEach(() => {
  // Cleanup that runs after each test
});

afterAll(() => {
  vi.unstubAllEnvs();
});
