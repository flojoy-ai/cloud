// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type EmailVerificationId = string;

/** Represents the table public.email_verification */
export default interface EmailVerificationTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<EmailVerificationId, EmailVerificationId, EmailVerificationId>;

  /** Database type: pg_catalog.text */
  code: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;

  /** Database type: pg_catalog.text */
  email: ColumnType<string, string, string>;

  /** Database type: pg_catalog.timestamptz */
  expiresAt: ColumnType<Date, Date | string, Date | string>;
}

export type EmailVerification = Selectable<EmailVerificationTable>;

export type NewEmailVerification = Insertable<EmailVerificationTable>;

export type EmailVerificationUpdate = Updateable<EmailVerificationTable>;

export const emailVerificationId = z.string();

export const emailVerification = z.object({
  id: emailVerificationId,
  code: z.string(),
  userId: userId,
  email: z.string(),
  expiresAt: z.coerce.date(),
});

export const emailVerificationInitializer = z.object({
  id: emailVerificationId,
  code: z.string(),
  userId: userId,
  email: z.string(),
  expiresAt: z.coerce.date(),
});

export const emailVerificationMutator = z.object({
  id: emailVerificationId.optional(),
  code: z.string().optional(),
  userId: userId.optional(),
  email: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});
