import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

const Event = z.object({
	id: z.number(),
	name: z.string(),
	event_definition_id: z.number(),
	date: z.string(),
	start_time: z.string(),
	end_time: z.string(),
	duties_unlocked: z.number(),
});

const EventDuty = z.object({
	id: z.number(),
	duty_definition_id: z.number(),
	points: z.number(),
	required_brothers: z.number(),
	time: z.string(),
	assigned_count: z.number().optional(),
});

const Assignment = z.object({
	id: z.number(),
	event_duty_id: z.number(),
	brother_id: z.number(),
	status_id: z.number(),
});

export class EventList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List events",
		request: {
			query: z.object({
				from: Str({ required: false, description: "YYYY-MM-DD" }),
				to: Str({ required: false, description: "YYYY-MM-DD" }),
				include_duties: Str({ required: false, description: "true|false" }),
			}),
		},
		responses: {
			"200": {
				description: "List of events",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							events: Event.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			events: [],
		};
	}
}

export class EventDutiesList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List duties for an event",
		request: {
			params: z.object({
				event_id: Num({ description: "Event id" }),
			}),
		},
		responses: {
			"200": {
				description: "List of duties",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							duties: EventDuty.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			duties: [],
		};
	}
}

export class EventDutyAssignmentsList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List assignments for an event duty",
		request: {
			params: z.object({
				event_id: Num({ description: "Event id" }),
				event_duty_id: Num({ description: "Event duty id" }),
			}),
		},
		responses: {
			"200": {
				description: "Assignments",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							assignments: Assignment.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			assignments: [],
		};
	}
}

export class EventDutyAssignmentCreate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Assign a brother to an event duty",
		request: {
			params: z.object({
				event_id: Num({ description: "Event id" }),
				event_duty_id: Num({ description: "Event duty id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							brother_id: z.number(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Assignment created",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							assignment: Assignment.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			assignment: null,
		};
	}
}
