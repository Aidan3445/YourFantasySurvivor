/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { vi } from 'vitest';

/**
 * Mock Drizzle ORM database utilities for testing
 *
 * Usage:
 * import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
 *
 * vi.mock('~/db', () => ({
 *   db: mockDb,
 * }));
 *
 * mockDbQuery.mockResolvedValue([{ id: 1, name: 'test' }]);
 */

// Chainable query builder mock
export const mockDbQuery = vi.fn();

const createQueryBuilder = () => {
  const builder = {
    select: vi.fn(() => builder),
    from: vi.fn(() => builder),
    where: vi.fn(() => builder),
    orderBy: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    offset: vi.fn(() => builder),
    leftJoin: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
    groupBy: vi.fn(() => builder),
    returning: vi.fn(() => builder),
    then: vi.fn(async (resolve) => {
      const result = await mockDbQuery();
      return resolve(result);
    }),
  };
  return builder;
};

// Mock transaction function
export const mockTransaction = vi.fn(async (callback) => {
  const trxBuilder = {
    select: vi.fn(() => trxBuilder),
    insert: vi.fn(() => trxBuilder),
    update: vi.fn(() => trxBuilder),
    delete: vi.fn(() => trxBuilder),
    from: vi.fn(() => trxBuilder),
    where: vi.fn(() => trxBuilder),
    set: vi.fn(() => trxBuilder),
    values: vi.fn(() => trxBuilder),
    onConflictDoUpdate: vi.fn(() => trxBuilder),
    returning: vi.fn(() => trxBuilder),
    then: vi.fn(async (resolve) => {
      const result = await mockDbQuery();
      return resolve(result);
    }),
  };
  return callback(trxBuilder);
});

// Main db mock object
export const mockDb = {
  select: vi.fn(() => createQueryBuilder()),
  insert: vi.fn(() => createQueryBuilder()),
  update: vi.fn(() => createQueryBuilder()),
  delete: vi.fn(() => createQueryBuilder()),
  transaction: mockTransaction,
};

// Helper to reset all mocks between tests
export const resetDbMocks = () => {
  mockDbQuery.mockReset();
  mockTransaction.mockReset();
  Object.values(mockDb).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });
};
