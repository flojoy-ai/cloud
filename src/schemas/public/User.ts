// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Identifier type for public.user */
export type UserId = string & { __brand: 'UserId' };

/** Represents the table public.user */
export default interface UserTable {
  id: ColumnType<UserId, UserId, UserId>;

  email_verified: ColumnType<boolean | null, boolean | null, boolean | null>;

  email: ColumnType<string, string, string>;

  hashed_password: ColumnType<string | null, string | null, string | null>;

  created_at: ColumnType<Date, Date | string | undefined, Date | string>;

  updated_at: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type User = Selectable<UserTable>;

export type NewUser = Insertable<UserTable>;

export type UserUpdate = Updateable<UserTable>;

export const userId = z.string();

export const user = z.object({
  id: userId,
  email_verified: z.boolean().nullable(),
  email: z.string(),
  hashed_password: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const userInitializer = z.object({
  id: userId,
  email_verified: z.boolean().optional().nullable(),
  email: z.string(),
  hashed_password: z.string().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const userMutator = z.object({
  id: userId.optional(),
  email_verified: z.boolean().optional().nullable(),
  email: z.string().optional(),
  hashed_password: z.string().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
