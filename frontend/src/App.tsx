import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Brother = {
  id: number;
  name: string;
  role_id: number;
};

type EventItem = {
  id: number;
  name: string;
  event_type_id: number;
  date: string;
  start_time: string;
  end_time: string;
};

type Duty = {
  id: number;
  duty_definition_id: number;
  duty_type: string;
  description: string;
  points: number;
  required_brothers: number;
  assigned_count: number;
  due_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

type Assignment = {
  id: number;
  event_duty_id: number;
  brother_id: number;
  status_id: number;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8787";
const API_URL = `${API_BASE.replace(/\/$/, "")}/api`;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function App() {
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedBrotherId, setSelectedBrotherId] = useState<number | "">("");
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [loadingDuties, setLoadingDuties] = useState(false);
  const [submittingDutyId, setSubmittingDutyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchJson<{ success: boolean; brothers: Brother[] }>(`${API_URL}/brothers`),
      fetchJson<{ success: boolean; events: EventItem[] }>(`${API_URL}/events`),
    ])
      .then(([brotherData, eventData]) => {
        if (!active) return;
        setBrothers(brotherData.brothers ?? []);
        setEvents(eventData.events ?? []);
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
  }, []);

  useEffect(() => {
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
        `${API_URL}/event-duties?event_id=${selectedEventId}`,
      ),
      fetchJson<{ success: boolean; assignments: Assignment[] }>(
        `${API_URL}/event-duty-assignments?event_id=${selectedEventId}`,
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
  }, [selectedEventId]);

  const selectedBrother = brothers.find((brother) => brother.id === selectedBrotherId);
  const selectedEvent = events.find((event) => event.id === selectedEventId);

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
    return [
      { label: "Purchase", key: "Purchase" },
      { label: "Setup", key: "Setup" },
      { label: "During", key: "During" },
      { label: "Cleanup", key: "Cleanup" },
      { label: "Other", key: "Other" },
    ].map((group) => ({ ...group, duties: groups.get(group.key) ?? [] }));
  }, [duties]);

  const formatDutyTime = (duty: Duty) => {
    if (duty.start_time && duty.end_time) {
      return `${duty.start_time}–${duty.end_time}`;
    }
    if (duty.due_time) {
      return `Due ${duty.due_time}`;
    }
    return "Time TBD";
  };

  const handleSignUp = async (eventDutyId: number) => {
    if (!selectedBrotherId) {
      setNotice("Select your name before signing up.");
      return;
    }

    setSubmittingDutyId(eventDutyId);
    setNotice(null);

    try {
      await fetchJson(`${API_URL}/event-duty-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_duty_id: eventDutyId,
          brother_id: selectedBrotherId,
        }),
      });

      const [dutyData, assignmentData] = await Promise.all([
        fetchJson<{ success: boolean; duties: Duty[] }>(
          `${API_URL}/event-duties?event_id=${selectedEventId}`,
        ),
        fetchJson<{ success: boolean; assignments: Assignment[] }>(
          `${API_URL}/event-duty-assignments?event_id=${selectedEventId}`,
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
              {selectedBrother ? selectedBrother.name : "Select a brother"}
            </div>
            <span className="badge">DUTY ROSTER</span>
          </div>
        </header>

        <nav className="tabs">
          <button className="tab active" type="button">Duties</button>
          <button className="tab" type="button" disabled>Assignments</button>
          <button className="tab" type="button" disabled>Account</button>
        </nav>

        <section className="panel">
          <div className="filters">
            <div className="filter-group">
              <span className="filter-label">Filters</span>
              <div className="select-pill">
                <label htmlFor="brother">Brother</label>
                <select
                  id="brother"
                  value={selectedBrotherId}
                  onChange={(event) =>
                    setSelectedBrotherId(event.target.value ? Number(event.target.value) : "")
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
                      {event.name} · {event.date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="action-group">
              {selectedEvent ? (
                <p className="event-meta">
                  {selectedEvent.name} · {selectedEvent.date} · {selectedEvent.start_time}
                </p>
              ) : (
                <p className="event-meta">Pick an event to see duties.</p>
              )}
              <button className="primary" type="button" disabled>
                Share Duty List
              </button>
            </div>
          </div>

          {notice ? <div className="notice">{notice}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          <div className="duties">
            {loading || loadingDuties ? (
              <div className="empty">Loading duties…</div>
            ) : duties.length === 0 ? (
              <div className="empty">No duties available.</div>
            ) : (
              dutyGroups.map((group) => (
                <div key={group.key} className="duty-group">
                  <div className="group-header">
                    <h2>{group.label}</h2>
                    <span>{group.duties.length} duties</span>
                  </div>
                  {group.duties.length === 0 ? (
                    <div className="empty">No {group.label.toLowerCase()} duties.</div>
                  ) : (
                    group.duties.map((duty) => {
                      const assigned = assignmentMap.get(duty.id) ?? [];
                      const isFull = assigned.length >= duty.required_brothers;
                      const isAssigned = assigned.some(
                        (assignment) => assignment.brother_id === selectedBrotherId,
                      );
                      const disabled = !selectedBrotherId || isFull || isAssigned;

                      return (
                        <div className="duty-row" key={duty.id}>
                          <div>
                            <p className="duty-name">{duty.description}</p>
                            <p className="duty-meta">
                              {formatDutyTime(duty)} · {duty.points} pts · {assigned.length}/
                              {duty.required_brothers} filled
                            </p>
                          </div>
                          <div className="duty-actions">
                            <span className={`pill ${isFull ? "full" : "open"}`}>
                              {isFull ? "Full" : "Open"}
                            </span>
                            <button
                              className="ghost"
                              type="button"
                              onClick={() => handleSignUp(duty.id)}
                              disabled={disabled || submittingDutyId === duty.id}
                            >
                              {isAssigned ? "Signed" : isFull ? "Full" : "Sign up"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
