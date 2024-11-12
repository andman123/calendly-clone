"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { createEvent, updateEvent } from "../../server/actions/events";
import { Fragment, useState, useTransition } from "react";
import { DAYS_OF_WEEK_IN_ORDER } from "../../data/constants";
import { scheduleFormSchema } from "../../schema/schedule";
import { timeToInt } from "../../lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "../../lib/formatters";
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "../../server/actions/schedule";

type Availabilty = {
	startTime: string;
	endTime: string;
	dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export function ScheduleForm({
	schedule,
}: {
	schedule?: {
		timezone: string;
		availabilities: Availabilty[];
	};
}) {
	const [successMessage, setSuccessMessage] = useState("");
	const form = useForm<z.infer<typeof scheduleFormSchema>>({
		resolver: zodResolver(scheduleFormSchema),
		defaultValues: {
			timezone:
				schedule?.timezone ??
				Intl.DateTimeFormat().resolvedOptions().timeZone,
			availabilities: schedule?.availabilities.toSorted((a, b) => {
				return timeToInt(a.startTime) - timeToInt(b.startTime);
			}),
		},
	});

	const {
		append: addAvailability,
		remove: removeAvailability,
		fields: availabiltyFields,
	} = useFieldArray({ name: "availabilities", control: form.control });

	const groupedAvailabiltyFields = Object.groupBy(
		availabiltyFields.map((field, index) => ({ ...field, index })),
		(availabilty) => availabilty.dayOfWeek
	);

	async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
		const data = await saveSchedule(values);
		console.log(data);
		if (data?.error) {
			form.setError("root", {
				message: "There was error saving your schedule",
			});
		} else {
			setSuccessMessage("Schedule Saved!");
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex gap-6 flex-col"
			>
				{form.formState.errors.root && (
					<div className="text-destructive text-sm">
						{form.formState.errors.root.message}
					</div>
				)}
				{successMessage && (
					<div className="text-green-500 text-sm">
						{successMessage}
					</div>
				)}
				<FormField
					control={form.control}
					name="timezone"
					render={({ field }) => {
						return (
							<FormItem>
								<FormLabel>Timezone</FormLabel>
								<FormControl>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>{" "}
										<SelectContent>
											{Intl.supportedValuesOf(
												"timeZone"
											).map((timezone) => (
												<SelectItem
													key={timezone}
													value={timezone}
												>
													{timezone}
													{` (${formatTimezoneOffset(
														timezone
													)})`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>

								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
					{DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
						<Fragment key={dayOfWeek}>
							<div className="capitalize text-sm font-semibold">
								{dayOfWeek.substring(0, 3)}
							</div>
							<div className="flex flex-col gap-2">
								<Button
									type="button"
									className="size-6 p-1"
									variant="outline"
									onClick={() => {
										addAvailability({
											dayOfWeek,
											startTime: "9:00",
											endTime: "17:00",
										});
									}}
								>
									<Plus className="size-full" />
								</Button>
								{groupedAvailabiltyFields[dayOfWeek]?.map(
									(field, labelIndex) => (
										<div
											className="flex flex-col gap-1"
											key={field.id}
										>
											<div className="flex gap-2 items-center">
												<FormField
													control={form.control}
													name={`availabilities.${field.index}.startTime`}
													render={({ field }) => {
														return (
															<FormItem>
																<FormControl>
																	<Input
																		className="w-24"
																		aria-lable={`${dayOfWeek} Start Time ${
																			labelIndex +
																			1
																		}`}
																		{...field}
																	/>
																</FormControl>

																<FormMessage />
															</FormItem>
														);
													}}
												/>
												<FormField
													control={form.control}
													name={`availabilities.${field.index}.endTime`}
													render={({ field }) => {
														return (
															<FormItem>
																<FormControl>
																	<Input
																		className="w-24"
																		aria-lable={`${dayOfWeek} End Time ${
																			labelIndex +
																			1
																		}`}
																		{...field}
																	/>
																</FormControl>

																<FormMessage />
															</FormItem>
														);
													}}
												/>
												<Button
													type="button"
													className="size-6 p-1"
													variant="destructiveGhost"
													onClick={() => {
														removeAvailability(
															field.index
														);
													}}
												>
													<X />
												</Button>
											</div>
											<FormMessage>
												{
													form.formState.errors.availabilities?.at?.(
														field.index
													)?.root?.message
												}
											</FormMessage>
											<FormMessage>
												{
													form.formState.errors.availabilities?.at?.(
														field.index
													)?.startTime?.message
												}
											</FormMessage>
											<FormMessage>
												{
													form.formState.errors.availabilities?.at?.(
														field.index
													)?.endTime?.message
												}
											</FormMessage>
										</div>
									)
								)}
							</div>
						</Fragment>
					))}
				</div>

				<div className="flex gap-2 justify-end">
					<Button
						disabled={form.formState.isSubmitting}
						type="submit"
					>
						Save
					</Button>
				</div>
			</form>
		</Form>
	);
}
