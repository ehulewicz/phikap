import { Bool, Num, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const DutyType = z.object({
	id: z.number(),
	name: z.string(),
});

export class DutyTypeList extends OpenAPIRoute {
	schema = {
		tags: ["Duty Types"],
		summary: "List duty types",
		request: {
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
			}),
		},
		responses: {
			"200": {
				description: "Duty types",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							types: DutyType.array(),
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
			.prepare("SELECT COUNT(*) AS total FROM duty_type")
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, name
				 FROM duty_type
				 ORDER BY name ASC
				 LIMIT ? OFFSET ?`
			)
			.bind(pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			types: result.results ?? [],
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
		};
	}
}

export class DutyTypeCreate extends OpenAPIRoute {
	schema = {
		tags: ["Duty Types"],
		summary: "Create duty type",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: Str(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created duty type",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							type: DutyType.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { name } = data.body;

		const insert = await c.env.phikap_db
			.prepare("INSERT INTO duty_type (name) VALUES (?)")
			.bind(name)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare("SELECT id, name FROM duty_type WHERE id = ?")
			.bind(id)
			.first();

		return {
			success: true,
			type: created ?? null,
		};
	}
}

export class DutyTypeUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Duty Types"],
		summary: "Update duty type",
		request: {
			params: z.object({
				duty_type_id: Num({ description: "Duty type id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: Str(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Updated duty type",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							type: DutyType.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { duty_type_id } = data.params;
		const { name } = data.body;

		await c.env.phikap_db
			.prepare("UPDATE duty_type SET name = ? WHERE id = ?")
			.bind(name, duty_type_id)
			.run();

		const updated = await c.env.phikap_db
			.prepare("SELECT id, name FROM duty_type WHERE id = ?")
			.bind(duty_type_id)
			.first();

		return {
			success: true,
			type: updated ?? null,
		};
	}
}
