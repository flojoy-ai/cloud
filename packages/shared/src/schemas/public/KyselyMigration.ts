// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type KyselyMigrationName = string;

/** Represents the table public.kysely_migration */
export default interface KyselyMigrationTable {
  /** Database type: pg_catalog.varchar */
  name: ColumnType<KyselyMigrationName, KyselyMigrationName, KyselyMigrationName>;

  /** Database type: pg_catalog.varchar */
  timestamp: ColumnType<string, string, string>;
}

export type KyselyMigration = Selectable<KyselyMigrationTable>;

export type NewKyselyMigration = Insertable<KyselyMigrationTable>;

export type KyselyMigrationUpdate = Updateable<KyselyMigrationTable>;
