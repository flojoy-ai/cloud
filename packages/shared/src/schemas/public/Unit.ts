// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type WorkspaceId } from './Workspace';
import { type PartVariationId } from './PartVariation';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

export type UnitId = string;

/** Represents the table public.unit */
export default interface UnitTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<UnitId, UnitId, UnitId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  partVariationId: ColumnType<PartVariationId, PartVariationId, PartVariationId>;

  /** Database type: pg_catalog.text */
  serialNumber: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  lotNumber: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Unit = Selectable<UnitTable>;

export type NewUnit = Insertable<UnitTable>;

export type UnitUpdate = Updateable<UnitTable>;