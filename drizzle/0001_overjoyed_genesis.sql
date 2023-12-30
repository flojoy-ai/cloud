ALTER TYPE "workspace_role" ADD VALUE 'pending';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"measurement_id" text NOT NULL,
	CONSTRAINT "tag_unique" UNIQUE("measurement_id","name")
);
--> statement-breakpoint
ALTER TABLE "cloud_device" DROP CONSTRAINT "cloud_device_project_id_name_unique";--> statement-breakpoint
ALTER TABLE "cloud_project" DROP CONSTRAINT "cloud_project_workspace_id_name_unique";--> statement-breakpoint
ALTER TABLE "cloud_secret" DROP CONSTRAINT "cloud_secret_user_id_name_project_id_unique";--> statement-breakpoint
ALTER TABLE "cloud_test" DROP CONSTRAINT "cloud_test_project_id_name_unique";--> statement-breakpoint
ALTER TABLE "cloud_workspace_user" DROP CONSTRAINT "cloud_workspace_user_workspace_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "cloud_measurement" ALTER COLUMN "name" SET DEFAULT 'Untitled';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_name_idx" ON "cloud_tag" ("name","measurement_id");--> statement-breakpoint
ALTER TABLE "cloud_measurement" DROP COLUMN IF EXISTS "tags";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_tag" ADD CONSTRAINT "cloud_tag_measurement_id_cloud_measurement_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "cloud_measurement"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "cloud_device" ADD CONSTRAINT "device_unique" UNIQUE("project_id","name");--> statement-breakpoint
ALTER TABLE "cloud_project" ADD CONSTRAINT "project_unique" UNIQUE("workspace_id","name");--> statement-breakpoint
ALTER TABLE "cloud_secret" ADD CONSTRAINT "secret_unique" UNIQUE("user_id","name","project_id");--> statement-breakpoint
ALTER TABLE "cloud_test" ADD CONSTRAINT "test_unique" UNIQUE("project_id","name");--> statement-breakpoint
ALTER TABLE "cloud_workspace_user" ADD CONSTRAINT "workspace_user_unique" UNIQUE("workspace_id","user_id");