import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthLogin, AuthLogout } from "./endpoints/auth";
import { BrotherList } from "./endpoints/brothers";
import { EventDutiesList, EventDutyAssignmentCreate, EventDutyAssignmentsList, EventList } from "./endpoints/events";
import { EventDefinitionDutiesList, EventDefinitionList } from "./endpoints/eventDefinitions";
import { DutyCreate, DutyList } from "./endpoints/duties";
import { DutyDefinitionCreate, DutyDefinitionList } from "./endpoints/dutyDefinitions";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"/api/*",
	cors({ origin: "*", allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }),
);

const openapi = fromHono(app, {
	docs_url: "/",
});

openapi.post("/api/auth/login", AuthLogin);
openapi.post("/api/auth/logout", AuthLogout);

openapi.get("/api/brothers", BrotherList);

openapi.get("/api/events", EventList);
openapi.get("/api/events/:event_id/duties", EventDutiesList);
openapi.get(
	"/api/events/:event_id/duties/:event_duty_id/assignments",
	EventDutyAssignmentsList,
);
openapi.post(
	"/api/events/:event_id/duties/:event_duty_id/assignments",
	EventDutyAssignmentCreate,
);

openapi.get("/api/eventDefinitions", EventDefinitionList);
openapi.get("/api/eventDefinitions/:event_definition_id/duties", EventDefinitionDutiesList);

openapi.get("/api/duties", DutyList);
openapi.post("/api/duties", DutyCreate);

openapi.get("/api/dutyDefinitions", DutyDefinitionList);
openapi.post("/api/dutyDefinitions", DutyDefinitionCreate);

export default app;
