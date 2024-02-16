// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type default as KyselyMigrationTable } from './KyselyMigration';
import { type default as KyselyMigrationLockTable } from './KyselyMigrationLock';
import { type default as WorkspaceTable } from './Workspace';
import { type default as UserTable } from './User';
import { type default as UserSessionTable } from './UserSession';
import { type default as OauthAccountTable } from './OauthAccount';
import { type default as PasswordResetTokenTable } from './PasswordResetToken';
import { type default as EmailVerificationTable } from './EmailVerification';
import { type default as UserInviteTable } from './UserInvite';
import { type default as WorkspaceUserTable } from './WorkspaceUser';
import { type default as ModelTable } from './Model';
import { type default as ModelRelationTable } from './ModelRelation';
import { type default as ProjectTable } from './Project';
import { type default as TestTable } from './Test';
import { type default as HardwareTable } from './Hardware';
import { type default as HardwareRelationTable } from './HardwareRelation';
import { type default as ProjectHardwareTable } from './ProjectHardware';
import { type default as MeasurementTable } from './Measurement';
import { type default as TagTable } from './Tag';
import { type default as MeasurementTagTable } from './MeasurementTag';
import { type default as SecretTable } from './Secret';
import { type default as HardwareRevisionTable } from './HardwareRevision';

export default interface PublicSchema {
  kysely_migration: KyselyMigrationTable;

  kysely_migration_lock: KyselyMigrationLockTable;

  workspace: WorkspaceTable;

  user: UserTable;

  user_session: UserSessionTable;

  oauth_account: OauthAccountTable;

  password_reset_token: PasswordResetTokenTable;

  email_verification: EmailVerificationTable;

  user_invite: UserInviteTable;

  workspace_user: WorkspaceUserTable;

  model: ModelTable;

  model_relation: ModelRelationTable;

  project: ProjectTable;

  test: TestTable;

  hardware: HardwareTable;

  hardware_relation: HardwareRelationTable;

  project_hardware: ProjectHardwareTable;

  measurement: MeasurementTable;

  tag: TagTable;

  measurement_tag: MeasurementTagTable;

  secret: SecretTable;

  hardware_revision: HardwareRevisionTable;
}