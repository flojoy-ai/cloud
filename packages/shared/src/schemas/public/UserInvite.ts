// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type WorkspaceId } from './Workspace';
import { type default as WorkspaceRole } from './WorkspaceRole';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type UserInviteId = string;

/** Represents the table public.user_invite */
export default interface UserInviteTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<UserInviteId, UserInviteId, UserInviteId>;

  /** Database type: pg_catalog.text */
  email: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: public.workspace_role */
  role: ColumnType<WorkspaceRole, WorkspaceRole, WorkspaceRole>;
}

export type UserInvite = Selectable<UserInviteTable>;

export type NewUserInvite = Insertable<UserInviteTable>;

export type UserInviteUpdate = Updateable<UserInviteTable>;
