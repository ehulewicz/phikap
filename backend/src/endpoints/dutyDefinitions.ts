import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

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
		responses: {
			"200": {
				description: "Duty definitions",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							definitions: DutyDefinition.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			definitions: [],
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

	async handle(_c: AppContext) {
		return {
			success: true,
			definition: null,
		};
	}
}
