-- =========================
-- ASSIGNMENT STATUS LOOKUP
-- =========================
INSERT INTO event_duty_assignment_status (name) VALUES
  ('assigned'),
  ('completed'),
  ('rejected'),
  ('auto_rejected');

-- =========================
-- ROLES
-- =========================
INSERT INTO role (name) VALUES
  ('active'),
  ('inactive'),
  ('senior'),
  ('chair');

-- =========================
-- BROTHERS
-- =========================
-- name, previous_semester_points, role_id, phone_number
-- role_id: 1=active, 2=inactive, 3=senior, 4=chair

INSERT INTO brother (name, previous_semester_points, role_id, phone_number)
VALUES
('Aditya Bilawar', 165, 1, '6097217190'),
('Alessandro Ferrari', 59, 3, '6468215621'),
('Alexander Frawley', 281, 3, '9179436262'),
('Ashish Dewal', 173, 1, '5168704707'),
('Bryce Kelly', 536, 1, '6785758735'),
('Cade Richard', 179, 1, '6784477027'),
('Christopher Goggins', 130, 1, '2023097457'),
('Davin Aoyama', 150, 1, '2063042969'),
('Elliott Barthel', 0, 1, '6784883763'),
('Ethan Hulewicz', 319, 4, '2247164791'),
('Ethan Lam', 0, 1, '4045109889'),
('Evan McCarty', 457, 1, '6788232157'),
('Rett Smith', 123, 1, '6787104760'),
('Gavin Mathieu', 113, 1, '6786284098'),
('Henry Lott', 165, 1, '4045587421'),
('Hersh Pamnani', 0, 4, '4703017278'),
('Jack Stoltz', 0, 1, '6467995047'),
('Jacob Pullen', 0, 1, '4042813859'),
('Jacob Ma', 0, 1, '2163792952'),
('James Porter', 287, 1, '4045288285'),
('James Soule', 0, 1, '4232772417'),
('Jason Lai', 149, 1, '4042453010'),
('Jason Barachina', 0, 1, '6783135108'),
('John Lewis', 928, 1, '17703355774'),
('Joseph Townsend', 314, 1, '6786749338'),
('Justin Xia', 352, 3, '3302326880'),
('Liam Streleckis', 261, 1, '7708765274'),
('Malhar Kamat', 79, 1, '8578290411'),
('Marcus Kim', 108, 2, '6782079223'),
('Mio Achache', 79, 1, '3235588725'),
('Muhammad Atif', 44, 1, '2166815299'),
('Nathan Tai', 344, 3, '9132964420'),
('Nicholas Carlsson', 0, 1, '4807172177'),
('Nic Young', 104, 1, '6783082537'),
('Parker Oelrich', 113, 1, '6128238560'),
('Rui Lyu Chang', 1035, 1, '6788983488'),
('Sam Kim', 76, 1, '6786224683'),
('Sawyer Miyake', 174, 1, '4049550885'),
('Sergey Sachko', 0, 1, '2244365949'),
('Tanay Kapoor', 125, 1, '4088388499'),
('Tommy Arthur', 0, 1, '7064743240'),
('Tyler Schnell', 159, 1, '8455544665'),
('Vedesh Yadlapalli', 102, 3, '7177754664'),
('Walker Helms', 100, 1, '4783301444'),
('Xander Golubic', 149, 4, '4048054453'),
('Zachary Shapiro', 56, 1, '4703043308'),
('Zachary Reed', 127, 1, '6813189431'),
('Zhengyu Liu', 139, 1, '3214000906'),
('Michael Porter', 287, 1, '4045288285'),
('Yan Tsenter', 55, 2, '3478611651'),
('Anthony Natarella', 152, 2, '6785886489'),
('Jay Townsend', 314, 2, '6786749338'),
('Dylan Curran', 387, 2, '6178938362'),
('Quinn O''Connell', 471, 2, '4012585269'),
('Joe Shulman', 537, 2, '4043749749'),
('Assign Test', 0, 1, '2247164791');

-- =========================
-- DUTY TYPES
-- =========================
INSERT INTO duty_type (name) VALUES
  ('Setup'),
  ('Cleanup'),
  ('Purchase'),
  ('During');

