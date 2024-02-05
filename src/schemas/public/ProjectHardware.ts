// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { projectId, type ProjectId } from './Project';
import { hardwareId, type HardwareId } from './Hardware';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

/** Represents the table public.project_hardware */
export default interface ProjectHardwareTable {
  project_id: ColumnType<ProjectId, ProjectId, ProjectId>;

  hardware_id: ColumnType<HardwareId, HardwareId, HardwareId>;
}

export const projectHardware = z.object({
  project_id: projectId,
  hardware_id: hardwareId,
}) as unknown as z.Schema<ProjectHardware>;

export const projectHardwareInitializer = z.object({
  project_id: projectId,
  hardware_id: hardwareId,
}) as unknown as z.Schema<ProjectHardwareInitializer>;

export const projectHardwareMutator = z.object({
  project_id: projectId.optional(),
  hardware_id: hardwareId.optional(),
}) as unknown as z.Schema<ProjectHardwareMutator>;

export type ProjectHardware = Selectable<ProjectHardwareTable>;

export type NewProjectHardware = Insertable<ProjectHardwareTable>;

export type ProjectHardwareUpdate = Updateable<ProjectHardwareTable>;
