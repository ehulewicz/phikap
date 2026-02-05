-- session
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    brother_id INTEGER NOT NULL,

    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (brother_id) REFERENCES brother(id)
);

--reset password
--currentlyi unused
CREATE TABLE password_reset_token (
    id TEXT PRIMARY KEY,
    brother_id INTEGER NOT NULL,
    code_hash TEXT NOT NULL,

    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (brother_id) REFERENCES brother(id)
);

-- accounts / brothers
CREATE TABLE brother (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT,

    slack_id TEXT NOT NULL UNIQUE,
    password_hash TEXT,

    last_semester_points INTEGER NOT NULL DEFAULT 0,
    admin_points INTEGER NOT NULL DEFAULT 0,

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

    default_points INTEGER NOT NULL,
    default_required_brothers INTEGER NOT NULL,

    UNIQUE (duty_type_id, description),
    FOREIGN KEY (duty_type_id) REFERENCES duty_type(id)
);

-- event definitions
CREATE TABLE event_definition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    admin_points INTEGER NOT NULL DEFAULT 10,
    default_start_time TEXT
);

-- add defualt duties to event definitions
CREATE TABLE event_definition_duty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_definition_id INTEGER NOT NULL,
    duty_definition_id INTEGER NOT NULL,

    default_points INTEGER NOT NULL,
    default_required_brothers INTEGER NOT NULL,
    default_time TEXT,

    UNIQUE (event_definition_id, duty_definition_id, default_time),
    FOREIGN KEY (event_definition_id) REFERENCES event_definition(id),
    FOREIGN KEY (duty_definition_id) REFERENCES duty_definition(id)
);

-- events on calendar
CREATE TABLE event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_definition_id INTEGER NOT NULL,

    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,

    duties_unlocked INTEGER NOT NULL DEFAULT 0,

    UNIQUE (event_definition_id, date, start_time),
    FOREIGN KEY (event_definition_id) REFERENCES event_definition(id)
);

-- manual points ledger (all adjustments tied to an event)
CREATE TABLE point_adjustment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brother_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (brother_id) REFERENCES brother(id),
    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (created_by) REFERENCES brother(id)
);

-- all duties for a specific event (default and not)
-- time for the "during" duty type is the start time of the duty (with a 1 hour duration)
-- time for all other duty types is the due date
CREATE TABLE event_duty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    duty_definition_id INTEGER NOT NULL,

    points INTEGER NOT NULL,
    required_brothers INTEGER NOT NULL,

    time TEXT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (duty_definition_id) REFERENCES duty_definition(id)
);

-- assigned duties
CREATE TABLE event_duty_assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_duty_id INTEGER NOT NULL,
    brother_id INTEGER NOT NULL,

    status_id INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (event_duty_id) REFERENCES event_duty(id),
    FOREIGN KEY (brother_id) REFERENCES brother(id),
    FOREIGN KEY (status_id) REFERENCES event_duty_assignment_status(id)
);

-- assignment status lookup
CREATE TABLE event_duty_assignment_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_point_adjustment_brother_id ON point_adjustment (brother_id);
CREATE INDEX idx_point_adjustment_event_id ON point_adjustment (event_id);
CREATE INDEX idx_point_adjustment_created_at ON point_adjustment (created_at);
