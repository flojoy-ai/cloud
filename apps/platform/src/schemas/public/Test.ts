// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { measurementType, type default as MeasurementType } from './MeasurementType';
import { projectId, type ProjectId } from './Project';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type TestId = string;

/** Represents the table public.test */
export default interface TestTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<TestId, TestId, TestId>;

  /** Database type: public.measurement_type */
  measurementType: ColumnType<MeasurementType, MeasurementType, MeasurementType>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  projectId: ColumnType<ProjectId, ProjectId, ProjectId>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Test = Selectable<TestTable>;

export type NewTest = Insertable<TestTable>;

export type TestUpdate = Updateable<TestTable>;

export const testId = z.string();

export const test = z.object({
  id: testId,
  measurementType: measurementType,
  name: z.string(),
  projectId: projectId,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const testInitializer = z.object({
  id: testId,
  measurementType: measurementType,
  name: z.string(),
  projectId: projectId,
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const testMutator = z.object({
  id: testId.optional(),
  measurementType: measurementType.optional(),
  name: z.string().optional(),
  projectId: projectId.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});