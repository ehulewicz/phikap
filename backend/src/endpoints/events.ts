import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

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

const DutyOverride = z.object({
	duty_definition_id: z.number(),
	points: z.number().optional(),
	required_brothers: z.number().optional(),
	time: z.string().optional(),
});

const ExtraDuty = z.object({
	duty_definition_id: z.number(),
	points: z.number(),
	required_brothers: z.number(),
	time: z.string().optional(),
});

const EventWithDuties = Event.extend({
	duties: EventDuty.array().optional(),
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
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
			}),
		},
		responses: {
			"200": {
				description: "List of events",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							events: EventWithDuties.array(),
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
		const from = query.from ?? null;
		const to = query.to ?? null;
		const includeDuties = query.include_duties === "true";

		const where: string[] = [];
		const params: Array<string | number> = [];

		if (from) {
			where.push("date >= ?");
			params.push(from);
		}
		if (to) {
			where.push("date <= ?");
			params.push(to);
		}

		const countResult = await c.env.phikap_db
			.prepare(
				`SELECT COUNT(*) AS total
				 FROM event
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`
			)
			.bind(...params)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, name, event_definition_id, date, start_time, end_time, duties_unlocked
				 FROM event
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
				 ORDER BY date ASC, start_time ASC
				 LIMIT ? OFFSET ?`
			)
			.bind(...params, pageSize, offset)
			.all();

		const events = (result.results ?? []).map((row) => ({
			...row,
		})) as Array<z.infer<typeof EventWithDuties>>;

		if (includeDuties && events.length > 0) {
			const ids = events.map((event) => event.id);
			const placeholders = ids.map(() => "?").join(", ");
			const dutiesResult = await c.env.phikap_db
				.prepare(
					`SELECT id, event_id, duty_definition_id, points, required_brothers, time
					 FROM event_duty
					 WHERE event_id IN (${placeholders})
					 ORDER BY time ASC, id ASC`
				)
				.bind(...ids)
				.all();

			const dutiesByEvent = new Map<number, Array<z.infer<typeof EventDuty>>>();
			for (const duty of dutiesResult.results ?? []) {
				const eventId = Number(duty.event_id);
				const list = dutiesByEvent.get(eventId) ?? [];
				list.push({
					id: duty.id,
					duty_definition_id: duty.duty_definition_id,
					points: duty.points,
					required_brothers: duty.required_brothers,
					time: duty.time,
				});
				dutiesByEvent.set(eventId, list);
			}

			for (const event of events) {
				event.duties = dutiesByEvent.get(event.id) ?? [];
			}
		}

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			events,
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
		};
	}
}

export class EventCreate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Create event (seeds duties from event definition by default)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string(),
							event_definition_id: z.number(),
							date: z.string(),
							start_time: z.string(),
							end_time: z.string(),
							duty_overrides: z
								.array(DutyOverride)
								.optional(),
							extra_duties: z.array(ExtraDuty).optional(),
							include_default_duties: z.boolean().optional().default(true),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created event",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event: Event.nullable(),
							duties_created: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const {
			name,
			event_definition_id,
			date,
			start_time,
			end_time,
			duty_overrides,
			extra_duties,
			include_default_duties,
		} = data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event (name, event_definition_id, date, start_time, end_time)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.bind(name, event_definition_id, date, start_time, end_time)
			.run();

		const eventId = Number(insert.meta.last_row_id);
		let dutiesCreated = 0;

		const overridesMap = new Map<number, z.infer<typeof DutyOverride>>();
		for (const duty of duty_overrides ?? []) {
			overridesMap.set(duty.duty_definition_id, duty);
		}

		if (include_default_duties) {
			const defaults = await c.env.phikap_db
				.prepare(
					`SELECT duty_definition_id, default_points, default_required_brothers, default_time
					 FROM event_definition_duty
					 WHERE event_definition_id = ?`
				)
				.bind(event_definition_id)
				.all();

			if (defaults.results && defaults.results.length > 0) {
				const stmt = c.env.phikap_db.prepare(
					`INSERT INTO event_duty
					 (event_id, duty_definition_id, points, required_brothers, time)
					 VALUES (?, ?, ?, ?, ?)`
				);
				const batch = defaults.results.map((row) => {
					const override = overridesMap.get(row.duty_definition_id);
					const points = override?.points ?? row.default_points;
					const required = override?.required_brothers ?? row.default_required_brothers;
					const time =
						override?.time ?? (row.default_time as string | null) ?? start_time;
					return stmt.bind(eventId, row.duty_definition_id, points, required, time);
				});
				await c.env.phikap_db.batch(batch);
				dutiesCreated += defaults.results.length;
			}
		}

		if (extra_duties && extra_duties.length > 0) {
			const stmt = c.env.phikap_db.prepare(
				`INSERT INTO event_duty
				 (event_id, duty_definition_id, points, required_brothers, time)
				 VALUES (?, ?, ?, ?, ?)`
			);
			const batch = extra_duties.map((duty) =>
				stmt.bind(
					eventId,
					duty.duty_definition_id,
					duty.points,
					duty.required_brothers,
					duty.time ?? start_time
				)
			);
			await c.env.phikap_db.batch(batch);
			dutiesCreated += extra_duties.length;
		}

		const created = await c.env.phikap_db
			.prepare(
				`SELECT id, name, event_definition_id, date, start_time, end_time, duties_unlocked
				 FROM event
				 WHERE id = ?`
			)
			.bind(eventId)
			.first();

		return {
			success: true,
			event: created ?? null,
			duties_created: dutiesCreated,
		};
	}
}

export class EventUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Events"],
		summary: "Update event",
		request: {
			params: z.object({
				event_id: Num({ description: "Event id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string(),
							event_definition_id: z.number(),
							date: z.string(),
							start_time: z.string(),
							end_time: z.string(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Updated event",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event: Event.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_id } = data.params;
		const { name, event_definition_id, date, start_time, end_time } = data.body;

		const current = await c.env.phikap_db
			.prepare(
				`SELECT event_definition_id
				 FROM event
				 WHERE id = ?`
			)
			.bind(event_id)
			.first();
		const previousDefinitionId = Number(current?.event_definition_id ?? 0);

		await c.env.phikap_db
			.prepare(
				`UPDATE event
				 SET name = ?, event_definition_id = ?, date = ?, start_time = ?, end_time = ?
				 WHERE id = ?`
			)
			.bind(name, event_definition_id, date, start_time, end_time, event_id)
			.run();

		if (current && previousDefinitionId !== event_definition_id) {
			await c.env.phikap_db
				.prepare(
					`DELETE FROM event_duty_assignment
					 WHERE event_duty_id IN (
						SELECT id FROM event_duty WHERE event_id = ?
					 )`
				)
				.bind(event_id)
				.run();

			await c.env.phikap_db
				.prepare("DELETE FROM event_duty WHERE event_id = ?")
				.bind(event_id)
				.run();

			const defaults = await c.env.phikap_db
				.prepare(
					`SELECT duty_definition_id, default_points, default_required_brothers, default_time
					 FROM event_definition_duty
					 WHERE event_definition_id = ?`
				)
				.bind(event_definition_id)
				.all();

			if (defaults.results && defaults.results.length > 0) {
				const stmt = c.env.phikap_db.prepare(
					`INSERT INTO event_duty
					 (event_id, duty_definition_id, points, required_brothers, time)
					 VALUES (?, ?, ?, ?, ?)`
				);
				const batch = defaults.results.map((row) =>
					stmt.bind(
						event_id,
						row.duty_definition_id,
						row.default_points,
						row.default_required_brothers,
						(row.default_time as string | null) ?? start_time
					)
				);
				await c.env.phikap_db.batch(batch);
			}
		}

		const updated = await c.env.phikap_db
			.prepare(
				`SELECT id, name, event_definition_id, date, start_time, end_time, duties_unlocked
				 FROM event
				 WHERE id = ?`
			)
			.bind(event_id)
			.first();

		return {
			success: true,
			event: updated ?? null,
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
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
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
							meta: PaginationMeta,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { params, query } = await this.getValidatedData<typeof this.schema>();
		const page = query.page ?? 1;
		const pageSize = query.page_size ?? 20;
		const offset = (page - 1) * pageSize;

		const countResult = await c.env.phikap_db
			.prepare("SELECT COUNT(*) AS total FROM event_duty WHERE event_id = ?")
			.bind(params.event_id)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, duty_definition_id, points, required_brothers, time
				 FROM event_duty
				 WHERE event_id = ?
				 ORDER BY time ASC, id ASC
				 LIMIT ? OFFSET ?`
			)
			.bind(params.event_id, pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			duties: result.results ?? [],
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
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
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
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
							meta: PaginationMeta,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { params, query } = await this.getValidatedData<typeof this.schema>();
		const page = query.page ?? 1;
		const pageSize = query.page_size ?? 20;
		const offset = (page - 1) * pageSize;

		const countResult = await c.env.phikap_db
			.prepare(
				`SELECT COUNT(*) AS total
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 WHERE a.event_duty_id = ? AND ed.event_id = ?`
			)
			.bind(params.event_duty_id, params.event_id)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT a.id, a.event_duty_id, a.brother_id, a.status_id
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 WHERE a.event_duty_id = ? AND ed.event_id = ?
				 ORDER BY a.id
				 LIMIT ? OFFSET ?`
			)
			.bind(params.event_duty_id, params.event_id, pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			assignments: result.results ?? [],
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
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

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_duty_id } = data.params;
		const { brother_id } = data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event_duty_assignment (event_duty_id, brother_id)
				 VALUES (?, ?)`
			)
			.bind(event_duty_id, brother_id)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare(
				`SELECT id, event_duty_id, brother_id, status_id
				 FROM event_duty_assignment
				 WHERE id = ?`
			)
			.bind(id)
			.first();

		return {
			success: true,
			assignment: created ?? null,
		};
	}
}
