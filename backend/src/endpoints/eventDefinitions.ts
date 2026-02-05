import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const EventDefinition = z.object({
	id: z.number(),
	name: z.string(),
	admin_points: z.number(),
	default_start_time: z.string().nullable().optional(),
});

const EventDefinitionDuty = z.object({
	id: z.number(),
	event_definition_id: z.number(),
	duty_definition_id: z.number(),
	default_points: z.number(),
	default_required_brothers: z.number(),
	default_time: z.string().nullable().optional(),
});

export class EventDefinitionList extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "List event definitions",
		request: {
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
			}),
		},
		responses: {
			"200": {
				description: "Event definitions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event_definitions: EventDefinition.array(),
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

		const countResult = await c.env.phikap_db
			.prepare("SELECT COUNT(*) AS total FROM event_definition")
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, name, admin_points, default_start_time
				 FROM event_definition
				 ORDER BY id
				 LIMIT ? OFFSET ?`
			)
			.bind(pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			event_definitions: result.results ?? [],
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
		};
	}
}

export class EventDefinitionCreate extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Create event definition",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string(),
							admin_points: z.number().int().default(10),
							default_start_time: z.string().nullable().optional(),
							duties: z
								.array(
									z.object({
										duty_definition_id: z.number(),
										default_points: z.number(),
										default_required_brothers: z.number(),
										default_time: z.string().nullable().optional(),
									})
								)
								.optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created event definition",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event_definition: EventDefinition.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { name, admin_points, default_start_time, duties } = data.body;

		const insert = await c.env.phikap_db
			.prepare(
				"INSERT INTO event_definition (name, admin_points, default_start_time) VALUES (?, ?, ?)"
			)
			.bind(name, admin_points, default_start_time ?? null)
			.run();

		const eventDefinitionId = Number(insert.meta.last_row_id);

		if (duties && duties.length > 0) {
			const stmt = c.env.phikap_db.prepare(
				`INSERT INTO event_definition_duty
				 (event_definition_id, duty_definition_id, default_points, default_required_brothers, default_time)
				 VALUES (?, ?, ?, ?, ?)`
			);
			const batch = duties.map((duty) =>
				stmt.bind(
					eventDefinitionId,
					duty.duty_definition_id,
					duty.default_points,
					duty.default_required_brothers,
					duty.default_time ?? null
				)
			);
			await c.env.phikap_db.batch(batch);
		}

		const created = await c.env.phikap_db
			.prepare(
				"SELECT id, name, admin_points, default_start_time FROM event_definition WHERE id = ?"
			)
			.bind(eventDefinitionId)
			.first();

		return {
			success: true,
			event_definition: created ?? null,
		};
	}
}

export class EventDefinitionUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Update event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string(),
							admin_points: z.number().int(),
							default_start_time: z.string().nullable().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Updated event definition",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							event_definition: EventDefinition.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_definition_id } = data.params;
		const { name, admin_points, default_start_time } = data.body;

		await c.env.phikap_db
			.prepare(
				`UPDATE event_definition
				 SET name = ?, admin_points = ?, default_start_time = COALESCE(?, default_start_time)
				 WHERE id = ?`
			)
			.bind(name, admin_points, default_start_time ?? null, event_definition_id)
			.run();

		const updated = await c.env.phikap_db
			.prepare(
				"SELECT id, name, admin_points, default_start_time FROM event_definition WHERE id = ?"
			)
			.bind(event_definition_id)
			.first();

		return {
			success: true,
			event_definition: updated ?? null,
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
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
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
				 FROM event_definition_duty
				 WHERE event_definition_id = ?`
			)
			.bind(params.event_definition_id)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, event_definition_id, duty_definition_id, default_points, default_required_brothers, default_time
				 FROM event_definition_duty
				 WHERE event_definition_id = ?
				 ORDER BY id
				 LIMIT ? OFFSET ?`
			)
			.bind(params.event_definition_id, pageSize, offset)
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

export class EventDefinitionDutyCreate extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Add a default duty to an event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							duty_definition_id: z.number(),
							default_points: z.number(),
							default_required_brothers: z.number(),
							default_time: z.string().nullable().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created default duty",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							duty: EventDefinitionDuty.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_definition_id } = data.params;
		const { duty_definition_id, default_points, default_required_brothers, default_time } =
			data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event_definition_duty
				 (event_definition_id, duty_definition_id, default_points, default_required_brothers, default_time)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.bind(
				event_definition_id,
				duty_definition_id,
				default_points,
				default_required_brothers,
				default_time ?? null
			)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare(
				`SELECT id, event_definition_id, duty_definition_id, default_points, default_required_brothers, default_time
				 FROM event_definition_duty
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

export class EventDefinitionDutyUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Update a default duty for an event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
				event_definition_duty_id: Num({ description: "Event definition duty id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							default_points: z.number(),
							default_required_brothers: z.number(),
							default_time: z.string().nullable().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Updated default duty",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							duty: EventDefinitionDuty.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_definition_id, event_definition_duty_id } = data.params;
		const { default_points, default_required_brothers, default_time } = data.body;

		await c.env.phikap_db
			.prepare(
				`UPDATE event_definition_duty
				 SET default_points = ?, default_required_brothers = ?, default_time = ?
				 WHERE id = ? AND event_definition_id = ?`
			)
			.bind(
				default_points,
				default_required_brothers,
				default_time ?? null,
				event_definition_duty_id,
				event_definition_id
			)
			.run();

		const updated = await c.env.phikap_db
			.prepare(
				`SELECT id, event_definition_id, duty_definition_id, default_points, default_required_brothers, default_time
				 FROM event_definition_duty
				 WHERE id = ?`
			)
			.bind(event_definition_duty_id)
			.first();

		return {
			success: true,
			duty: updated ?? null,
		};
	}
}

export class EventDefinitionDutyDelete extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Remove a default duty from an event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
				event_definition_duty_id: Num({ description: "Event definition duty id" }),
			}),
		},
		responses: {
			"200": {
				description: "Deleted default duty",
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
		const { event_definition_id, event_definition_duty_id } = data.params;

		await c.env.phikap_db
			.prepare(
				`DELETE FROM event_definition_duty
				 WHERE id = ? AND event_definition_id = ?`
			)
			.bind(event_definition_duty_id, event_definition_id)
			.run();

		return {
			success: true,
		};
	}
}

