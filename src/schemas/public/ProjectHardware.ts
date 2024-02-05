// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { projectId, type ProjectId } from './Project';
import { hardwareId, type HardwareId } from './Hardware';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.project_hardware */
export default interface ProjectHardwareTable {
  /** Database type: pg_catalog.text */
  ProjectId: ColumnType<ProjectId, ProjectId, ProjectId>;

  /** Database type: pg_catalog.text */
  HardwareId: ColumnType<HardwareId, HardwareId, HardwareId>;
}

export type ProjectHardware = Selectable<ProjectHardwareTable>;

export type NewProjectHardware = Insertable<ProjectHardwareTable>;

export type ProjectHardwareUpdate = Updateable<ProjectHardwareTable>;

export const projectHardware = z.object({
  ProjectId: projectId,
  HardwareId: hardwareId,
});

export const projectHardwareInitializer = z.object({
  ProjectId: projectId,
  HardwareId: hardwareId,
});

export const projectHardwareMutator = z.object({
  ProjectId: projectId.optional(),
  HardwareId: hardwareId.optional(),
});
