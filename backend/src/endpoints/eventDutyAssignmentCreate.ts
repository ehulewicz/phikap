import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { EventDutyAssignment, type AppContext } from "../types";

export class EventDutyAssignmentCreate extends OpenAPIRoute {
	schema = {
		tags: ["Event Duty Assignments"],
		summary: "Assign a brother to a duty",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							event_duty_id: z.number(),
							brother_id: z.number(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the new assignment",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							assignment: EventDutyAssignment,
						}),
					},
				},
			},
			"400": {
				description: "Validation error",
			},
			"404": {
				description: "Not found",
			},
			"409": {
				description: "Conflict",
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_duty_id, brother_id } = data.body;

		const duty = await c.env.phikap_db
			.prepare("SELECT id, required_brothers FROM event_duty WHERE id = ?")
			.bind(event_duty_id)
			.first();

		if (!duty) {
			return c.json({ success: false, error: "Duty not found" }, 404);
		}

		const brother = await c.env.phikap_db
			.prepare("SELECT id FROM brother WHERE id = ?")
			.bind(brother_id)
			.first();

		if (!brother) {
			return c.json({ success: false, error: "Brother not found" }, 404);
		}

		const existing = await c.env.phikap_db
			.prepare(
				"SELECT id FROM event_duty_assignment WHERE event_duty_id = ? AND brother_id = ?",
			)
			.bind(event_duty_id, brother_id)
			.first();

		if (existing) {
			return c.json({ success: false, error: "Already assigned" }, 409);
		}

		const countRow = await c.env.phikap_db
			.prepare(
				"SELECT COUNT(*) AS count FROM event_duty_assignment WHERE event_duty_id = ?",
			)
			.bind(event_duty_id)
			.first();

		const assignedCount = Number(countRow?.count ?? 0);
		const required = Number(duty.required_brothers ?? 0);
		if (assignedCount >= required) {
			return c.json({ success: false, error: "Duty is full" }, 409);
		}

		const inserted = await c.env.phikap_db
			.prepare(
				"INSERT INTO event_duty_assignment (event_duty_id, brother_id, status_id) VALUES (?, ?, 1) RETURNING id, event_duty_id, brother_id, status_id",
			)
			.bind(event_duty_id, brother_id)
			.first();

		return {
			success: true,
			assignment: inserted ?? {
				id: 0,
				event_duty_id,
				brother_id,
				status_id: 1,
			},
		};
	}
}
