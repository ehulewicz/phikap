import { Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EventDuty, type AppContext } from "../types";

export class EventDutyList extends OpenAPIRoute {
	schema = {
		tags: ["Event Duties"],
		summary: "List duties for an event",
		request: {
			query: z.object({
				event_id: Num({ description: "Event id" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns duties for the event",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							duties: EventDuty.array(),
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
					ed.id,
					ed.duty_definition_id,
					dt.name AS duty_type,
					dd.description,
					ed.points,
					ed.required_brothers,
					ed.due_time,
					ed.start_time,
					ed.end_time,
					COUNT(eda.id) AS assigned_count
				FROM event_duty ed
				JOIN duty_definition dd ON dd.id = ed.duty_definition_id
				JOIN duty_type dt ON dt.id = dd.duty_type_id
				LEFT JOIN event_duty_assignment eda ON eda.event_duty_id = ed.id
				WHERE ed.event_id = ?
				GROUP BY ed.id
				ORDER BY dt.id, dd.description`,
			)
			.bind(event_id)
			.all();

		const duties = (results ?? []).map((row) => ({
			...row,
			assigned_count: Number(row.assigned_count ?? 0),
		}));

		return {
			success: true,
			duties,
		};
	}
}
