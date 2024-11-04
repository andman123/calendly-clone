import { auth } from "@clerk/nextjs/server";
import { EventForm } from "../../../../../components/forms/EventForm";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../../components/ui/card";
import { db } from "../../../../../drizzle/db";
import { EventTable } from "../../../../../drizzle/schema";
import { notFound } from "next/navigation";

export const revaildate = 0;

export default async function EditEventPage({
	params: { eventId },
}: {
	params: { eventId: string };
}) {
	const { userId, redirectToSignIn } = await auth();

	if (userId === null) {
		return redirectToSignIn();
	}

	const event = await db.query.EventTable.findFirst({
		where: ({ id, clerkUserId }, { eq, and }) =>
			and(eq(clerkUserId, userId), eq(id, eventId)),
	});

	if (event == null) {
		return notFound();
	}

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Edit Event</CardTitle>
			</CardHeader>
			<CardContent>
				<EventForm
					event={{
						...event,
						description: event.description || undefined,
						isActive: !!event.isActive,
					}}
				/>
			</CardContent>
		</Card>
	);
}