-- =========================
-- EVENT TYPES
-- =========================
INSERT INTO event_type (name, chair_points) VALUES
  ('BPK', 10),
  ('Open party', 20),
  ('Closed party', 20),
  ('Date night', 10),
  ('Pong tourney', 10),
  ('Tailgate', 10);

-- =========================
-- DUTY DEFINITIONS
-- =========================
INSERT INTO duty_definition (duty_type_id, description) VALUES
  -- Setup duties
  (1, 'Draw banner design'),
  (1, 'Finish banner painting'),
  (1, 'Hang banner'),
  (1, 'Set up decorations'),
  (1, 'Set up fence'),
  (1, 'Set up and wipe down bar and tables'),
  (1, 'Move chairs out of the way'),
  (1, 'Rearrange couches'),
  (1, 'Sweep and mop chapter room'),
  (1, 'Sweep and mop foyer pool room tv room'),
  (1, 'Pick up and take out chapter room trash'),
  (1, 'Pick up and take out foyer pool room tv room trash'),
  (1, 'Clean front yard'),
  (1, 'Clean backyard'),
  (1, 'Clean roof'),
  (1, 'Clean womens restroom'),
  (1, 'Clean downstairs restroom'),
  (1, 'Set up sound system and lights'),
  (1, 'Setup music inside and out'),
  (1, 'Move subwoofer'),
  (1, 'Clean and fill coolers coolers'),
  (1, 'Set up cooler behind bar'),
  (1, 'Move grill outside'),
  (1, 'Set up yard games'),
  -- Cleanup duties
  (2, 'Take down banner'),
  (2, 'Take down fence'),
  (2, 'Bring in and wipe down bar and tables'),
  (2, 'Fix couches'),
  (2, 'Sweep and mop chapter room'),
  (2, 'Sweep and mop foyer pool room tv room'),
  (2, 'Pick up and take out chapter room trash'),
  (2, 'Pick up and take out foyer pool room tv room trash'),
  (2, 'Clean front yard'),
  (2, 'Clean backyard'),
  (2, 'Clean roof'),
  (2, 'Clean womens restroom'),
  (2, 'Clean downstairs restroom'),
  (2, 'Take apart sound system and lights'),
  (2, 'Return subwoofer'),
  (2, 'Return grill'),
  (2, 'Put away yard games'),
  -- Purchase duties
  (3, 'Buy alcohol'),
  (3, 'Buy ice'),
  (3, 'Buy cups'),
  (3, 'Buy food'),
  (3, 'Buy ping pong balls'),
  (3, 'Buy die'),
  (3, 'Buy pumpkins'),
  (3, 'Buy tablecloths'),
  (3, 'Buy decorations'),
  -- During duties
  (4, 'Sober monitor'),
  (4, 'Bartender'),
  (4, 'Door'),
  (4, 'DJ'),
  (4, 'Grilling'),
  (4, 'Judge competition');

-- =========================
-- EVENT TYPE DUTY TEMPLATES
-- =========================
-- Tailgate specific duties
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (6, 1, 10, 1),  -- Draw banner design
  (6, 2, 10, 1),  -- Finish banner painting
  (6, 3, 10, 2),  -- Hang banner
  (6, 23, 3, 2),  -- Move grill outside
  (6, 24, 4, 2),  -- Set up yard games
  (6, 25, 8, 1),  -- Take down banner
  (6, 40, 3, 1),  -- Return grill
  (6, 41, 4, 2),  -- Put away yard games
  (6, 46, 10, 1), -- Buy food
  (6, 56, 15, 1); -- Grilling

-- Open party specific duties
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (2, 5, 6, 4),   -- Set up fence
  (2, 26, 8, 2);  -- Take down fence

-- Party specific (Open party, Closed party)
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (2, 8, 3, 2),   -- Rearrange couches
  (2, 18, 8, 2),  -- Set up sound system and lights
  (2, 20, 5, 2),  -- Move subwoofer
  (2, 28, 3, 2),  -- Fix couches
  (2, 38, 7, 2),  -- Take apart sound system and lights
  (2, 39, 5, 2),  -- Return subwoofer
  (2, 52, 30, 4), -- Sober monitor
  (2, 55, 10, 1), -- DJ
  (3, 8, 3, 2),   -- Rearrange couches
  (3, 18, 8, 2),  -- Set up sound system and lights
  (3, 20, 5, 2),  -- Move subwoofer
  (3, 28, 3, 2),  -- Fix couches
  (3, 38, 7, 2),  -- Take apart sound system and lights
  (3, 39, 5, 2),  -- Return subwoofer
  (3, 52, 30, 5), -- Sober monitor
  (3, 55, 10, 1); -- DJ

