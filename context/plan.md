PHIKAP ZERO-TO-HERO PLAN (LOCKED DRAFT)

Scope: Build full working app locally tonight, then deploy to Cloudflare. Start with current backend and introduce a points ledger table. Focus on an actionable plan with checkpoints, decisions, and testing.

DECISIONS LOCKED
- Frontend stack: React + Vite + Tailwind.
- Points rules: only "completed" counts; "assigned" and "late" do not add points.
- All points must be attached to an event (including admin and social chair points).
- Pagination: yes, now.
- Auth: implement late in the plan, right before Cloudflare deploy.

ROUTE SHAPE LOCKED
- Primary contract uses flat filter endpoints (/duties, /assignments).
- Nested routes stay as secondary/compat for docs and readability.

PLAN (15 STEPS)
1) Align requirements + route contract
   - Confirm decisions above.
   - Lock API shapes for brothers, events, duties, assignments, auth.
   - Decide on query params (sorting, role filtering, include flags).
   - Output: Signed-off API contract section in context/architecture.md.

2) DB schema updates (ledger table + indexes)
   - Add point_adjustment table: (id, brother_id, event_id, amount, reason, created_by, created_at).
   - event_id is NOT NULL so every adjustment ties to an event.
   - Add indexes on brother_id, event_id, created_at; add FKs to brother + event.
   - Decide whether admin_points column is deprecated or kept for legacy.
   - Output: Updated backend/schema.sql + migration notes.

3) Seed strategy + reset plan
   - Decide on reseed approach: baseline + demo adjustments.
   - Update seed.sql with sample point_adjustment rows and any new events.
   - Output: Fresh seed ready for local dev and demo.

4) Backend scaffolding + OpenAPI consistency
   - Wire up all route handlers in backend/src/index.ts (Hono + Chanfana).
   - Standardize response envelopes: { success, data... }.
   - Output: Fully registered routes and docs.

5) Points calculation (ledger + assignments)
   - Update points SQL to include point_adjustment sum.
   - Enforce rules for assignment statuses (completed/late/rejected).
   - Output: Brother list/detail returning correct totals.

6) Brothers endpoints
   - GET /brothers with role filter, sorting, default ordering.
   - Pagination (page/page_size) on all list endpoints.
   - PUT /brothers/:id to add/subtract points via ledger (not direct field).
   - Output: Admin can adjust points; list reflects it.

7) Duty definitions + duty types endpoints
   - CRUD or minimal create/list for duty definitions and duty types.
   - Output: Admin can define new duties.

8) Event definitions + events endpoints
   - Create event definitions (templates).
   - Create event instances with duties seeded from definitions.
   - Output: Admin can add events + duties in one flow.

9) Duties + assignments endpoints
   - GET /duties?event_id=... for event duties.
   - POST/PUT/DELETE /assignments for sign-up, status changes, drop.
   - Output: Sign-up and status flows work.

10) Frontend app scaffolding
   - Pick stack, set up routing, layout, and data layer.
   - Add `frontend/src/api/paths.ts` + base API client.
   - Output: App shell with routes and navigation.

11) Core pages (MVP)
   - Duty signup page: event dropdown, duties list, signup controls.
   - Home calendar page with event selection.
   - Brother list page with sorting/filtering + admin point adjustments.
   - Output: All primary user stories working.

12) Admin management pages
   - Create event types, events, duty definitions, duty types.
   - Output: Admin can manage data from UI.

13) UI polish + UX passes
   - Intentional typography and color system, responsive layout, loading states.
   - Add empty states and toasts for actions.
   - Output: Professional look and feel.

14) Auth endpoints (late stage)
   - POST /auth/login (slack_id → session cookie).
   - POST /auth/logout (delete session + cookie).
   - POST /auth/reset + PUT /auth (stubbed, documented, or minimal).
   - Output: Working auth with cookie persistence.

15) Testing + deployment
   - Automated checks: key endpoint tests + points calc cases.
   - Manual test checklist (signup, completion, admin edits).
   - Deploy to Cloudflare (wrangler, D1 migrations, secrets).
   - Output: Live instance verified.

TESTING CHECKLIST (INITIAL DRAFT)
- Login/logout with slack_id
- Brother list sorting/filtering
- Points calc matches expected for sample brothers
- Duty signup + status change rules
- Event creation → duties auto-created
- Admin point adjustments update totals
- UI screens on desktop + mobile

DEPLOYMENT NOTES (TO FINALIZE)
- Wrangler config for D1 + environment variables
- Migration order: schema → seed
- Cache + CORS policies
