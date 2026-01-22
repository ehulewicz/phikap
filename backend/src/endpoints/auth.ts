import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class AuthLogin extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Login using Slack ID",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							slack_id: Str({ description: "Slack ID" }),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Login success",
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

	async handle(_c: AppContext) {
		return {
			success: true,
		};
	}
}

export class AuthLogout extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Logout",
		responses: {
			"200": {
				description: "Logout success",
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

	async handle(_c: AppContext) {
		return {
			success: true,
		};
	}
}
