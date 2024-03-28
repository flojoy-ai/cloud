export { createClient } from "./eden";

// TODO: find a way to automate this
export type * as EmailVerification from "./schemas/public/EmailVerification";
export type * as Family from "./schemas/public/Family";
export type * as Hardware from "./schemas/public/Hardware";
export type * as HardwareRelation from "./schemas/public/HardwareRelation";
export type * as HardwareRevision from "./schemas/public/HardwareRevision";
export type * as Measurement from "./schemas/public/Measurement";
export type * as MeasurementTag from "./schemas/public/MeasurementTag";
export type * as MeasurementType from "./schemas/public/MeasurementType";
export type * as Model from "./schemas/public/Model";
export type * as ModelRelation from "./schemas/public/ModelRelation";
export type * as OauthAccount from "./schemas/public/OauthAccount";
export type * as PasswordResetToken from "./schemas/public/PasswordResetToken";
export type * as PlanType from "./schemas/public/PlanType";
export type * as Product from "./schemas/public/Product";
export type * as Project from "./schemas/public/Project";
export type * as ProjectHardware from "./schemas/public/ProjectHardware";
export type * as RevisionType from "./schemas/public/RevisionType";
export type * as Secret from "./schemas/public/Secret";
export type * as Session from "./schemas/public/Session";
export type * as Station from "./schemas/public/Station";
export type * as StorageProvider from "./schemas/public/StorageProvider";
export type * as Tag from "./schemas/public/Tag";
export type * as User from "./schemas/public/User";
export type * as UserInvite from "./schemas/public/UserInvite";
export type * as UserSession from "./schemas/public/UserSession";
export type * as Workspace from "./schemas/public/Workspace";
export type * as WorkspaceRole from "./schemas/public/WorkspaceRole";
export type * as WorkspaceUser from "./schemas/public/WorkspaceUser";

export type * from "./schemas/Database";
