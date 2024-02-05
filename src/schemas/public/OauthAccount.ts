// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type OauthAccountProviderId = string;

export type OauthAccountProviderUserId = string;

/** Represents the table public.oauth_account */
export default interface OauthAccountTable {
  /** Database type: pg_catalog.text */
  providerId: ColumnType<OauthAccountProviderId, OauthAccountProviderId, OauthAccountProviderId>;

  /** Database type: pg_catalog.text */
  providerUserId: ColumnType<OauthAccountProviderUserId, OauthAccountProviderUserId, OauthAccountProviderUserId>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;
}

export type OauthAccount = Selectable<OauthAccountTable>;

export type NewOauthAccount = Insertable<OauthAccountTable>;

export type OauthAccountUpdate = Updateable<OauthAccountTable>;

export const oauthAccountProviderId = z.string();

export const oauthAccountProviderUserId = z.string();

export const oauthAccount = z.object({
  providerId: oauthAccountProviderId,
  providerUserId: oauthAccountProviderUserId,
  userId: userId,
});

export const oauthAccountInitializer = z.object({
  providerId: oauthAccountProviderId,
  providerUserId: oauthAccountProviderUserId,
  userId: userId,
});

export const oauthAccountMutator = z.object({
  providerId: oauthAccountProviderId.optional(),
  providerUserId: oauthAccountProviderUserId.optional(),
  userId: userId.optional(),
});
