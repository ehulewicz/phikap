import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "./App.css";
import { buildQuery, fetchJson } from "./api/client";
import { paths } from "./api/paths";

type Brother = {
	id: number;
	name: string;
	role_id: number;
	last_semester_points: number;
	points: number;
};

type AuthBrother = {
	id: number;
	name: string;
	role_id: number;
	slack_id: string;
};

type EventItem = {
	id: number;
	name: string;
	event_definition_id: number;
	date: string;
	start_time: string;
	end_time: string;
	duties_unlocked: number;
};

type Duty = {
	id: number;
	event_id: number;
	duty_definition_id: number;
	description: string;
	duty_type: string;
	points: number;
	required_brothers: number;
	time: string;
	assigned_count: number;
};

type Assignment = {
	id: number;
	event_duty_id: number;
	brother_id: number;
	status_id: number;
	status_name?: string;
	brother_name?: string;
};

type EventDefinition = {
	id: number;
	name: string;
	admin_points: number;
	default_start_time?: string | null;
};

type DutyType = {
	id: number;
	name: string;
};

type DutyDefinition = {
	id: number;
	duty_type_id: number;
	description: string;
	default_points: number;
	default_required_brothers: number;
};

type EventDefinitionDuty = {
	id: number;
	event_definition_id: number;
	duty_definition_id: number;
	default_points: number;
	default_required_brothers: number;
	default_time: string | null;
};

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentBrother, setCurrentBrother] = useState<AuthBrother | null>(null);
  const [slackIdInput, setSlackIdInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedBrotherId, setSelectedBrotherId] = useState<number | "">("");
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [view, setView] = useState<"duties" | "calendar" | "brothers" | "admin">("calendar");
  const [loading, setLoading] = useState(true);
  const [brothersLoading, setBrothersLoading] = useState(false);
  const [loadingDuties, setLoadingDuties] = useState(false);
  const [submittingDutyId, setSubmittingDutyId] = useState<number | null>(null);
  const [droppingAssignmentId, setDroppingAssignmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [roleFilters, setRoleFilters] = useState<Array<"active" | "inactive" | "senior">>([
    "active",
    "senior",
  ]);
  const [orderBy, setOrderBy] = useState<"points" | "name">("points");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");
  const [adjustmentBrotherId, setAdjustmentBrotherId] = useState<number | "">("");
  const [adjustmentEventId, setAdjustmentEventId] = useState<number | "">("");
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>("");
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [weekEvents, setWeekEvents] = useState<EventItem[]>([]);
  const [weekAssignments, setWeekAssignments] = useState<
    Array<{
      event: EventItem;
      duty: Duty;
      assignment: Assignment;
    }>
  >([]);
  const [weekRefreshTick, setWeekRefreshTick] = useState(0);
  const [adminEntity, setAdminEntity] = useState<
    "event_definitions" | "events" | "duty_definitions"
  >("event_definitions");
  const [adminItemId, setAdminItemId] = useState<number | "new">("new");
  const [adminNavTarget, setAdminNavTarget] = useState<number | null>(null);
  const [, setAdminLoading] = useState(false);
  const [eventDefinitions, setEventDefinitions] = useState<EventDefinition[]>([]);
  const [dutyDefinitions, setDutyDefinitions] = useState<DutyDefinition[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [adminDuties, setAdminDuties] = useState<Duty[]>([]);
  const [eventDefinitionDuties, setEventDefinitionDuties] = useState<EventDefinitionDuty[]>([]);
  const [eventDefinitionDutyEdits, setEventDefinitionDutyEdits] = useState<
    Record<number, { default_points: string; default_required_brothers: string; default_time: string }>
  >({});
  const [eventDefinitionDutyAdd, setEventDefinitionDutyAdd] = useState<{
    duty_definition_id: number | "";
    default_points: string;
    default_required_brothers: string;
    default_time: string;
  }>({ duty_definition_id: "", default_points: "", default_required_brothers: "", default_time: "" });
  const [eventDefinitionName, setEventDefinitionName] = useState("");
  const [eventDefinitionAdminPoints, setEventDefinitionAdminPoints] = useState("10");
  const [eventDefinitionDefaultStartTime, setEventDefinitionDefaultStartTime] = useState("");
  const [eventDefinitionTemplateId, setEventDefinitionTemplateId] = useState<number | "">("");
  const [eventDefinitionDutyDrafts, setEventDefinitionDutyDrafts] = useState<
    Array<{
      duty_definition_id: number | "";
      default_points: string;
      default_required_brothers: string;
      default_time: string;
    }>
  >([{ duty_definition_id: "", default_points: "", default_required_brothers: "", default_time: "" }]);
  const [eventFormName, setEventFormName] = useState("");
  const [eventFormDefinitionId, setEventFormDefinitionId] = useState<number | "">("");
  const [eventFormDate, setEventFormDate] = useState("");
  const [eventFormStartTime, setEventFormStartTime] = useState("");
  const [eventFormEndTime, setEventFormEndTime] = useState("");
  const [eventIncludeDefaults, setEventIncludeDefaults] = useState(true);
  const [eventEditDefinitionId, setEventEditDefinitionId] = useState<number | "">("");
  const [eventEditName, setEventEditName] = useState("");
  const [eventEditDate, setEventEditDate] = useState("");
  const [eventEditStartTime, setEventEditStartTime] = useState("");
  const [eventEditEndTime, setEventEditEndTime] = useState("");
  const [eventEditSaving, setEventEditSaving] = useState(false);
  const [eventDutyEdits, setEventDutyEdits] = useState<Record<number, string>>({});
  const [eventDutyDraftDefinitionId, setEventDutyDraftDefinitionId] = useState<number | "">("");
  const [eventDutyDraftPoints, setEventDutyDraftPoints] = useState("");
  const [eventDutyDraftRequired, setEventDutyDraftRequired] = useState("");
  const [eventDutyDraftTime, setEventDutyDraftTime] = useState("");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [preCreateEventId, setPreCreateEventId] = useState<number | "">("");
  const [dutyDefinitionTypeId, setDutyDefinitionTypeId] = useState<number | "">("");
  const [dutyDefinitionDescription, setDutyDefinitionDescription] = useState("");
  const [dutyDefinitionPoints, setDutyDefinitionPoints] = useState("");
  const [dutyDefinitionRequired, setDutyDefinitionRequired] = useState("");

  useEffect(() => {
    const storedSlackId = localStorage.getItem("phikap_slack_id");
    if (storedSlackId) {
      setSlackIdInput(storedSlackId);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setAuthLoading(true);
    fetchJson<{ success: boolean; brother: AuthBrother; expires_at: string }>(paths.auth.me())
      .then((data) => {
        if (!active) return;
        setIsAuthenticated(true);
        setCurrentBrother(data.brother);
        if (data.brother?.id) {
          setSelectedBrotherId(data.brother.id);
        }
      })
      .catch(() => {
        if (!active) return;
        setIsAuthenticated(false);
        setCurrentBrother(null);
      })
      .finally(() => {
        if (!active) return;
        setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchJson<{ success: boolean; events: EventItem[] }>(
        `${paths.events.list()}${buildQuery({ page: 1, page_size: 100 })}`,
      ),
      fetchJson<{ success: boolean; event_definitions: EventDefinition[] }>(
        `${paths.eventDefinitions.list()}${buildQuery({ page: 1, page_size: 100 })}`,
      ),
    ])
      .then(([eventData, definitionData]) => {
        if (!active) return;
        setEvents(eventData.events ?? []);
        setEventDefinitions(definitionData.event_definitions ?? []);
        if (eventData.events?.length) {
          setSelectedEventId(eventData.events[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load data.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setBrothersLoading(true);
    setError(null);

    fetchJson<{ success: boolean; brothers: Brother[] }>(
      `${paths.brothers.list()}${buildQuery({
        page: 1,
        page_size: 100,
        role_ids: roleFilters.length ? toRoleIds(roleFilters) : undefined,
        order_by: orderBy,
        order: orderDir,
      })}`,
    )
      .then((brotherData) => {
        if (!active) return;
        setBrothers(brotherData.brothers ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load brothers.");
      })
      .finally(() => {
        if (!active) return;
        setBrothersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, roleFilters, orderBy, orderDir]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!selectedEventId) {
      setDuties([]);
      setAssignments([]);
      return;
    }

    let active = true;
    setLoadingDuties(true);
    setError(null);

    Promise.all([
      fetchJson<{ success: boolean; duties: Duty[] }>(
        `${paths.duties.list()}${buildQuery({
          event_id: selectedEventId,
          page: 1,
          page_size: 100,
        })}`,
      ),
      fetchJson<{ success: boolean; assignments: Assignment[] }>(
        `${paths.assignments.list()}${buildQuery({
          event_id: selectedEventId,
          page: 1,
          page_size: 100,
        })}`,
      ),
    ])
      .then(([dutyData, assignmentData]) => {
        if (!active) return;
        setDuties(dutyData.duties ?? []);
        setAssignments(assignmentData.assignments ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load duties.");
      })
      .finally(() => {
        if (!active) return;
        setLoadingDuties(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, selectedEventId]);

  const activeBrotherId =
    currentBrother?.id ?? (typeof selectedBrotherId === "number" ? selectedBrotherId : null);
  const selectedBrother = activeBrotherId
    ? brothers.find((brother) => brother.id === activeBrotherId)
    : undefined;
  const displayBrother = selectedBrother ?? currentBrother;
  const isAdmin = (displayBrother?.role_id ?? currentBrother?.role_id) === 4;
  const selectedEvent = selectedEventId
    ? events.find((event) => event.id === selectedEventId)
    : null;
  const formatShortDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map((part) => Number(part));
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const formatEventLabel = (event: EventItem) =>
    `${event.name} · ${formatShortDate(event.date)} · ${formatTime(
      event.start_time,
    )} – ${formatTime(event.end_time)}`;

  useEffect(() => {
    if (selectedEvent) {
      setEventEditDefinitionId(selectedEvent.event_definition_id);
      setEventEditName(selectedEvent.name);
      setEventEditDate(selectedEvent.date);
      setEventEditStartTime(selectedEvent.start_time);
      setEventEditEndTime(selectedEvent.end_time);
    } else {
      setEventEditDefinitionId("");
      setEventEditName("");
      setEventEditDate("");
      setEventEditStartTime("");
      setEventEditEndTime("");
    }
  }, [selectedEvent]);

  const roleOptions = [
    { key: "active" as const, label: "Active" },
    { key: "inactive" as const, label: "Inactive" },
    { key: "senior" as const, label: "Senior" },
  ];

  const toRoleIds = (filters: Array<"active" | "inactive" | "senior">) => {
    const ids: number[] = [];
    if (filters.includes("active")) {
      ids.push(1, 4);
    }
    if (filters.includes("inactive")) {
      ids.push(2);
    }
    if (filters.includes("senior")) {
      ids.push(3);
    }
    return ids;
  };

  const assignmentMap = useMemo(() => {
    const map = new Map<number, Assignment[]>();
    assignments.forEach((assignment) => {
      const list = map.get(assignment.event_duty_id) ?? [];
      list.push(assignment);
      map.set(assignment.event_duty_id, list);
    });
    return map;
  }, [assignments]);

  const dutyGroups = useMemo(() => {
    const groups = new Map<string, Duty[]>();
    duties.forEach((duty) => {
      const key = duty.duty_type || "Other";
      const list = groups.get(key) ?? [];
      list.push(duty);
      groups.set(key, list);
    });
    const order = ["Purchase", "Setup", "During", "Cleanup"];
    const ordered = order
      .filter((label) => groups.has(label))
      .map((label) => ({ label, duties: groups.get(label) ?? [] }));
    const remaining = Array.from(groups.entries())
      .filter(([label]) => !order.includes(label))
      .map(([label, list]) => ({ label, duties: list }));
    return [...ordered, ...remaining];
  }, [duties]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [events]);

  const dutyTypeNameById = useMemo(() => {
    const map = new Map<number, string>();
    dutyTypes.forEach((type) => map.set(type.id, type.name));
    return map;
  }, [dutyTypes]);

  const dutyDefinitionById = useMemo(() => {
    const map = new Map<number, DutyDefinition>();
    dutyDefinitions.forEach((definition) => map.set(definition.id, definition));
    return map;
  }, [dutyDefinitions]);

  const eventDefinitionById = useMemo(() => {
    const map = new Map<number, EventDefinition>();
    eventDefinitions.forEach((definition) => map.set(definition.id, definition));
    return map;
  }, [eventDefinitions]);

  const isSpecialEvent = (event: EventItem) => {
    const definition = eventDefinitionById.get(event.event_definition_id);
    return definition?.name === "Special";
  };

  const sortedDutyDefinitions = useMemo(() => {
    const order = ["Purchase", "Setup", "During", "Cleanup"];
    const orderIndex = new Map(order.map((label, index) => [label, index]));
    return [...dutyDefinitions].sort((a, b) => {
      const aType = dutyTypeNameById.get(a.duty_type_id) ?? "";
      const bType = dutyTypeNameById.get(b.duty_type_id) ?? "";
      const aIdx = orderIndex.has(aType) ? orderIndex.get(aType)! : order.length;
      const bIdx = orderIndex.has(bType) ? orderIndex.get(bType)! : order.length;
      if (aIdx !== bIdx) return aIdx - bIdx;
      const aDesc = a.description.toLowerCase();
      const bDesc = b.description.toLowerCase();
      if (aDesc < bDesc) return -1;
      if (aDesc > bDesc) return 1;
      return a.id - b.id;
    });
  }, [dutyDefinitions, dutyTypeNameById]);

  const eventDutiesForSelected = useMemo(() => {
    if (adminEntity !== "events" || adminItemId === "new") return [];
    return adminDuties.filter((duty) => duty.event_id === adminItemId);
  }, [adminDuties, adminEntity, adminItemId]);

  const eventDutyGroups = useMemo(() => {
    const groups = new Map<string, Duty[]>();
    eventDutiesForSelected.forEach((duty) => {
      const key = duty.duty_type || "Other";
      const list = groups.get(key) ?? [];
      list.push(duty);
      groups.set(key, list);
    });
    const order = ["Purchase", "Setup", "During", "Cleanup"];
    const ordered = order.map((label) => ({ label, duties: groups.get(label) ?? [] }));
    const remaining = Array.from(groups.entries())
      .filter(([label]) => !order.includes(label))
      .map(([label, list]) => ({ label, duties: list }));
    return [...ordered, ...remaining];
  }, [eventDutiesForSelected]);

  const eventDefinitionDutyGroups = useMemo(() => {
    const groups = new Map<string, EventDefinitionDuty[]>();
    eventDefinitionDuties.forEach((duty) => {
      const definition = dutyDefinitionById.get(duty.duty_definition_id);
      const label = definition
        ? dutyTypeNameById.get(definition.duty_type_id) ?? "Other"
        : "Other";
      const list = groups.get(label) ?? [];
      list.push(duty);
      groups.set(label, list);
    });
    const order = ["Purchase", "Setup", "During", "Cleanup"];
    const ordered = order.map((label) => ({ label, duties: groups.get(label) ?? [] }));
    const remaining = Array.from(groups.entries())
      .filter(([label]) => !order.includes(label))
      .map(([label, list]) => ({ label, duties: list }));
    return [...ordered, ...remaining];
  }, [dutyDefinitionById, dutyTypeNameById, eventDefinitionDuties]);

  const adminItemOptions = useMemo(() => {
    if (adminEntity === "event_definitions") {
      return eventDefinitions.map((definition) => ({
        id: definition.id,
        label: definition.name,
      }));
    }
    if (adminEntity === "events") {
      return events.map((event) => ({
        id: event.id,
        label: formatEventLabel(event),
      }));
    }
    if (adminEntity === "duty_definitions") {
      return sortedDutyDefinitions.map((definition) => ({
        id: definition.id,
        label: `${definition.description} · ${
          dutyTypeNameById.get(definition.duty_type_id) ?? `Type ${definition.duty_type_id}`
        }`,
      }));
    }
    return [];
  }, [
    adminEntity,
    sortedDutyDefinitions,
    dutyTypeNameById,
    eventDefinitions,
    events,
  ]);

  useEffect(() => {
    const handleClick = (event: globalThis.MouseEvent) => {
      if (!statusFilterOpen) return;
      const target = event.target as Node | null;
      if (statusFilterRef.current && target && !statusFilterRef.current.contains(target)) {
        setStatusFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [statusFilterOpen]);

  const buildCalendarGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = startWeekday - 1; i >= 0; i -= 1) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        inMonth: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), inMonth: true });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const fill = 7 - remainder;
      for (let day = 1; day <= fill; day += 1) {
        cells.push({ date: new Date(year, month + 1, day), inMonth: false });
      }
    }
    return cells;
  };

  const calendarGrid = useMemo(() => {
    return buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth());
  }, [calendarMonth]);

  const todayKey = (() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const parseDate = (date: string) => {
    const [year, month, day] = date.split("-").map((part) => Number(part));
    return new Date(year, month - 1, day);
  };

  const getCalendarWeekRange = (baseDate: Date) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diffToTuesday = (day + 5) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diffToTuesday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const currentWeekRange = useMemo(() => getCalendarWeekRange(new Date()), []);

  useEffect(() => {
    const now = new Date();
    const { start, end } = getCalendarWeekRange(now);
    const filtered = events.filter((event) => {
      const date = parseDate(event.date);
      return date >= start && date <= end;
    });
    setWeekEvents(filtered);
  }, [events]);


  useEffect(() => {
    if (!activeBrotherId) {
      setWeekAssignments([]);
      return;
    }
    const now = new Date();
    const { start, end } = getCalendarWeekRange(now);
    const weekEvents = events.filter((event) => {
      const date = parseDate(event.date);
      return date >= start && date <= end;
    });

    if (weekEvents.length === 0) {
      setWeekAssignments([]);
      return;
    }

    let active = true;
    Promise.all(
      weekEvents.map(async (event) => {
        const [dutiesData, assignmentsData] = await Promise.all([
          fetchJson<{ success: boolean; duties: Duty[] }>(
            `${paths.duties.list()}${buildQuery({ event_id: event.id, page: 1, page_size: 100 })}`,
          ),
          fetchJson<{ success: boolean; assignments: Assignment[] }>(
            `${paths.assignments.list()}${buildQuery({
              event_id: event.id,
              page: 1,
              page_size: 100,
            })}`,
          ),
        ]);

        const duties = dutiesData.duties ?? [];
        const assignments = assignmentsData.assignments ?? [];
        const dutyMap = new Map<number, Duty>();
        duties.forEach((duty) => dutyMap.set(duty.id, duty));

        return assignments
          .filter((assignment) => {
            if (!activeBrotherId) return false;
            return assignment.brother_id === activeBrotherId;
          })
          .map((assignment) => {
            const duty = dutyMap.get(assignment.event_duty_id);
            if (!duty) return null;
            return { event, duty, assignment };
          })
          .filter(Boolean) as Array<{
          event: EventItem;
          duty: Duty;
          assignment: Assignment;
        }>;
      }),
    )
      .then((result) => {
        if (!active) return;
        const flattened = result.flat();
        setWeekAssignments(flattened);
      })
      .catch(() => {
        if (!active) return;
        setWeekAssignments([]);
      });

    return () => {
      active = false;
    };
  }, [events, activeBrotherId, weekRefreshTick]);

  const monthLabel = calendarMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToMonth = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      const delta = direction === "prev" ? -1 : 1;
      return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
    });
  };

  const formatTime = (value: string) => {
    if (!value) return "Time TBD";
    const [h, m] = value.split(":").map((part) => Number(part));
    if (Number.isNaN(h) || Number.isNaN(m)) return value;
    const hour12 = ((h + 11) % 12) + 1;
    const suffix = h >= 12 ? "PM" : "AM";
    return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const formatDay = (dateString: string) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDutyTime = (duty: Duty) => {
    return duty.time ? formatTime(duty.time) : "Time TBD";
  };

  const toggleRole = (roleKey: "active" | "inactive" | "senior") => {
    setRoleFilters((prev) =>
      prev.includes(roleKey)
        ? prev.filter((key) => key !== roleKey)
        : [...prev, roleKey],
    );
  };

  const resetEventDefinitionForm = () => {
    setEventDefinitionName("");
    setEventDefinitionAdminPoints("10");
    setEventDefinitionDefaultStartTime("");
    setEventDefinitionTemplateId("");
    setEventDefinitionDutyDrafts([
      {
        duty_definition_id: "",
        default_points: "",
        default_required_brothers: "",
        default_time: "",
      },
    ]);
    setEventDefinitionDuties([]);
    setEventDefinitionDutyEdits({});
    setEventDefinitionDutyAdd({
      duty_definition_id: "",
      default_points: "",
      default_required_brothers: "",
      default_time: "",
    });
  };

  const resetEventForm = () => {
    setEventFormName("");
    setEventFormDefinitionId("");
    setEventFormDate("");
    setEventFormStartTime("");
    setEventFormEndTime("");
    setEventIncludeDefaults(true);
    setEventDutyEdits({});
    setEventDutyDraftDefinitionId("");
    setEventDutyDraftPoints("");
    setEventDutyDraftRequired("");
    setEventDutyDraftTime("");
  };

  const getDefinitionStartTime = (definitionId: number | "") => {
    if (!definitionId) return "";
    const definition = eventDefinitions.find((item) => item.id === definitionId);
    return definition?.default_start_time ?? "";
  };

  const handleEventFormDefinitionChange = (value: string) => {
    const nextId = value ? Number(value) : "";
    setEventFormDefinitionId(nextId);
    if (!nextId) return;
    if (!eventFormStartTime) {
      const defaultStart = getDefinitionStartTime(nextId);
      if (defaultStart) {
        setEventFormStartTime(defaultStart);
      }
    }
  };

  const openCreateEvent = (date?: string) => {
    setNotice(null);
    setError(null);
    setIsEditingEvent(false);
    if (!isCreatingEvent) {
      setPreCreateEventId(typeof selectedEventId === "number" ? selectedEventId : "");
    }
    setSelectedEventId("");
    setDuties([]);
    setAssignments([]);
    if (!isCreatingEvent) {
      const previousDefinitionId = eventFormDefinitionId;
      resetEventForm();
      const nextDefinitionId =
        previousDefinitionId || eventDefinitions[0]?.id || "";
      if (nextDefinitionId) {
        setEventFormDefinitionId(nextDefinitionId);
        const defaultStart = getDefinitionStartTime(nextDefinitionId);
        if (defaultStart) {
          setEventFormStartTime(defaultStart);
        }
      }
    }
    if (date) {
      setEventFormDate(date);
    }
    setIsCreatingEvent(true);
  };

  const handleCreateEvent = async () => {
    const name = eventFormName.trim();
    if (!name) {
      setError("Enter an event name.");
      return;
    }
    if (!eventFormDefinitionId) {
      setError("Select an event definition.");
      return;
    }
    if (!eventFormDate || !eventFormStartTime || !eventFormEndTime) {
      setError("Enter the date, start time, and end time.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      const data = await fetchJson<{ success: boolean; event: EventItem | null }>(
        paths.events.create(),
        {
          method: "POST",
          body: JSON.stringify({
            name,
            event_definition_id: Number(eventFormDefinitionId),
            date: eventFormDate,
            start_time: eventFormStartTime,
            end_time: eventFormEndTime,
            include_default_duties: eventIncludeDefaults,
          }),
        },
      );
      await refreshEvents();
      await refreshAdminDuties();
      setNotice("Event created.");
      if (data.event?.id) {
        setSelectedEventId(data.event.id);
        setIsCreatingEvent(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to create event.");
      } else {
        setError("Unable to create event.");
      }
    }
  };

  const resetDutyDefinitionForm = () => {
    setDutyDefinitionTypeId("");
    setDutyDefinitionDescription("");
    setDutyDefinitionPoints("");
    setDutyDefinitionRequired("");
  };


  const refreshBrothers = async () => {
    setBrothersLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ success: boolean; brothers: Brother[] }>(
        `${paths.brothers.list()}${buildQuery({
          page: 1,
          page_size: 100,
          role_ids: roleFilters.length ? toRoleIds(roleFilters) : undefined,
          order_by: orderBy,
          order: orderDir,
        })}`,
      );
      setBrothers(data.brothers ?? []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load brothers.");
      }
    } finally {
      setBrothersLoading(false);
    }
  };

  const refreshEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await fetchJson<{ success: boolean; events: EventItem[] }>(
        `${paths.events.list()}${buildQuery({ page: 1, page_size: 100 })}`,
      );
      const nextEvents = eventData.events ?? [];
      setEvents(nextEvents);
      setSelectedEventId((prev) => {
        if (typeof prev === "number" && nextEvents.some((event) => event.id === prev)) {
          return prev;
        }
        return nextEvents[0]?.id ?? "";
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load events.");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshEventDefinitions = async () => {
    const data = await fetchJson<{ success: boolean; event_definitions: EventDefinition[] }>(
      `${paths.eventDefinitions.list()}${buildQuery({ page: 1, page_size: 100 })}`,
    );
    setEventDefinitions(data.event_definitions ?? []);
  };

  const refreshEventDefinitionDuties = async (eventDefinitionId: number) => {
    const data = await fetchJson<{ success: boolean; duties: EventDefinitionDuty[] }>(
      `${paths.eventDefinitions.duties(eventDefinitionId)}${buildQuery({ page: 1, page_size: 100 })}`,
    );
    setEventDefinitionDuties(data.duties ?? []);
  };

  const refreshDutyDefinitions = async () => {
    const data = await fetchJson<{ success: boolean; definitions: DutyDefinition[] }>(
      `${paths.dutyDefinitions.list()}${buildQuery({ page: 1, page_size: 100 })}`,
    );
    setDutyDefinitions(data.definitions ?? []);
  };

  const refreshDutyTypes = async () => {
    const data = await fetchJson<{ success: boolean; types: DutyType[] }>(
      `${paths.dutyTypes.list()}${buildQuery({ page: 1, page_size: 100 })}`,
    );
    setDutyTypes(data.types ?? []);
  };

  const refreshAdminDuties = async () => {
    const data = await fetchJson<{ success: boolean; duties: Duty[] }>(
      `${paths.duties.list()}${buildQuery({ page: 1, page_size: 100 })}`,
    );
    setAdminDuties(data.duties ?? []);
  };

  useEffect(() => {
    if (view !== "admin") return;
    if (adminNavTarget) {
      setAdminEntity("event_definitions");
      setAdminItemId(adminNavTarget);
      setAdminNavTarget(null);
      return;
    }
    setAdminEntity("event_definitions");
    setAdminItemId("new");
  }, [view, adminNavTarget]);

  useEffect(() => {
    if (view !== "duties") {
      setIsEditingEvent(false);
    }
  }, [view]);

  useEffect(() => {
    setIsEditingEvent(false);
  }, [selectedEventId]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || view !== "admin") return;
    let active = true;
    setAdminLoading(true);
    setError(null);

    Promise.all([
      refreshEventDefinitions(),
      refreshDutyDefinitions(),
      refreshDutyTypes(),
      refreshAdminDuties(),
    ])
      .catch((err) => {
        if (!active) return;
        if (err instanceof Error) {
          setError(err.message || "Failed to load admin data.");
        } else {
          setError("Failed to load admin data.");
        }
      })
      .finally(() => {
        if (!active) return;
        setAdminLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, isAdmin, view]);

  useEffect(() => {
    setAdminItemId("new");
    if (adminEntity === "event_definitions") {
      resetEventDefinitionForm();
    } else if (adminEntity === "events") {
      resetEventForm();
    } else if (adminEntity === "duty_definitions") {
      resetDutyDefinitionForm();
    }
  }, [adminEntity]);

  useEffect(() => {
    if (adminEntity !== "event_definitions") return;
    if (adminItemId === "new") {
      resetEventDefinitionForm();
      return;
    }
    const selected = eventDefinitions.find((definition) => definition.id === adminItemId);
    if (!selected) return;
    setEventDefinitionName(selected.name);
    setEventDefinitionAdminPoints(String(selected.admin_points));
    setEventDefinitionDefaultStartTime(selected.default_start_time ?? "");
    setEventDefinitionTemplateId("");
    setEventDefinitionDutyAdd({
      duty_definition_id: "",
      default_points: "",
      default_required_brothers: "",
      default_time: "",
    });

    refreshEventDefinitionDuties(selected.id).catch(() => {
      setEventDefinitionDuties([]);
    });
  }, [adminEntity, adminItemId, eventDefinitions]);

  useEffect(() => {
    if (adminEntity !== "event_definitions") return;
    const next: Record<
      number,
      { default_points: string; default_required_brothers: string; default_time: string }
    > = {};
    eventDefinitionDuties.forEach((duty) => {
      next[duty.id] = {
        default_points: String(duty.default_points),
        default_required_brothers: String(duty.default_required_brothers),
        default_time: duty.default_time ?? "",
      };
    });
    setEventDefinitionDutyEdits(next);
  }, [adminEntity, eventDefinitionDuties]);

  const handleEventDefinitionTemplateChange = async (value: string) => {
    const nextId = value ? Number(value) : "";
    setEventDefinitionTemplateId(nextId);
    if (!nextId) {
      setEventDefinitionDutyDrafts([
        {
          duty_definition_id: "",
          default_points: "",
          default_required_brothers: "",
          default_time: "",
        },
      ]);
      return;
    }

    const template = eventDefinitions.find((definition) => definition.id === nextId);
    if (template) {
      setEventDefinitionAdminPoints(String(template.admin_points));
      setEventDefinitionDefaultStartTime(template.default_start_time ?? "");
      setEventDefinitionName((prev) => (prev ? prev : `${template.name} Copy`));
    }

    try {
      const data = await fetchJson<{ success: boolean; duties: EventDefinitionDuty[] }>(
        `${paths.eventDefinitions.duties(nextId)}${buildQuery({ page: 1, page_size: 100 })}`,
      );
      const drafts =
        data.duties?.map((duty) => ({
          duty_definition_id: duty.duty_definition_id,
          default_points: String(duty.default_points),
          default_required_brothers: String(duty.default_required_brothers),
          default_time: duty.default_time ?? "",
        })) ?? [];
      setEventDefinitionDutyDrafts(
        drafts.length
          ? drafts
          : [
              {
                duty_definition_id: "",
                default_points: "",
                default_required_brothers: "",
                default_time: "",
              },
            ],
      );
    } catch (err) {
      setEventDefinitionDutyDrafts([
        {
          duty_definition_id: "",
          default_points: "",
          default_required_brothers: "",
          default_time: "",
        },
      ]);
    }
  };

  useEffect(() => {
    if (adminEntity !== "events") return;
    if (adminItemId === "new") {
      resetEventForm();
      return;
    }
    const selected = events.find((event) => event.id === adminItemId);
    if (!selected) return;
    setEventFormName(selected.name);
    setEventFormDefinitionId(selected.event_definition_id);
    setEventFormDate(selected.date);
    setEventFormStartTime(selected.start_time);
    setEventFormEndTime(selected.end_time);
    setEventIncludeDefaults(true);
    setEventDutyDraftDefinitionId("");
    setEventDutyDraftPoints("");
    setEventDutyDraftRequired("");
    setEventDutyDraftTime(selected.start_time || "");
  }, [adminEntity, adminItemId, events]);

  useEffect(() => {
    if (adminEntity !== "events" || adminItemId === "new") {
      setEventDutyEdits({});
      return;
    }
    const next: Record<number, string> = {};
    eventDutiesForSelected.forEach((duty) => {
      next[duty.id] = String(duty.required_brothers);
    });
    setEventDutyEdits(next);
  }, [adminEntity, adminItemId, eventDutiesForSelected]);

  useEffect(() => {
    if (adminEntity !== "duty_definitions") return;
    if (adminItemId === "new") {
      resetDutyDefinitionForm();
      return;
    }
    const selected = dutyDefinitions.find((definition) => definition.id === adminItemId);
    if (!selected) return;
    setDutyDefinitionTypeId(selected.duty_type_id);
    setDutyDefinitionDescription(selected.description);
    setDutyDefinitionPoints(String(selected.default_points));
    setDutyDefinitionRequired(String(selected.default_required_brothers));
  }, [adminEntity, adminItemId, dutyDefinitions]);

  const handleAdjustmentSubmit = async () => {
    if (!adjustmentBrotherId || !adjustmentEventId || !adjustmentAmount) {
      setNotice("Select a brother, event, and amount.");
      return;
    }
    setNotice(null);
    try {
      await fetchJson(paths.brothers.points(Number(adjustmentBrotherId)), {
        method: "POST",
        body: JSON.stringify({
          event_id: Number(adjustmentEventId),
          amount: Number(adjustmentAmount),
          reason: adjustmentReason || null,
        }),
      });
      setNotice("Point adjustment saved.");
      setAdjustmentAmount("");
      setAdjustmentReason("");
      await refreshBrothers();
    } catch (err) {
      if (err instanceof Error) {
        setNotice(err.message || "Unable to save adjustment.");
      }
    }
  };

  const handleLogin = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmed = slackIdInput.trim();
    if (!trimmed) {
      setAuthError("Enter your Slack ID to continue.");
      return;
    }

    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const data = await fetchJson<{
        success: boolean;
        brother: AuthBrother;
        expires_at: string;
      }>(paths.auth.login(), {
        method: "POST",
        body: JSON.stringify({
          slack_id: trimmed,
        }),
      });
      setIsAuthenticated(true);
      setCurrentBrother(data.brother);
      if (data.brother?.id) {
        setSelectedBrotherId(data.brother.id);
      }
      localStorage.setItem("phikap_slack_id", trimmed);
    } catch (err) {
      if (err instanceof Error) {
        setAuthError(err.message || "Unable to login.");
      } else {
        setAuthError("Unable to login.");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchJson(paths.auth.logout(), { method: "POST" });
    } catch {
      // ignore logout errors
    } finally {
      setIsAuthenticated(false);
      setCurrentBrother(null);
      setSelectedBrotherId("");
      setSelectedEventId("");
      setView("calendar");
    }
  };

  const handleSort = (column: "points" | "name") => {
    if (orderBy === column) {
      setOrderDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(column);
      setOrderDir(column === "points" ? "desc" : "asc");
    }
  };

  const updateEventDefinitionDutyDraft = (
    index: number,
    field:
      | "duty_definition_id"
      | "default_points"
      | "default_required_brothers"
      | "default_time",
    value: string,
  ) => {
    setEventDefinitionDutyDrafts((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === "duty_definition_id") {
          return { ...item, duty_definition_id: value ? Number(value) : "" };
        }
        return { ...item, [field]: value };
      }),
    );
  };

  const addEventDefinitionDutyDraft = () => {
    setEventDefinitionDutyDrafts((prev) => [
      ...prev,
      {
        duty_definition_id: "",
        default_points: "",
        default_required_brothers: "",
        default_time: "",
      },
    ]);
  };

  const removeEventDefinitionDutyDraft = (index: number) => {
    setEventDefinitionDutyDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAdminSave = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setNotice(null);
    setError(null);

    try {
      if (adminEntity === "event_definitions") {
        const name = eventDefinitionName.trim();
        if (!name) {
          setError("Enter an event definition name.");
          return;
        }
        if (!eventDefinitionAdminPoints.trim()) {
          setError("Enter admin points.");
          return;
        }
        const adminPoints = Number(eventDefinitionAdminPoints);
        if (!Number.isFinite(adminPoints)) {
          setError("Admin points must be a number.");
          return;
        }
        const defaultStartTime = eventDefinitionDefaultStartTime.trim() || null;

        const hasPartialDuty = eventDefinitionDutyDrafts.some((duty) => {
          const hasAny =
            duty.duty_definition_id ||
            duty.default_points ||
            duty.default_required_brothers ||
            duty.default_time;
          const hasAll =
            duty.duty_definition_id &&
            duty.default_points.trim() !== "" &&
            duty.default_required_brothers.trim() !== "";
          return hasAny && !hasAll;
        });
        if (hasPartialDuty) {
          setError("Fill out all default duty fields or remove the row.");
          return;
        }

        const dutiesPayload = eventDefinitionDutyDrafts
          .filter(
            (duty) =>
              duty.duty_definition_id &&
              duty.default_points.trim() !== "" &&
              duty.default_required_brothers.trim() !== "",
          )
          .map((duty) => ({
            duty_definition_id: Number(duty.duty_definition_id),
            default_points: Number(duty.default_points),
            default_required_brothers: Number(duty.default_required_brothers),
            default_time: duty.default_time?.trim() || null,
          }));

        if (adminItemId === "new") {
          const data = await fetchJson<{ success: boolean; event_definition: EventDefinition | null }>(
            paths.eventDefinitions.create(),
            {
              method: "POST",
              body: JSON.stringify({
                name,
                admin_points: adminPoints,
                default_start_time: defaultStartTime,
                duties: dutiesPayload.length ? dutiesPayload : undefined,
              }),
            },
          );
          await refreshEventDefinitions();
          setNotice("Event definition created.");
          if (data.event_definition?.id) {
            setAdminItemId(data.event_definition.id);
          } else {
            resetEventDefinitionForm();
          }
        } else {
          await fetchJson(paths.eventDefinitions.update(adminItemId), {
            method: "PUT",
            body: JSON.stringify({
              name,
              admin_points: adminPoints,
              default_start_time: defaultStartTime,
            }),
          });
          await refreshEventDefinitions();
          setNotice("Event definition updated.");
        }
        return;
      }

      if (adminEntity === "events") {
        const name = eventFormName.trim();
        if (!name) {
          setError("Enter an event name.");
          return;
        }
        if (!eventFormDefinitionId) {
          setError("Select an event definition.");
          return;
        }
        if (!eventFormDate || !eventFormStartTime || !eventFormEndTime) {
          setError("Enter the date, start time, and end time.");
          return;
        }

        if (adminItemId === "new") {
          const data = await fetchJson<{ success: boolean; event: EventItem | null }>(
            paths.events.create(),
            {
              method: "POST",
              body: JSON.stringify({
                name,
                event_definition_id: Number(eventFormDefinitionId),
                date: eventFormDate,
                start_time: eventFormStartTime,
                end_time: eventFormEndTime,
                include_default_duties: eventIncludeDefaults,
              }),
            },
          );
          await refreshEvents();
          await refreshAdminDuties();
          setNotice("Event created.");
          if (data.event?.id) {
            setAdminItemId(data.event.id);
          } else {
            resetEventForm();
          }
        } else {
          await fetchJson(paths.events.update(adminItemId), {
            method: "PUT",
            body: JSON.stringify({
              name,
              event_definition_id: Number(eventFormDefinitionId),
              date: eventFormDate,
              start_time: eventFormStartTime,
              end_time: eventFormEndTime,
            }),
          });
          await refreshEvents();
          await refreshAdminDuties();
          setNotice("Event updated.");
        }
        return;
      }

      if (adminEntity === "duty_definitions") {
        if (!dutyDefinitionTypeId) {
          setError("Select a duty type.");
          return;
        }
        const description = dutyDefinitionDescription.trim();
        if (!description) {
          setError("Enter a duty description.");
          return;
        }
        if (!dutyDefinitionPoints.trim() || !dutyDefinitionRequired.trim()) {
          setError("Enter default points and required brothers.");
          return;
        }
        const defaultPoints = Number(dutyDefinitionPoints);
        const defaultRequired = Number(dutyDefinitionRequired);
        if (!Number.isFinite(defaultPoints) || !Number.isFinite(defaultRequired)) {
          setError("Default points and required brothers must be numbers.");
          return;
        }

        if (adminItemId === "new") {
          const data = await fetchJson<{ success: boolean; definition: DutyDefinition | null }>(
            paths.dutyDefinitions.create(),
            {
              method: "POST",
              body: JSON.stringify({
                duty_type_id: Number(dutyDefinitionTypeId),
                description,
                default_points: defaultPoints,
                default_required_brothers: defaultRequired,
              }),
            },
          );
          await refreshDutyDefinitions();
          setNotice("Duty definition created.");
          if (data.definition?.id) {
            setAdminItemId(data.definition.id);
          } else {
            resetDutyDefinitionForm();
          }
        } else {
          await fetchJson(paths.dutyDefinitions.update(adminItemId), {
            method: "PUT",
            body: JSON.stringify({
              duty_type_id: Number(dutyDefinitionTypeId),
              description,
              default_points: defaultPoints,
              default_required_brothers: defaultRequired,
            }),
          });
          await refreshDutyDefinitions();
          setNotice("Duty definition updated.");
        }
        return;
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to save changes.");
      } else {
        setError("Unable to save changes.");
      }
    }
  };

  const handleEventDefinitionDutyAddDefinitionChange = (value: string) => {
    const nextId = value ? Number(value) : "";
    if (!nextId) {
      setEventDefinitionDutyAdd((prev) => ({
        ...prev,
        duty_definition_id: "",
      }));
      return;
    }
    const definition = dutyDefinitions.find((item) => item.id === nextId);
    setEventDefinitionDutyAdd((prev) => ({
      duty_definition_id: nextId,
      default_points:
        prev.default_points || (definition ? String(definition.default_points) : ""),
      default_required_brothers:
        prev.default_required_brothers ||
        (definition ? String(definition.default_required_brothers) : ""),
      default_time: prev.default_time || "",
    }));
  };

  const handleEventDefinitionDutyUpdate = async (dutyId: number) => {
    if (adminEntity !== "event_definitions" || adminItemId === "new") return;
    const draft = eventDefinitionDutyEdits[dutyId];
    if (!draft) return;
    const defaultPoints = Number(draft.default_points);
    const defaultRequired = Number(draft.default_required_brothers);
    const defaultTime = draft.default_time?.trim() || null;
    if (!Number.isFinite(defaultPoints) || !Number.isFinite(defaultRequired)) {
      setError("Default points and required brothers must be numbers.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.eventDefinitions.dutyUpdate(adminItemId, dutyId), {
        method: "PUT",
        body: JSON.stringify({
          default_points: defaultPoints,
          default_required_brothers: defaultRequired,
          default_time: defaultTime,
        }),
      });
      await refreshEventDefinitionDuties(adminItemId);
      setNotice("Default duty updated.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to update default duty.");
      } else {
        setError("Unable to update default duty.");
      }
    }
  };

  const handleEventDefinitionDutyRemove = async (dutyId: number) => {
    if (adminEntity !== "event_definitions" || adminItemId === "new") return;
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.eventDefinitions.dutyRemove(adminItemId, dutyId), {
        method: "DELETE",
      });
      await refreshEventDefinitionDuties(adminItemId);
      setNotice("Default duty removed.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to remove default duty.");
      } else {
        setError("Unable to remove default duty.");
      }
    }
  };

  const handleEventDefinitionRemove = async () => {
    if (adminEntity !== "event_definitions" || adminItemId === "new") return;
    const confirmed = window.confirm(
      "Delete this event definition? This will remove all related events and duties.",
    );
    if (!confirmed) return;
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.eventDefinitions.remove(adminItemId), { method: "DELETE" });
      await Promise.all([refreshEventDefinitions(), refreshEvents(), refreshAdminDuties()]);
      setNotice("Event definition deleted.");
      setAdminItemId("new");
      resetEventDefinitionForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to delete event definition.");
      } else {
        setError("Unable to delete event definition.");
      }
    }
  };

  const handleEventDefinitionDutyAdd = async () => {
    if (adminEntity !== "event_definitions" || adminItemId === "new") return;
    if (!eventDefinitionDutyAdd.duty_definition_id) {
      setError("Select a duty definition.");
      return;
    }
    if (
      !eventDefinitionDutyAdd.default_points.trim() ||
      !eventDefinitionDutyAdd.default_required_brothers.trim()
    ) {
      setError("Enter default points and required brothers.");
      return;
    }
    const defaultPoints = Number(eventDefinitionDutyAdd.default_points);
    const defaultRequired = Number(eventDefinitionDutyAdd.default_required_brothers);
    const defaultTime = eventDefinitionDutyAdd.default_time?.trim() || null;
    if (!Number.isFinite(defaultPoints) || !Number.isFinite(defaultRequired)) {
      setError("Default points and required brothers must be numbers.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.eventDefinitions.dutyCreate(adminItemId), {
        method: "POST",
        body: JSON.stringify({
          duty_definition_id: Number(eventDefinitionDutyAdd.duty_definition_id),
          default_points: defaultPoints,
          default_required_brothers: defaultRequired,
          default_time: defaultTime,
        }),
      });
      await refreshEventDefinitionDuties(adminItemId);
      setNotice("Default duty added.");
      setEventDefinitionDutyAdd({
        duty_definition_id: "",
        default_points: "",
        default_required_brothers: "",
        default_time: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to add default duty.");
      } else {
        setError("Unable to add default duty.");
      }
    }
  };

  const handleEventDutyDraftDefinitionChange = (value: string) => {
    const nextId = value ? Number(value) : "";
    if (!nextId) {
      setEventDutyDraftDefinitionId("");
      return;
    }
    const definition = dutyDefinitions.find((item) => item.id === nextId);
    setEventDutyDraftDefinitionId(nextId);
    if (definition) {
      setEventDutyDraftPoints((prev) => prev || String(definition.default_points));
      setEventDutyDraftRequired((prev) => prev || String(definition.default_required_brothers));
    }
    if (!eventDutyDraftTime) {
      const baseTime = eventFormStartTime || eventEditStartTime || selectedEvent?.start_time || "";
      if (baseTime) {
        setEventDutyDraftTime(baseTime);
      }
    }
  };

  const handleEventDutyUpdate = async (duty: Duty) => {
    if (adminEntity !== "events" || adminItemId === "new") return;
    const requiredDraft = eventDutyEdits[duty.id];
    if (!requiredDraft || !requiredDraft.trim()) {
      setError("Enter required brothers.");
      return;
    }
    const required = Number(requiredDraft);
    if (!Number.isFinite(required)) {
      setError("Required brothers must be a number.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.duties.update(duty.id), {
        method: "PUT",
        body: JSON.stringify({
          event_id: duty.event_id,
          duty_definition_id: duty.duty_definition_id,
          points: duty.points,
          required_brothers: required,
          time: duty.time,
        }),
      });
      await refreshAdminDuties();
      setNotice("Duty updated.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to update duty.");
      } else {
        setError("Unable to update duty.");
      }
    }
  };

  const handleEventDutyRemove = async (dutyId: number) => {
    if (adminEntity !== "events" || adminItemId === "new") return;
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.duties.remove(dutyId), { method: "DELETE" });
      await refreshAdminDuties();
      setNotice("Duty removed.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to remove duty.");
      } else {
        setError("Unable to remove duty.");
      }
    }
  };

  const handleEventDutyRemoveFromList = async (dutyId: number) => {
    if (!selectedEventId) {
      setError("Select an event first.");
      return;
    }
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.duties.remove(dutyId), { method: "DELETE" });
      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${paths.duties.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${paths.assignments.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
      ]);
      setDuties(dutyData.duties ?? []);
      setAssignments(assignmentData.assignments ?? []);
      setNotice("Duty removed.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to remove duty.");
      } else {
        setError("Unable to remove duty.");
      }
    }
  };

  const handleEventDutyAdd = async () => {
    if (adminEntity !== "events" || adminItemId === "new") {
      setError("Create the event before adding duties.");
      return;
    }
    if (!eventDutyDraftDefinitionId) {
      setError("Select a duty definition.");
      return;
    }
    if (!eventDutyDraftPoints.trim() || !eventDutyDraftRequired.trim()) {
      setError("Enter points and required brothers.");
      return;
    }
    if (!eventDutyDraftTime) {
      setError("Enter a duty time.");
      return;
    }
    const points = Number(eventDutyDraftPoints);
    const required = Number(eventDutyDraftRequired);
    if (!Number.isFinite(points) || !Number.isFinite(required)) {
      setError("Points and required brothers must be numbers.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.duties.create(), {
        method: "POST",
        body: JSON.stringify({
          event_id: Number(adminItemId),
          duty_definition_id: Number(eventDutyDraftDefinitionId),
          points,
          required_brothers: required,
          time: eventDutyDraftTime,
        }),
      });
      await refreshAdminDuties();
      setNotice("Duty added.");
      setEventDutyDraftDefinitionId("");
      setEventDutyDraftPoints("");
      setEventDutyDraftRequired("");
      setEventDutyDraftTime(eventFormStartTime || "");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to add duty.");
      } else {
        setError("Unable to add duty.");
      }
    }
  };

  const handleEventDutyAddFromList = async () => {
    if (!selectedEventId) {
      setError("Select an event first.");
      return;
    }
    if (!eventDutyDraftDefinitionId) {
      setError("Select a duty definition.");
      return;
    }
    if (!eventDutyDraftPoints.trim() || !eventDutyDraftRequired.trim()) {
      setError("Enter points and required brothers.");
      return;
    }
    if (!eventDutyDraftTime) {
      setError("Enter a duty time.");
      return;
    }
    const points = Number(eventDutyDraftPoints);
    const required = Number(eventDutyDraftRequired);
    if (!Number.isFinite(points) || !Number.isFinite(required)) {
      setError("Points and required brothers must be numbers.");
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.duties.create(), {
        method: "POST",
        body: JSON.stringify({
          event_id: Number(selectedEventId),
          duty_definition_id: Number(eventDutyDraftDefinitionId),
          points,
          required_brothers: required,
          time: eventDutyDraftTime,
        }),
      });
      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${paths.duties.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${paths.assignments.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
      ]);
      setDuties(dutyData.duties ?? []);
      setAssignments(assignmentData.assignments ?? []);
      setNotice("Duty added.");
      setEventDutyDraftDefinitionId("");
      setEventDutyDraftPoints("");
      setEventDutyDraftRequired("");
      const baseTime = eventEditStartTime || selectedEvent?.start_time || "";
      setEventDutyDraftTime(baseTime);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to add duty.");
      } else {
        setError("Unable to add duty.");
      }
    }
  };

  const handleDutyDefinitionRemove = async () => {
    if (adminEntity !== "duty_definitions" || adminItemId === "new") return;
    const confirmed = window.confirm(
      "Delete this duty definition? This will remove all related duties and assignments.",
    );
    if (!confirmed) return;
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.dutyDefinitions.remove(adminItemId), { method: "DELETE" });
      await refreshDutyDefinitions();
      setNotice("Duty definition deleted.");
      setAdminItemId("new");
      resetDutyDefinitionForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to delete duty definition.");
      } else {
        setError("Unable to delete duty definition.");
      }
    }
  };

  const handleSignUp = async (eventDutyId: number) => {
    if (!activeBrotherId) {
      setNotice("Unable to identify your account.");
      return;
    }

    setSubmittingDutyId(eventDutyId);
    setNotice(null);

    try {
      await fetchJson(paths.assignments.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_duty_id: eventDutyId,
          brother_id: activeBrotherId,
        }),
      });

      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${paths.duties.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${paths.assignments.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
      ]);
      setDuties(dutyData.duties ?? []);
      setAssignments(assignmentData.assignments ?? []);
      setNotice("Signed up successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setNotice(err.message || "Unable to sign up.");
      }
    } finally {
      setSubmittingDutyId(null);
    }
  };

  const handleEventTypeChange = async (value: string) => {
    if (!selectedEvent) {
      setError("Select an event first.");
      return;
    }
    const nextId = value ? Number(value) : "";
    if (!nextId) {
      setEventEditDefinitionId("");
      return;
    }
    if (nextId === selectedEvent.event_definition_id) {
      setEventEditDefinitionId(nextId);
      return;
    }
    const confirmed = window.confirm(
      "Change event type? This will reset all duties for this event.",
    );
    if (!confirmed) {
      setEventEditDefinitionId(selectedEvent.event_definition_id);
      return;
    }

    setEventEditDefinitionId(nextId);
    setNotice(null);
    setError(null);
    try {
      await fetchJson(paths.events.update(selectedEvent.id), {
        method: "PUT",
        body: JSON.stringify({
          name: selectedEvent.name,
          event_definition_id: nextId,
          date: selectedEvent.date,
          start_time: selectedEvent.start_time,
          end_time: selectedEvent.end_time,
        }),
      });
      await refreshEvents();
      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${paths.duties.list()}${buildQuery({
            event_id: selectedEvent.id,
            page: 1,
            page_size: 100,
          })}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${paths.assignments.list()}${buildQuery({
            event_id: selectedEvent.id,
            page: 1,
            page_size: 100,
          })}`,
        ),
      ]);
      setDuties(dutyData.duties ?? []);
      setAssignments(assignmentData.assignments ?? []);
      setNotice("Event type updated.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to update event type.");
      } else {
        setError("Unable to update event type.");
      }
      setEventEditDefinitionId(selectedEvent.event_definition_id);
    }
  };

  const handleEventEditSave = async () => {
    if (!selectedEvent) {
      setError("Select an event first.");
      return;
    }
    const name = eventEditName.trim();
    if (!name) {
      setError("Enter an event name.");
      return;
    }
    if (!eventEditDate || !eventEditStartTime || !eventEditEndTime) {
      setError("Enter the date, start time, and end time.");
      return;
    }

    setNotice(null);
    setError(null);
    setEventEditSaving(true);
    try {
      await fetchJson(paths.events.update(selectedEvent.id), {
        method: "PUT",
        body: JSON.stringify({
          name,
          event_definition_id:
            typeof eventEditDefinitionId === "number"
              ? eventEditDefinitionId
              : selectedEvent.event_definition_id,
          date: eventEditDate,
          start_time: eventEditStartTime,
          end_time: eventEditEndTime,
        }),
      });
      await refreshEvents();
      setNotice("Event updated.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to update event.");
      } else {
        setError("Unable to update event.");
      }
    } finally {
      setEventEditSaving(false);
    }
  };

  const handleDropAssignment = async (assignmentId: number) => {
    if (!selectedEventId) {
      setError("Select an event first.");
      return;
    }
    if (!window.confirm("Drop this duty?")) {
      return;
    }
    setNotice(null);
    setError(null);
    setDroppingAssignmentId(assignmentId);
    try {
      await fetchJson(paths.assignments.remove(assignmentId), { method: "DELETE" });
      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${paths.duties.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${paths.assignments.list()}${buildQuery({
            event_id: selectedEventId,
            page: 1,
            page_size: 100,
          })}`,
        ),
      ]);
      setDuties(dutyData.duties ?? []);
      setAssignments(assignmentData.assignments ?? []);
      setNotice("Dropped duty.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to drop duty.");
      } else {
        setError("Unable to drop duty.");
      }
    } finally {
      setDroppingAssignmentId(null);
    }
  };

  const handleEventClick = (eventId: number, clickEvent: MouseEvent<HTMLButtonElement>) => {
    if (isAdmin && (clickEvent.ctrlKey || clickEvent.metaKey)) {
      clickEvent.preventDefault();
      setAdminNavTarget(eventId);
      setView("admin");
      return;
    }
    setSelectedEventId(eventId);
    setView("duties");
  };

  const handleCalendarDayDoubleClick = (dateKey: string) => {
    if (!isAdmin) return;
    openCreateEvent(dateKey);
    setView("duties");
  };

  const handleUnlockWeek = async () => {
    setNotice(null);
    setError(null);
    try {
      const data = await fetchJson<{ success: boolean; updated: number }>(
        paths.admin.unlockWeek(),
        { method: "POST" },
      );
      setNotice(`Unlocked duties for ${data.updated} event(s) this week.`);
      await refreshEvents();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to unlock duties.");
      } else {
        setError("Unable to unlock duties.");
      }
    }
  };

  const handleAssignWeek = async () => {
    setNotice(null);
    setError(null);
    try {
      const data = await fetchJson<{
        success: boolean;
        assignments_created: number;
      }>(paths.admin.assignWeek(), { method: "POST" });
      setNotice(`Assigned ${data.assignments_created} duty slots for this week.`);
      await refreshAdminDuties();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unable to assign duties.");
      } else {
        setError("Unable to assign duties.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="page">
        <main className="shell auth-shell">
          <section className="panel login-panel">
            <div className="login-header">
              <div className="brand-mark">ΦΚΘ</div>
              <div>
                <p className="brand-overline">Phi Kappa Theta · Gamma Tau</p>
                <h1>Checking session…</h1>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <main className="shell auth-shell">
          <section className="panel login-panel">
            <div className="login-header">
              <div className="brand-mark">ΦΚΘ</div>
              <div>
                <p className="brand-overline">Phi Kappa Theta · Gamma Tau</p>
                <h1>Sign in with Slack ID</h1>
              </div>
            </div>
            <p className="login-subtitle">
              Enter your Slack ID to access the duty signup app.
            </p>
            {authError ? <div className="error">{authError}</div> : null}
            <form className="login-form" onSubmit={handleLogin}>
              <div className="select-pill">
                <label htmlFor="slack-id">Slack ID</label>
                <input
                  id="slack-id"
                  className="text-input"
                  type="text"
                  value={slackIdInput}
                  onChange={(event) => setSlackIdInput(event.target.value)}
                  placeholder="e.g. U06F0AFB8F7"
                />
              </div>
              <button className="primary" type="submit" disabled={authSubmitting}>
                {authSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="login-footnote">
              Don’t know your Slack ID? Find it under profile by clicking the three dots.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="shell">
        <header className="header">
          <div className="brand">
            <div className="brand-mark">ΦΚΘ</div>
            <div>
              <p className="brand-overline">Phi Kappa Theta · Gamma Tau</p>
              <h1>Social Duty Signup</h1>
            </div>
          </div>
          <div className="profile">
            <div className="profile-name">
              {displayBrother ? displayBrother.name : "Select a brother"}
            </div>
            <button className="ghost small" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <nav className="tabs">
          <button
            className={`tab ${view === "calendar" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setCalendarMonth(new Date());
              setWeekRefreshTick((prev) => prev + 1);
              setView("calendar");
            }}
          >
            Home
          </button>
          <button
            className={`tab ${view === "duties" ? "active" : ""}`}
            type="button"
            onClick={() => setView("duties")}
          >
            Duties
          </button>
          <button
            className={`tab ${view === "brothers" ? "active" : ""}`}
            type="button"
            onClick={() => setView("brothers")}
          >
            Brothers
          </button>
          {isAdmin ? (
            <button
              className={`tab ${view === "admin" ? "active" : ""}`}
              type="button"
              onClick={() => setView("admin")}
            >
              Admin
            </button>
          ) : null}
        </nav>

        <section className="panel">
          {notice ? <div className="notice">{notice}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          {view === "duties" ? (
            <>
              <div className="filters">
                <div className="filter-group">
                  <div className="select-pill">
                    <label htmlFor="event">Event</label>
                    <select
                      id="event"
                      value={selectedEventId}
                      onChange={(event) =>
                        setSelectedEventId(event.target.value ? Number(event.target.value) : "")
                      }
                    >
                      <option value="">Select</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {formatEventLabel(event)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isAdmin && isEditingEvent ? (
                    <div className="select-pill">
                      <label htmlFor="event-type">Event type</label>
                      <select
                        id="event-type"
                        value={eventEditDefinitionId}
                        onChange={(event) => handleEventTypeChange(event.target.value)}
                        disabled={!selectedEventId}
                      >
                        <option value="">Select</option>
                        {eventDefinitions.map((definition) => (
                          <option key={definition.id} value={definition.id}>
                            {definition.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
                <div className="action-group">
                  <button className="primary" type="button" disabled>
                    Share Duty List
                  </button>
                  {isAdmin ? (
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        if (isCreatingEvent) {
                          setIsCreatingEvent(false);
                          if (typeof preCreateEventId === "number") {
                            setSelectedEventId(preCreateEventId);
                          }
                          return;
                        }
                        openCreateEvent();
                      }}
                    >
                      {isCreatingEvent ? "Cancel" : "New event"}
                    </button>
                  ) : null}
                  {isAdmin ? (
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setIsCreatingEvent(false);
                        setIsEditingEvent((prev) => !prev);
                      }}
                    >
                      Edit event
                    </button>
                  ) : null}
                </div>
              </div>
              {isAdmin && isCreatingEvent ? (
                <div className="event-edit event-create">
                  <div className="event-edit-grid">
                    <div className="select-pill">
                      <label htmlFor="event-create-name">Event name</label>
                      <input
                        id="event-create-name"
                        className="text-input"
                        type="text"
                        value={eventFormName}
                        onChange={(event) => setEventFormName(event.target.value)}
                        placeholder="e.g. Philigher"
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-create-type">Event type</label>
                      <select
                        id="event-create-type"
                        value={eventFormDefinitionId}
                        onChange={(event) => handleEventFormDefinitionChange(event.target.value)}
                      >
                        <option value="">Select</option>
                        {eventDefinitions.map((definition) => (
                          <option key={definition.id} value={definition.id}>
                            {definition.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-create-date">Date</label>
                      <input
                        id="event-create-date"
                        className="text-input"
                        type="date"
                        value={eventFormDate}
                        onChange={(event) => setEventFormDate(event.target.value)}
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-create-start">Start time</label>
                      <input
                        id="event-create-start"
                        className="text-input"
                        type="time"
                        value={eventFormStartTime}
                        onChange={(event) => setEventFormStartTime(event.target.value)}
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-create-end">End time</label>
                      <input
                        id="event-create-end"
                        className="text-input"
                        type="time"
                        value={eventFormEndTime}
                        onChange={(event) => setEventFormEndTime(event.target.value)}
                      />
                    </div>
                    <button className="primary action" type="button" onClick={handleCreateEvent}>
                      Create event
                    </button>
                  </div>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={eventIncludeDefaults}
                      onChange={(event) => setEventIncludeDefaults(event.target.checked)}
                    />
                    <span>Seed default duties from the event definition</span>
                  </label>
                </div>
              ) : null}
              {isAdmin && isEditingEvent ? (
                <div className="event-edit">
                  <div className="event-edit-grid">
                    <div className="select-pill">
                      <label htmlFor="event-edit-name">Event name</label>
                      <input
                        id="event-edit-name"
                        className="text-input"
                        type="text"
                        value={eventEditName}
                        onChange={(event) => setEventEditName(event.target.value)}
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-edit-date">Date</label>
                      <input
                        id="event-edit-date"
                        className="text-input"
                        type="date"
                        value={eventEditDate}
                        onChange={(event) => setEventEditDate(event.target.value)}
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-edit-start">Start time</label>
                      <input
                        id="event-edit-start"
                        className="text-input"
                        type="time"
                        value={eventEditStartTime}
                        onChange={(event) => setEventEditStartTime(event.target.value)}
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="event-edit-end">End time</label>
                      <input
                        id="event-edit-end"
                        className="text-input"
                        type="time"
                        value={eventEditEndTime}
                        onChange={(event) => setEventEditEndTime(event.target.value)}
                      />
                    </div>
                    <button
                      className="primary action"
                      type="button"
                      onClick={handleEventEditSave}
                      disabled={eventEditSaving}
                    >
                      {eventEditSaving ? "Saving..." : "Save event"}
                    </button>
                  </div>
                  <div className="admin-subsection">
                    <div className="admin-subtitle">Add duty to event</div>
                    <div className="admin-duty-row event-duty-add">
                      <div className="select-pill">
                        <label>Duty definition</label>
                        <select
                          value={eventDutyDraftDefinitionId || ""}
                          onChange={(event) =>
                            handleEventDutyDraftDefinitionChange(event.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {sortedDutyDefinitions.map((definition) => (
                            <option key={definition.id} value={definition.id}>
                              {definition.description} ·{" "}
                              {dutyTypeNameById.get(definition.duty_type_id) ??
                                `Type ${definition.duty_type_id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="select-pill">
                        <label>Points</label>
                        <input
                          className="text-input"
                          type="number"
                          min="0"
                          value={eventDutyDraftPoints}
                          onChange={(event) => setEventDutyDraftPoints(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label>Slots</label>
                        <input
                          className="text-input"
                          type="number"
                          min="1"
                          value={eventDutyDraftRequired}
                          onChange={(event) => setEventDutyDraftRequired(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label>Time</label>
                        <input
                          className="text-input"
                          type="time"
                          value={eventDutyDraftTime}
                          onChange={(event) => setEventDutyDraftTime(event.target.value)}
                        />
                      </div>
                      <button className="ghost small" type="button" onClick={handleEventDutyAddFromList}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="duties">
                {loading || loadingDuties ? (
                  <div className="empty">Loading duties…</div>
                ) : duties.length === 0 ? (
                  <div className="empty">No duties available.</div>
                ) : (
                  dutyGroups.map((group) => (
                    <div key={group.label} className="duty-group">
                      <div className="group-header">
                        <h2>{group.label}</h2>
                        <span>{group.duties.length} duties</span>
                      </div>
                      {group.duties.length === 0 ? (
                        <div className="empty">No {group.label.toLowerCase()} duties.</div>
                      ) : (
                        group.duties.map((duty) => {
                          const assigned = assignmentMap.get(duty.id) ?? [];
                          const assignedCount = duty.assigned_count ?? assigned.length;
                          const isFull = assignedCount >= duty.required_brothers;
                          const activeAssignment = activeBrotherId
                            ? assigned.find((assignment) => assignment.brother_id === activeBrotherId)
                            : null;
                          const isSignedUp = activeAssignment?.status_name === "signed_up";
                          const isUnlocked = selectedEvent?.duties_unlocked === 1;
                          const actionDisabled = isSignedUp
                            ? !isUnlocked || droppingAssignmentId === activeAssignment?.id
                            : !activeBrotherId ||
                              !isUnlocked ||
                              isFull ||
                              Boolean(activeAssignment) ||
                              submittingDutyId === duty.id;

                          return (
                            <div className="duty-row" key={duty.id}>
                              <div>
                                <p className="duty-name">{duty.description}</p>
                                <p className="duty-meta">
                                  {formatDutyTime(duty)} · {duty.points} pts · {assignedCount}/
                                  {duty.required_brothers} filled
                                </p>
                                {assignedCount > 0 ? (
                                  <p className="duty-assignees">
                                    {(assigned
                                      .map((assignment) => assignment.brother_name)
                                      .filter(Boolean) as string[]
                                    ).join(", ")}
                                  </p>
                                ) : null}
                              </div>
                              <div className="duty-actions">
                                <span className={`pill ${isFull ? "full" : "open"}`}>
                                  {isFull ? "Full" : "Open"}
                                </span>
                                <button
                                  className="ghost"
                                  type="button"
                                  onClick={() => {
                                    if (isSignedUp && activeAssignment) {
                                      handleDropAssignment(activeAssignment.id);
                                    } else {
                                      handleSignUp(duty.id);
                                    }
                                  }}
                                  disabled={actionDisabled}
                                >
                                  {!isUnlocked
                                    ? "Locked"
                                    : isSignedUp
                                      ? "Drop duty"
                                      : "Sign up"}
                                </button>
                                {isAdmin && isEditingEvent ? (
                                  <button
                                    className="duty-admin-remove"
                                    type="button"
                                    aria-label="Remove duty"
                                    onClick={() => handleEventDutyRemoveFromList(duty.id)}
                                  >
                                    ×
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}

          {view === "calendar" ? (
            <div className="calendar">
              <div className="calendar-section current-week">
                <div className="calendar-section-header">
                  <div className="calendar-section-title">This Week Events</div>
                  {isAdmin ? (
                    <div className="admin-quick-actions">
                      <button className="ghost" type="button" onClick={handleUnlockWeek}>
                        Unlock this week
                      </button>
                      <button className="ghost" type="button" onClick={handleAssignWeek}>
                        Assign this week
                      </button>
                    </div>
                  ) : null}
                </div>
                {weekEvents.length === 0 ? (
                  <div className="empty">No events scheduled this week.</div>
                ) : (
                  <div className="week-events">
                    {weekEvents.map((event) => (
                      <div
                        className={`week-event ${isSpecialEvent(event) ? "special" : ""}`}
                        key={event.id}
                      >
                        <div>
                          <p className="event-title">{event.name}</p>
                          <p className="event-time">
                            {formatDay(event.date)} · {formatTime(event.start_time)} –{" "}
                            {formatTime(event.end_time)}
                          </p>
                        </div>
                        {isSpecialEvent(event) ? null : (
                          <button
                            className="ghost"
                            type="button"
                            onClick={(eventClick) => handleEventClick(event.id, eventClick)}
                          >
                            View duties
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="calendar-header">
                <button className="ghost" type="button" onClick={() => goToMonth("prev")}>
                  Prev
                </button>
                <div className="calendar-title">{monthLabel}</div>
                <button className="ghost" type="button" onClick={() => goToMonth("next")}>
                  Next
                </button>
              </div>
              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarGrid.map((cell) => {
                  const dateKey = cell.date.toISOString().slice(0, 10);
                  const dayEvents = eventsByDate.get(dateKey) ?? [];
                  const isToday = dateKey === todayKey;
                  const isCurrentWeek =
                    cell.date >= currentWeekRange.start && cell.date <= currentWeekRange.end;
                  return (
                    <div
                      key={`${dateKey}-${cell.inMonth ? "in" : "out"}`}
                      className={`calendar-cell ${cell.inMonth ? "in" : "out"} ${
                        isToday ? "today" : ""
                      } ${isCurrentWeek ? "current-week" : ""}`}
                      onDoubleClick={() => handleCalendarDayDoubleClick(dateKey)}
                    >
                      <div className="calendar-day-number">{cell.date.getDate()}</div>
                      {dayEvents.length > 0 ? (
                        <div className="calendar-events">
                          {isSpecialEvent(dayEvents[0]) ? (
                            <div className="calendar-event special">
                              {dayEvents[0].name}
                            </div>
                          ) : (
                            <button
                              key={dayEvents[0].id}
                              type="button"
                              className="calendar-event"
                              onClick={(eventClick) =>
                                handleEventClick(dayEvents[0].id, eventClick)
                              }
                            >
                              {dayEvents[0].name}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="calendar-section">
                <div className="calendar-section-title">My Duties This Week</div>
                {weekAssignments.length === 0 ? (
                  <div className="empty">No duties this week.</div>
                ) : (
                  <div className="weekend-assignments">
                    {weekAssignments.map((item) => {
                      const isAssigned = item.assignment.status_name === "assigned";
                      return (
                        <div
                          className={`assignment-card ${isAssigned ? "assigned" : "signed"}`}
                          key={`${item.event.id}-${item.duty.id}-${item.assignment.id}`}
                        >
                          <div>
                            <p className="event-title">{item.duty.description}</p>
                            <p className="event-time">
                              {item.event.name} · {item.event.date} ·{" "}
                              {formatTime(item.duty.time)}
                            </p>
                          </div>
                          <span className="assignment-count">
                            {isAssigned ? "Assigned" : "Signed up"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {view === "brothers" ? (
            <div className="brothers">
              {isAdmin ? (
                <div className="adjustment">
                  <div className="adjustment-grid">
                    <div className="select-pill">
                      <label htmlFor="adjust-brother">Brother</label>
                      <select
                        id="adjust-brother"
                        value={adjustmentBrotherId}
                        onChange={(event) =>
                          setAdjustmentBrotherId(
                            event.target.value ? Number(event.target.value) : "",
                          )
                        }
                      >
                        <option value="">Select</option>
                        {brothers.map((brother) => (
                          <option key={brother.id} value={brother.id}>
                            {brother.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="select-pill">
                      <label htmlFor="adjust-event">Event</label>
                      <select
                        id="adjust-event"
                        value={adjustmentEventId}
                        onChange={(event) =>
                          setAdjustmentEventId(
                            event.target.value ? Number(event.target.value) : "",
                          )
                        }
                      >
                        <option value="">Select</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name} · {event.date}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="select-pill">
                      <label htmlFor="adjust-amount">Amount</label>
                      <input
                        id="adjust-amount"
                        className="text-input"
                        type="number"
                        value={adjustmentAmount}
                        onChange={(event) => setAdjustmentAmount(event.target.value)}
                        placeholder="e.g. 10 or -5"
                      />
                    </div>
                    <div className="select-pill">
                      <label htmlFor="adjust-reason">Reason</label>
                      <input
                        id="adjust-reason"
                        className="text-input"
                        type="text"
                        value={adjustmentReason}
                        onChange={(event) => setAdjustmentReason(event.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <button className="primary action" type="button" onClick={handleAdjustmentSubmit}>
                      Add points
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="table">
                <div className="table-row table-header">
                  <button
                    className={`table-sort ${orderBy === "name" ? "active" : ""}`}
                    type="button"
                    onClick={() => handleSort("name")}
                  >
                    Name {orderBy === "name" ? (orderDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                  <button
                    className={`table-sort ${orderBy === "points" ? "active" : ""}`}
                    type="button"
                    onClick={() => handleSort("points")}
                  >
                    Points {orderBy === "points" ? (orderDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                  <div className="status-header">
                    <div className="filter-popover" ref={statusFilterRef}>
                      <button
                        className="status-chip no-bubble"
                        type="button"
                        onClick={() => setStatusFilterOpen((prev) => !prev)}
                      >
                        <span>Status</span>
                        <span className="status-selected">
                          {roleFilters
                            .map((key) => roleOptions.find((role) => role.key === key)?.label)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </button>
                      {statusFilterOpen ? (
                        <div className="popover">
                          {roleOptions.map((role) => (
                            <label key={role.key} className="popover-item">
                              <input
                                type="checkbox"
                                checked={roleFilters.includes(role.key)}
                                onChange={() => toggleRole(role.key)}
                              />
                              <span>{role.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                {brothersLoading ? (
                  <div className="empty">Loading brothers…</div>
                ) : brothers.length === 0 ? (
                  <div className="empty">No brothers found.</div>
                ) : (
                  brothers.map((brother) => (
                    <div className="table-row" key={brother.id}>
                      <span>{brother.name}</span>
                      <span>{Math.round(brother.points * 100) / 100}</span>
                      <span>
                        {brother.role_id === 4
                          ? "Active"
                          : roleOptions.find((role) => {
                              if (role.key === "active") return brother.role_id === 1;
                              if (role.key === "inactive") return brother.role_id === 2;
                              if (role.key === "senior") return brother.role_id === 3;
                              return false;
                            })?.label ?? `Role ${brother.role_id}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {view === "admin" ? (
            <div className="admin">
              <div className="admin-controls">
                <div className="select-pill">
                  <label htmlFor="admin-entity">Manage</label>
                  <select
                    id="admin-entity"
                    value={adminEntity}
                    onChange={(event) =>
                      setAdminEntity(
                        event.target.value as
                          | "event_definitions"
                          | "events"
                          | "duty_definitions",
                      )
                    }
                  >
                    <option value="event_definitions">Event definitions</option>
                    <option value="duty_definitions">Duty definitions</option>
                  </select>
                </div>
                <div className="select-pill">
                  <label htmlFor="admin-item">
                    {adminEntity === "events" ? "Event" : "Item"}
                  </label>
                  <select
                    id="admin-item"
                    value={adminItemId === "new" ? "new" : String(adminItemId)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAdminItemId(value === "new" ? "new" : Number(value));
                    }}
                  >
                    <option value="new">Create new</option>
                    {adminItemOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {adminEntity === "events" ? (
                  <div className="select-pill">
                    <label htmlFor="admin-event-type">Event type</label>
                    <select
                      id="admin-event-type"
                      value={eventFormDefinitionId}
                      onChange={(event) => handleEventFormDefinitionChange(event.target.value)}
                    >
                      <option value="">Select</option>
                      {eventDefinitions.map((definition) => (
                        <option key={definition.id} value={definition.id}>
                          {definition.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {adminEntity === "event_definitions" ? (
                <div className="admin-card">
                  <div className="admin-header">
                    <div>
                      <p className="admin-overline">Event Definitions</p>
                      <h2>
                        {adminItemId === "new" ? "Create event definition" : "Edit event definition"}
                      </h2>
                    </div>
                    <span className="pill">{adminItemId === "new" ? "New" : "Editing"}</span>
                  </div>
                  <form className="admin-form" onSubmit={handleAdminSave}>
                    <div className="admin-grid">
                      <div className="select-pill">
                        <label htmlFor="event-def-name">Definition name</label>
                        <input
                          id="event-def-name"
                          className="text-input"
                          type="text"
                          value={eventDefinitionName}
                          onChange={(event) => setEventDefinitionName(event.target.value)}
                          placeholder="e.g. Philigher"
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="event-def-points">Admin points</label>
                        <input
                          id="event-def-points"
                          className="text-input"
                          type="number"
                          value={eventDefinitionAdminPoints}
                          onChange={(event) => setEventDefinitionAdminPoints(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="event-def-start-time">Default start time</label>
                        <input
                          id="event-def-start-time"
                          className="text-input"
                          type="time"
                          value={eventDefinitionDefaultStartTime}
                          onChange={(event) => setEventDefinitionDefaultStartTime(event.target.value)}
                        />
                      </div>
                      {adminItemId === "new" ? (
                        <div className="select-pill">
                          <label htmlFor="event-def-template">Select from template</label>
                          <select
                            id="event-def-template"
                            value={eventDefinitionTemplateId}
                            onChange={(event) =>
                              handleEventDefinitionTemplateChange(event.target.value)
                            }
                          >
                            <option value="">None</option>
                            {eventDefinitions.map((definition) => (
                              <option key={definition.id} value={definition.id}>
                                {definition.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </div>

                    {adminItemId === "new" ? (
                      <div className="admin-subsection">
                        <div className="admin-subtitle">Default duties (optional)</div>
                        <div className="admin-stack">
                          {eventDefinitionDutyDrafts.map((duty, index) => (
                            <div className="admin-row" key={`event-def-duty-${index}`}>
                              <div className="select-pill">
                                <label>Duty definition</label>
                                <select
                                  value={duty.duty_definition_id || ""}
                                  onChange={(event) =>
                                    updateEventDefinitionDutyDraft(
                                      index,
                                      "duty_definition_id",
                                      event.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {sortedDutyDefinitions.map((definition) => (
                                    <option key={definition.id} value={definition.id}>
                                      {definition.description} ·{" "}
                                      {dutyTypeNameById.get(definition.duty_type_id) ??
                                        `Type ${definition.duty_type_id}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="select-pill">
                                <label>Default points</label>
                                <input
                                  className="text-input"
                                  type="number"
                                  value={duty.default_points}
                                  onChange={(event) =>
                                    updateEventDefinitionDutyDraft(
                                      index,
                                      "default_points",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="e.g. 5"
                                />
                              </div>
                            <div className="select-pill">
                              <label>Required brothers</label>
                              <input
                                className="text-input"
                                type="number"
                                value={duty.default_required_brothers}
                                  onChange={(event) =>
                                    updateEventDefinitionDutyDraft(
                                      index,
                                      "default_required_brothers",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="e.g. 2"
                                />
                              </div>
                              <div className="select-pill">
                                <label>Time</label>
                                <input
                                  className="text-input"
                                  type="time"
                                  value={duty.default_time}
                                  onChange={(event) =>
                                    updateEventDefinitionDutyDraft(
                                      index,
                                      "default_time",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>
                              <button
                                className="ghost small"
                                type="button"
                                onClick={() => removeEventDefinitionDutyDraft(index)}
                                disabled={eventDefinitionDutyDrafts.length === 1}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button className="ghost" type="button" onClick={addEventDefinitionDutyDraft}>
                          Add default duty
                        </button>
                      </div>
                    ) : (
                      <div className="admin-subsection">
                        <div className="admin-subtitle">Add default duty</div>
                        <div className="admin-duty-row admin-duty-add">
                          <div className="select-pill">
                            <label>Duty definition</label>
                            <select
                              value={eventDefinitionDutyAdd.duty_definition_id || ""}
                              onChange={(event) =>
                                handleEventDefinitionDutyAddDefinitionChange(event.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {sortedDutyDefinitions.map((definition) => (
                                <option key={definition.id} value={definition.id}>
                                  {definition.description} ·{" "}
                                  {dutyTypeNameById.get(definition.duty_type_id) ??
                                    `Type ${definition.duty_type_id}`}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="select-pill">
                            <label>Points</label>
                            <input
                              className="text-input"
                              type="number"
                              value={eventDefinitionDutyAdd.default_points}
                              onChange={(event) =>
                                setEventDefinitionDutyAdd((prev) => ({
                                  ...prev,
                                  default_points: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="select-pill">
                            <label>Slots</label>
                            <input
                              className="text-input"
                              type="number"
                              value={eventDefinitionDutyAdd.default_required_brothers}
                              onChange={(event) =>
                                setEventDefinitionDutyAdd((prev) => ({
                                  ...prev,
                                  default_required_brothers: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="select-pill">
                            <label>Time</label>
                            <input
                              className="text-input"
                              type="time"
                              value={eventDefinitionDutyAdd.default_time}
                              onChange={(event) =>
                                setEventDefinitionDutyAdd((prev) => ({
                                  ...prev,
                                  default_time: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <button
                            className="ghost small"
                            type="button"
                            onClick={handleEventDefinitionDutyAdd}
                          >
                            Add
                          </button>
                        </div>
                        <div className="admin-group-stack">
                          {eventDefinitionDutyGroups.map((group) => (
                            <div className="admin-duty-group" key={group.label}>
                              <div className="admin-group-header">
                                <span>{group.label}</span>
                                <span>{group.duties.length} duties</span>
                              </div>
                              {group.duties.length === 0 ? (
                                <div className="empty">
                                  No {group.label.toLowerCase()} duties.
                                </div>
                              ) : (
                                <div className="admin-stack">
                                  {group.duties.map((duty) => {
                                    const definition = dutyDefinitionById.get(
                                      duty.duty_definition_id,
                                    );
                                    const edit = eventDefinitionDutyEdits[duty.id];
                                    return (
                                      <div className="admin-duty-row" key={duty.id}>
                                        <div className="admin-duty-info">
                                          <p className="admin-duty-name">
                                            {definition?.description ??
                                              `Duty ${duty.duty_definition_id}`}
                                          </p>
                                          <p className="admin-duty-meta">
                                            {definition
                                              ? dutyTypeNameById.get(definition.duty_type_id) ??
                                                `Type ${definition.duty_type_id}`
                                              : "Type"}
                                          </p>
                                        </div>
                                        <div className="select-pill">
                                          <label>Points</label>
                                          <input
                                            className="text-input"
                                            type="number"
                                            value={
                                              edit?.default_points ??
                                              String(duty.default_points)
                                            }
                                            onChange={(event) =>
                                              setEventDefinitionDutyEdits((prev) => ({
                                                ...prev,
                                                [duty.id]: {
                                                  default_points: event.target.value,
                                                  default_required_brothers:
                                                    prev[duty.id]?.default_required_brothers ??
                                                    String(duty.default_required_brothers),
                                                  default_time:
                                                    prev[duty.id]?.default_time ??
                                                    (duty.default_time ?? ""),
                                                },
                                              }))
                                            }
                                          />
                                        </div>
                                        <div className="select-pill">
                                          <label>Slots</label>
                                          <input
                                            className="text-input"
                                            type="number"
                                            value={
                                              edit?.default_required_brothers ??
                                              String(duty.default_required_brothers)
                                            }
                                            onChange={(event) =>
                                              setEventDefinitionDutyEdits((prev) => ({
                                                ...prev,
                                                [duty.id]: {
                                                  default_points:
                                                    prev[duty.id]?.default_points ??
                                                    String(duty.default_points),
                                                  default_required_brothers: event.target.value,
                                                  default_time:
                                                    prev[duty.id]?.default_time ??
                                                    (duty.default_time ?? ""),
                                                },
                                              }))
                                            }
                                          />
                                        </div>
                                        <div className="select-pill">
                                          <label>Time</label>
                                          <input
                                            className="text-input"
                                            type="time"
                                            value={edit?.default_time ?? duty.default_time ?? ""}
                                            onChange={(event) =>
                                              setEventDefinitionDutyEdits((prev) => ({
                                                ...prev,
                                                [duty.id]: {
                                                  default_points:
                                                    prev[duty.id]?.default_points ??
                                                    String(duty.default_points),
                                                  default_required_brothers:
                                                    prev[duty.id]?.default_required_brothers ??
                                                    String(duty.default_required_brothers),
                                                  default_time: event.target.value,
                                                },
                                              }))
                                            }
                                          />
                                        </div>
                                        <div className="admin-duty-actions">
                                          <button
                                            className="ghost small"
                                            type="button"
                                            onClick={() => handleEventDefinitionDutyUpdate(duty.id)}
                                          >
                                            Update
                                          </button>
                                          <button
                                            className="ghost small danger"
                                            type="button"
                                            onClick={() => handleEventDefinitionDutyRemove(duty.id)}
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="admin-actions">
                      {adminItemId !== "new" ? (
                        <button
                          className="ghost danger"
                          type="button"
                          onClick={handleEventDefinitionRemove}
                        >
                          Delete event definition
                        </button>
                      ) : null}
                      <button className="primary" type="submit">
                        {adminItemId === "new" ? "Create event definition" : "Update event definition"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {adminEntity === "events" ? (
                <div className="admin-card">
                  <div className="admin-header">
                    <div>
                      <p className="admin-overline">Events</p>
                      <h2>{adminItemId === "new" ? "Create event" : "Edit event"}</h2>
                    </div>
                    <span className="pill">{adminItemId === "new" ? "New" : "Editing"}</span>
                  </div>
                  <form className="admin-form" onSubmit={handleAdminSave}>
                    <div className="admin-grid">
                      <div className="select-pill">
                        <label htmlFor="event-name">Event name</label>
                        <input
                          id="event-name"
                          className="text-input"
                          type="text"
                          value={eventFormName}
                          onChange={(event) => setEventFormName(event.target.value)}
                          placeholder="e.g. Philigher"
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="event-date">Date</label>
                        <input
                          id="event-date"
                          className="text-input"
                          type="date"
                          value={eventFormDate}
                          onChange={(event) => setEventFormDate(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="event-start">Start time</label>
                        <input
                          id="event-start"
                          className="text-input"
                          type="time"
                          value={eventFormStartTime}
                          onChange={(event) => setEventFormStartTime(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="event-end">End time</label>
                        <input
                          id="event-end"
                          className="text-input"
                          type="time"
                          value={eventFormEndTime}
                          onChange={(event) => setEventFormEndTime(event.target.value)}
                        />
                      </div>
                    </div>

                    {adminItemId === "new" ? (
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={eventIncludeDefaults}
                          onChange={(event) => setEventIncludeDefaults(event.target.checked)}
                        />
                        <span>Seed default duties from the event definition</span>
                      </label>
                    ) : null}

                    {adminItemId !== "new" ? (
                      <div className="admin-subsection">
                        <div className="admin-subtitle">Add duty to event</div>
                        <div className="admin-duty-row event-duty-add">
                          <div className="select-pill">
                            <label>Duty definition</label>
                            <select
                              value={eventDutyDraftDefinitionId || ""}
                              onChange={(event) =>
                                handleEventDutyDraftDefinitionChange(event.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {sortedDutyDefinitions.map((definition) => (
                                <option key={definition.id} value={definition.id}>
                                  {definition.description} ·{" "}
                                  {dutyTypeNameById.get(definition.duty_type_id) ??
                                    `Type ${definition.duty_type_id}`}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="select-pill">
                            <label>Points</label>
                            <input
                              className="text-input"
                              type="number"
                              value={eventDutyDraftPoints}
                              onChange={(event) => setEventDutyDraftPoints(event.target.value)}
                            />
                          </div>
                          <div className="select-pill">
                            <label>Slots</label>
                            <input
                              className="text-input"
                              type="number"
                              value={eventDutyDraftRequired}
                              onChange={(event) => setEventDutyDraftRequired(event.target.value)}
                            />
                          </div>
                          <div className="select-pill">
                            <label>Time</label>
                            <input
                              className="text-input"
                              type="time"
                              value={eventDutyDraftTime}
                              onChange={(event) => setEventDutyDraftTime(event.target.value)}
                            />
                          </div>
                          <button
                            className="ghost small"
                            type="button"
                            onClick={handleEventDutyAdd}
                          >
                            Add
                          </button>
                        </div>
                        <div className="admin-divider" />
                        <div className="admin-group-stack">
                          {eventDutyGroups.map((group) => (
                            <div className="admin-duty-group" key={group.label}>
                              <div className="admin-group-header">
                                <span>{group.label}</span>
                                <span>{group.duties.length} duties</span>
                              </div>
                              {group.duties.length === 0 ? (
                                <div className="empty">
                                  No {group.label.toLowerCase()} duties.
                                </div>
                              ) : (
                                <div className="admin-stack">
                                  {group.duties.map((duty) => (
                                    <div className="admin-duty-row event-duty" key={duty.id}>
                                      <div className="admin-duty-info">
                                        <p className="admin-duty-name">{duty.description}</p>
                                        <p className="admin-duty-meta">
                                          {duty.duty_type} · {formatTime(duty.time)} · {duty.points}{" "}
                                          pts
                                        </p>
                                      </div>
                                      <div className="select-pill">
                                        <label>Slots</label>
                                        <input
                                          className="text-input"
                                          type="number"
                                          value={
                                            eventDutyEdits[duty.id] ??
                                            String(duty.required_brothers)
                                          }
                                          onChange={(event) =>
                                            setEventDutyEdits((prev) => ({
                                              ...prev,
                                              [duty.id]: event.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="admin-duty-actions">
                                        <button
                                          className="ghost small"
                                          type="button"
                                          onClick={() => handleEventDutyUpdate(duty)}
                                        >
                                          Update
                                        </button>
                                        <button
                                          className="ghost small danger"
                                          type="button"
                                          onClick={() => handleEventDutyRemove(duty.id)}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="admin-actions">
                      <button className="primary" type="submit">
                        {adminItemId === "new" ? "Create event" : "Update event"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {adminEntity === "duty_definitions" ? (
                <div className="admin-card">
                  <div className="admin-header">
                    <div>
                      <p className="admin-overline">Duty Definitions</p>
                      <h2>
                        {adminItemId === "new" ? "Create duty definition" : "Edit duty definition"}
                      </h2>
                    </div>
                    <span className="pill">{adminItemId === "new" ? "New" : "Editing"}</span>
                  </div>
                  <form className="admin-form" onSubmit={handleAdminSave}>
                    <div className="admin-grid">
                      <div className="select-pill">
                        <label htmlFor="duty-def-type">Duty type</label>
                        <select
                          id="duty-def-type"
                          value={dutyDefinitionTypeId}
                          onChange={(event) =>
                            setDutyDefinitionTypeId(
                              event.target.value ? Number(event.target.value) : "",
                            )
                          }
                        >
                          <option value="">Select</option>
                          {dutyTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="select-pill">
                        <label htmlFor="duty-def-desc">Description</label>
                        <input
                          id="duty-def-desc"
                          className="text-input"
                          type="text"
                          value={dutyDefinitionDescription}
                          onChange={(event) => setDutyDefinitionDescription(event.target.value)}
                          placeholder="e.g. Setup tables"
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="duty-def-points">Default points</label>
                        <input
                          id="duty-def-points"
                          className="text-input"
                          type="number"
                          value={dutyDefinitionPoints}
                          onChange={(event) => setDutyDefinitionPoints(event.target.value)}
                        />
                      </div>
                      <div className="select-pill">
                        <label htmlFor="duty-def-required">Required brothers</label>
                        <input
                          id="duty-def-required"
                          className="text-input"
                          type="number"
                          value={dutyDefinitionRequired}
                          onChange={(event) => setDutyDefinitionRequired(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-actions">
                      {adminItemId !== "new" ? (
                        <button
                          className="ghost danger"
                          type="button"
                          onClick={handleDutyDefinitionRemove}
                        >
                          Delete duty definition
                        </button>
                      ) : null}
                      <button className="primary" type="submit">
                        {adminItemId === "new" ? "Create duty definition" : "Update duty definition"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
