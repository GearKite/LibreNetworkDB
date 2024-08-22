DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('W', 'B', 'E');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "networks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "networks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"bssid" "macaddr" NOT NULL,
	"type" "type" NOT NULL,
	CONSTRAINT "networks_bssid_type_unique" UNIQUE("bssid","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "observations" (
	"userId" uuid NOT NULL,
	"networkId" bigint NOT NULL,
	"ssid" varchar(248),
	"time" timestamp (0) NOT NULL,
	"position" geometry(point, 4326) NOT NULL,
	"altitude" integer,
	"accuracy" real,
	"signal" smallint NOT NULL,
	"service" text,
	"capabilities" text,
	CONSTRAINT "observations_networkId_time_position_pk" PRIMARY KEY("networkId","time","position")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp (0) DEFAULT now(),
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "observations" ADD CONSTRAINT "observations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "observations" ADD CONSTRAINT "observations_networkId_networks_id_fk" FOREIGN KEY ("networkId") REFERENCES "public"."networks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "networks_bssid_index" ON "networks" USING btree ("bssid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "networks_type_index" ON "networks" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "observations_userId_index" ON "observations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "observations_networkId_index" ON "observations" USING btree ("networkId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "observations_ssid_index" ON "observations" USING btree ("ssid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "observations_time_index" ON "observations" USING btree ("time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "observations_position_index" ON "observations" USING gist ("position");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_name_index" ON "users" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_index" ON "users" USING btree ("email");