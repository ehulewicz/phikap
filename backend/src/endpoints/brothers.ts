import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const Brother = z.object({
	id: z.number(),
	name: z.string(),
	role_id: z.number(),
	phone_number: z.string().nullable(),
	last_semester_points: z.number(),
	points: z.number(),
});

const OrderBy = z.enum(["points", "name"]);
const OrderDir = z.enum(["asc", "desc"]);

export class BrotherList extends OpenAPIRoute {
	schema = {
		tags: ["Brothers"],
		summary: "List brothers",
		request: {
			query: z.object({
				role_ids: z
					.array(z.coerce.number().int())
					.optional()
					.describe("Role IDs (repeat query param)"),
				order_by: OrderBy.optional(),
				order: OrderDir.optional(),
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
			}),
		},
		responses: {
			"200": {
				description: "Brothers",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							brothers: Brother.array(),
							meta: PaginationMeta,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { query } = await this.getValidatedData<typeof this.schema>();

		const roleIds = query.role_ids?.filter((id) => Number.isFinite(id)) ?? [];
		const orderBy = query.order_by ?? "points";
		const orderDir =
			query.order ?? (orderBy === "name" ? "asc" : "desc");
		const page = query.page ?? 1;
		const pageSize = query.page_size ?? 20;
		const offset = (page - 1) * pageSize;

		const where: string[] = [];
		const params: Array<number> = [];

		if (roleIds.length > 0) {
			where.push(`b.role_id IN (${roleIds.map(() => "?").join(", ")})`);
			params.push(...roleIds);
		}

		const orderClause =
			orderBy === "points"
				? `ORDER BY points ${orderDir.toUpperCase()}, b.name ASC`
				: `ORDER BY b.name ${orderDir.toUpperCase()}, points DESC`;

		const countSql = `
			SELECT COUNT(*) AS total
			FROM brother b
			${where.length ? `WHERE ${where.join(" AND ")}` : ""}
		`;

		const pointsSql = `
			SELECT
				b.id,
				b.name,
				b.role_id,
				b.phone_number,
				b.last_semester_points,
				(0.75 * b.last_semester_points)
				+ COALESCE(assignments.total, 0)
				+ COALESCE(adjustments.total, 0)
					AS points
			FROM brother b
			LEFT JOIN (
				SELECT
					a.brother_id AS brother_id,
					SUM(CASE WHEN s.name = 'completed' THEN ed.points ELSE 0 END) AS total
				FROM event_duty_assignment a
				JOIN event_duty ed
					ON ed.id = a.event_duty_id
				JOIN event_duty_assignment_status s
					ON s.id = a.status_id
				GROUP BY a.brother_id
			) assignments
				ON assignments.brother_id = b.id
			LEFT JOIN (
				SELECT
					brother_id,
					SUM(amount) AS total
				FROM point_adjustment
				GROUP BY brother_id
			) adjustments
				ON adjustments.brother_id = b.id
			${where.length ? `WHERE ${where.join(" AND ")}` : ""}
			${orderClause}
		`;

		const countResult = await c.env.phikap_db
			.prepare(countSql)
			.bind(...params)
			.first();

		const result = await c.env.phikap_db
			.prepare(`${pointsSql} LIMIT ? OFFSET ?`)
			.bind(...params, pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
		const brothers = (result.results ?? []).map((row) => ({
			...row,
			points: Math.ceil(Number(row.points ?? 0)),
			last_semester_points: Number(row.last_semester_points ?? 0),
		}));

		return {
			success: true,
			brothers,
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
		};
	}
}

export class BrotherPointsCreate extends OpenAPIRoute {
	schema = {
		tags: ["Brothers"],
		summary: "Add or subtract points for a brother (ledger entry)",
		request: {
			params: z.object({
				brother_id: Num({ description: "Brother id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							event_id: Num({ description: "Event id" }),
							amount: z.number().int(),
							reason: z
								.string()
								.nullable()
								.optional()
								.describe("Adjustment reason"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Point adjustment created",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							adjustment: z.object({
								id: z.number(),
								brother_id: z.number(),
								event_id: z.number(),
								amount: z.number(),
								reason: z.string().nullable(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const brotherId = data.params.brother_id;
		const { event_id, amount, reason } = data.body;

		const result = await c.env.phikap_db
			.prepare(
				`INSERT INTO point_adjustment (brother_id, event_id, amount, reason, created_by)
				 VALUES (?, ?, ?, ?, NULL)`
			)
			.bind(brotherId, event_id, amount, reason ?? null)
			.run();

		return {
			success: true,
			adjustment: {
				id: Number(result.meta.last_row_id),
				brother_id: brotherId,
				event_id,
				amount,
				reason: reason ?? null,
			},
		};
	}
}
