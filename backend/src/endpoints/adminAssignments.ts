import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

const Summary = z.object({
	event_id: z.number(),
	assignments_created: z.number(),
});

const toDateKey = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getWeekRange = (baseDate: Date) => {
	const start = new Date(baseDate);
	start.setDate(baseDate.getDate() - baseDate.getDay());
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);
	return { start, end };
};

const fetchActiveBrothers = async (c: AppContext) => {
	const result = await c.env.phikap_db
		.prepare(
			`SELECT
				b.id,
				b.name,
				(0.75 * b.last_semester_points)
				+ COALESCE(assignments.total, 0)
				+ COALESCE(adjustments.total, 0) AS points
			 FROM brother b
			 LEFT JOIN (
				SELECT
					a.brother_id AS brother_id,
					SUM(CASE WHEN s.name = 'completed' THEN ed.points ELSE 0 END) AS total
				FROM event_duty_assignment a
				JOIN event_duty ed ON ed.id = a.event_duty_id
				JOIN event_duty_assignment_status s ON s.id = a.status_id
				GROUP BY a.brother_id
			 ) assignments ON assignments.brother_id = b.id
			 LEFT JOIN (
				SELECT brother_id, SUM(amount) AS total
				FROM point_adjustment
				GROUP BY brother_id
			 ) adjustments ON adjustments.brother_id = b.id
			 WHERE b.role_id = 1
			 ORDER BY points ASC, b.name ASC`
		)
		.all();

	return (result.results ?? []).map((row) => ({
		id: Number(row.id),
		name: String(row.name),
		points: Number(row.points ?? 0),
	}));
};

