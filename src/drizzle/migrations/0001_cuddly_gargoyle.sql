ALTER TABLE "events" ALTER COLUMN "isActive" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_clerkUserId_unique" UNIQUE("clerkUserId");