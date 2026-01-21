import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { BrotherList } from "./endpoints/brotherList";
import { EventDutyAssignmentCreate } from "./endpoints/eventDutyAssignmentCreate";
import { EventDutyAssignmentList } from "./endpoints/eventDutyAssignmentList";
import { EventDutyList } from "./endpoints/eventDutyList";
import { EventList } from "./endpoints/eventList";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({ origin: "*", allowMethods: ["GET", "POST", "DELETE", "OPTIONS"] }));

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);
openapi.get("/api/brothers", BrotherList);
openapi.get("/api/events", EventList);
openapi.get("/api/event-duties", EventDutyList);
openapi.get("/api/event-duty-assignments", EventDutyAssignmentList);
openapi.post("/api/event-duty-assignments", EventDutyAssignmentCreate);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
