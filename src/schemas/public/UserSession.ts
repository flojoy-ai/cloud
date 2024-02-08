// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type UserSessionId = string;

/** Represents the table public.user_session */
export default interface UserSessionTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<UserSessionId, UserSessionId, UserSessionId>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.timestamptz */
  expiresAt: ColumnType<Date, Date | string, Date | string>;
}

export type UserSession = Selectable<UserSessionTable>;

export type NewUserSession = Insertable<UserSessionTable>;

export type UserSessionUpdate = Updateable<UserSessionTable>;

export const userSessionId = z.string();

export const userSession = z.object({
  id: userSessionId,
  userId: userId,
  expiresAt: z.date().coerce(),
});

export const userSessionInitializer = z.object({
  id: userSessionId,
  userId: userId,
  expiresAt: z.date().coerce(),
});

export const userSessionMutator = z.object({
  id: userSessionId.optional(),
  userId: userId.optional(),
  expiresAt: z.date().coerce().optional(),
});
