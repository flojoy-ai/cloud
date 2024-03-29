// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { measurementId, type MeasurementId } from './Measurement';
import { tagId, type TagId } from './Tag';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.measurement_tag */
export default interface MeasurementTagTable {
  /** Database type: pg_catalog.text */
  measurementId: ColumnType<MeasurementId, MeasurementId, MeasurementId>;

  /** Database type: pg_catalog.text */
  tagId: ColumnType<TagId, TagId, TagId>;
}

export type MeasurementTag = Selectable<MeasurementTagTable>;

export type NewMeasurementTag = Insertable<MeasurementTagTable>;

export type MeasurementTagUpdate = Updateable<MeasurementTagTable>;

export const measurementTag = z.object({
  measurementId: measurementId,
  tagId: tagId,
});

export const measurementTagInitializer = z.object({
  measurementId: measurementId,
  tagId: tagId,
});

export const measurementTagMutator = z.object({
  measurementId: measurementId.optional(),
  tagId: tagId.optional(),
});
