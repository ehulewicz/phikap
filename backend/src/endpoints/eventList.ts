import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Event, type AppContext } from "../types";

export class EventList extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "List events",
		responses: {
			"200": {
				description: "Returns a list of events",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							events: Event.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { results } = await c.env.phikap_db
			.prepare(
				"SELECT id, name, event_type_id, date, start_time, end_time FROM event ORDER BY date, start_time",
			)
			.all();

		return {
			success: true,
			events: results ?? [],
		};
	}
}
