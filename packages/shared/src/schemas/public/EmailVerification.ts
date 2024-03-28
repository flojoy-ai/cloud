// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

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
