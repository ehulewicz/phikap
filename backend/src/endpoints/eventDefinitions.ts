import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

const EventDefinition = z.object({
	id: z.number(),
	name: z.string(),
	admin_points: z.number(),
});

const EventDefinitionDuty = z.object({
	id: z.number(),
	event_definition_id: z.number(),
	duty_definition_id: z.number(),
	default_points: z.number(),
	default_required_brothers: z.number(),
});

export class EventDefinitionList extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "List event definitions",
		responses: {
			"200": {
				description: "Event definitions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event_definitions: EventDefinition.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			event_definitions: [],
		};
	}
}

export class EventDefinitionDutiesList extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "List default duties for an event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
			}),
		},
		responses: {
			"200": {
				description: "Default duties",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							duties: EventDefinitionDuty.array(),
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
