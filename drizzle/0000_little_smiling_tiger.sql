DO $$ BEGIN
 CREATE TYPE "auth_provider" AS ENUM('auth0');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "measurement_type" AS ENUM('boolean', 'dataframe', 'image');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plan_type" AS ENUM('hobby', 'pro', 'enterprise');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "storage_provider" AS ENUM('s3', 'local');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "workspace_role" AS ENUM('owner', 'admin', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_device" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp,
	"project_id" text NOT NULL,
	CONSTRAINT "cloud_device_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_measurement" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text DEFAULT 'Untitled Measurement',
	"device_id" text NOT NULL,
	"test_id" text NOT NULL,
	"measurement_type" "measurement_type" NOT NULL,
	"tags" text[],
	"storage_provider" "storage_provider" NOT NULL,
	"data" jsonb,
	"s3_bucket" text,
	"s3_key" text,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_project" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp,
	"workspace_id" text NOT NULL,
	CONSTRAINT "cloud_project_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_test" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp,
	"measurement_type" "measurement_type" NOT NULL,
	"project_id" text NOT NULL,
	CONSTRAINT "cloud_test_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"signup_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hashed_password" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"auth_provider" "auth_provider" NOT NULL,
	"active_expires" bigint NOT NULL,
	"idle_expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"total_seats" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_workspace_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspace_user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"workspace_role" "workspace_role" NOT NULL,
	CONSTRAINT "cloud_workspace_user_workspace_id_user_id_unique" UNIQUE("workspace_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_name_idx" ON "cloud_device" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "measurement_name_idx" ON "cloud_measurement" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "measurement_device_id_idx" ON "cloud_measurement" ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "measurement_test_id_idx" ON "cloud_measurement" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_name_index" ON "cloud_project" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "test_name_idx" ON "cloud_test" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_name_index" ON "cloud_workspace" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_user_workspace_id_user_id_index" ON "cloud_workspace_user" ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_user_user_id_index" ON "cloud_workspace_user" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_user_workspace_id_index" ON "cloud_workspace_user" ("workspace_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_device" ADD CONSTRAINT "cloud_device_project_id_cloud_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "cloud_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurement" ADD CONSTRAINT "cloud_measurement_device_id_cloud_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "cloud_device"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurement" ADD CONSTRAINT "cloud_measurement_test_id_cloud_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "cloud_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project" ADD CONSTRAINT "cloud_project_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_test" ADD CONSTRAINT "cloud_test_project_id_cloud_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "cloud_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_user_key" ADD CONSTRAINT "cloud_user_key_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_user_session" ADD CONSTRAINT "cloud_user_session_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
