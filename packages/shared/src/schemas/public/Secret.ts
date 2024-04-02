// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UserId } from './User';
import { type WorkspaceId } from './Workspace';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

/** Represents the table public.secret */
export default interface SecretTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  value: ColumnType<string, string, string>;

  /** Database type: pg_catalog.timestamp */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamp */
  lastUsedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type Secret = Selectable<SecretTable>;

export type NewSecret = Insertable<SecretTable>;

export type SecretUpdate = Updateable<SecretTable>;
