import type { AppContext } from "./db";
import { SESSION_COOKIE_NAME, addDays, nowIso } from "./db";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

export type SessionInfo = {
  sessionId: string;
  brotherId: number;
  role: string;
  name: string;
};

export const createSession = async (c: AppContext, brotherId: number) => {
  const sessionId = crypto.randomUUID();
  const expiresAt = addDays(7);
  await c.env.phikap_db
    .prepare(
      `INSERT INTO session (id, brother_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(sessionId, brotherId, expiresAt, nowIso())
    .run();

  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    expires: new Date(expiresAt),
  });

  return sessionId;
};

export const clearSessionCookie = (c: AppContext) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
};

export const getSession = async (c: AppContext): Promise<SessionInfo | null> => {
  const cookie = getCookie(c, SESSION_COOKIE_NAME);
  if (!cookie) {
    return null;
  }
  const row = await c.env.phikap_db
    .prepare(
      `SELECT session.id as session_id,
              session.expires_at as expires_at,
              brother.id as brother_id,
              brother.name as brother_name,
              role.name as role
       FROM session
       JOIN brother ON session.brother_id = brother.id
       JOIN role ON brother.role_id = role.id
       WHERE session.id = ?`
    )
    .bind(cookie)
    .first();
  if (!row) {
    return null;
  }

  const expiresAt = Date.parse(String(row.expires_at));
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
    await c.env.phikap_db
      .prepare(`DELETE FROM session WHERE id = ?`)
      .bind(cookie)
      .run();
    clearSessionCookie(c);
    return null;
  }

  return {
    sessionId: String(row.session_id),
    brotherId: Number(row.brother_id),
    role: String(row.role),
    name: String(row.brother_name),
  };
};

export const requireSession = async (c: AppContext) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return session;
};
