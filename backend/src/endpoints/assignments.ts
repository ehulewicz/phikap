import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const Assignment = z.object({
	id: z.number(),
	event_duty_id: z.number(),
	brother_id: z.number(),
	status_id: z.number(),
	status_name: z.string().optional(),
	brother_name: z.string().optional(),
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
				`SELECT a.id, a.event_duty_id, a.brother_id, a.status_id, s.name AS status_name, b.name AS brother_name
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 JOIN event_duty_assignment_status s ON s.id = a.status_id
				 JOIN brother b ON b.id = a.brother_id
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
			assignments: (result.results ?? []).map((row) => ({
				...row,
				status_name: row.status_name ?? undefined,
				brother_name: row.brother_name ?? undefined,
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
							error: z.string().optional(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { event_duty_id, brother_id, status_id } = data.body;

		const dutyRow = await c.env.phikap_db
			.prepare(
				`SELECT e.duties_unlocked
				 FROM event_duty ed
				 JOIN event e ON e.id = ed.event_id
				 WHERE ed.id = ?`
			)
			.bind(event_duty_id)
			.first();

		if (!dutyRow || Number(dutyRow.duties_unlocked) !== 1) {
			return c.json(
				{
					success: false,
					assignment: null,
					error: "Duties are locked for this event.",
				},
				400
			);
		}

		const statusRow = await c.env.phikap_db
			.prepare(
				`SELECT id
				 FROM event_duty_assignment_status
				 WHERE name = ?`
			)
			.bind("signed_up")
			.first();
		const signedUpStatusId = Number(statusRow?.id ?? 1);

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO event_duty_assignment (event_duty_id, brother_id, status_id)
				 VALUES (?, ?, ?)`
			)
			.bind(event_duty_id, brother_id, status_id ?? signedUpStatusId)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare(
				`SELECT a.id, a.event_duty_id, a.brother_id, a.status_id, s.name AS status_name, b.name AS brother_name
				 FROM event_duty_assignment a
				 JOIN event_duty_assignment_status s ON s.id = a.status_id
				 JOIN brother b ON b.id = a.brother_id
				 WHERE a.id = ?`
			)
			.bind(id)
			.first();

		return {
			success: true,
			assignment: created
				? {
						...created,
						status_name: created.status_name,
						brother_name: created.brother_name,
					}
				: null,
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
				`SELECT a.id, a.event_duty_id, a.brother_id, a.status_id, s.name AS status_name, b.name AS brother_name
				 FROM event_duty_assignment a
				 JOIN event_duty_assignment_status s ON s.id = a.status_id
				 JOIN brother b ON b.id = a.brother_id
				 WHERE a.id = ?`
			)
			.bind(assignmentId)
			.first();

		return {
			success: true,
			assignment: updated
				? {
						...updated,
						status_name: updated.status_name,
						brother_name: updated.brother_name,
					}
				: null,
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
							error: z.string().optional(),
						}),
					},
				},
			},
			"400": {
				description: "Deletion not allowed",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							deleted: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const assignmentId = data.params.assignment_id;

		const row = await c.env.phikap_db
			.prepare(
				`SELECT a.id, a.brother_id, s.name AS status_name, e.date AS event_date
				 FROM event_duty_assignment a
				 JOIN event_duty ed ON ed.id = a.event_duty_id
				 JOIN event e ON e.id = ed.event_id
				 JOIN event_duty_assignment_status s ON s.id = a.status_id
				 WHERE a.id = ?`
			)
			.bind(assignmentId)
			.first();

		if (!row) {
			return c.json(
				{ success: false, deleted: false, error: "Assignment not found." },
				400
			);
		}

		const statusName = String(row.status_name ?? "");
		if (statusName !== "signed_up") {
			return c.json(
				{
					success: false,
					deleted: false,
					error: "Only signed up duties can be removed.",
				},
				400
			);
		}

		const date = String(row.event_date ?? "");
		const [year, month, day] = date.split("-").map((part) => Number(part));
		const eventDate = new Date(year, month - 1, day);
		const weekStart = new Date(eventDate);
		weekStart.setDate(eventDate.getDate() - eventDate.getDay());
		weekStart.setHours(0, 0, 0, 0);
		const lockTime = new Date(weekStart);
		lockTime.setDate(weekStart.getDate() + 1);
		lockTime.setHours(20, 0, 0, 0);

		if (new Date() >= lockTime) {
			return c.json(
				{
					success: false,
					deleted: false,
					error: "Duties are locked for this event.",
				},
				400
			);
		}

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
