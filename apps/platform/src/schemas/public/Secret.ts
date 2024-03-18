// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { workspaceId, type WorkspaceId } from './Workspace';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.secret */
export default interface SecretTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.text */
  value: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.timestamp */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamp */
  lastUsedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type Secret = Selectable<SecretTable>;

export type NewSecret = Insertable<SecretTable>;

export type SecretUpdate = Updateable<SecretTable>;

export const secret = z.object({
  id: z.string(),
  userId: userId,
  value: z.string(),
  workspaceId: workspaceId,
  createdAt: z.date(),
  lastUsedAt: z.date().nullable(),
});

export const secretInitializer = z.object({
  id: z.string(),
  userId: userId,
  value: z.string(),
  workspaceId: workspaceId,
  createdAt: z.date().optional(),
  lastUsedAt: z.date().optional().nullable(),
});

export const secretMutator = z.object({
  id: z.string().optional(),
  userId: userId.optional(),
  value: z.string().optional(),
  workspaceId: workspaceId.optional(),
  createdAt: z.date().optional(),
  lastUsedAt: z.date().optional().nullable(),
});
