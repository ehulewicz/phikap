-- =========================
-- ASSIGNMENT STATUS LOOKUP
-- =========================
INSERT INTO event_duty_assignment_status (name) VALUES
  ('signed_up'),
  ('assigned'),
  ('completed'),
  ('late'),
  ('rejected');

-- =========================
-- ROLES
-- =========================
INSERT INTO role (name) VALUES
  ('active'),
  ('inactive'),
  ('senior'),
  ('admin');

-- =========================
-- BROTHERS
-- =========================
-- name, previous_semester_points, role_id, phone_number
-- role_id: 1=active, 2=inactive, 3=senior, 4=admin

-- =========================
-- DUTY TYPES
-- =========================
INSERT INTO duty_type (name) VALUES
  ('Setup'),
  ('Cleanup'),
  ('Purchase'),
  ('During');

-- =========================
-- EVENT DEFINITIONS
-- =========================
INSERT INTO event_definition (name, admin_points) VALUES
  ('BPK', 15),
  ('Open party', 25),
  ('Closed party', 20),
  ('Date night', 15),
  ('Pong tourney', 15),
  ('Tailgate', 15),
  ('Special', 0),
  ('Brotherhood', 15);

INSERT INTO brother (name, last_semester_points, role_id, phone_number, slack_id)
VALUES
('Aditya Bilawar', 165, 1, '6097217190', 'U06F0AFB8F7'),
('Alessandro Ferrari', 59, 3, '6468215621', 'U0400NY1WN8'),
('Alexander Frawley', 281, 3, '9179436262', 'U0400NYLXV2'),
('Ashish Dewal', 173, 1, '5168704707', 'U08996EQFSS'),
('Bryce Kelly', 536, 1, '6785758735', 'U0400NY44DS'),
('Cade Richard', 179, 1, '6784477027', 'U04L0MWLR27'),
('Christopher Goggins', 130, 1, '2023097457', 'U07JJ9VQPK5'),
('Davin Aoyama', 150, 1, '2063042969', 'U07JFGLJR1T'),
('Elliott Barthel', 0, 1, '6784883763', 'U09BVHMJXKQ'),
('Ethan Hulewicz', 319, 4, '2247164791', 'U06FFSZA3GR'),
('Ethan Lam', 30, 1, '4045109889', 'U09BVHQAPSA'),
('Evan McCarty', 457, 1, '6788232157', 'U089FQFBZK4'),
('Rett Smith', 123, 1, '6787104760', 'U07JJD2DFK4'),
('Gavin Mathieu', 113, 1, '6786284098', 'U07JX39921F'),
('Henry Lott', 165, 1, '4045587421', 'U089D005KNH'),
('Hersh Pamnani', 0, 4, '4703017278', 'U09BVHLHW94'),
('Jack Stoltz', 0, 1, '6467995047', 'U089FMZNYNP'),
('Jacob Pullen', 0, 1, '4042813859', 'U09BVHQBYUW'),
('Jacob Ma', 0, 1, '2163792952', 'U09BVHQ9G78'),
('James Soule', 0, 1, '4232772417', 'U09BVHKK406'),
('Jason Lai', 149, 1, '4042453010', 'U05Q7ATTY4V'),
('Jason Barachina', 0, 1, '6783135108', 'U09BVHK12G6'),
('John Lewis', 928, 1, '17703355774', 'U06FFSZ8P5F'),
('Justin Xia', 352, 3, '3302326880', 'U03UXNBAKV5'),
('Liam Streleckis', 261, 1, '7708765274', 'U05Q3K45BHU'),
('Malhar Kamat', 79, 1, '8578290411', 'U05Q7AVBW05'),
('Marcus Kim', 108, 2, '6782079223', 'U07JLTE2XPW'),
('Mio Achache', 79, 1, '3235588725', 'U07JX38BDFB'),
('Muhammad Atif', 44, 1, '2166815299', 'U07JJ9VARFD'),
('Nathan Tai', 344, 3, '9132964420', 'U05QCMJG1MJ'),
('Nicholas Carlsson', 0, 1, '4807172177', 'U09BVHFL5PG'),
('Nic Young', 104, 1, '6783082537', 'U05PVN72DHV'),
('Parker Oelrich', 113, 1, '6128238560', 'U05QCMH6V7E'),
('Rui Chang Lyu', 1035, 1, '6788983488', 'U07JBPYSSCE'),
('Sam Kim', 76, 1, '6786224683', 'U04L39P7QN8'),
('Sawyer Miyake', 174, 1, '4049550885', 'U07JFGM0PEH'),
('Sergey Sachko', 0, 1, '2244365949', 'U09BVHNQCNA'),
('Tanay Kapoor', 125, 1, '4088388499', 'U07JFGLSH45'),
('Tommy Arthur', 0, 1, '7064743240', 'U09BVHQ5P5L'),
('Tyler Schnell', 159, 1, '8455544665', 'U08A4K4PMJ4'),
('Vedesh Yadlapalli', 102, 3, '7177754664', 'U03UXNBLXSB'),
('Walker Helms', 100, 1, '4783301444', 'U089FQFDM7U'),
('Xander Golubic', 149, 4, '4048054453', 'U07JX38EQGZ'),
('Zachary Shapiro', 56, 1, '4703043308', 'U02CHQ69Q0N'),
('Zachary Reed', 127, 1, '6813189431', 'U08A4K4UUM6'),
('Zhengyu Liu', 139, 1, '3214000906', 'U06ENMJHSMD'),
('Michael Porter', 287, 1, '4045288285', 'U05Q7AV3C85'),
('Yan Tsenter', 55, 2, '3478611651', 'U05Q3K0AWRL'),
('Anthony Natarella', 152, 2, '6785886489', 'U08A4K4MWD6'),
('Jay Townsend', 314, 2, '6786749338', 'U05PVN4DELX'),
('Dylan Curran', 387, 2, '6178938362', 'U05QA5MS7D1'),
('Quinn OConnell', 471, 2, '4012585269', 'U04SDB3LMGS'),
('Joe Shulman', 537, 2, '4043749749', 'U07JBPZG8ES');

