// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Identifier type for public.password_reset_token */
export type PasswordResetTokenId = string & { __brand: 'PasswordResetTokenId' };

/** Represents the table public.password_reset_token */
export default interface PasswordResetTokenTable {
  id: ColumnType<PasswordResetTokenId, PasswordResetTokenId, PasswordResetTokenId>;

  user_id: ColumnType<UserId, UserId, UserId>;

  token: ColumnType<string, string, string>;

  expires_at: ColumnType<Date, Date | string, Date | string>;
}

export const passwordResetTokenId = z.string() as unknown as z.Schema<PasswordResetTokenId>;

export const passwordResetToken = z.object({
  id: passwordResetTokenId,
  user_id: userId,
  token: z.string(),
  expires_at: z.date(),
}) as unknown as z.Schema<PasswordResetToken>;

export const passwordResetTokenInitializer = z.object({
  id: passwordResetTokenId,
  user_id: userId,
  token: z.string(),
  expires_at: z.date(),
}) as unknown as z.Schema<PasswordResetTokenInitializer>;

export const passwordResetTokenMutator = z.object({
  id: passwordResetTokenId.optional(),
  user_id: userId.optional(),
  token: z.string().optional(),
  expires_at: z.date().optional(),
}) as unknown as z.Schema<PasswordResetTokenMutator>;

export type PasswordResetToken = Selectable<PasswordResetTokenTable>;

export type NewPasswordResetToken = Insertable<PasswordResetTokenTable>;

export type PasswordResetTokenUpdate = Updateable<PasswordResetTokenTable>;
