import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

export const Brother = z.object({
	id: z.number(),
	name: z.string(),
	role_id: z.number(),
});

export const Event = z.object({
	id: z.number(),
	name: z.string(),
	event_type_id: z.number(),
	date: z.string(),
	start_time: z.string(),
	end_time: z.string(),
});

export const EventDuty = z.object({
	id: z.number(),
	duty_definition_id: z.number(),
	duty_type: z.string(),
	description: z.string(),
	points: z.number(),
	required_brothers: z.number(),
	assigned_count: z.number(),
	due_time: z.string().nullable().optional(),
	start_time: z.string().nullable().optional(),
	end_time: z.string().nullable().optional(),
});

export const EventDutyAssignment = z.object({
	id: z.number(),
	event_duty_id: z.number(),
	brother_id: z.number(),
	status_id: z.number(),
});
