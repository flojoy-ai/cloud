// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { workspaceId, type WorkspaceId } from './Workspace';
import { workspaceRole, type default as WorkspaceRole } from './WorkspaceRole';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.workspace_user */
export default interface WorkspaceUserTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: public.workspace_role */
  role: ColumnType<WorkspaceRole, WorkspaceRole, WorkspaceRole>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type WorkspaceUser = Selectable<WorkspaceUserTable>;

export type NewWorkspaceUser = Insertable<WorkspaceUserTable>;

export type WorkspaceUserUpdate = Updateable<WorkspaceUserTable>;

export const workspaceUser = z.object({
  userId: userId,
  workspaceId: workspaceId,
  role: workspaceRole,
  createdAt: z.coerce.date(),
});

export const workspaceUserInitializer = z.object({
  userId: userId,
  workspaceId: workspaceId,
  role: workspaceRole,
  createdAt: z.coerce.date().optional(),
});

export const workspaceUserMutator = z.object({
  userId: userId.optional(),
  workspaceId: workspaceId.optional(),
  role: workspaceRole.optional(),
  createdAt: z.coerce.date().optional(),
});
