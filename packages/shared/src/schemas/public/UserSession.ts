// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UserId } from './User';
import { type WorkspaceId } from './Workspace';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type UserSessionId = string;

/** Represents the table public.user_session */
export default interface UserSessionTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<UserSessionId, UserSessionId, UserSessionId>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId | null, WorkspaceId | null, WorkspaceId | null>;

  /** Database type: pg_catalog.timestamptz */
  expiresAt: ColumnType<Date, Date | string, Date | string>;
}

export type UserSession = Selectable<UserSessionTable>;

export type NewUserSession = Insertable<UserSessionTable>;

export type UserSessionUpdate = Updateable<UserSessionTable>;
