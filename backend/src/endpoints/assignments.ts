import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const Assignment = z.object({
	id: z.number(),
	event_duty_id: z.number(),
	brother_id: z.number(),
	status_id: z.number(),
});

export class AssignmentList extends OpenAPIRoute {
	schema = {
		tags: ["Assignments"],
		summary: "List duty assignments",
		request: {
			query: z.object({
				event_id: Num({ required: false, description: "Event id" }),
				event_duty_id: Num({ required: false, description: "Event duty id" }),
				brother_id: Num({ required: false, description: "Brother id" }),
				status_id: Num({ required: false, description: "Status id" }),
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
		const { query } = await this.getValidatedData<typeof this.schema>();
		const page = query.page ?? 1;
		const pageSize = query.page_size ?? 20;
		const offset = (page - 1) * pageSize;

		const where: string[] = [];
		const params: Array<number> = [];

		if (query.event_duty_id) {
			where.push("a.event_duty_id = ?");
			params.push(query.event_duty_id);
		}
		if (query.brother_id) {
			where.push("a.brother_id = ?");
			params.push(query.brother_id);
		}
		if (query.status_id) {
			where.push("a.status_id = ?");
			params.push(query.status_id);
		}
		if (query.event_id) {
			where.push("ed.event_id = ?");
			params.push(query.event_id);
		}

		const countResult = await c.env.phikap_db
			.prepare(
				`SELECT COUNT(*) AS total
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`
			)
			.bind(...params)
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT a.id, a.event_duty_id, a.brother_id, a.status_id
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
				 ORDER BY a.id
				 LIMIT ? OFFSET ?`
			)
			.bind(...params, pageSize, offset)
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

export class AssignmentCreate extends OpenAPIRoute {
	schema = {
		tags: ["Assignments"],
		summary: "Create duty assignment (sign up)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							event_duty_id: z.number(),
							brother_id: z.number(),
							status_id: z.number().optional(),
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
		const { event_duty_id, brother_id, status_id } = data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event_duty_assignment (event_duty_id, brother_id, status_id)
				 VALUES (?, ?, COALESCE(?, 1))`
			)
			.bind(event_duty_id, brother_id, status_id ?? null)
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

export class AssignmentUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Assignments"],
		summary: "Update assignment status",
		request: {
			params: z.object({
				assignment_id: Num({ description: "Assignment id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							status_id: z.number(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Assignment updated",
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
		const assignmentId = data.params.assignment_id;
		const { status_id } = data.body;

		await c.env.phikap_db
			.prepare(
				`UPDATE event_duty_assignment
				 SET status_id = ?
				 WHERE id = ?`
			)
			.bind(status_id, assignmentId)
			.run();

		const updated = await c.env.phikap_db
			.prepare(
				`SELECT id, event_duty_id, brother_id, status_id
				 FROM event_duty_assignment
				 WHERE id = ?`
			)
			.bind(assignmentId)
			.first();

		return {
			success: true,
			assignment: updated ?? null,
		};
	}
}

export class AssignmentDelete extends OpenAPIRoute {
	schema = {
		tags: ["Assignments"],
		summary: "Delete assignment",
		request: {
			params: z.object({
				assignment_id: Num({ description: "Assignment id" }),
			}),
		},
		responses: {
			"200": {
				description: "Assignment deleted",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							deleted: z.boolean(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const assignmentId = data.params.assignment_id;

		const result = await c.env.phikap_db
			.prepare("DELETE FROM event_duty_assignment WHERE id = ?")
			.bind(assignmentId)
			.run();

		return {
			success: true,
			deleted: (result.meta.changes ?? 0) > 0,
		};
	}
}
