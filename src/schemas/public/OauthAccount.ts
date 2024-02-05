// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Identifier type for public.oauth_account */
export type OauthAccountProviderId = string & { __brand: 'OauthAccountProviderId' };

/** Identifier type for public.oauth_account */
export type OauthAccountProviderUserId = string & { __brand: 'OauthAccountProviderUserId' };

/** Represents the table public.oauth_account */
export default interface OauthAccountTable {
  provider_id: ColumnType<OauthAccountProviderId, OauthAccountProviderId, OauthAccountProviderId>;

  provider_user_id: ColumnType<OauthAccountProviderUserId, OauthAccountProviderUserId, OauthAccountProviderUserId>;

  user_id: ColumnType<UserId, UserId, UserId>;
}

export type OauthAccount = Selectable<OauthAccountTable>;

export type NewOauthAccount = Insertable<OauthAccountTable>;

export type OauthAccountUpdate = Updateable<OauthAccountTable>;

export const oauthAccountProviderId = z.string();

export const oauthAccountProviderUserId = z.string();

export const oauthAccount = z.object({
  provider_id: oauthAccountProviderId,
  provider_user_id: oauthAccountProviderUserId,
  user_id: userId,
});

export const oauthAccountInitializer = z.object({
  provider_id: oauthAccountProviderId,
  provider_user_id: oauthAccountProviderUserId,
  user_id: userId,
});

export const oauthAccountMutator = z.object({
  provider_id: oauthAccountProviderId.optional(),
  provider_user_id: oauthAccountProviderUserId.optional(),
  user_id: userId.optional(),
});