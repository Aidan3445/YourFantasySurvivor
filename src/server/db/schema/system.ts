import 'server-only';

import { boolean, serial, varchar } from 'drizzle-orm/pg-core';
import { createTable } from '~/server/db/schema/createTable';

export const systemSchema = createTable(
  'system',
  {
    id: serial('system_id').notNull().primaryKey(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    noRedirects: boolean('no_redirects').notNull().default(false),
  }
);
