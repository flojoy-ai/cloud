DO $$ BEGIN
 CREATE TYPE "auth_provider" AS ENUM('google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "measurement_type" AS ENUM('boolean', 'dataframe');
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
 CREATE TYPE "workspace_role" AS ENUM('owner', 'admin', 'member', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_device" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"workspace_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_device_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_measurement" (
	"is_deleted" boolean DEFAULT false,
	"data" jsonb NOT NULL,
	"device_id" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"measurement_type" "measurement_type" NOT NULL,
	"name" text DEFAULT 'Untitled',
	"storage_provider" "storage_provider" NOT NULL,
	"test_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"workspace_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_project_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_project_device" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cloud_project_device_project_id_device_id_unique" UNIQUE("project_id","device_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_secret" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"value" text NOT NULL,
	"workspace_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "cloud_secret_user_id_workspace_id_unique" UNIQUE("user_id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"measurement_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cloud_tag_measurement_id_name_unique" UNIQUE("measurement_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_test" (
	"id" text PRIMARY KEY NOT NULL,
	"measurement_type" "measurement_type" NOT NULL,
	"name" text NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_test_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user" (
	"id" text PRIMARY KEY NOT NULL,
	"signup_completed" boolean DEFAULT false,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_user_email_unique" UNIQUE("email")
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
	"name" text NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"total_seats" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_workspace_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspace_user" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"workspace_role" "workspace_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cloud_workspace_user_workspace_id_user_id_unique" UNIQUE("workspace_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_device_name_index" ON "cloud_device" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_name_index" ON "cloud_measurement" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_device_id_index" ON "cloud_measurement" ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_test_id_index" ON "cloud_measurement" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_project_name_index" ON "cloud_project" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_project_device_project_id_device_id_index" ON "cloud_project_device" ("project_id","device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_project_device_project_id_index" ON "cloud_project_device" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_project_device_device_id_index" ON "cloud_project_device" ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_tag_name_measurement_id_index" ON "cloud_tag" ("name","measurement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_test_name_index" ON "cloud_test" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_workspace_name_index" ON "cloud_workspace" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_workspace_user_workspace_id_user_id_index" ON "cloud_workspace_user" ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_workspace_user_user_id_index" ON "cloud_workspace_user" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_workspace_user_workspace_id_index" ON "cloud_workspace_user" ("workspace_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_device" ADD CONSTRAINT "cloud_device_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurement" ADD CONSTRAINT "cloud_measurement_device_id_cloud_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."cloud_device"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurement" ADD CONSTRAINT "cloud_measurement_test_id_cloud_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."cloud_test"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project" ADD CONSTRAINT "cloud_project_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project_device" ADD CONSTRAINT "cloud_project_device_project_id_cloud_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cloud_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project_device" ADD CONSTRAINT "cloud_project_device_device_id_cloud_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."cloud_device"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_secret" ADD CONSTRAINT "cloud_secret_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_secret" ADD CONSTRAINT "cloud_secret_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_tag" ADD CONSTRAINT "cloud_tag_measurement_id_cloud_measurement_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "public"."cloud_measurement"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_test" ADD CONSTRAINT "cloud_test_project_id_cloud_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cloud_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_user_key" ADD CONSTRAINT "cloud_user_key_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cloud_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_user_session" ADD CONSTRAINT "cloud_user_session_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cloud_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
