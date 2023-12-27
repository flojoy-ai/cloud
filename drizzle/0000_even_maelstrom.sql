CREATE TABLE IF NOT EXISTS "cloud_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256) NOT NULL,
	"updated_at" timestamp,
	"project_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_measurements" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256),
	"device_id" text NOT NULL,
	"test_id" text NOT NULL,
	"tags" varchar(64)[],
	"is_deleted" boolean DEFAULT false,
	"storage_provider" "storage_provider" NOT NULL,
	"storage_location" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256) NOT NULL,
	"updated_at" timestamp,
	"workspace_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256) NOT NULL,
	"updated_at" timestamp,
	"project_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"auth_provider" "auth_provider" NOT NULL,
	"auth_provider_user_id" text NOT NULL,
	"updated_at" timestamp,
	"signup_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(256) NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"total_seats" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspaces_users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"workspace_role" "workspace_role" NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "cloud_devices" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "cloud_measurements" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "cloud_projects" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "cloud_tests" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_provider_user_id_idx" ON "cloud_users" ("auth_provider","auth_provider_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "cloud_workspaces" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_id_idx" ON "cloud_workspaces_users" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "cloud_workspaces_users" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_devices" ADD CONSTRAINT "cloud_devices_project_id_cloud_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "cloud_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurements" ADD CONSTRAINT "cloud_measurements_device_id_cloud_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "cloud_devices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurements" ADD CONSTRAINT "cloud_measurements_test_id_cloud_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "cloud_tests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_projects" ADD CONSTRAINT "cloud_projects_workspace_id_cloud_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_tests" ADD CONSTRAINT "cloud_tests_project_id_cloud_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "cloud_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspaces_users" ADD CONSTRAINT "cloud_workspaces_users_workspace_id_cloud_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspaces_users" ADD CONSTRAINT "cloud_workspaces_users_user_id_cloud_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
