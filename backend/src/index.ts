import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  SESSION_COOKIE_NAME,
  getBrotherById,
  getBrotherBySlackId,
  getBrotherPoints,
  getStatusIdByName,
  hashSha256,
  nowIso,
} from "./db";
import { clearSessionCookie, createSession, getSession, requireSession } from "./auth";
import { getCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/", (c) => c.text("Phi Kap API"));

app.post("/auth/login", async (c) => {
  const body = await c.req.json<{ slackId?: string }>();
  if (!body.slackId) {
    return c.json({ error: "slackId is required" }, 400);
  }
  const brother = await getBrotherBySlackId(c, body.slackId);
  if (!brother) {
    return c.json({ error: "Brother not found" }, 404);
  }
  await createSession(c, brother.id);
  return c.json({
    brother: {
      id: brother.id,
      name: brother.name,
      slackId: brother.slack_id,
      role: brother.role,
    },
    isAdmin: brother.role === "admin",
  });
});

app.post("/auth/logout", async (c) => {
  const cookie = getCookie(c, SESSION_COOKIE_NAME);
  if (cookie) {
    await c.env.phikap_db.prepare(`DELETE FROM session WHERE id = ?`).bind(cookie).run();
  }
  clearSessionCookie(c);
  return c.json({ ok: true });
});

app.post("/auth/reset", async (c) => {
  const body = await c.req.json<{ slackId?: string }>();
  if (!body.slackId) {
    return c.json({ error: "slackId is required" }, 400);
  }
  const brother = await getBrotherBySlackId(c, body.slackId);
  if (!brother) {
    return c.json({ error: "Brother not found" }, 404);
  }
  const resetId = crypto.randomUUID();
  const resetCode = crypto.randomUUID().slice(0, 8);
  const codeHash = await hashSha256(resetCode);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  await c.env.phikap_db
    .prepare(
      `INSERT INTO password_reset_token (id, brother_id, code_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(resetId, brother.id, codeHash, expiresAt, nowIso())
    .run();

  return c.json({ ok: true, resetCode });
});

app.put("/auth", async (c) => {
  const session = await requireSession(c);
  if (session instanceof Response) {
    return session;
  }
  const body = await c.req.json<{ password?: string }>();
  if (!body.password) {
    return c.json({ error: "password is required" }, 400);
  }
  const passwordHash = await hashSha256(body.password);
  await c.env.phikap_db
    .prepare(`UPDATE brother SET password_hash = ? WHERE id = ?`)
    .bind(passwordHash, session.brotherId)
    .run();
  return c.json({ ok: true });
});

app.get("/brothers", async (c) => {
  const orderBy = c.req.query("orderBy") ?? "points";
  const order = c.req.query("order") ?? "desc";
  const rolesParam = c.req.query("roles");
  const roles = rolesParam ? rolesParam.split(",").map((value) => value.trim()) : [];
  const orderDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereClauses: string[] = [];
  const bindings: string[] = [];

  if (roles.length > 0) {
    whereClauses.push(`role.name IN (${roles.map(() => "?").join(",")})`);
    bindings.push(...roles);
  } else {
    whereClauses.push("role.name != 'inactive'");
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const rows = await c.env.phikap_db
    .prepare(
      `WITH assignment_points AS (
        SELECT event_duty_assignment.brother_id AS brother_id,
               SUM(event_duty.points) AS duty_points
        FROM event_duty_assignment
        JOIN event_duty ON event_duty_assignment.event_duty_id = event_duty.id
        GROUP BY event_duty_assignment.brother_id
      )
      SELECT brother.id,
             brother.name,
             brother.phone_number,
             role.name as role,
             (0.75 * brother.last_semester_points + brother.admin_points + COALESCE(assignment_points.duty_points, 0)) AS points
      FROM brother
      JOIN role ON brother.role_id = role.id
      LEFT JOIN assignment_points ON assignment_points.brother_id = brother.id
      ${whereSql}
      ORDER BY ${orderBy === "name" ? "brother.name" : "points"} ${orderDirection}, brother.name ASC`
    )
    .bind(...bindings)
    .all();

  return c.json({
    brothers: rows.results.map((row) => ({
      id: Number(row.id),
      name: row.name,
      phoneNumber: row.phone_number,
      role: row.role,
      points: Number(row.points ?? 0),
    })),
  });
});

app.get("/brothers/:id", async (c) => {
  const brotherId = Number(c.req.param("id"));
  if (!Number.isFinite(brotherId)) {
    return c.json({ error: "Invalid brother id" }, 400);
  }
  const points = await getBrotherPoints(c, brotherId);
  if (!points) {
    return c.json({ error: "Brother not found" }, 404);
  }
  return c.json(points);
});

app.get("/brothers/:id/assignments", async (c) => {
  const brotherId = Number(c.req.param("id"));
  if (!Number.isFinite(brotherId)) {
    return c.json({ error: "Invalid brother id" }, 400);
  }
  const rows = await c.env.phikap_db
    .prepare(
      `SELECT event_duty_assignment.id as assignment_id,
              event_duty.id as duty_id,
              event.name as event_name,
              event.date as event_date,
              event_duty.time as duty_time,
              duty_definition.description as duty_description,
              duty_type.name as duty_type,
              event_duty_assignment_status.name as status
       FROM event_duty_assignment
       JOIN event_duty ON event_duty_assignment.event_duty_id = event_duty.id
       JOIN event ON event_duty.event_id = event.id
       JOIN duty_definition ON event_duty.duty_definition_id = duty_definition.id
       JOIN duty_type ON duty_definition.duty_type_id = duty_type.id
       JOIN event_duty_assignment_status ON event_duty_assignment.status_id = event_duty_assignment_status.id
       WHERE event_duty_assignment.brother_id = ?
       ORDER BY event.date ASC, event_duty.time ASC`
    )
    .bind(brotherId)
    .all();

  return c.json({ assignments: rows.results });
});

app.put("/brothers/brother", async (c) => {
  const body = await c.req.json<{ id?: number; adminPoints?: number; adminPointsDelta?: number }>();
  if (!body.id) {
    return c.json({ error: "id is required" }, 400);
  }
  if (typeof body.adminPointsDelta === "number") {
    await c.env.phikap_db
      .prepare(`UPDATE brother SET admin_points = admin_points + ? WHERE id = ?`)
      .bind(body.adminPointsDelta, body.id)
      .run();
  } else if (typeof body.adminPoints === "number") {
    await c.env.phikap_db
      .prepare(`UPDATE brother SET admin_points = ? WHERE id = ?`)
      .bind(body.adminPoints, body.id)
      .run();
  } else {
    return c.json({ error: "adminPoints or adminPointsDelta is required" }, 400);
  }
  const points = await getBrotherPoints(c, body.id);
  return c.json({ ok: true, points: points?.points ?? 0 });
});

app.get("/events", async (c) => {
  const rows = await c.env.phikap_db
    .prepare(
      `SELECT event.id,
              event.name,
              event.date,
              event.start_time,
              event.end_time,
              event.duties_unlocked,
              event_definition.name as definition_name,
              event_definition.admin_points as admin_points
       FROM event
       JOIN event_definition ON event.event_definition_id = event_definition.id
       ORDER BY event.date ASC, event.start_time ASC`
    )
    .all();
  return c.json({ events: rows.results });
});

app.post("/events", async (c) => {
  const body = await c.req.json<{
    name?: string;
    eventDefinitionId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
    dutiesUnlocked?: number;
    duties?: Array<{ dutyDefinitionId: number; points: number; requiredBrothers: number; time: string }>;
  }>();

  if (!body.name || !body.eventDefinitionId || !body.date || !body.startTime || !body.endTime) {
    return c.json({ error: "Missing required event fields" }, 400);
  }

  const result = await c.env.phikap_db
    .prepare(
      `INSERT INTO event (name, event_definition_id, date, start_time, end_time, duties_unlocked)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.name,
      body.eventDefinitionId,
      body.date,
      body.startTime,
      body.endTime,
      body.dutiesUnlocked ?? 0
    )
    .run();

  const eventId = Number(result.meta.last_row_id);

  if (body.duties?.length) {
    const statements = body.duties.map((duty) =>
      c.env.phikap_db
        .prepare(
          `INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, time)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(eventId, duty.dutyDefinitionId, duty.points, duty.requiredBrothers, duty.time)
    );
    await c.env.phikap_db.batch(statements);
  }

  return c.json({ ok: true, eventId });
});

app.get("/events/:eventId/duties", async (c) => {
  const eventId = Number(c.req.param("eventId"));
  if (!Number.isFinite(eventId)) {
    return c.json({ error: "Invalid event id" }, 400);
  }
  const duties = await c.env.phikap_db
    .prepare(
      `SELECT event_duty.id,
              event_duty.points,
              event_duty.required_brothers,
              event_duty.time,
              duty_definition.description,
              duty_type.name as duty_type
       FROM event_duty
       JOIN duty_definition ON event_duty.duty_definition_id = duty_definition.id
       JOIN duty_type ON duty_definition.duty_type_id = duty_type.id
       WHERE event_duty.event_id = ?
       ORDER BY event_duty.time ASC, duty_definition.description ASC`
    )
    .bind(eventId)
    .all();

  const assignments = await c.env.phikap_db
    .prepare(
      `SELECT event_duty_assignment.id as assignment_id,
              event_duty_assignment.event_duty_id as duty_id,
              event_duty_assignment_status.name as status,
              brother.id as brother_id,
              brother.name as brother_name
       FROM event_duty_assignment
       JOIN event_duty_assignment_status ON event_duty_assignment.status_id = event_duty_assignment_status.id
       JOIN brother ON event_duty_assignment.brother_id = brother.id
       WHERE event_duty_assignment.event_duty_id IN (
        SELECT id FROM event_duty WHERE event_id = ?
       )
       ORDER BY brother.name ASC`
    )
    .bind(eventId)
    .all();

  const assignmentMap = new Map<number, typeof assignments.results>();
  assignments.results.forEach((assignment) => {
    const dutyId = Number(assignment.duty_id);
    const list = assignmentMap.get(dutyId) ?? [];
    list.push(assignment);
    assignmentMap.set(dutyId, list);
  });

  return c.json({
    duties: duties.results.map((duty) => {
      const dutyAssignments = assignmentMap.get(Number(duty.id)) ?? [];
      return {
        id: Number(duty.id),
        points: Number(duty.points),
        requiredBrothers: Number(duty.required_brothers),
        time: duty.time,
        description: duty.description,
        dutyType: duty.duty_type,
        assignments: dutyAssignments.map((assignment) => ({
          id: Number(assignment.assignment_id),
          status: assignment.status,
          brotherId: Number(assignment.brother_id),
          brotherName: assignment.brother_name,
        })),
      };
    }),
  });
});

app.post("/events/:eventId/duties/:dutyId/assignments", async (c) => {
  const eventId = Number(c.req.param("eventId"));
  const dutyId = Number(c.req.param("dutyId"));
  const body = await c.req.json<{ brotherId?: number }>();
  if (!Number.isFinite(eventId) || !Number.isFinite(dutyId) || !body.brotherId) {
    return c.json({ error: "Invalid event duty assignment request" }, 400);
  }

  const dutyRow = await c.env.phikap_db
    .prepare(
      `SELECT required_brothers FROM event_duty WHERE id = ? AND event_id = ?`
    )
    .bind(dutyId, eventId)
    .first();
  if (!dutyRow) {
    return c.json({ error: "Duty not found" }, 404);
  }

  const assigned = await c.env.phikap_db
    .prepare(
      `SELECT COUNT(*) as count FROM event_duty_assignment WHERE event_duty_id = ?`
    )
    .bind(dutyId)
    .first();

  const assignedCount = Number(assigned?.count ?? 0);
  if (assignedCount >= Number(dutyRow.required_brothers)) {
    return c.json({ error: "No remaining slots" }, 409);
  }

  await c.env.phikap_db
    .prepare(
      `INSERT INTO event_duty_assignment (event_duty_id, brother_id, status_id)
       VALUES (?, ?, 1)`
    )
    .bind(dutyId, body.brotherId)
    .run();

  return c.json({ ok: true });
});

app.put("/events/:eventId/duties/:dutyId/assignments/:assignmentId", async (c) => {
  const eventId = Number(c.req.param("eventId"));
  const dutyId = Number(c.req.param("dutyId"));
  const assignmentId = Number(c.req.param("assignmentId"));
  const body = await c.req.json<{ status?: string }>();
  if (!Number.isFinite(eventId) || !Number.isFinite(dutyId) || !Number.isFinite(assignmentId)) {
    return c.json({ error: "Invalid assignment" }, 400);
  }
  if (!body.status) {
    return c.json({ error: "status is required" }, 400);
  }
  const statusId = await getStatusIdByName(c, body.status);
  if (!statusId) {
    return c.json({ error: "Unknown status" }, 400);
  }

  const update = await c.env.phikap_db
    .prepare(
      `UPDATE event_duty_assignment
       SET status_id = ?
       WHERE id = ? AND event_duty_id = ?`
    )
    .bind(statusId, assignmentId, dutyId)
    .run();

  if (update.meta.changes === 0) {
    return c.json({ error: "Assignment not found" }, 404);
  }

  return c.json({ ok: true });
});

app.get("/eventDefinitions", async (c) => {
  const rows = await c.env.phikap_db
    .prepare(`SELECT id, name, admin_points FROM event_definition ORDER BY name ASC`)
    .all();
  return c.json({ eventDefinitions: rows.results });
});

app.post("/eventDefinitions", async (c) => {
  const body = await c.req.json<{ name?: string; adminPoints?: number }>();
  if (!body.name) {
    return c.json({ error: "name is required" }, 400);
  }
  const adminPoints = body.adminPoints ?? 10;
  const result = await c.env.phikap_db
    .prepare(`INSERT INTO event_definition (name, admin_points) VALUES (?, ?)`)
    .bind(body.name, adminPoints)
    .run();

  return c.json({ ok: true, eventDefinitionId: result.meta.last_row_id });
});

app.get("/eventDefinitions/:id/duties", async (c) => {
  const eventDefinitionId = Number(c.req.param("id"));
  if (!Number.isFinite(eventDefinitionId)) {
    return c.json({ error: "Invalid event definition id" }, 400);
  }
  const rows = await c.env.phikap_db
    .prepare(
      `SELECT event_definition_duty.id,
              event_definition_duty.default_points,
              event_definition_duty.default_required_brothers,
              duty_definition.description,
              duty_type.name as duty_type
       FROM event_definition_duty
       JOIN duty_definition ON event_definition_duty.duty_definition_id = duty_definition.id
       JOIN duty_type ON duty_definition.duty_type_id = duty_type.id
       WHERE event_definition_duty.event_definition_id = ?
       ORDER BY duty_type.name ASC, duty_definition.description ASC`
    )
    .bind(eventDefinitionId)
    .all();

  return c.json({ duties: rows.results });
});

app.post("/eventDefinitions/:id/duties", async (c) => {
  const eventDefinitionId = Number(c.req.param("id"));
  const body = await c.req.json<{
    dutyDefinitionId?: number;
    defaultPoints?: number;
    defaultRequiredBrothers?: number;
  }>();
  if (!Number.isFinite(eventDefinitionId) || !body.dutyDefinitionId) {
    return c.json({ error: "Invalid event definition duty" }, 400);
  }

  await c.env.phikap_db
    .prepare(
      `INSERT INTO event_definition_duty
       (event_definition_id, duty_definition_id, default_points, default_required_brothers)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      eventDefinitionId,
      body.dutyDefinitionId,
      body.defaultPoints ?? 0,
      body.defaultRequiredBrothers ?? 1
    )
    .run();

  return c.json({ ok: true });
});

app.get("/dutyDefinitions", async (c) => {
  const rows = await c.env.phikap_db
    .prepare(
      `SELECT duty_definition.id,
              duty_definition.description,
              duty_definition.default_points,
              duty_definition.default_required_brothers,
              duty_type.name as duty_type
       FROM duty_definition
       JOIN duty_type ON duty_definition.duty_type_id = duty_type.id
       ORDER BY duty_type.name ASC, duty_definition.description ASC`
    )
    .all();

  return c.json({ dutyDefinitions: rows.results });
});

app.post("/dutyDefinitions", async (c) => {
  const body = await c.req.json<{
    dutyTypeId?: number;
    description?: string;
    defaultPoints?: number;
    defaultRequiredBrothers?: number;
  }>();
  if (!body.dutyTypeId || !body.description) {
    return c.json({ error: "dutyTypeId and description are required" }, 400);
  }
  const result = await c.env.phikap_db
    .prepare(
      `INSERT INTO duty_definition
       (duty_type_id, description, default_points, default_required_brothers)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      body.dutyTypeId,
      body.description,
      body.defaultPoints ?? 0,
      body.defaultRequiredBrothers ?? 1
    )
    .run();

  return c.json({ ok: true, dutyDefinitionId: result.meta.last_row_id });
});

app.get("/duties", async (c) => {
  const rows = await c.env.phikap_db
    .prepare(
      `SELECT event_duty.id,
              event.name as event_name,
              event.date,
              event_duty.time,
              event_duty.points,
              event_duty.required_brothers,
              duty_definition.description,
              duty_type.name as duty_type
       FROM event_duty
       JOIN event ON event_duty.event_id = event.id
       JOIN duty_definition ON event_duty.duty_definition_id = duty_definition.id
       JOIN duty_type ON duty_definition.duty_type_id = duty_type.id
       ORDER BY event.date ASC, event_duty.time ASC`
    )
    .all();

  return c.json({ duties: rows.results });
});

app.get("/me", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ authenticated: false });
  }
  const brother = await getBrotherById(c, session.brotherId);
  return c.json({
    authenticated: true,
    brother,
    isAdmin: brother?.role === "admin",
  });
});

export default app;
