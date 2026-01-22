import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

const EventDuty = z.object({
	id: z.number(),
	event_id: z.number(),
	duty_definition_id: z.number(),
	points: z.number(),
	required_brothers: z.number(),
	time: z.string(),
});

export class DutyList extends OpenAPIRoute {
	schema = {
		tags: ["Duties"],
		summary: "List event duties",
		request: {
			query: z.object({
				event_id: Num({ required: false, description: "Event id" }),
			}),
		},
		responses: {
			"200": {
				description: "Event duties",
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

export class DutyCreate extends OpenAPIRoute {
	schema = {
		tags: ["Duties"],
		summary: "Create an event duty",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							event_id: z.number(),
							duty_definition_id: z.number(),
							points: z.number(),
							required_brothers: z.number(),
							time: Str(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created duty",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							duty: EventDuty.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			duty: null,
		};
	}
}
