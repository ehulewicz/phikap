-- brothers
CREATE TABLE brother (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT,

    previous_semester_points INTEGER NOT NULL DEFAULT 0,
    additional_points INTEGER NOT NULL DEFAULT 0,
    duty_points INTEGER NOT NULL DEFAULT 0,

    role_id INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- roles
CREATE TABLE role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- duty types
CREATE TABLE duty_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- list of possible duties
CREATE TABLE duty_definition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duty_type_id INTEGER NOT NULL,
    description TEXT NOT NULL,

    UNIQUE (duty_type_id, description),
    FOREIGN KEY (duty_type_id) REFERENCES duty_type(id)
);

-- event types
CREATE TABLE event_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    chair_points INTEGER NOT NULL DEFAULT 10
);

-- default event duties
CREATE TABLE event_type_duty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    duty_definition_id INTEGER NOT NULL,

    default_points INTEGER NOT NULL,
    default_required_brothers INTEGER NOT NULL,

    UNIQUE (event_type_id, duty_definition_id),
    FOREIGN KEY (event_type_id) REFERENCES event_type(id),
    FOREIGN KEY (duty_definition_id) REFERENCES duty_definition(id)
);

-- events on calendar
CREATE TABLE event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_type_id INTEGER NOT NULL,

    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,

    UNIQUE (event_type_id, date, start_time),
    FOREIGN KEY (event_type_id) REFERENCES event_type(id)
);

-- all duties for a specific event (default and not)
CREATE TABLE event_duty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    duty_definition_id INTEGER NOT NULL,

    points INTEGER NOT NULL,
    required_brothers INTEGER NOT NULL,
    due_time TEXT,
    start_time TEXT,
    end_time TEXT,

    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (duty_definition_id) REFERENCES duty_definition(id)
);

-- assignment status lookup
CREATE TABLE event_duty_assignment_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- assigned duties
CREATE TABLE event_duty_assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_duty_id INTEGER NOT NULL,
    brother_id INTEGER NOT NULL,

    status_id INTEGER NOT NULL DEFAULT 1,
    completed_at TEXT,
    rejected_at TEXT,
    rejection_reason TEXT,

    FOREIGN KEY (event_duty_id) REFERENCES event_duty(id),
    FOREIGN KEY (brother_id) REFERENCES brother(id),
    FOREIGN KEY (status_id) REFERENCES event_duty_assignment_status(id)
);
