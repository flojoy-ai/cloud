// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { planType, type default as PlanType } from './PlanType';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type WorkspaceId = string;

/** Represents the table public.workspace */
export default interface WorkspaceTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  namespace: ColumnType<string, string, string>;

  /** Database type: public.plan_type */
  planType: ColumnType<PlanType, PlanType, PlanType>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type Workspace = Selectable<WorkspaceTable>;

export type NewWorkspace = Insertable<WorkspaceTable>;

export type WorkspaceUpdate = Updateable<WorkspaceTable>;

export const workspaceId = z.string();

export const workspace = z.object({
  id: workspaceId,
  name: z.string(),
  namespace: z.string(),
  planType: planType,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const workspaceInitializer = z.object({
  id: workspaceId,
  name: z.string(),
  namespace: z.string(),
  planType: planType,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const workspaceMutator = z.object({
  id: workspaceId.optional(),
  name: z.string().optional(),
  namespace: z.string().optional(),
  planType: planType.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
