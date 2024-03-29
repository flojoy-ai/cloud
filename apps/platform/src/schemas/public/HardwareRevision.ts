// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { hardwareId, type HardwareId } from './Hardware';
import { revisionType, type default as RevisionType } from './RevisionType';
import { userId, type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.hardware_revision */
export default interface HardwareRevisionTable {
  /** Database type: pg_catalog.text */
  hardwareId: ColumnType<HardwareId, HardwareId, HardwareId>;

  /** Database type: public.revision_type */
  revisionType: ColumnType<RevisionType, RevisionType, RevisionType>;

  /** Database type: pg_catalog.timestamp */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.text */
  componentId: ColumnType<HardwareId, HardwareId, HardwareId>;

  /** Database type: pg_catalog.text */
  reason: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<UserId, UserId, UserId>;
}

export type HardwareRevision = Selectable<HardwareRevisionTable>;

export type NewHardwareRevision = Insertable<HardwareRevisionTable>;

export type HardwareRevisionUpdate = Updateable<HardwareRevisionTable>;

export const hardwareRevision = z.object({
  hardwareId: hardwareId,
  revisionType: revisionType,
  createdAt: z.date(),
  componentId: hardwareId,
  reason: z.string().nullable(),
  userId: userId,
});

export const hardwareRevisionInitializer = z.object({
  hardwareId: hardwareId,
  revisionType: revisionType,
  createdAt: z.date().optional(),
  componentId: hardwareId,
  reason: z.string().optional().nullable(),
  userId: userId,
});

export const hardwareRevisionMutator = z.object({
  hardwareId: hardwareId.optional(),
  revisionType: revisionType.optional(),
  createdAt: z.date().optional(),
  componentId: hardwareId.optional(),
  reason: z.string().optional().nullable(),
  userId: userId.optional(),
});
