// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { workspaceId, type WorkspaceId } from './Workspace';
import { modelId, type ModelId } from './Model';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type ProjectId = string;

/** Represents the table public.project */
export default interface ProjectTable {
  /** Database type: pg_catalog.text */
  id: ColumnType<ProjectId, ProjectId, ProjectId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  workspaceId: ColumnType<WorkspaceId, WorkspaceId, WorkspaceId>;

  /** Database type: pg_catalog.text */
  modelId: ColumnType<ModelId, ModelId, ModelId>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.text */
  repoUrl: ColumnType<string | null, string | null, string | null>;
}

export type Project = Selectable<ProjectTable>;

export type NewProject = Insertable<ProjectTable>;

export type ProjectUpdate = Updateable<ProjectTable>;

export const projectId = z.string();

export const project = z.object({
  id: projectId,
  name: z.string(),
  workspaceId: workspaceId,
  modelId: modelId,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  repoUrl: z.string().nullable(),
});

export const projectInitializer = z.object({
  id: projectId,
  name: z.string(),
  workspaceId: workspaceId,
  modelId: modelId,
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  repoUrl: z.string().optional().nullable(),
});

export const projectMutator = z.object({
  id: projectId.optional(),
  name: z.string().optional(),
  workspaceId: workspaceId.optional(),
  modelId: modelId.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  repoUrl: z.string().optional().nullable(),
});
