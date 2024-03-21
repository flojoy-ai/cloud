// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { workspaceId, type WorkspaceId } from './Workspace';
import { productId, type ProductId } from './Product';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type FamilyId = string;

/** Represents the table public.family */
export default interface FamilyTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<FamilyId, FamilyId, FamilyId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  productId: ColumnType<ProductId, ProductId, ProductId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  description: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Family = Selectable<FamilyTable>;

export type NewFamily = Insertable<FamilyTable>;

export type FamilyUpdate = Updateable<FamilyTable>;

export const familyId = z.string();

export const family = z.object({
  id: familyId,
  workspaceId: workspaceId,
  productId: productId,
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const familyInitializer = z.object({
  id: familyId,
  workspaceId: workspaceId,
  productId: productId,
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const familyMutator = z.object({
  id: familyId.optional(),
  workspaceId: workspaceId.optional(),
  productId: productId.optional(),
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});