-- =========================
-- DUTY DEFINITIONS
-- =========================
INSERT INTO duty_definition (duty_type_id, description, default_points, default_required_brothers) VALUES
  -- Setup duties
  (1, 'Draw banner design', 8, 1),
  (1, 'Finish banner painting', 8, 1),
  (1, 'Hang banner', 5, 1),
  (1, 'Set up decorations', 5, 1),
  (1, 'Set up fence', 6, 1),
  (1, 'Set up and wipe down bar and tables', 2, 1),
  (1, 'Move chairs out of the way', 6, 1),
  (1, 'Rearrange couches', 3, 1),
  (1, 'Sweep and mop chapter room', 6, 1),
  (1, 'Sweep and mop foyer pool room tv room', 6, 1),
  (1, 'Pick up and take out chapter room trash', 5, 1),
  (1, 'Pick up and take out foyer pool room tv room trash', 5, 1),
  (1, 'Clean front yard', 5, 1),
  (1, 'Clean backyard', 5, 1),
  (1, 'Clean roof', 6, 1),
  (1, 'Clean womens restroom', 6, 1),
  (1, 'Clean downstairs restroom', 6, 1),
  (1, 'Set up sound system and lights', 6, 1),
  (1, 'Setup music inside and out', 6, 1),
  (1, 'Move subwoofer', 5, 1),
  (1, 'Clean and fill coolers coolers', 3, 1),
  (1, 'Set up cooler behind bar', 3, 1),
  (1, 'Move grill outside', 4, 1),
  (1, 'Set up yard games', 5, 1),
  -- Cleanup duties
  (2, 'Take down banner', 5, 1),
  (2, 'Take down fence', 4, 1),
  (2, 'Bring in and wipe down bar and tables', 3, 1),
  (2, 'Fix couches', 3, 1),
  (2, 'Sweep and mop chapter room', 6, 1),
  (2, 'Sweep and mop foyer pool room tv room', 6, 1),
  (2, 'Pick up and take out chapter room trash', 5, 1),
  (2, 'Pick up and take out foyer pool room tv room trash', 5, 1),
  (2, 'Clean front yard', 5, 1),
  (2, 'Clean backyard', 5, 1),
  (2, 'Clean roof', 6, 1),
  (2, 'Clean womens restroom', 6, 1),
  (2, 'Clean downstairs restroom', 6, 1),
  (2, 'Take apart sound system and lights', 6, 1),
  (2, 'Return subwoofer', 5, 1),
  (2, 'Return grill', 4, 1),
  (2, 'Put away yard games', 5, 1),
  -- Purchase duties
  (3, 'Buy alcohol', 5, 1),
  (3, 'Buy ice', 5, 1),
  (3, 'Buy cups', 3, 1),
  (3, 'Buy food', 4, 1),
  (3, 'Buy ping pong balls', 2, 1),
  (3, 'Buy die', 2, 1),
  (3, 'Buy pumpkins', 3, 1),
  (3, 'Buy tablecloths', 3, 1),
  (3, 'Buy decorations', 5, 1),
  -- During duties
  (4, 'Sober monitor', 20, 1),
  (4, 'Bartender', 8, 1),
  (4, 'Door', 8, 1),
  (4, 'DJ', 8, 1),
  (4, 'Grilling', 7, 1),
  (4, 'Judge competition', 6, 1);