export class EventDefinitionDelete extends OpenAPIRoute {
	schema = {
		tags: ["Event Definitions"],
		summary: "Delete event definition",
		request: {
			params: z.object({
				event_definition_id: Num({ description: "Event definition id" }),
			}),
		},
		responses: {
			"200": {
				description: "Deleted event definition",
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
		const { event_definition_id } = data.params;

		await c.env.phikap_db
			.prepare(
				`DELETE FROM event_duty_assignment
				 WHERE event_duty_id IN (
					SELECT ed.id
					FROM event_duty ed
					JOIN event e ON e.id = ed.event_id
					WHERE e.event_definition_id = ?
				 )`
			)
			.bind(event_definition_id)
			.run();

		await c.env.phikap_db
			.prepare(
				`DELETE FROM event_duty
				 WHERE event_id IN (
					SELECT id FROM event WHERE event_definition_id = ?
				 )`
			)
			.bind(event_definition_id)
			.run();

		await c.env.phikap_db
			.prepare(
				`DELETE FROM point_adjustment
				 WHERE event_id IN (
					SELECT id FROM event WHERE event_definition_id = ?
				 )`
			)
			.bind(event_definition_id)
			.run();

		await c.env.phikap_db
			.prepare("DELETE FROM event WHERE event_definition_id = ?")
			.bind(event_definition_id)
			.run();

		await c.env.phikap_db
			.prepare("DELETE FROM event_definition_duty WHERE event_definition_id = ?")
			.bind(event_definition_id)
			.run();

		await c.env.phikap_db
			.prepare("DELETE FROM event_definition WHERE id = ?")
			.bind(event_definition_id)
			.run();

		return { success: true };
	}
}