-- Date night specific
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (4, 49, 10, 1), -- Buy pumpkins
  (4, 50, 5, 1),  -- Buy tablecloths
  (4, 56, 5, 1);  -- Judge competition

-- Misc events (using Pong tourney as placeholder for Misc)
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (5, 4, 6, 4),   -- Set up decorations
  (5, 51, 5, 1),  -- Buy decorations
  (5, 54, 10, 4); -- Door

-- "All" event type duties - adding to all 6 event types
INSERT INTO event_type_duty (event_type_id, duty_definition_id, default_points, default_required_brothers) VALUES
  -- BPK (id=1)
  (1, 6, 4, 2), (1, 7, 3, 1), (1, 9, 6, 1), (1, 10, 6, 1), (1, 11, 5, 1), (1, 12, 5, 1),
  (1, 13, 5, 1), (1, 14, 5, 1), (1, 15, 5, 1), (1, 16, 6, 1), (1, 17, 6, 1), (1, 19, 5, 1),
  (1, 21, 4, 1), (1, 22, 3, 2), (1, 27, 4, 2), (1, 29, 6, 1), (1, 30, 6, 1), (1, 31, 8, 1),
  (1, 32, 8, 1), (1, 33, 5, 1), (1, 34, 5, 1), (1, 35, 5, 1), (1, 36, 6, 1), (1, 37, 6, 1),
  (1, 42, 8, 1), (1, 43, 8, 1), (1, 44, 8, 1), (1, 45, 8, 1), (1, 47, 5, 1), (1, 48, 5, 1),
  (1, 53, 10, 2),
  -- Open party (id=2)
  (2, 6, 4, 2), (2, 7, 3, 1), (2, 9, 6, 1), (2, 10, 6, 1), (2, 11, 5, 1), (2, 12, 5, 1),
  (2, 13, 5, 1), (2, 14, 5, 1), (2, 15, 5, 1), (2, 16, 6, 1), (2, 17, 6, 1), (2, 19, 5, 1),
  (2, 21, 4, 1), (2, 22, 3, 2), (2, 27, 4, 2), (2, 29, 6, 1), (2, 30, 6, 1), (2, 31, 8, 1),
  (2, 32, 8, 1), (2, 33, 5, 1), (2, 34, 5, 1), (2, 35, 5, 1), (2, 36, 6, 1), (2, 37, 6, 1),
  (2, 42, 8, 1), (2, 43, 8, 1), (2, 44, 8, 1), (2, 45, 8, 1), (2, 47, 5, 1), (2, 48, 5, 1),
  (2, 53, 10, 2),
  -- Closed party (id=3)
  (3, 6, 4, 2), (3, 7, 3, 1), (3, 9, 6, 1), (3, 10, 6, 1), (3, 11, 5, 1), (3, 12, 5, 1),
  (3, 13, 5, 1), (3, 14, 5, 1), (3, 15, 5, 1), (3, 16, 6, 1), (3, 17, 6, 1), (3, 19, 5, 1),
  (3, 21, 4, 1), (3, 22, 3, 2), (3, 27, 4, 2), (3, 29, 6, 1), (3, 30, 6, 1), (3, 31, 8, 1),
  (3, 32, 8, 1), (3, 33, 5, 1), (3, 34, 5, 1), (3, 35, 5, 1), (3, 36, 6, 1), (3, 37, 6, 1),
  (3, 42, 8, 1), (3, 43, 8, 1), (3, 44, 8, 1), (3, 45, 8, 1), (3, 47, 5, 1), (3, 48, 5, 1),
  (3, 53, 10, 2),
  -- Date night (id=4)
  (4, 6, 4, 2), (4, 7, 3, 1), (4, 9, 6, 1), (4, 10, 6, 1), (4, 11, 5, 1), (4, 12, 5, 1),
  (4, 13, 5, 1), (4, 14, 5, 1), (4, 15, 5, 1), (4, 16, 6, 1), (4, 17, 6, 1), (4, 19, 5, 1),
  (4, 21, 4, 1), (4, 22, 3, 2), (4, 27, 4, 2), (4, 29, 6, 1), (4, 30, 6, 1), (4, 31, 8, 1),
  (4, 32, 8, 1), (4, 33, 5, 1), (4, 34, 5, 1), (4, 35, 5, 1), (4, 36, 6, 1), (4, 37, 6, 1),
  (4, 42, 8, 1), (4, 43, 8, 1), (4, 44, 8, 1), (4, 45, 8, 1), (4, 47, 5, 1), (4, 48, 5, 1),
  (4, 53, 10, 2),
  -- Pong tourney (id=5)
  (5, 6, 4, 2), (5, 7, 3, 1), (5, 9, 6, 1), (5, 10, 6, 1), (5, 11, 5, 1), (5, 12, 5, 1),
  (5, 13, 5, 1), (5, 14, 5, 1), (5, 15, 5, 1), (5, 16, 6, 1), (5, 17, 6, 1), (5, 19, 5, 1),
  (5, 21, 4, 1), (5, 22, 3, 2), (5, 27, 4, 2), (5, 29, 6, 1), (5, 30, 6, 1), (5, 31, 8, 1),
  (5, 32, 8, 1), (5, 33, 5, 1), (5, 34, 5, 1), (5, 35, 5, 1), (5, 36, 6, 1), (5, 37, 6, 1),
  (5, 42, 8, 1), (5, 43, 8, 1), (5, 44, 8, 1), (5, 45, 8, 1), (5, 47, 5, 1), (5, 48, 5, 1),
  (5, 53, 10, 2),
  -- Tailgate (id=6)
  (6, 6, 4, 2), (6, 7, 3, 1), (6, 9, 6, 1), (6, 10, 6, 1), (6, 11, 5, 1), (6, 12, 5, 1),
  (6, 13, 5, 1), (6, 14, 5, 1), (6, 15, 5, 1), (6, 16, 6, 1), (6, 17, 6, 1), (6, 19, 5, 1),
  (6, 21, 4, 1), (6, 22, 3, 2), (6, 27, 4, 2), (6, 29, 6, 1), (6, 30, 6, 1), (6, 31, 8, 1),
  (6, 32, 8, 1), (6, 33, 5, 1), (6, 34, 5, 1), (6, 35, 5, 1), (6, 36, 6, 1), (6, 37, 6, 1),
  (6, 42, 8, 1), (6, 43, 8, 1), (6, 44, 8, 1), (6, 45, 8, 1), (6, 47, 5, 1), (6, 48, 5, 1),
  (6, 53, 10, 2);