-- =========================
-- EVENT TYPE DUTY TEMPLATES
-- =========================
-- Tailgate specific duties
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
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
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (2, 5, 6, 4),   -- Set up fence
  (2, 26, 8, 2);  -- Take down fence

-- Party specific (Open party, Closed party)
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
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
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (4, 49, 10, 1), -- Buy pumpkins
  (4, 50, 5, 1),  -- Buy tablecloths
  (4, 56, 5, 1);  -- Judge competition

-- Misc events (using Pong tourney as placeholder for Misc)
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
  (5, 4, 6, 4),   -- Set up decorations
  (5, 51, 5, 1),  -- Buy decorations
  (5, 54, 10, 4); -- Door

-- "All" event definition duties - adding to all 6 event definitions
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers) VALUES
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

-- Brotherhood (same as BPK, excluding During duties)
INSERT INTO event_definition_duty (event_definition_id, duty_definition_id, default_points, default_required_brothers)
SELECT brotherhood.id, ed.duty_definition_id, ed.default_points, ed.default_required_brothers
FROM event_definition_duty ed
JOIN event_definition bpk ON bpk.id = ed.event_definition_id AND bpk.name = 'BPK'
JOIN duty_definition dd ON dd.id = ed.duty_definition_id
JOIN event_definition brotherhood ON brotherhood.name = 'Brotherhood'
WHERE dd.duty_type_id <> 4;

-- =========================
-- CALENDAR EVENTS (SPRING 2026)
-- =========================
INSERT INTO event (name, event_definition_id, date, start_time, end_time)
VALUES
  ('Philighter Open', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-01-24', '21:00', '23:30'),
  ('BPK', (SELECT id FROM event_definition WHERE name = 'BPK'), '2026-01-29', '21:00', '23:30'),
  ('Case Race', (SELECT id FROM event_definition WHERE name = 'Special'), '2026-01-31', '20:00', '22:00'),
  ('Die Day', (SELECT id FROM event_definition WHERE name = 'Special'), '2026-02-03', '20:00', '22:00'),
  ('BPK', (SELECT id FROM event_definition WHERE name = 'BPK'), '2026-02-05', '21:00', '23:30'),
  ('Super Bowl Watch Party', (SELECT id FROM event_definition WHERE name = 'Brotherhood'), '2026-02-08', '18:00', '21:00'),
  ('Champagne and Shackles', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-02-12', '21:00', '23:30'),
  ('Valentines Party', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-02-13', '21:00', '23:30'),
  ('PC Mixer', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-02-19', '20:00', '22:30'),
  ('AGD PC Mixer', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-02-26', '20:00', '22:30'),
  ('BPK', (SELECT id FROM event_definition WHERE name = 'BPK'), '2026-03-05', '21:00', '23:30'),
  ('Date Night', (SELECT id FROM event_definition WHERE name = 'Date night'), '2026-03-12', '20:00', '22:00'),
  ('St Patties Open', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-03-13', '21:00', '23:30'),
  ('Phi Mu Mixer', (SELECT id FROM event_definition WHERE name = 'Open party'), '2026-03-19', '20:00', '22:30'),
  ('BPK', (SELECT id FROM event_definition WHERE name = 'BPK'), '2026-04-02', '21:00', '23:30'),
  ('Closed Party', (SELECT id FROM event_definition WHERE name = 'Closed party'), '2026-04-03', '21:00', '23:30'),
  ('Formal', (SELECT id FROM event_definition WHERE name = 'Special'), '2026-04-17', '19:00', '23:00'),
  ('Formal', (SELECT id FROM event_definition WHERE name = 'Special'), '2026-04-19', '19:00', '23:00'),
  ('BPK', (SELECT id FROM event_definition WHERE name = 'BPK'), '2026-04-23', '21:00', '23:30'),
  ('Ice Cream Social', (SELECT id FROM event_definition WHERE name = 'Special'), '2026-04-28', '19:00', '21:00');
