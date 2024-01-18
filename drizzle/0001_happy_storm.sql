CREATE TABLE IF NOT EXISTS "cloud_device" (
	"hardware_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cloud_system" (
	"hardware_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_device" ADD CONSTRAINT "cloud_device_hardware_id_cloud_hardware_id_fk" FOREIGN KEY ("hardware_id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cloud_system" ADD CONSTRAINT "cloud_system_hardware_id_cloud_hardware_id_fk" FOREIGN KEY ("hardware_id") REFERENCES "cloud_hardware"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
