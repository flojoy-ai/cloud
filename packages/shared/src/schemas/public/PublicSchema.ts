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
import { type default as ProductTable } from './Product';
import { type default as PartTable } from './Part';
import { type default as PartVariationTable } from './PartVariation';
import { type default as PartVariationRelationTable } from './PartVariationRelation';
import { type default as ProjectTable } from './Project';
import { type default as ProjectUserTable } from './ProjectUser';
import { type default as UnitTable } from './Unit';
import { type default as UnitRelationTable } from './UnitRelation';
import { type default as ProjectUnitTable } from './ProjectUnit';
import { type default as TestTable } from './Test';
import { type default as StationTable } from './Station';
import { type default as SessionTable } from './Session';
import { type default as MeasurementTable } from './Measurement';
import { type default as TagTable } from './Tag';
import { type default as MeasurementTagTable } from './MeasurementTag';
import { type default as UnitRevisionTable } from './UnitRevision';
import { type default as PartVariationTypeTable } from './PartVariationType';
import { type default as PartVariationMarketTable } from './PartVariationMarket';

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

  product: ProductTable;

  part: PartTable;

  part_variation: PartVariationTable;

  part_variation_relation: PartVariationRelationTable;

  project: ProjectTable;

  project_user: ProjectUserTable;

  unit: UnitTable;

  unit_relation: UnitRelationTable;

  project_unit: ProjectUnitTable;

  test: TestTable;

  station: StationTable;

  session: SessionTable;

  measurement: MeasurementTable;

  tag: TagTable;

  measurement_tag: MeasurementTagTable;

  unit_revision: UnitRevisionTable;

  part_variation_type: PartVariationTypeTable;

  part_variation_market: PartVariationMarketTable;
}
