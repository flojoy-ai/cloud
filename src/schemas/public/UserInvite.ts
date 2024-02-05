// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { workspaceId, type WorkspaceId } from './Workspace';
import { workspaceRole, type default as WorkspaceRole } from './WorkspaceRole';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Identifier type for public.user_invite */
export type UserInviteId = string & { __brand: 'UserInviteId' };

/** Represents the table public.user_invite */
export default interface UserInviteTable {
  id: ColumnType<UserInviteId, UserInviteId, UserInviteId>;

  email: ColumnType<string, string, string>;

  workspace_id: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  role: ColumnType<WorkspaceRole, WorkspaceRole, WorkspaceRole>;
}

export type UserInvite = Selectable<UserInviteTable>;

export type NewUserInvite = Insertable<UserInviteTable>;

export type UserInviteUpdate = Updateable<UserInviteTable>;

export const userInviteId = z.string();

export const userInvite = z.object({
  id: userInviteId,
  email: z.string(),
  workspace_id: workspaceId,
  role: workspaceRole,
});

export const userInviteInitializer = z.object({
  id: userInviteId,
  email: z.string(),
  workspace_id: workspaceId,
  role: workspaceRole,
});

export const userInviteMutator = z.object({
  id: userInviteId.optional(),
  email: z.string().optional(),
  workspace_id: workspaceId.optional(),
  role: workspaceRole.optional(),
});
