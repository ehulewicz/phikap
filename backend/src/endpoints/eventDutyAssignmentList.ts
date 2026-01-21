import { Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EventDutyAssignment, type AppContext } from "../types";

export class EventDutyAssignmentList extends OpenAPIRoute {
	schema = {
		tags: ["Event Duty Assignments"],
		summary: "List duty assignments for an event",
		request: {
			query: z.object({
				event_id: Num({ description: "Event id" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns assignments for the event",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							assignments: EventDutyAssignment.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_id } = data.query;

		const { results } = await c.env.phikap_db
			.prepare(
				`SELECT
					edaa.id,
					edaa.event_duty_id,
					edaa.brother_id,
					edaa.status_id
				FROM event_duty_assignment edaa
				JOIN event_duty ed ON ed.id = edaa.event_duty_id
				WHERE ed.event_id = ?`,
			)
			.bind(event_id)
			.all();

		return {
			success: true,
			assignments: results ?? [],
		};
	}
}