-- =========================
-- SAMPLE EVENT + DUTIES
-- =========================
INSERT INTO event (name, event_type_id, date, start_time, end_time)
VALUES ('Philigher', 2, '2026-01-24', '22:00', '02:00');

-- Setup duties (due by 20:00)
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 4, 6, 4, '20:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 18, 8, 2, '20:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 20, 5, 2, '20:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 5, 6, 4, '20:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

-- Purchase duties (due by 21:00)
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 42, 8, 1, '21:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 43, 8, 1, '21:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 44, 8, 1, '21:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

-- Cleanup duties (due by 12:00)
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 26, 8, 2, '12:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 38, 7, 2, '12:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, due_time)
SELECT e.id, 39, 5, 2, '12:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

-- Pregame (21:00-22:00)
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 53, 10, 1, '21:00', '22:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 52, 10, 1, '21:00', '22:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

-- During (22:00-02:00) Door + DJ slots
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 53, 10, 3, '22:00', '23:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 54, 10, 1, '22:00', '23:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 53, 10, 3, '23:00', '00:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 54, 10, 1, '23:00', '00:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 53, 10, 3, '00:00', '01:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 54, 10, 1, '00:00', '01:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';

INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 53, 10, 3, '01:00', '02:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
INSERT INTO event_duty (event_id, duty_definition_id, points, required_brothers, start_time, end_time)
SELECT e.id, 54, 10, 1, '01:00', '02:00' FROM event e WHERE e.name = 'Philigher' AND e.date = '2026-01-24';