export class AdminUnlockWeek extends OpenAPIRoute {
	schema = {
		tags: ["Admin"],
		summary: "Unlock duties for this week's events",
		responses: {
			"200": {
				description: "Week unlocked",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							updated: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { start, end } = getWeekRange(new Date());
		const weekendStart = new Date(start);
		weekendStart.setDate(start.getDate() + 4);
		weekendStart.setHours(0, 0, 0, 0);
		const weekendEnd = new Date(start);
		weekendEnd.setDate(start.getDate() + 7);
		weekendEnd.setHours(23, 59, 59, 999);
		const startKey = toDateKey(weekendStart);
		const endKey = toDateKey(weekendEnd);

		const result = await c.env.phikap_db
			.prepare(
				`UPDATE event
				 SET duties_unlocked = 1
				 WHERE date >= ? AND date <= ?`
			)
			.bind(startKey, endKey)
			.run();

		return {
			success: true,
			updated: Number(result.meta.changes ?? 0),
		};
	}
}

export class AdminAssignWeek extends OpenAPIRoute {
	schema = {
		tags: ["Admin"],
		summary: "Assign open duties for this week's events",
		responses: {
			"200": {
				description: "Assignments created",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							summaries: Summary.array(),
							assignments_created: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { start, end } = getWeekRange(new Date());
		const weekendStart = new Date(start);
		weekendStart.setDate(start.getDate() + 4);
		weekendStart.setHours(0, 0, 0, 0);
		const weekendEnd = new Date(start);
		weekendEnd.setDate(start.getDate() + 7);
		weekendEnd.setHours(23, 59, 59, 999);
		const startKey = toDateKey(weekendStart);
		const endKey = toDateKey(weekendEnd);

		const eventsResult = await c.env.phikap_db
			.prepare(
				`SELECT id, date
				 FROM event
				 WHERE date >= ? AND date <= ?
				 ORDER BY date ASC, id ASC`
			)
			.bind(startKey, endKey)
			.all();

		const events = eventsResult.results ?? [];
		if (events.length === 0) {
			return { success: true, summaries: [], assignments_created: 0 };
		}

		const statusResult = await c.env.phikap_db
			.prepare(
				`SELECT id, name
				 FROM event_duty_assignment_status
				 WHERE name IN ('signed_up', 'assigned', 'completed', 'late', 'rejected')`
			)
			.all();

		const statusByName = new Map<string, number>();
		for (const row of statusResult.results ?? []) {
			statusByName.set(String(row.name), Number(row.id));
		}

		const assignedStatusId = statusByName.get("assigned");
		if (!assignedStatusId) {
			throw new Error("Missing assigned status id.");
		}

		const activeBrothers = await fetchActiveBrothers(c);

		const summaries: Array<z.infer<typeof Summary>> = [];
		let totalAssignments = 0;

		for (const eventRow of events) {
			const eventId = Number(eventRow.id);

			const dutiesResult = await c.env.phikap_db
				.prepare(
					`SELECT ed.id, ed.points, ed.required_brothers, dd.description
					 FROM event_duty ed
					 JOIN duty_definition dd ON dd.id = ed.duty_definition_id
					 WHERE ed.event_id = ?
					 ORDER BY ed.points DESC, dd.description ASC, ed.id ASC`
				)
				.bind(eventId)
				.all();

			const duties = dutiesResult.results ?? [];
			if (duties.length === 0) {
				summaries.push({ event_id: eventId, assignments_created: 0 });
				continue;
			}

			const assignmentsResult = await c.env.phikap_db
				.prepare(
					`SELECT a.event_duty_id, a.brother_id, s.name AS status_name
					 FROM event_duty_assignment a
					 JOIN event_duty ed ON ed.id = a.event_duty_id
					 JOIN event_duty_assignment_status s ON s.id = a.status_id
					 WHERE ed.event_id = ?`
				)
				.bind(eventId)
				.all();

			const occupiedStatuses = new Set(["assigned", "completed", "late"]);
			const excludedBrothers = new Set<number>();
			const assignedCountByDuty = new Map<number, number>();

			for (const row of assignmentsResult.results ?? []) {
				const status = String(row.status_name);
				const dutyId = Number(row.event_duty_id);
				if (status !== "rejected") {
					assignedCountByDuty.set(
						dutyId,
						(assignedCountByDuty.get(dutyId) ?? 0) + 1
					);
				}
				if (occupiedStatuses.has(status)) {
					excludedBrothers.add(Number(row.brother_id));
				}
			}

			const basePool = activeBrothers.filter(
				(brother) => !excludedBrothers.has(brother.id)
			);
			let pool = [...basePool];
			const assignments: Array<[number, number, number]> = [];

			const pickBrother = () => {
				if (pool.length === 0) {
					pool = [...basePool];
				}
				if (pool.length === 0) return null;
				let minPoints = pool[0].points;
				for (const brother of pool) {
					if (brother.points < minPoints) minPoints = brother.points;
				}
				const candidates = pool.filter((brother) => brother.points === minPoints);
				const chosen = candidates[Math.floor(Math.random() * candidates.length)];
				const index = pool.findIndex((brother) => brother.id === chosen.id);
				if (index >= 0) {
					pool.splice(index, 1);
				}
				return chosen;
			};

			for (const dutyRow of duties) {
				const dutyId = Number(dutyRow.id);
				const required = Number(dutyRow.required_brothers);
				const current = assignedCountByDuty.get(dutyId) ?? 0;
				const openSlots = Math.max(required - current, 0);

				for (let slot = 0; slot < openSlots; slot += 1) {
					const brother = pickBrother();
					if (!brother) break;
					assignments.push([dutyId, brother.id, assignedStatusId]);
					totalAssignments += 1;
				}
			}

			if (assignments.length > 0) {
				const stmt = c.env.phikap_db.prepare(
					`INSERT INTO event_duty_assignment (event_duty_id, brother_id, status_id)
					 VALUES (?, ?, ?)`
				);
				await c.env.phikap_db.batch(
					assignments.map(([dutyId, brotherId, statusId]) =>
						stmt.bind(dutyId, brotherId, statusId)
					)
				);
			}

			summaries.push({
				event_id: eventId,
				assignments_created: assignments.length,
			});
		}

		return {
			success: true,
			summaries,
			assignments_created: totalAssignments,
		};
	}
}
