import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

const Brother = z.object({
	id: z.number(),
	name: z.string(),
	points: z.number(),
	role_id: z.number(),
	phone_number: z.string().nullable(),
});

export class BrotherList extends OpenAPIRoute {
	schema = {
		tags: ["Brothers"],
		summary: "List brothers with calculated points",
		request: {
			query: z.object({
				sort: Str({ required: false, description: "points|name" }),
				order: Str({ required: false, description: "asc|desc" }),
				role_ids: Str({ required: false, description: "comma-separated role ids" }),
			}),
		},
		responses: {
			"200": {
				description: "List of brothers",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							brothers: Brother.array(),
						}),
					},
				},
			},
		},
	};

	async handle(_c: AppContext) {
		return {
			success: true,
			brothers: [],
		};
	}
}
