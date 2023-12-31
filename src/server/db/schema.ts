import {
  index,
  text,
  pgTableCreator,
  timestamp,
  pgEnum,
  boolean,
  bigint,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { allMeasurementDataTypes, type MeasurementData } from "~/types/data";

export const pgTable = pgTableCreator((name) => `cloud_${name}`);

// The base modal to setup the ID with a prefix and a createdAt timestamp.
// All public facing tables should have these two fields.
const baseModal = (prefix: string) => ({
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => prefix + "_" + createId()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// After a user signs up with the auth provider, we will create a user
// object in our database as well. This user object will also record the
// unique ID from the auth provider such that we can easily look up user
// information from the auth provider.
// When the 'signupCompleted' field is false, we will redirect the user
// to a signup wizard (which we can use to collect more info)
// to complete the signup process.
export const user = pgTable("user", {
  ...baseModal("user"),
  updatedAt: timestamp("updated_at"),
  signupCompleted: boolean("signup_completed").default(false),
});

// The user_session and user_key tables are internal to Lucia
// Therefore, they do not have the baseModal fields (ID prefix).
export const authProviderEnum = pgEnum("auth_provider", ["auth0"]);

export const user_session = pgTable("user_session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  authProvider: authProviderEnum("auth_provider").notNull(),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const user_key = pgTable("user_key", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hashedPassword: text("hashed_password"),
});

// Upon creating a Flojoy Cloud account, the user will be prompted to
// create a workspace. (This can be a part of the singup wizard like mentioned
// in the comment above).
export const planTypeEnum = pgEnum("plan_type", ["hobby", "pro", "enterprise"]);

export const workspace = pgTable(
  "workspace",
  {
    ...baseModal("workspace"),
    name: text("name").notNull().unique(),
    planType: planTypeEnum("plan_type").notNull(),
    totalSeats: integer("total_seats").notNull().default(1),
    updatedAt: timestamp("updated_at"),
  },
  (workspace) => ({
    workspaceNameIndex: index("workspace_name_index").on(workspace.name),
  }),
);

// The workspaces_users table is a join table between the workspaces and users
// It is used to keep track of which user belongs to which workspace.
export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
  "pending", // An invite has sent but the user has not accepted it yet
]);

export const workspace_user = pgTable(
  "workspace_user",
  {
    ...baseModal("workspace_user"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceRole: workspaceRoleEnum("workspace_role").notNull(),
  },
  (workspace_user) => ({
    workspaceUserWorkspaceIdUserIdIndex: index(
      "workspace_user_workspace_id_user_id_index",
    ).on(workspace_user.workspaceId, workspace_user.userId),
    workspaceUserUserIdIndex: index("workspace_user_user_id_index").on(
      workspace_user.userId,
    ),
    workspaceUserWorkspaceIdIndex: index(
      "workspace_user_workspace_id_index",
    ).on(workspace_user.workspaceId),
    unq: unique("workspace_user_unique").on(
      workspace_user.workspaceId,
      workspace_user.userId,
    ),
  }),
);

// This table should be self-explanatory.
export const project = pgTable(
  "project",
  {
    ...baseModal("project"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
  },
  (project) => ({
    projectNameIndex: index("project_name_index").on(project.name),
    unq: unique("project_unique").on(project.workspaceId, project.name),
  }),
);

export const measurementTypeEnum = pgEnum(
  "measurement_type",
  allMeasurementDataTypes,
);

// Each project can have multiple tests (not "software test").
export const test = pgTable(
  "test",
  {
    ...baseModal("test"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at"),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
  },
  (test) => ({
    testNameIndex: index("test_name_idx").on(test.name),
    unq: unique("test_unique").on(test.projectId, test.name),
  }),
);

// Each project can have a bunch of hardware devices registered to it.
export const device = pgTable(
  "device",
  {
    ...baseModal("device"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at"),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
  },
  (device) => ({
    deviceNameIndex: index("device_name_idx").on(device.name),
    unq: unique("device_unique").on(device.projectId, device.name),
  }),
);

// A measurement from a device that is associated with a test.
// The is_deleted field is used to soft-delete a measurement.
export const storageProviderEnum = pgEnum("storage_provider", ["s3", "local"]);

export const measurement = pgTable(
  "measurement",
  {
    ...baseModal("measurement"),
    name: text("name").default("Untitled"),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    storageProvider: storageProviderEnum("storage_provider").notNull(),
    // TODO: this needs a bit more thought, would be nice to make it more structured
    data: jsonb("data").$type<MeasurementData>().notNull(),
    isDeleted: boolean("is_deleted").default(false),
  },
  (measurement) => ({
    measurementNameIndex: index("measurement_name_idx").on(measurement.name),
    measurementDeviceIdIndex: index("measurement_device_id_idx").on(
      measurement.deviceId,
    ),
    measurementTestIdIndex: index("measurement_test_id_idx").on(
      measurement.testId,
    ),
  }),
);

export const tag = pgTable(
  "tag",
  {
    ...baseModal("tag"),
    name: text("name").notNull(),
    measurementId: text("measurement_id")
      .notNull()
      .references(() => measurement.id, { onDelete: "cascade" }),
  },
  (tags) => ({
    tagNameMeasurementIdIndex: index("tag_name_idx").on(
      tags.name,
      tags.measurementId,
    ),
    unq: unique("tag_unique").on(tags.measurementId, tags.name),
  }),
);

export const secret = pgTable(
  "secret",
  {
    ...baseModal("secret"),
    name: text("name").notNull(),
    value: text("value").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
  },
  (secret) => ({
    unq: unique("secret_unique").on(
      secret.userId,
      secret.name,
      secret.projectId,
    ),
  }),
);
