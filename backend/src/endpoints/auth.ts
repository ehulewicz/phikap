import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { getCookie, setCookie } from "hono/cookie";
import { type AppContext } from "../types";

const SESSION_COOKIE = "phikap_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const BrotherInfo = z.object({
	id: z.number(),
	name: z.string(),
	slack_id: z.string(),
	role_id: z.number(),
});

const sessionCookieOptions = (c: AppContext, maxAgeSeconds: number) => ({
	httpOnly: true,
	secure: c.req.url.startsWith("https://"),
	sameSite: "Lax" as const,
	path: "/",
	maxAge: maxAgeSeconds,
});

const isExpired = (expiresAt: string) => {
	const value = Date.parse(expiresAt);
	if (Number.isNaN(value)) return true;
	return value <= Date.now();
};

const clearSessionCookie = (c: AppContext) => {
	setCookie(c, SESSION_COOKIE, "", {
		httpOnly: true,
		secure: c.req.url.startsWith("https://"),
		sameSite: "Lax",
		path: "/",
		maxAge: 0,
	});
};

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
							brother: BrotherInfo,
							expires_at: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const slackId = data.body.slack_id.trim();
		const brother = await c.env.phikap_db
			.prepare(
				`SELECT id, name, slack_id, role_id
				 FROM brother
				 WHERE slack_id = ?
				 LIMIT 1`
			)
			.bind(slackId)
			.first();

		if (!brother) {
			return c.text("Unknown Slack ID.", 404);
		}

		const sessionId = crypto.randomUUID();
		const ttlSeconds = SESSION_TTL_SECONDS;
		const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

		await c.env.phikap_db
			.prepare(`DELETE FROM session WHERE brother_id = ?`)
			.bind(brother.id)
			.run();

		await c.env.phikap_db
			.prepare(
				`INSERT INTO session (id, brother_id, expires_at, created_at)
				 VALUES (?, ?, ?, datetime('now'))`
			)
			.bind(sessionId, brother.id, expiresAt)
			.run();

		setCookie(c, SESSION_COOKIE, sessionId, sessionCookieOptions(c, ttlSeconds));

		return {
			success: true,
			brother: {
				id: Number(brother.id),
				name: String(brother.name),
				slack_id: String(brother.slack_id),
				role_id: Number(brother.role_id),
			},
			expires_at: expiresAt,
		};
	}
}

export class AuthMe extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Get current session",
		responses: {
			"200": {
				description: "Session info",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							brother: BrotherInfo,
							expires_at: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const sessionId = getCookie(c, SESSION_COOKIE);
		if (!sessionId) {
			return c.text("Not authenticated.", 401);
		}

		const session = await c.env.phikap_db
			.prepare(
				`SELECT id, brother_id, expires_at
				 FROM session
				 WHERE id = ?
				 LIMIT 1`
			)
			.bind(sessionId)
			.first();

		if (!session) {
			clearSessionCookie(c);
			return c.text("Not authenticated.", 401);
		}

		if (isExpired(String(session.expires_at))) {
			await c.env.phikap_db
				.prepare(`DELETE FROM session WHERE id = ?`)
				.bind(sessionId)
				.run();
			clearSessionCookie(c);
			return c.text("Session expired.", 401);
		}

		const brother = await c.env.phikap_db
			.prepare(
				`SELECT id, name, slack_id, role_id
				 FROM brother
				 WHERE id = ?
				 LIMIT 1`
			)
			.bind(session.brother_id)
			.first();

		if (!brother) {
			await c.env.phikap_db
				.prepare(`DELETE FROM session WHERE id = ?`)
				.bind(sessionId)
				.run();
			clearSessionCookie(c);
			return c.text("Not authenticated.", 401);
		}

		return {
			success: true,
			brother: {
				id: Number(brother.id),
				name: String(brother.name),
				slack_id: String(brother.slack_id),
				role_id: Number(brother.role_id),
			},
			expires_at: String(session.expires_at),
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

	async handle(c: AppContext) {
		const sessionId = getCookie(c, SESSION_COOKIE);
		if (sessionId) {
			await c.env.phikap_db
				.prepare(`DELETE FROM session WHERE id = ?`)
				.bind(sessionId)
				.run();
		}
		clearSessionCookie(c);

		return {
			success: true,
		};
	}
}
