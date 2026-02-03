import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthLogin, AuthLogout, AuthMe } from "./endpoints/auth";
import {
	AssignmentCreate,
	AssignmentDelete,
	AssignmentList,
	AssignmentUpdate,
} from "./endpoints/assignments";
import { AdminAssignWeek, AdminUnlockWeek } from "./endpoints/adminAssignments";
import { BrotherList, BrotherPointsCreate } from "./endpoints/brothers";
import {
	DutyDefinitionCreate,
	DutyDefinitionList,
	DutyDefinitionUpdate,
} from "./endpoints/dutyDefinitions";
import { DutyTypeCreate, DutyTypeList, DutyTypeUpdate } from "./endpoints/dutyTypes";
import { DutyCreate, DutyDelete, DutyList, DutyUpdate } from "./endpoints/duties";
import {
	EventDefinitionCreate,
	EventDefinitionDutyCreate,
	EventDefinitionDutyDelete,
	EventDefinitionDutyUpdate,
	EventDefinitionDutiesList,
	EventDefinitionList,
	EventDefinitionUpdate,
} from "./endpoints/eventDefinitions";
import {
	EventDutiesList,
	EventDutyAssignmentCreate,
	EventDutyAssignmentsList,
	EventCreate,
	EventList,
	EventUpdate,
} from "./endpoints/events";

const app = new Hono<{ Bindings: Env }>();
app.use(
	"*",
	cors({
		origin: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:5174",
			"http://127.0.0.1:5174",
		],
		credentials: true,
	})
);

const openapi = fromHono(app, {
	docs_url: "/",
	openapi_url: "/openapi.json",
	schema: {
		info: {
			title: "PhiKap API",
			version: "0.1.0",
		},
	},
});

// Auth
openapi.post("/auth/login", AuthLogin);
openapi.get("/auth/me", AuthMe);
openapi.post("/auth/logout", AuthLogout);

// Brothers
openapi.get("/brothers", BrotherList);
openapi.post("/brothers/:brother_id/points", BrotherPointsCreate);

// Duties
openapi.get("/duties", DutyList);
openapi.post("/duties", DutyCreate);
openapi.put("/duties/:duty_id", DutyUpdate);
openapi.delete("/duties/:duty_id", DutyDelete);

// Assignments (flat endpoints)
openapi.get("/assignments", AssignmentList);
openapi.post("/assignments", AssignmentCreate);
openapi.put("/assignments/:assignment_id", AssignmentUpdate);
openapi.delete("/assignments/:assignment_id", AssignmentDelete);

// Admin assignment utilities (testing)
openapi.post("/admin/assignments/unlock-week", AdminUnlockWeek);
openapi.post("/admin/assignments/assign-week", AdminAssignWeek);

// Duty Types
openapi.get("/dutyTypes", DutyTypeList);
openapi.post("/dutyTypes", DutyTypeCreate);
openapi.put("/dutyTypes/:duty_type_id", DutyTypeUpdate);

// Duty Definitions
openapi.get("/dutyDefinitions", DutyDefinitionList);
openapi.post("/dutyDefinitions", DutyDefinitionCreate);
openapi.put("/dutyDefinitions/:duty_definition_id", DutyDefinitionUpdate);

// Event Definitions
openapi.get("/eventDefinitions", EventDefinitionList);
openapi.post("/eventDefinitions", EventDefinitionCreate);
openapi.put("/eventDefinitions/:event_definition_id", EventDefinitionUpdate);
openapi.get(
	"/eventDefinitions/:event_definition_id/duties",
	EventDefinitionDutiesList
);
openapi.post(
	"/eventDefinitions/:event_definition_id/duties",
	EventDefinitionDutyCreate
);
openapi.put(
	"/eventDefinitions/:event_definition_id/duties/:event_definition_duty_id",
	EventDefinitionDutyUpdate
);
openapi.delete(
	"/eventDefinitions/:event_definition_id/duties/:event_definition_duty_id",
	EventDefinitionDutyDelete
);

// Events
openapi.get("/events", EventList);
openapi.post("/events", EventCreate);
openapi.put("/events/:event_id", EventUpdate);
openapi.get("/events/:event_id/duties", EventDutiesList);
openapi.get(
	"/events/:event_id/duties/:event_duty_id/assignments",
	EventDutyAssignmentsList
);
openapi.post(
	"/events/:event_id/duties/:event_duty_id/assignments",
	EventDutyAssignmentCreate
);

export default app;
