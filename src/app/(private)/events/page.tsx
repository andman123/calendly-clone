import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { CalendarPlus, CalendarRange } from "lucide-react";
import { db } from "../../../drizzle/db";
import { auth } from "@clerk/nextjs/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { formatEventDescription } from "../../../lib/formatters";
import { CopyEventButton } from "../../../components/CopyEventButton";
import { cn } from "../../../lib/utils";

export const revaildate = 0;

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
				<div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
					{events.map((event) => {
						return <EventCard key={event.id} {...event} />;
					})}
				</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					<CalendarRange className="size-16 mx-auto" />
					You do not have any events yet.Create your first event to
					get started!
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

type EventCardProps = {
	id: string;
	isActive: boolean | null;
	description: string | null;
	name: string;
	durationInMinutes: number;
	clerkUserId: string;
};

function EventCard({
	id,
	isActive,
	description,
	name,
	durationInMinutes,
	clerkUserId,
}: EventCardProps) {
	return (
		<Card
			className={cn("flex flex-col", !isActive && "border-secondary/50")}
		>
			<CardHeader className={cn(!isActive && "opacity-50")}>
				<CardTitle>{name}</CardTitle>
				<CardDescription>
					{formatEventDescription(durationInMinutes)}
				</CardDescription>
			</CardHeader>
			{description != null && (
				<CardContent className={cn(!isActive && "opacity-50")}>
					{description}
				</CardContent>
			)}
			<CardFooter className="flex justify-end gap-2 mt-auto">
				{isActive && (
					<CopyEventButton
						variant="outline"
						eventId={id}
						clerkUserId={clerkUserId}
					/>
				)}
				<Button asChild>
					<Link href={`/events/${id}/edit`}>Edit</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
