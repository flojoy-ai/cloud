// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type WorkspaceId } from './Workspace';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type PartVariationMarketId = string;

/** Represents the table public.part_variation_market */
export default interface PartVariationMarketTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<PartVariationMarketId, PartVariationMarketId, PartVariationMarketId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;
}

export type PartVariationMarket = Selectable<PartVariationMarketTable>;

export type NewPartVariationMarket = Insertable<PartVariationMarketTable>;

export type PartVariationMarketUpdate = Updateable<PartVariationMarketTable>;
