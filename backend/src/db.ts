import type { Context } from "hono";

export type AppContext = Context<{ Bindings: Env }>;

export const SESSION_COOKIE_NAME = "phikap_session";

export const nowIso = () => new Date().toISOString();

export const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const hashSha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const getBrotherBySlackId = async (c: AppContext, slackId: string) => {
  const row = await c.env.phikap_db
    .prepare(
      `SELECT brother.id, brother.name, brother.slack_id, brother.role_id, role.name as role
       FROM brother
       JOIN role ON brother.role_id = role.id
       WHERE brother.slack_id = ?`
    )
    .bind(slackId)
    .first();
  return row as
    | {
        id: number;
        name: string;
        slack_id: string;
        role_id: number;
        role: string;
      }
    | null;
};

export const getBrotherById = async (c: AppContext, brotherId: number) => {
  const row = await c.env.phikap_db
    .prepare(
      `SELECT brother.id, brother.name, brother.slack_id, brother.role_id, role.name as role
       FROM brother
       JOIN role ON brother.role_id = role.id
       WHERE brother.id = ?`
    )
    .bind(brotherId)
    .first();
  return row as
    | {
        id: number;
        name: string;
        slack_id: string;
        role_id: number;
        role: string;
      }
    | null;
};

export const getBrotherPoints = async (c: AppContext, brotherId: number) => {
  const row = await c.env.phikap_db
    .prepare(
      `WITH assignment_points AS (
        SELECT event_duty_assignment.brother_id AS brother_id,
               SUM(event_duty.points) AS duty_points
        FROM event_duty_assignment
        JOIN event_duty ON event_duty_assignment.event_duty_id = event_duty.id
        GROUP BY event_duty_assignment.brother_id
      )
      SELECT (
        0.75 * brother.last_semester_points +
        brother.admin_points +
        COALESCE(assignment_points.duty_points, 0)
      ) AS points
      FROM brother
      LEFT JOIN assignment_points ON assignment_points.brother_id = brother.id
      WHERE brother.id = ?`
    )
    .bind(brotherId)
    .first();
  if (!row) {
    return null;
  }
  const points = Number(row.points ?? 0);
  return { points };
};

export const getStatusIdByName = async (c: AppContext, status: string) => {
  const row = await c.env.phikap_db
    .prepare(`SELECT id FROM event_duty_assignment_status WHERE name = ?`)
    .bind(status)
    .first();
  return row ? Number(row.id) : null;
};
