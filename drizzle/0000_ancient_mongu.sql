DO $$ BEGIN
 CREATE TYPE "workspace_role" AS ENUM('owner', 'admin', 'member', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_device" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_hardware" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"model_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_hardware_workspace_id_name_model_id_unique" UNIQUE("workspace_id","name","model_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_system_device" (
	"system_id" text NOT NULL,
	"device_id" text NOT NULL,
	CONSTRAINT "cloud_system_device_system_id_device_id_pk" PRIMARY KEY("system_id","device_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_system" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_measurement" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Untitled',
	"data" jsonb NOT NULL,
	"pass" boolean,
	"hardware_id" text NOT NULL,
	"test_id" text NOT NULL,
	"storage_provider" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_device_model" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_model" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cloud_model_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_system_model_device_model" (
	"system_model_id" text NOT NULL,
	"device_model_id" text NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "cloud_system_model_device_model_system_model_id_device_model_id_pk" PRIMARY KEY("system_model_id","device_model_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_system_model" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"workspace_id" text NOT NULL,
	"model_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_project_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_project_hardware" (
	"project_id" text NOT NULL,
	"hardware_id" text NOT NULL,
	CONSTRAINT "cloud_project_hardware_project_id_hardware_id_pk" PRIMARY KEY("project_id","hardware_id")
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
	"measurement_type" text NOT NULL,
	"name" text NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_test_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_email_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_oauth_account" (
	"provider_id" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "cloud_oauth_account_provider_id_provider_user_id_pk" PRIMARY KEY("provider_id","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_password_reset_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_user" (
	"id" text PRIMARY KEY NOT NULL,
	"email_verified" boolean DEFAULT false,
	"email" text NOT NULL,
	"hashed_password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"namespace" text NOT NULL,
	"plan_type" text NOT NULL,
	"total_seats" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "cloud_workspace_namespace_unique" UNIQUE("namespace")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_workspace_user" (
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"workspace_role" "workspace_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cloud_workspace_user_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_hardware_name_index" ON "cloud_hardware" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_name_index" ON "cloud_measurement" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_hardware_id_index" ON "cloud_measurement" ("hardware_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_measurement_test_id_index" ON "cloud_measurement" ("test_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_model_name_index" ON "cloud_model" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_project_name_index" ON "cloud_project" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_tag_name_measurement_id_index" ON "cloud_tag" ("name","measurement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_test_name_index" ON "cloud_test" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cloud_workspace_namespace_index" ON "cloud_workspace" ("namespace");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_device" ADD CONSTRAINT "cloud_device_id_cloud_hardware_id_fk" FOREIGN KEY ("id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_hardware" ADD CONSTRAINT "cloud_hardware_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_hardware" ADD CONSTRAINT "cloud_hardware_model_id_cloud_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "cloud_model"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system_device" ADD CONSTRAINT "cloud_system_device_system_id_cloud_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "cloud_system"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system_device" ADD CONSTRAINT "cloud_system_device_device_id_cloud_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "cloud_device"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system" ADD CONSTRAINT "cloud_system_id_cloud_hardware_id_fk" FOREIGN KEY ("id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_measurement" ADD CONSTRAINT "cloud_measurement_hardware_id_cloud_hardware_id_fk" FOREIGN KEY ("hardware_id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "cloud_device_model" ADD CONSTRAINT "cloud_device_model_id_cloud_model_id_fk" FOREIGN KEY ("id") REFERENCES "cloud_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_model" ADD CONSTRAINT "cloud_model_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system_model_device_model" ADD CONSTRAINT "cloud_system_model_device_model_system_model_id_cloud_system_model_id_fk" FOREIGN KEY ("system_model_id") REFERENCES "cloud_system_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system_model_device_model" ADD CONSTRAINT "cloud_system_model_device_model_device_model_id_cloud_device_model_id_fk" FOREIGN KEY ("device_model_id") REFERENCES "cloud_device_model"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system_model" ADD CONSTRAINT "cloud_system_model_id_cloud_model_id_fk" FOREIGN KEY ("id") REFERENCES "cloud_model"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "cloud_project" ADD CONSTRAINT "cloud_project_model_id_cloud_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "cloud_model"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project_hardware" ADD CONSTRAINT "cloud_project_hardware_project_id_cloud_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "cloud_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_project_hardware" ADD CONSTRAINT "cloud_project_hardware_hardware_id_cloud_hardware_id_fk" FOREIGN KEY ("hardware_id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_secret" ADD CONSTRAINT "cloud_secret_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_secret" ADD CONSTRAINT "cloud_secret_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_tag" ADD CONSTRAINT "cloud_tag_measurement_id_cloud_measurement_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "cloud_measurement"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "cloud_email_verification" ADD CONSTRAINT "cloud_email_verification_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_oauth_account" ADD CONSTRAINT "cloud_oauth_account_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_password_reset_token" ADD CONSTRAINT "cloud_password_reset_token_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_user_id_cloud_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cloud_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "cloud_workspace_user_workspace_id_cloud_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "cloud_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
