import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiFetch } from './api/client'
import { paths } from './api/paths'

type Session = {
  brother: {
    id: number
    name: string
    role: string
  }
  isAdmin: boolean
}

type EventSummary = {
  id: number
  name: string
  date: string
  start_time: string
  end_time: string
  duties_unlocked: number
  definition_name: string
  admin_points: number
}

type DutyAssignment = {
  id: number
  status: string
  brotherId: number
  brotherName: string
}

type EventDuty = {
  id: number
  points: number
  requiredBrothers: number
  time: string
  description: string
  dutyType: string
  assignments: DutyAssignment[]
}

type Brother = {
  id: number
  name: string
  phoneNumber: string
  role: string
  points: number
}

type BrotherAssignment = {
  assignment_id: number
  duty_id: number
  event_name: string
  event_date: string
  duty_time: string
  duty_description: string
  duty_type: string
  status: string
}

type EventDefinition = {
  id: number
  name: string
  admin_points: number
}

type DutyDefinition = {
  id: number
  description: string
  default_points: number
  default_required_brothers: number
  duty_type: string
}

const roleOptions = ['active', 'inactive', 'senior', 'admin']

const buildDateTime = (date: string, time: string) => {
  const [hours, minutes] = time.split(':')
  return new Date(`${date}T${hours}:${minutes}:00`)
}

const getDutyStatus = (eventDate: string, duty: EventDuty) => {
  const statusNames = duty.assignments.map((assignment) => assignment.status)
  if (statusNames.includes('completed')) {
    return 'completed'
  }
  if (statusNames.includes('rejected')) {
    return 'rejected'
  }
  if (duty.dutyType === 'During') {
    return 'assigned'
  }
  const dueTime = buildDateTime(eventDate, duty.time)
  const now = new Date()
  const lateThreshold = new Date(dueTime.getTime() + 5 * 60 * 1000)
  const rejectThreshold = new Date(dueTime.getTime() + 60 * 60 * 1000)
  if (now >= rejectThreshold) {
    return 'rejected'
  }
  if (now >= lateThreshold) {
    return 'late'
  }
  return 'assigned'
}

