// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { workspaceId, type WorkspaceId } from './Workspace';
import { familyId, type FamilyId } from './Family';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type ModelId = string;

/** Represents the table public.model */
export default interface ModelTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<ModelId, ModelId, ModelId>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  familyId: ColumnType<FamilyId, FamilyId, FamilyId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Model = Selectable<ModelTable>;

export type NewModel = Insertable<ModelTable>;

export type ModelUpdate = Updateable<ModelTable>;

export const modelId = z.string();

export const model = z.object({
  id: modelId,
  workspaceId: workspaceId,
  familyId: familyId,
  name: z.string(),
  createdAt: z.coerce.date(),
});

export const modelInitializer = z.object({
  id: modelId,
  workspaceId: workspaceId,
  familyId: familyId,
  name: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const modelMutator = z.object({
  id: modelId.optional(),
  workspaceId: workspaceId.optional(),
  familyId: familyId.optional(),
  name: z.string().optional(),
  createdAt: z.coerce.date().optional(),
});
