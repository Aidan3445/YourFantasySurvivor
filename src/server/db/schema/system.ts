import { serial, varchar } from 'drizzle-orm/pg-core';
import { createTable } from './createTable';

export const system = createTable(
  'system',
  {
    id: serial('system_id').notNull().primaryKey(),
    userId: varchar('user_id', { length: 64 }).notNull(),
  }
);
