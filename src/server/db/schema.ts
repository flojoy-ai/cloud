import {
  index,
  text,
  pgTableCreator,
  timestamp,
  varchar,
  pgEnum,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const pgTable = pgTableCreator((name) => `cloud_${name}`);

// The base modal to setup the ID with a prefix and a createdAt timestamp.
const baseModal = (prefix: string) => ({
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => prefix + "_" + createId()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// We will use Auth0 for the public cloud, but we can extend
// this enum to support other auth providers in the future.
export const authProviderEnum = pgEnum("auth_provider", ["auth0"]);

// After a user signs up with the auth provider, we will create a user
// object in our database as well. This user object will also record the
// unique ID from the auth provider such that we can easily look up user
// information from the auth provider.
// When the 'signupCompleted' field is false, we will redirect the user
// to a signup wizard (which we can use to collect more info)
// to complete the signup process.
export const users = pgTable(
  "users",
  {
    ...baseModal("user"),
    authProvider: authProviderEnum("auth_provider").notNull(),
    authProviderUserID: text("auth_provider_user_id").notNull(),
    updatedAt: timestamp("updated_at"),
    signupCompleted: boolean("signup_completed").default(false),
  },
  (user) => ({
    authProviderUserIDIndex: index("auth_provider_user_id_index").on(
      user.authProvider,
      user.authProviderUserID,
    ),
  }),
);

// Upon creating a Flojoy Cloud account, the user will be prompted to
// create a workspace. (This can be a part of the singup wizard like mentioned
// in the comment above).
export const planTypeEnum = pgEnum("plan_type", ["hobby", "pro", "enterprise"]);

export const workspaces = pgTable(
  "workspaces",
  {
    ...baseModal("workspace"),
    name: varchar("name", { length: 256 }).notNull(),
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
]);

export const workspaces_users = pgTable(
  "workspaces_users",
  {
    ...baseModal("workspace_user"),
    workspaceID: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userID: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceRole: workspaceRoleEnum("workspace_role").notNull(),
  },
  (workspace_user) => ({
    workspaceIDUserIDIndex: index("workspace_id_user_id_index").on(
      workspace_user.workspaceID,
      workspace_user.userID,
    ),
  }),
);

// This table should be self-explanatory.
export const projects = pgTable(
  "projects",
  {
    ...baseModal("project"),
    name: varchar("name", { length: 256 }).notNull(),
    updatedAt: timestamp("updated_at"),
    workspaceID: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
  },
  (project) => ({
    projectNameIndex: index("project_name_index").on(project.name),
  }),
);

// Each project can have multiple tests (not "software test").
export const tests = pgTable(
  "tests",
  {
    ...baseModal("test"),
    name: varchar("name", { length: 256 }).notNull(),
    updatedAt: timestamp("updated_at"),
    projectID: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (test) => ({
    testNameIndex: index("test_name_idx").on(test.name),
  }),
);

// Each project can have a bunch of hardware devices registered to it.
export const devices = pgTable(
  "devices",
  {
    ...baseModal("device"),
    name: varchar("name", { length: 256 }).notNull(),
    updatedAt: timestamp("updated_at"),
    projectID: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (device) => ({
    deviceNameIndex: index("device_name_idx").on(device.name),
  }),
);

// A measurement from a device that is associated with a test.
// The is_deleted field is used to soft-delete a measurement.
export const storageProviderEnum = pgEnum("storage_provider", [
  "s3",
  "postgres",
]);

export const measurements = pgTable(
  "measurements",
  {
    ...baseModal("measurement"),
    name: varchar("name", { length: 256 }),
    deviceID: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    testID: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    tags: varchar("tags", { length: 64 }).array(),
    isDeleted: boolean("is_deleted").default(false),
    storageProvider: storageProviderEnum("storage_provider").notNull(),
    storageLocation: jsonb("storage_location").notNull(),
  },
  (measurement) => ({
    measurementNameIndex: index("measurement_name_idx").on(measurement.name),
  }),
);
