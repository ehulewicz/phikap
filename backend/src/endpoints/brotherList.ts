import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Brother, type AppContext } from "../types";

export class BrotherList extends OpenAPIRoute {
	schema = {
		tags: ["Brothers"],
		summary: "List brothers",
		responses: {
			"200": {
				description: "Returns a list of brothers",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							brothers: Brother.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { results } = await c.env.phikap_db
			.prepare("SELECT id, name, role_id FROM brother ORDER BY name")
			.all();

		return {
			success: true,
			brothers: results ?? [],
		};
	}
}
