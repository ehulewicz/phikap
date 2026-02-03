import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { PaginationMeta } from "./shared";

const DutyDefinition = z.object({
	id: z.number(),
	duty_type_id: z.number(),
	description: z.string(),
	default_points: z.number(),
	default_required_brothers: z.number(),
});

export class DutyDefinitionList extends OpenAPIRoute {
	schema = {
		tags: ["Duty Definitions"],
		summary: "List duty definitions",
		request: {
			query: z.object({
				page: z.coerce.number().int().min(1).default(1),
				page_size: z.coerce.number().int().min(1).max(100).default(20),
			}),
		},
		responses: {
			"200": {
				description: "Duty definitions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							definitions: DutyDefinition.array(),
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
			.prepare("SELECT COUNT(*) AS total FROM duty_definition")
			.first();

		const result = await c.env.phikap_db
			.prepare(
				`SELECT id, duty_type_id, description, default_points, default_required_brothers
				 FROM duty_definition
				 ORDER BY id
				 LIMIT ? OFFSET ?`
			)
			.bind(pageSize, offset)
			.all();

		const total = Number(countResult?.total ?? 0);
		const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

		return {
			success: true,
			definitions: result.results ?? [],
			meta: {
				page,
				page_size: pageSize,
				total,
				total_pages: totalPages,
			},
		};
	}
}

export class DutyDefinitionCreate extends OpenAPIRoute {
	schema = {
		tags: ["Duty Definitions"],
		summary: "Create duty definition",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							duty_type_id: z.number(),
							description: z.string(),
							default_points: z.number(),
							default_required_brothers: z.number(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Created duty definition",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							definition: DutyDefinition.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { duty_type_id, description, default_points, default_required_brothers } =
			data.body;

		const insert = await c.env.phikap_db
			.prepare(
				`INSERT INTO duty_definition
				 (duty_type_id, description, default_points, default_required_brothers)
				 VALUES (?, ?, ?, ?)`
			)
			.bind(
				duty_type_id,
				description,
				default_points,
				default_required_brothers
			)
			.run();

		const id = Number(insert.meta.last_row_id);
		const created = await c.env.phikap_db
			.prepare(
				`SELECT id, duty_type_id, description, default_points, default_required_brothers
				 FROM duty_definition WHERE id = ?`
			)
			.bind(id)
			.first();

		return {
			success: true,
			definition: created ?? null,
		};
	}
}

export class DutyDefinitionUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Duty Definitions"],
		summary: "Update duty definition",
		request: {
			params: z.object({
				duty_definition_id: Num({ description: "Duty definition id" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							duty_type_id: z.number(),
							description: z.string(),
							default_points: z.number(),
							default_required_brothers: z.number(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Updated duty definition",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							definition: DutyDefinition.nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { duty_definition_id } = data.params;
		const { duty_type_id, description, default_points, default_required_brothers } =
			data.body;

		await c.env.phikap_db
			.prepare(
				`UPDATE duty_definition
				 SET duty_type_id = ?, description = ?, default_points = ?, default_required_brothers = ?
				 WHERE id = ?`
			)
			.bind(
				duty_type_id,
				description,
				default_points,
				default_required_brothers,
				duty_definition_id
			)
			.run();

		const updated = await c.env.phikap_db
			.prepare(
				`SELECT id, duty_type_id, description, default_points, default_required_brothers
				 FROM duty_definition WHERE id = ?`
			)
			.bind(duty_definition_id)
			.first();

		return {
			success: true,
			definition: updated ?? null,
		};
	}
}
