"use server";

import "use-server";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { endOfDay, startOfDay } from "date-fns";

export async function getCalendarEventTimes(
	clerkUserId: string,
	{ start, end }: { start: Date; end: Date }
) {
	const oAuthClient = await getOAuthClient(clerkUserId);
	console.log(oAuthClient);
	let events: any;
	try {
		events = await google.calendar("v3").events.list({
			calendarId: "primary",
			eventTypes: ["default"],
			singleEvents: true,
			timeMin: start.toISOString(),
			timeMax: end.toISOString(),
			maxResults: 2500,
			auth: oAuthClient,
		});
	} catch (error) {
		console.log(error);
	}

	// return (
	// 	events.data.items
	// 		?.map((item) => {
	// 			if (item.start?.date != null && item.end?.date != null) {
	// 				return {
	// 					start: startOfDay(item.start.date),
	// 					end: endOfDay(item.end.date),
	// 				};
	// 			}

	// 			if (
	// 				item.start?.dateTime != null &&
	// 				item.end?.dateTime != null
	// 			) {
	// 				return {
	// 					start: new Date(item.start?.dateTime),
	// 					end: new Date(item.end?.dateTime),
	// 				};
	// 			}
	// 		})
	// 		.filter((date) => date != null) || []
	// );
}

async function getOAuthClient(clerkUserId: string) {
	const token = await (
		await clerkClient()
	).users.getUserOauthAccessToken(clerkUserId, "oauth_google");
	console.log(token.data[0]);
	if (token.data.length === 0 || token.data[0].token === null) {
		return;
	}

	const googleClient = new google.auth.OAuth2(
		process.env.GOOGLE_OAUTH_CLIENT_ID,
		process.env.GOOGLE_OAUTH_CLIENT_SECRET,
		process.env.GOOGLE_OAUTH_REDIRECT_URL
	);

	googleClient.setCredentials({
		access_token: token.data[0].token,
	});

	return googleClient;
}
