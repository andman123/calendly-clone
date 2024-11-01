import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { CalendarPlus, CalendarRange } from "lucide-react";
import { db } from "../../../drizzle/db";
import { auth } from "@clerk/nextjs/server";

export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth();

  if (userId === null) return redirectToSignIn();

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
  return (
    <>
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold">
          Events
        </h1>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="mr-4 size-6" /> New Event
          </Link>
        </Button>
      </div>

      {events.length > 0 ? (
        <h1>Events</h1>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="size-16 mx-auto" />
          You do not have any events yet.Create your first event to get started!
          <Button asChild size="lg" className="text-lg">
            <Link href="/events/new">
              <CalendarPlus className="mr-4 size-6" /> New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
