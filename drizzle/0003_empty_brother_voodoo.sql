ALTER TABLE "networks" ALTER COLUMN "bssid" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "networks_location_index" ON "networks" USING gist ("location");