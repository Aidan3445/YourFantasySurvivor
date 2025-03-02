import 'server-only';

import { pgTableCreator, } from 'drizzle-orm/pg-core';

export const createTable = pgTableCreator((name) => `yfs_${name}`);
