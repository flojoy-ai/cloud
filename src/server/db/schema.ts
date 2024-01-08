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
import { relations } from "drizzle-orm";

export const pgTable = pgTableCreator((name) => `cloud_${name}`);

// The base modal to setup the ID with a prefix and a createdAt timestamp.
// All public facing tables should have these two fields.
const baseModal = (prefix: string) => ({
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => prefix + "_" + createId()),
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
  signupCompleted: boolean("signup_completed").default(false),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// The user_session and user_key tables are internal to Lucia
// Therefore, they do not have the baseModal fields (ID prefix).
export const authProviderEnum = pgEnum("auth_provider", ["google"]);

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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (workspace) => ({
    workspaceNameIndex: index().on(workspace.name),
  }),
);

export const workspaceRelation = relations(workspace, ({ many }) => ({
  projects: many(project),
}));

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
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    workspaceRole: workspaceRoleEnum("workspace_role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (workspace_user) => ({
    workspaceUserWorkspaceIdUserIdIndex: index().on(
      workspace_user.workspaceId,
      workspace_user.userId,
    ),
    workspaceUserUserIdIndex: index().on(workspace_user.userId),
    workspaceUserWorkspaceIdIndex: index().on(workspace_user.workspaceId),
    unq: unique().on(workspace_user.workspaceId, workspace_user.userId),
  }),
);

// This table should be self-explanatory.
export const project = pgTable(
  "project",
  {
    ...baseModal("project"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (project) => ({
    projectNameIndex: index().on(project.name),
    unq: unique().on(project.workspaceId, project.name),
  }),
);

export const projectRelation = relations(project, ({ many, one }) => ({
  tests: many(test),
  devices: many(device),
  workspace: one(workspace, {
    fields: [project.workspaceId],
    references: [workspace.id],
  }),
}));

export const measurementTypeEnum = pgEnum(
  "measurement_type",
  allMeasurementDataTypes,
);

// Each project can have multiple tests (not "software test").
export const test = pgTable(
  "test",
  {
    ...baseModal("test"),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    name: text("name").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (test) => ({
    testNameIndex: index().on(test.name),
    unq: unique().on(test.projectId, test.name),
  }),
);

export const testRelation = relations(test, ({ one, many }) => ({
  measurements: many(measurement),
  project: one(project, {
    fields: [test.projectId],
    references: [project.id],
  }),
}));

// Each project can have a bunch of hardware devices registered to it.
export const device = pgTable(
  "device",
  {
    ...baseModal("device"),
    name: text("name").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (device) => ({
    deviceNameIndex: index().on(device.name),
    unq: unique().on(device.projectId, device.name),
  }),
);

export const deviceRelation = relations(device, ({ one, many }) => ({
  measurements: many(measurement),
  project: one(project, {
    fields: [device.projectId],
    references: [project.id],
  }),
}));

// A measurement from a device that is associated with a test.
// The is_deleted field is used to soft-delete a measurement.
export const storageProviderEnum = pgEnum("storage_provider", ["s3", "local"]);

export const measurement = pgTable(
  "measurement",
  {
    isDeleted: boolean("is_deleted").default(false),
    // TODO: this needs a bit more thought, would be nice to make it more structured
    data: jsonb("data").$type<MeasurementData>().notNull(),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    ...baseModal("measurement"),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    name: text("name").default("Untitled"),
    storageProvider: storageProviderEnum("storage_provider").notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (measurement) => ({
    measurementNameIndex: index().on(measurement.name),
    measurementDeviceIdIndex: index().on(measurement.deviceId),
    measurementTestIdIndex: index().on(measurement.testId),
  }),
);

export const measurementRelation = relations(measurement, ({ one }) => ({
  test: one(test, {
    fields: [measurement.testId],
    references: [test.id],
  }),
  device: one(device, {
    fields: [measurement.deviceId],
    references: [device.id],
  }),
}));

export const tag = pgTable(
  "tag",
  {
    ...baseModal("tag"),
    name: text("name").notNull(),
    measurementId: text("measurement_id")
      .notNull()
      .references(() => measurement.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (tags) => ({
    tagNameMeasurementIdIndex: index().on(tags.name, tags.measurementId),
    unq: unique().on(tags.measurementId, tags.name),
  }),
);

export const secret = pgTable(
  "secret",
  {
    ...baseModal("secret"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (secret) => ({
    unq: unique().on(secret.userId, secret.workspaceId),
  }),
);
