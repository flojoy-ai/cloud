ALTER TABLE "cloud_workspace" DROP CONSTRAINT "cloud_workspace_name_unique";--> statement-breakpoint
ALTER TABLE "cloud_workspace" ADD COLUMN "namespace" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cloud_workspace" ADD CONSTRAINT "cloud_workspace_namespace_unique" UNIQUE("namespace");