// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UnitId } from './Unit';
import { type default as RevisionType } from './RevisionType';
import { type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

/** Represents the table public.unit_revision */
export default interface UnitRevisionTable {
  /** Database type: pg_catalog.text */
  unitId: ColumnType<UnitId, UnitId, UnitId>;

  /** Database type: public.revision_type */
  revisionType: ColumnType<RevisionType, RevisionType, RevisionType>;

  /** Database type: pg_catalog.timestamp */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.text */
  componentId: ColumnType<UnitId, UnitId, UnitId>;

  /** Database type: pg_catalog.text */
  reason: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;
}

export type UnitRevision = Selectable<UnitRevisionTable>;

export type NewUnitRevision = Insertable<UnitRevisionTable>;

export type UnitRevisionUpdate = Updateable<UnitRevisionTable>;
