// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type PartVariationTypeId = string;

/** Represents the table public.part_variation_type */
export default interface PartVariationTypeTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<PartVariationTypeId, PartVariationTypeId, PartVariationTypeId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string | null, string | null, string | null>;
}

export type PartVariationType = Selectable<PartVariationTypeTable>;

export type NewPartVariationType = Insertable<PartVariationTypeTable>;

export type PartVariationTypeUpdate = Updateable<PartVariationTypeTable>;
