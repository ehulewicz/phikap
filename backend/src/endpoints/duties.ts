import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const EventDuty = z.object({
	id: z.number(),
	event_id: z.number(),
	duty_definition_id: z.number(),
	description: z.string(),
	duty_type: z.string(),
	points: z.number(),
	required_brothers: z.number(),
	time: z.string(),
	assigned_count: z.number(),
});

export class DutyList extends OpenAPIRoute {
	schema = {
		tags: ["Duties"],
		summary: "List event duties",
		request: {
			query: z.object({
				event_id: Num({ required: false, description: "Event id" }),
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
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
							meta: PaginationMeta,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { query } = await this.getValidatedData<typeof this.schema>();
		const page = query.page ?? 1;
		const pageSize = query.page_size ?? 20;
		const offset = (page - 1) * pageSize;
		const eventId = query.event_id ?? null;

		const where: string[] = [];
		const params: Array<number> = [];

		if (eventId !== null && Number.isFinite(eventId)) {
			where.push("event_id = ?");
			params.push(eventId);
		}

		const countResult = await c.env.phikap_db
			.prepare(
				`SELECT COUNT(*) AS total
				 FROM event_duty
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`
			)
			.bind(...params)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT
					ed.id,
					ed.event_id,
					ed.duty_definition_id,
					dd.description,
					dt.name AS duty_type,
					ed.points,
					ed.required_brothers,
					ed.time,
					COUNT(a.id) AS assigned_count
				 FROM event_duty ed
				 JOIN duty_definition dd ON dd.id = ed.duty_definition_id
				 JOIN duty_type dt ON dt.id = dd.duty_type_id
				 LEFT JOIN event_duty_assignment a ON a.event_duty_id = ed.id
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
				 GROUP BY ed.id
				 ORDER BY ed.time ASC, ed.id ASC
				 LIMIT ? OFFSET ?`
			)
			.bind(...params, pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			duties: (result.results ?? []).map((row) => ({
				...row,
				assigned_count: Number(row.assigned_count ?? 0),
			})),
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
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

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_id, duty_definition_id, points, required_brothers, time } =
			data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event_duty
				 (event_id, duty_definition_id, points, required_brothers, time)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.bind(event_id, duty_definition_id, points, required_brothers, time)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare(
				`SELECT id, event_id, duty_definition_id, points, required_brothers, time
				 FROM event_duty
				 WHERE id = ?`
			)
			.bind(id)
			.first();

		return {
			success: true,
			duty: created ?? null,
		};
	}
}

export class DutyUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Duties"],
		summary: "Update an event duty",
		request: {
			params: z.object({
				duty_id: Num({ description: "Duty id" }),
			}),
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
				description: "Updated duty",
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

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { duty_id } = data.params;
		const { event_id, duty_definition_id, points, required_brothers, time } =
			data.body;

		await c.env.phikap_db
			.prepare(
				`UPDATE event_duty
				 SET event_id = ?, duty_definition_id = ?, points = ?, required_brothers = ?, time = ?
				 WHERE id = ?`
			)
			.bind(event_id, duty_definition_id, points, required_brothers, time, duty_id)
			.run();

		const updated = await c.env.phikap_db
			.prepare(
				`SELECT id, event_id, duty_definition_id, points, required_brothers, time
				 FROM event_duty
				 WHERE id = ?`
			)
			.bind(duty_id)
			.first();

		return {
			success: true,
			duty: updated ?? null,
		};
	}
}

export class DutyDelete extends OpenAPIRoute {
	schema = {
		tags: ["Duties"],
		summary: "Delete an event duty",
		request: {
			params: z.object({
				duty_id: Num({ description: "Duty id" }),
			}),
		},
		responses: {
			"200": {
				description: "Deleted duty",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { duty_id } = data.params;

		await c.env.phikap_db
			.prepare("DELETE FROM event_duty_assignment WHERE event_duty_id = ?")
			.bind(duty_id)
			.run();

		await c.env.phikap_db
			.prepare("DELETE FROM event_duty WHERE id = ?")
			.bind(duty_id)
			.run();

		return {
			success: true,
		};
	}
}
