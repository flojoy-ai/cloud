// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { measurementId, type MeasurementId } from './Measurement';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type TagId = string;

/** Represents the table public.tag */
export default interface TagTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<TagId, TagId, TagId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  measurementId: ColumnType<MeasurementId, MeasurementId, MeasurementId>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Tag = Selectable<TagTable>;

export type NewTag = Insertable<TagTable>;

export type TagUpdate = Updateable<TagTable>;

export const tagId = z.string();

export const tag = z.object({
  id: tagId,
  name: z.string(),
  measurementId: measurementId,
  createdAt: z.date(),
});

export const tagInitializer = z.object({
  id: tagId,
  name: z.string(),
  measurementId: measurementId,
  createdAt: z.date().optional(),
});

export const tagMutator = z.object({
  id: tagId.optional(),
  name: z.string().optional(),
  measurementId: measurementId.optional(),
  createdAt: z.date().optional(),
});