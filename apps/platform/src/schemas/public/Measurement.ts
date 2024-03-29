// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { hardwareId, type HardwareId } from './Hardware';
import { testId, type TestId } from './Test';
import { storageProvider, type default as StorageProvider } from './StorageProvider';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type MeasurementId = string;

/** Represents the table public.measurement */
export default interface MeasurementTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<MeasurementId, MeasurementId, MeasurementId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.jsonb */
  data: ColumnType<unknown, unknown, unknown>;

  /** Database type: pg_catalog.bool */
  pass: ColumnType<boolean | null, boolean | null, boolean | null>;

  /** Database type: pg_catalog.text */
  hardwareId: ColumnType<HardwareId, HardwareId, HardwareId>;

  /** Database type: pg_catalog.text */
  testId: ColumnType<TestId, TestId, TestId>;

  /** Database type: public.storage_provider */
  storageProvider: ColumnType<StorageProvider, StorageProvider, StorageProvider>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.bool */
  isDeleted: ColumnType<boolean | null, boolean | null, boolean | null>;
}

export type Measurement = Selectable<MeasurementTable>;

export type NewMeasurement = Insertable<MeasurementTable>;

export type MeasurementUpdate = Updateable<MeasurementTable>;

export const measurementId = z.string();

export const measurement = z.object({
  id: measurementId,
  name: z.string(),
  data: z.unknown(),
  pass: z.boolean().nullable(),
  hardwareId: hardwareId,
  testId: testId,
  storageProvider: storageProvider,
  createdAt: z.coerce.date(),
  isDeleted: z.boolean().nullable(),
});

export const measurementInitializer = z.object({
  id: measurementId,
  name: z.string(),
  data: z.unknown(),
  pass: z.boolean().optional().nullable(),
  hardwareId: hardwareId,
  testId: testId,
  storageProvider: storageProvider,
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional().nullable(),
});

export const measurementMutator = z.object({
  id: measurementId.optional(),
  name: z.string().optional(),
  data: z.unknown().optional(),
  pass: z.boolean().optional().nullable(),
  hardwareId: hardwareId.optional(),
  testId: testId.optional(),
  storageProvider: storageProvider.optional(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional().nullable(),
});