function App() {
  const [page, setPage] = useState<'login' | 'home' | 'duties' | 'brothers' | 'admin'>('login')
  const [session, setSession] = useState<Session | null>(null)
  const [events, setEvents] = useState<EventSummary[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [duties, setDuties] = useState<EventDuty[]>([])
  const [brothers, setBrothers] = useState<Brother[]>([])
  const [brotherAssignments, setBrotherAssignments] = useState<BrotherAssignment[]>([])
  const [loginSlackId, setLoginSlackId] = useState('')
  const [loginError, setLoginError] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'points' | 'name'>('points')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [eventDefinitions, setEventDefinitions] = useState<EventDefinition[]>([])
  const [dutyDefinitions, setDutyDefinitions] = useState<DutyDefinition[]>([])
  const [newEventDefinition, setNewEventDefinition] = useState({
    name: '',
    adminPoints: 10,
  })
  const [newDutyDefinition, setNewDutyDefinition] = useState({
    dutyTypeId: 1,
    description: '',
    defaultPoints: 0,
    defaultRequiredBrothers: 1,
  })
  const [newEvent, setNewEvent] = useState({
    name: '',
    eventDefinitionId: 1,
    date: '',
    startTime: '',
    endTime: '',
    dutiesUnlocked: 0,
  })
  const [eventDutyDrafts, setEventDutyDrafts] = useState<
    Array<{ dutyDefinitionId: number; points: number; requiredBrothers: number; time: string }>
  >([])

  const isAdmin = session?.isAdmin ?? false

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  )

  useEffect(() => {
    let isActive = true
    const fetchSession = async () => {
      try {
        const data = await apiFetch<{
          authenticated: boolean
          brother?: Session['brother']
          isAdmin?: boolean
        }>(paths.me())
        if (isActive && data.authenticated && data.brother) {
          setSession({ brother: data.brother, isAdmin: Boolean(data.isAdmin) })
          setPage('home')
        }
      } catch (error) {
        console.error(error)
      }
    }
    void fetchSession()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!session) return
    apiFetch<{ events: EventSummary[] }>(paths.events.list())
      .then((data) => setEvents(data.events))
      .catch((error) => console.error(error))
  }, [session])

  useEffect(() => {
    if (!session || !selectedEventId) return
    apiFetch<{ duties: EventDuty[] }>(paths.events.duties(selectedEventId))
      .then((data) => setDuties(data.duties))
      .catch((error) => console.error(error))
  }, [session, selectedEventId])

  useEffect(() => {
    if (!session || page !== 'brothers') return
    const params = new URLSearchParams()
    params.set('orderBy', sortBy)
    params.set('order', sortOrder)
    if (filters.length > 0) {
      params.set('roles', filters.join(','))
    }
    apiFetch<{ brothers: Brother[] }>(`${paths.brothers.list()}?${params.toString()}`)
      .then((data) => setBrothers(data.brothers))
      .catch((error) => console.error(error))
  }, [filters, page, session, sortBy, sortOrder])

  useEffect(() => {
    if (!session) return
    apiFetch<{ assignments: BrotherAssignment[] }>(paths.brothers.assignments(session.brother.id))
      .then((data) => setBrotherAssignments(data.assignments))
      .catch((error) => console.error(error))
  }, [session])

  useEffect(() => {
    if (!session || page !== 'admin') return
    apiFetch<{ eventDefinitions: EventDefinition[] }>(paths.eventDefinitions.list())
      .then((data) => setEventDefinitions(data.eventDefinitions))
      .catch((error) => console.error(error))
    apiFetch<{ dutyDefinitions: DutyDefinition[] }>(paths.dutyDefinitions.list())
      .then((data) => setDutyDefinitions(data.dutyDefinitions))
      .catch((error) => console.error(error))
  }, [page, session])

  const handleLogin = async () => {
    setLoginError('')
    try {
      const data = await apiFetch<{ brother: Session['brother']; isAdmin: boolean }>(
        paths.auth.login(),
        {
          method: 'POST',
          body: JSON.stringify({ slackId: loginSlackId }),
        }
      )
      setSession({ brother: data.brother, isAdmin: data.isAdmin })
      setPage('home')
    } catch (error) {
      setLoginError((error as Error).message)
    }
  }

  const handleLogout = async () => {
    await apiFetch(paths.auth.logout(), { method: 'POST' })
    setSession(null)
    setPage('login')
  }

  const handleReset = async () => {
    setLoginError('')
    try {
      await apiFetch(paths.auth.reset(), {
        method: 'POST',
        body: JSON.stringify({ slackId: loginSlackId }),
      })
      setLoginError('Reset code sent. Check with an admin to complete the reset.')
    } catch (error) {
      setLoginError((error as Error).message)
    }
  }

  const handleSignup = async (dutyId: number) => {
    if (!session || !selectedEventId) return
    await apiFetch(paths.events.dutyAssignments(selectedEventId, dutyId), {
      method: 'POST',
      body: JSON.stringify({ brotherId: session.brother.id }),
    })
    const data = await apiFetch<{ duties: EventDuty[] }>(paths.events.duties(selectedEventId))
    setDuties(data.duties)
  }

  const handleAssignmentStatus = async (dutyId: number, assignmentId: number, status: string) => {
    if (!selectedEventId) return
    await apiFetch(`${paths.events.dutyAssignments(selectedEventId, dutyId)}/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    const data = await apiFetch<{ duties: EventDuty[] }>(paths.events.duties(selectedEventId))
    setDuties(data.duties)
  }

  const handlePointsUpdate = async (brotherId: number, delta: number) => {
    await apiFetch(paths.brothers.update(), {
      method: 'PUT',
      body: JSON.stringify({ id: brotherId, adminPointsDelta: delta }),
    })
    const params = new URLSearchParams()
    params.set('orderBy', sortBy)
    params.set('order', sortOrder)
    if (filters.length > 0) {
      params.set('roles', filters.join(','))
    }
    const data = await apiFetch<{ brothers: Brother[] }>(`${paths.brothers.list()}?${params.toString()}`)
    setBrothers(data.brothers)
  }

  const handleCreateEventDefinition = async () => {
    await apiFetch(paths.eventDefinitions.list(), {
      method: 'POST',
      body: JSON.stringify({
        name: newEventDefinition.name,
        adminPoints: newEventDefinition.adminPoints,
      }),
    })
    const data = await apiFetch<{ eventDefinitions: EventDefinition[] }>(paths.eventDefinitions.list())
    setEventDefinitions(data.eventDefinitions)
    setNewEventDefinition({ name: '', adminPoints: 10 })
  }

  const handleCreateDutyDefinition = async () => {
    await apiFetch(paths.dutyDefinitions.list(), {
      method: 'POST',
      body: JSON.stringify({
        dutyTypeId: newDutyDefinition.dutyTypeId,
        description: newDutyDefinition.description,
        defaultPoints: newDutyDefinition.defaultPoints,
        defaultRequiredBrothers: newDutyDefinition.defaultRequiredBrothers,
      }),
    })
    const data = await apiFetch<{ dutyDefinitions: DutyDefinition[] }>(paths.dutyDefinitions.list())
    setDutyDefinitions(data.dutyDefinitions)
    setNewDutyDefinition({
      dutyTypeId: 1,
      description: '',
      defaultPoints: 0,
      defaultRequiredBrothers: 1,
    })
  }

  const handleAddDutyDraft = () => {
    setEventDutyDrafts((prev) => [
      ...prev,
      { dutyDefinitionId: 1, points: 0, requiredBrothers: 1, time: '18:00' },
    ])
  }

  const handleEventCreation = async () => {
    await apiFetch(paths.events.list(), {
      method: 'POST',
      body: JSON.stringify({
        ...newEvent,
        eventDefinitionId: Number(newEvent.eventDefinitionId),
        dutiesUnlocked: Number(newEvent.dutiesUnlocked),
        duties: eventDutyDrafts,
      }),
    })
    const data = await apiFetch<{ events: EventSummary[] }>(paths.events.list())
    setEvents(data.events)
    setNewEvent({
      name: '',
      eventDefinitionId: 1,
      date: '',
      startTime: '',
      endTime: '',
      dutiesUnlocked: 0,
    })
    setEventDutyDrafts([])
  }

  const toggleFilter = (role: string) => {
    setFilters((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    )
  }

  if (!session) {
    return (
      <div className="app login-page">
        <div className="card">
          <h1>Phi Kap Duty Manager</h1>
          <p>Log in using your Slack ID.</p>
          <div className="form-row">
            <label htmlFor="slack">Slack ID</label>
            <input
              id="slack"
              type="text"
              value={loginSlackId}
              onChange={(event) => setLoginSlackId(event.target.value)}
              placeholder="seed_1"
            />
          </div>
          {loginError && <p className="error">{loginError}</p>}
          <div className="button-row">
            <button type="button" onClick={handleLogin}>
              Sign In
            </button>
            <button type="button" className="secondary" onClick={handleReset}>
              Forgot password
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Phi Kap Duty Manager</h1>
          <p>
            Welcome back, {session.brother.name}!{' '}
            {isAdmin && <span className="pill">Admin</span>}
          </p>
        </div>
        <button type="button" className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <nav>
        <button type="button" className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>
          Home
        </button>
        <button
          type="button"
          className={page === 'duties' ? 'active' : ''}
          onClick={() => setPage('duties')}
        >
          Duty sign-up
        </button>
        <button
          type="button"
          className={page === 'brothers' ? 'active' : ''}
          onClick={() => setPage('brothers')}
        >
          Brother list
        </button>
        {isAdmin && (
          <button type="button" className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>
            Admin tools
          </button>
        )}
      </nav>

      {page === 'home' && (
        <section className="grid">
          <div className="card">
            <h2>Upcoming events</h2>
            <ul className="list">
              {events.map((event) => (
                <li key={event.id}>
                  <button type="button" onClick={() => {
                    setSelectedEventId(event.id)
                    setPage('duties')
                  }}>
                    <strong>{event.name}</strong> · {event.date} · {event.start_time} - {event.end_time}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>Your duties</h2>
            <ul className="list">
              {brotherAssignments.map((assignment) => (
                <li key={assignment.assignment_id}>
                  <strong>{assignment.event_name}</strong> — {assignment.duty_description} ({assignment.duty_type})
                  <span className={`status ${assignment.status}`}>{assignment.status}</span>
                </li>
              ))}
              {brotherAssignments.length === 0 && <li>No duties assigned yet.</li>}
            </ul>
          </div>
        </section>
      )}

      {page === 'duties' && (
        <section className="card">
          <h2>Duty sign-up</h2>
          <div className="form-row">
            <label htmlFor="event">Event</label>
            <select
              id="event"
              value={selectedEventId ?? ''}
              onChange={(event) => setSelectedEventId(Number(event.target.value))}
            >
              <option value="" disabled>
                Select an event
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} · {event.date}
                </option>
              ))}
            </select>
          </div>
          {selectedEvent && (
            <div className="duties">
              {duties.map((duty) => {
                const status = getDutyStatus(selectedEvent.date, duty)
                const slotsFilled = duty.assignments.length
                const canSignup = slotsFilled < duty.requiredBrothers
                return (
                  <div key={duty.id} className="duty-card">
                    <div className="duty-header">
                      <div>
                        <h3>{duty.description}</h3>
                        <p>
                          {duty.dutyType} · {duty.time} · {duty.points} pts
                        </p>
                      </div>
                      <div className="slot-info">
                        <span>
                          {slotsFilled}/{duty.requiredBrothers} filled
                        </span>
                        <span className={`status ${status}`}>{status}</span>
                      </div>
                    </div>
                    <ul className="assignment-list">
                      {duty.assignments.map((assignment) => {
                        const isOwner = assignment.brotherId === session.brother.id
                        const canEdit = isOwner || isAdmin
                        const showComplete =
                          canEdit && (duty.dutyType !== 'During' || isAdmin)
                        return (
                          <li key={assignment.id}>
                            <span>
                              {assignment.brotherName}
                              <span className={`status ${assignment.status}`}>{assignment.status}</span>
                            </span>
                            {showComplete && (
                              <div className="button-row">
                                <button
                                  type="button"
                                  className="secondary"
                                  onClick={() => handleAssignmentStatus(duty.id, assignment.id, 'completed')}
                                >
                                  Mark complete
                                </button>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => handleAssignmentStatus(duty.id, assignment.id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            )}
                          </li>
                        )
                      })}
                      {duty.assignments.length === 0 && <li>No one assigned yet.</li>}
                    </ul>
                    {canSignup && (
                      <button type="button" onClick={() => handleSignup(duty.id)}>
                        Sign up
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {page === 'brothers' && (
        <section className="card">
          <h2>Brother list</h2>
          <div className="filters">
            <div className="filter-group">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'points' | 'name')}>
                <option value="points">Points</option>
                <option value="name">Name</option>
              </select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div className="filter-group">
              <span>Roles</span>
              {roleOptions.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={filters.includes(role)}
                    onChange={() => toggleFilter(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
          <div className="table">
            <div className="table-row header">
              <span>Name</span>
              <span>Points</span>
              <span>Role</span>
              <span>Phone</span>
              {isAdmin && <span>Admin adjust</span>}
            </div>
            {brothers.map((brother) => (
              <div key={brother.id} className="table-row">
                <span>{brother.name}</span>
                <span>{brother.points.toFixed(1)}</span>
                <span>{brother.role}</span>
                <span>{brother.phoneNumber}</span>
                {isAdmin && (
                  <div className="inline-form">
                    <button type="button" onClick={() => handlePointsUpdate(brother.id, 5)}>
                      +5
                    </button>
                    <button type="button" className="secondary" onClick={() => handlePointsUpdate(brother.id, -5)}>
                      -5
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {page === 'admin' && (
        <section className="grid">
          <div className="card">
            <h2>Create event definition</h2>
            <div className="form-row">
              <label htmlFor="event-def-name">Name</label>
              <input
                id="event-def-name"
                value={newEventDefinition.name}
                onChange={(event) =>
                  setNewEventDefinition((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label htmlFor="event-def-points">Admin points</label>
              <input
                id="event-def-points"
                type="number"
                value={newEventDefinition.adminPoints}
                onChange={(event) =>
                  setNewEventDefinition((prev) => ({
                    ...prev,
                    adminPoints: Number(event.target.value),
                  }))
                }
              />
            </div>
            <button type="button" onClick={handleCreateEventDefinition}>
              Add event definition
            </button>
          </div>
          <div className="card">
            <h2>Create duty definition</h2>
            <div className="form-row">
              <label htmlFor="duty-type">Duty type</label>
              <select
                id="duty-type"
                value={newDutyDefinition.dutyTypeId}
                onChange={(event) =>
                  setNewDutyDefinition((prev) => ({
                    ...prev,
                    dutyTypeId: Number(event.target.value),
                  }))
                }
              >
                <option value={1}>Setup</option>
                <option value={2}>Cleanup</option>
                <option value={3}>Purchase</option>
                <option value={4}>During</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="duty-desc">Description</label>
              <input
                id="duty-desc"
                value={newDutyDefinition.description}
                onChange={(event) =>
                  setNewDutyDefinition((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label htmlFor="duty-points">Default points</label>
              <input
                id="duty-points"
                type="number"
                value={newDutyDefinition.defaultPoints}
                onChange={(event) =>
                  setNewDutyDefinition((prev) => ({
                    ...prev,
                    defaultPoints: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="form-row">
              <label htmlFor="duty-required">Default slots</label>
              <input
                id="duty-required"
                type="number"
                value={newDutyDefinition.defaultRequiredBrothers}
                onChange={(event) =>
                  setNewDutyDefinition((prev) => ({
                    ...prev,
                    defaultRequiredBrothers: Number(event.target.value),
                  }))
                }
              />
            </div>
            <button type="button" onClick={handleCreateDutyDefinition}>
              Add duty definition
            </button>
          </div>
          <div className="card">
            <h2>Create event</h2>
            <div className="form-row">
              <label htmlFor="event-name">Event name</label>
              <input
                id="event-name"
                value={newEvent.name}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="form-row">
              <label htmlFor="event-definition">Event definition</label>
              <select
                id="event-definition"
                value={newEvent.eventDefinitionId}
                onChange={(event) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    eventDefinitionId: Number(event.target.value),
                  }))
                }
              >
                {eventDefinitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
            <div className="form-row">
              <label htmlFor="event-start">Start time</label>
              <input
                id="event-start"
                type="time"
                value={newEvent.startTime}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, startTime: event.target.value }))}
              />
            </div>
            <div className="form-row">
              <label htmlFor="event-end">End time</label>
              <input
                id="event-end"
                type="time"
                value={newEvent.endTime}
                onChange={(event) => setNewEvent((prev) => ({ ...prev, endTime: event.target.value }))}
              />
            </div>
            <div className="form-row">
              <label htmlFor="event-unlocked">Duties unlocked</label>
              <input
                id="event-unlocked"
                type="number"
                value={newEvent.dutiesUnlocked}
                onChange={(event) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    dutiesUnlocked: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="form-row">
              <label>Extra duties</label>
              <button type="button" className="secondary" onClick={handleAddDutyDraft}>
                Add duty line
              </button>
            </div>
            {eventDutyDrafts.map((duty, index) => (
              <div key={`draft-${index}`} className="inline-form">
                <select
                  value={duty.dutyDefinitionId}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setEventDutyDrafts((prev) =>
                      prev.map((item, idx) =>
                        idx === index ? { ...item, dutyDefinitionId: value } : item
                      )
                    )
                  }}
                >
                  {dutyDefinitions.map((definition) => (
                    <option key={definition.id} value={definition.id}>
                      {definition.description}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={duty.points}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setEventDutyDrafts((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, points: value } : item))
                    )
                  }}
                  placeholder="Points"
                />
                <input
                  type="number"
                  value={duty.requiredBrothers}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setEventDutyDrafts((prev) =>
                      prev.map((item, idx) =>
                        idx === index ? { ...item, requiredBrothers: value } : item
                      )
                    )
                  }}
                  placeholder="Slots"
                />
                <input
                  type="time"
                  value={duty.time}
                  onChange={(event) => {
                    const value = event.target.value
                    setEventDutyDrafts((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, time: value } : item))
                    )
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={handleEventCreation}>
              Add event
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
