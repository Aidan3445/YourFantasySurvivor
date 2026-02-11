import 'server-only';
import { type PgColumnBuilderBase, pgTableCreator, type PgTableExtraConfigValue, type PgTableWithColumns, timestamp } from 'drizzle-orm/pg-core';
import { type BuildExtraConfigColumns, type BuildColumns } from 'drizzle-orm';


export const defaultColumns = {
  created_at: timestamp({
    mode: 'date', withTimezone: true
  })
    .defaultNow()
    .notNull(),
  updated_at: timestamp({
    mode: 'date', withTimezone: true
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
} as const;


// copied from def of pgTableCreator in drizzle-orm
type PgTableFnM<TSchema extends string | undefined = undefined> = <
  TTableName extends string, TColumnsMap extends Record<string, PgColumnBuilderBase>
>(_name: TTableName, _columns: TColumnsMap, _extraConfig?: (
  _self: BuildExtraConfigColumns<TTableName, TColumnsMap, 'pg'>
) => PgTableExtraConfigValue[]) => PgTableWithColumns<{
  name: TTableName;
  schema: TSchema;
  columns: BuildColumns<TTableName, TColumnsMap & typeof defaultColumns, 'pg'>;
  dialect: 'pg';
}>;

export const createTable: PgTableFnM = (name, columns, extraConfig) => {
  return pgTableCreator((name) => `yfs_${name}`)(name, { ...columns, ...defaultColumns }, extraConfig);
};

