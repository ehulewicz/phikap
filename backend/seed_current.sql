PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    brother_id INTEGER NOT NULL,

    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (brother_id) REFERENCES brother(id)
);
INSERT INTO "session" VALUES('4b34cc6c-fe21-4060-a949-df8d53754979',10,'2026-03-07T17:18:57.735Z','2026-02-05 17:18:57');
CREATE TABLE password_reset_token (
    id TEXT PRIMARY KEY,
    brother_id INTEGER NOT NULL,
    code_hash TEXT NOT NULL,

    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (brother_id) REFERENCES brother(id)
);
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
INSERT INTO "brother" VALUES(1,'Aditya Bilawar','6097217190','U06F0AFB8F7',NULL,165,0,1);
INSERT INTO "brother" VALUES(2,'Alessandro Ferrari','6468215621','U0400NY1WN8',NULL,59,0,3);
INSERT INTO "brother" VALUES(3,'Alexander Frawley','9179436262','U0400NYLXV2',NULL,281,0,3);
INSERT INTO "brother" VALUES(4,'Ashish Dewal','5168704707','U08996EQFSS',NULL,173,0,1);
INSERT INTO "brother" VALUES(5,'Bryce Kelly','6785758735','U0400NY44DS',NULL,536,0,1);
INSERT INTO "brother" VALUES(6,'Cade Richard','6784477027','U04L0MWLR27',NULL,179,0,1);
INSERT INTO "brother" VALUES(7,'Christopher Goggins','2023097457','U07JJ9VQPK5',NULL,130,0,1);
INSERT INTO "brother" VALUES(8,'Davin Aoyama','2063042969','U07JFGLJR1T',NULL,150,0,1);
INSERT INTO "brother" VALUES(9,'Elliott Barthel','6784883763','U09BVHMJXKQ',NULL,0,0,1);
INSERT INTO "brother" VALUES(10,'Ethan Hulewicz','2247164791','U06FFSZA3GR',NULL,319,0,4);
INSERT INTO "brother" VALUES(11,'Ethan Lam','4045109889','U09BVHQAPSA',NULL,30,0,1);
INSERT INTO "brother" VALUES(12,'Evan McCarty','6788232157','U089FQFBZK4',NULL,457,0,1);
INSERT INTO "brother" VALUES(13,'Rett Smith','6787104760','U07JJD2DFK4',NULL,123,0,1);
INSERT INTO "brother" VALUES(14,'Gavin Mathieu','6786284098','U07JX39921F',NULL,113,0,1);
INSERT INTO "brother" VALUES(15,'Henry Lott','4045587421','U089D005KNH',NULL,165,0,1);
INSERT INTO "brother" VALUES(16,'Hersh Pamnani','4703017278','U09BVHLHW94',NULL,0,0,4);
INSERT INTO "brother" VALUES(17,'Jack Stoltz','6467995047','U089FMZNYNP',NULL,0,0,1);
INSERT INTO "brother" VALUES(18,'Jacob Pullen','4042813859','U09BVHQBYUW',NULL,0,0,1);
INSERT INTO "brother" VALUES(19,'Jacob Ma','2163792952','U09BVHQ9G78',NULL,0,0,1);
INSERT INTO "brother" VALUES(20,'James Soule','4232772417','U09BVHKK406',NULL,0,0,1);
INSERT INTO "brother" VALUES(21,'Jason Lai','4042453010','U05Q7ATTY4V',NULL,149,0,1);
INSERT INTO "brother" VALUES(22,'Jason Barachina','6783135108','U09BVHK12G6',NULL,0,0,1);
INSERT INTO "brother" VALUES(23,'John Lewis','17703355774','U06FFSZ8P5F',NULL,928,0,1);
INSERT INTO "brother" VALUES(24,'Justin Xia','3302326880','U03UXNBAKV5',NULL,352,0,3);
INSERT INTO "brother" VALUES(25,'Liam Streleckis','7708765274','U05Q3K45BHU',NULL,261,0,1);
INSERT INTO "brother" VALUES(26,'Malhar Kamat','8578290411','U05Q7AVBW05',NULL,79,0,1);
INSERT INTO "brother" VALUES(27,'Marcus Kim','6782079223','U07JLTE2XPW',NULL,108,0,2);
INSERT INTO "brother" VALUES(28,'Mio Achache','3235588725','U07JX38BDFB',NULL,79,0,1);
INSERT INTO "brother" VALUES(29,'Muhammad Atif','2166815299','U07JJ9VARFD',NULL,44,0,1);
INSERT INTO "brother" VALUES(30,'Nathan Tai','9132964420','U05QCMJG1MJ',NULL,344,0,3);
INSERT INTO "brother" VALUES(31,'Nicholas Carlsson','4807172177','U09BVHFL5PG',NULL,0,0,1);
INSERT INTO "brother" VALUES(32,'Nic Young','6783082537','U05PVN72DHV',NULL,104,0,1);
INSERT INTO "brother" VALUES(33,'Parker Oelrich','6128238560','U05QCMH6V7E',NULL,113,0,1);
INSERT INTO "brother" VALUES(34,'Rui Chang Lyu','6788983488','U07JBPYSSCE',NULL,1035,0,1);
INSERT INTO "brother" VALUES(35,'Sam Kim','6786224683','U04L39P7QN8',NULL,76,0,1);
INSERT INTO "brother" VALUES(36,'Sawyer Miyake','4049550885','U07JFGM0PEH',NULL,174,0,1);
INSERT INTO "brother" VALUES(37,'Sergey Sachko','2244365949','U09BVHNQCNA',NULL,0,0,1);
INSERT INTO "brother" VALUES(38,'Tanay Kapoor','4088388499','U07JFGLSH45',NULL,125,0,1);
INSERT INTO "brother" VALUES(39,'Tommy Arthur','7064743240','U09BVHQ5P5L',NULL,0,0,1);
INSERT INTO "brother" VALUES(40,'Tyler Schnell','8455544665','U08A4K4PMJ4',NULL,159,0,1);
INSERT INTO "brother" VALUES(41,'Vedesh Yadlapalli','7177754664','U03UXNBLXSB',NULL,102,0,3);
INSERT INTO "brother" VALUES(42,'Walker Helms','4783301444','U089FQFDM7U',NULL,100,0,1);
INSERT INTO "brother" VALUES(43,'Xander Golubic','4048054453','U07JX38EQGZ',NULL,149,0,4);
INSERT INTO "brother" VALUES(44,'Zachary Shapiro','4703043308','U02CHQ69Q0N',NULL,56,0,1);
INSERT INTO "brother" VALUES(45,'Zachary Reed','6813189431','U08A4K4UUM6',NULL,127,0,1);
INSERT INTO "brother" VALUES(46,'Zhengyu Liu','3214000906','U06ENMJHSMD',NULL,139,0,1);
INSERT INTO "brother" VALUES(47,'Michael Porter','4045288285','U05Q7AV3C85',NULL,287,0,1);
INSERT INTO "brother" VALUES(48,'Yan Tsenter','3478611651','U05Q3K0AWRL',NULL,55,0,2);
INSERT INTO "brother" VALUES(49,'Anthony Natarella','6785886489','U08A4K4MWD6',NULL,152,0,2);
INSERT INTO "brother" VALUES(50,'Jay Townsend','6786749338','U05PVN4DELX',NULL,314,0,2);
INSERT INTO "brother" VALUES(51,'Dylan Curran','6178938362','U05QA5MS7D1',NULL,387,0,2);
INSERT INTO "brother" VALUES(52,'Quinn OConnell','4012585269','U04SDB3LMGS',NULL,471,0,2);
INSERT INTO "brother" VALUES(53,'Joe Shulman','4043749749','U07JBPZG8ES',NULL,537,0,2);
CREATE TABLE role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO "role" VALUES(1,'active');
INSERT INTO "role" VALUES(2,'inactive');
INSERT INTO "role" VALUES(3,'senior');
INSERT INTO "role" VALUES(4,'admin');
CREATE TABLE duty_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO "duty_type" VALUES(1,'Setup');
INSERT INTO "duty_type" VALUES(2,'Cleanup');
INSERT INTO "duty_type" VALUES(3,'Purchase');
INSERT INTO "duty_type" VALUES(4,'During');
CREATE TABLE duty_definition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duty_type_id INTEGER NOT NULL,
    description TEXT NOT NULL,

    default_points INTEGER NOT NULL,
    default_required_brothers INTEGER NOT NULL,

    UNIQUE (duty_type_id, description),
    FOREIGN KEY (duty_type_id) REFERENCES duty_type(id)
);
INSERT INTO "duty_definition" VALUES(1,1,'Draw banner design',8,1);
INSERT INTO "duty_definition" VALUES(2,1,'Finish banner painting',8,1);
INSERT INTO "duty_definition" VALUES(3,1,'Hang banner',5,1);
INSERT INTO "duty_definition" VALUES(4,1,'Set up decorations',5,1);
INSERT INTO "duty_definition" VALUES(5,1,'Set up fence',6,1);
INSERT INTO "duty_definition" VALUES(6,1,'Set up and wipe down bar and tables',2,1);
INSERT INTO "duty_definition" VALUES(7,1,'Move chairs out of the way',6,1);
INSERT INTO "duty_definition" VALUES(8,1,'Rearrange couches',3,1);
INSERT INTO "duty_definition" VALUES(9,1,'Sweep and mop chapter room',6,1);
INSERT INTO "duty_definition" VALUES(10,1,'Sweep and mop foyer pool room tv room',6,1);
INSERT INTO "duty_definition" VALUES(11,1,'Pick up and take out chapter room trash',5,1);
INSERT INTO "duty_definition" VALUES(12,1,'Pick up and take out foyer pool room tv room trash',5,1);
INSERT INTO "duty_definition" VALUES(13,1,'Clean front yard',5,1);
INSERT INTO "duty_definition" VALUES(14,1,'Clean backyard',5,1);
INSERT INTO "duty_definition" VALUES(15,1,'Clean roof',6,1);
INSERT INTO "duty_definition" VALUES(16,1,'Clean womens restroom',6,1);
INSERT INTO "duty_definition" VALUES(17,1,'Clean downstairs restroom',6,1);
INSERT INTO "duty_definition" VALUES(18,1,'Set up sound system and lights',6,1);
INSERT INTO "duty_definition" VALUES(19,1,'Setup music inside and out',6,1);
INSERT INTO "duty_definition" VALUES(20,1,'Move subwoofer',5,1);
INSERT INTO "duty_definition" VALUES(21,1,'Clean and fill coolers',3,1);
INSERT INTO "duty_definition" VALUES(23,1,'Move grill outside',4,1);
INSERT INTO "duty_definition" VALUES(24,1,'Set up yard games',5,1);
INSERT INTO "duty_definition" VALUES(25,2,'Take down banner',5,1);
INSERT INTO "duty_definition" VALUES(26,2,'Take down fence',4,1);
INSERT INTO "duty_definition" VALUES(27,2,'Bring in and wipe down bar and tables',3,1);
INSERT INTO "duty_definition" VALUES(28,2,'Fix couches',3,1);
INSERT INTO "duty_definition" VALUES(29,2,'Sweep and mop chapter room',6,1);
INSERT INTO "duty_definition" VALUES(30,2,'Sweep and mop foyer pool room tv room',6,1);
INSERT INTO "duty_definition" VALUES(31,2,'Pick up and take out chapter room trash',5,1);
INSERT INTO "duty_definition" VALUES(32,2,'Pick up and take out foyer pool room tv room trash',5,1);
INSERT INTO "duty_definition" VALUES(33,2,'Clean front yard',5,1);
INSERT INTO "duty_definition" VALUES(34,2,'Clean backyard',5,1);
INSERT INTO "duty_definition" VALUES(35,2,'Clean roof',6,1);
INSERT INTO "duty_definition" VALUES(36,2,'Clean womens restroom',6,1);
INSERT INTO "duty_definition" VALUES(37,2,'Clean downstairs restroom',6,1);
INSERT INTO "duty_definition" VALUES(38,2,'Take apart sound system and lights',6,1);
INSERT INTO "duty_definition" VALUES(39,2,'Return subwoofer',5,1);
INSERT INTO "duty_definition" VALUES(40,2,'Return grill',4,1);
INSERT INTO "duty_definition" VALUES(41,2,'Put away yard games',5,1);
INSERT INTO "duty_definition" VALUES(42,3,'Buy alcohol',5,1);
INSERT INTO "duty_definition" VALUES(43,3,'Buy ice',5,1);
INSERT INTO "duty_definition" VALUES(44,3,'Buy cups',3,1);
INSERT INTO "duty_definition" VALUES(45,3,'Buy food',4,1);
INSERT INTO "duty_definition" VALUES(46,3,'Buy ping pong balls',2,1);
INSERT INTO "duty_definition" VALUES(47,3,'Buy die',2,1);
INSERT INTO "duty_definition" VALUES(48,3,'Buy pumpkins',3,1);
INSERT INTO "duty_definition" VALUES(49,3,'Buy tablecloths',3,1);
INSERT INTO "duty_definition" VALUES(50,3,'Buy decorations',5,1);
INSERT INTO "duty_definition" VALUES(51,4,'Sober monitor',20,1);
INSERT INTO "duty_definition" VALUES(52,4,'Bartender',8,1);
INSERT INTO "duty_definition" VALUES(53,4,'Door',8,1);
INSERT INTO "duty_definition" VALUES(54,4,'DJ',8,1);
INSERT INTO "duty_definition" VALUES(55,4,'Grilling',7,1);
INSERT INTO "duty_definition" VALUES(56,4,'Judge competition',6,1);
INSERT INTO "duty_definition" VALUES(57,3,'Buy water bottles',8,1);
CREATE TABLE event_definition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    admin_points INTEGER NOT NULL DEFAULT 10
);
INSERT INTO "event_definition" VALUES(1,'BPK',15);
INSERT INTO "event_definition" VALUES(2,'Open party',25);
INSERT INTO "event_definition" VALUES(3,'Closed party',20);
INSERT INTO "event_definition" VALUES(7,'Special',0);
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
INSERT INTO "event_definition_duty" VALUES(11,2,5,6,4,'20:00');
INSERT INTO "event_definition_duty" VALUES(12,2,26,8,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(13,2,8,3,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(14,2,18,8,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(15,2,20,5,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(16,2,28,3,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(17,2,38,7,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(18,2,39,5,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(19,2,51,30,5,'21:00');
INSERT INTO "event_definition_duty" VALUES(21,3,8,3,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(22,3,18,8,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(23,3,20,5,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(24,3,28,3,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(25,3,38,7,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(26,3,39,5,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(27,3,51,30,4,'21:00');
INSERT INTO "event_definition_duty" VALUES(35,1,6,4,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(36,1,7,3,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(37,1,9,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(38,1,10,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(39,1,11,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(40,1,12,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(46,1,19,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(47,1,21,4,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(49,1,27,4,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(50,1,29,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(51,1,30,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(52,1,31,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(53,1,32,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(54,1,33,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(55,1,34,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(56,1,35,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(57,1,36,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(58,1,37,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(59,1,42,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(60,1,43,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(61,1,44,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(62,1,47,5,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(63,1,53,10,2,'21:00');
INSERT INTO "event_definition_duty" VALUES(64,2,6,4,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(65,2,7,3,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(66,2,9,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(67,2,10,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(68,2,11,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(69,2,12,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(70,2,13,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(71,2,14,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(72,2,15,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(76,2,21,4,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(78,2,27,4,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(79,2,29,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(80,2,30,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(81,2,31,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(82,2,32,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(83,2,33,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(84,2,34,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(85,2,35,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(86,2,36,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(87,2,37,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(88,2,42,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(89,2,43,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(90,2,44,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(91,2,45,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(94,2,53,10,1,'21:00');
INSERT INTO "event_definition_duty" VALUES(95,3,6,4,2,'20:00');
INSERT INTO "event_definition_duty" VALUES(96,3,7,3,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(97,3,9,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(98,3,10,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(99,3,11,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(100,3,12,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(107,3,21,4,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(109,3,27,4,2,'23:30');
INSERT INTO "event_definition_duty" VALUES(110,3,29,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(111,3,30,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(112,3,31,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(113,3,32,8,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(114,3,33,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(115,3,34,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(116,3,35,5,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(117,3,36,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(118,3,37,6,1,'23:30');
INSERT INTO "event_definition_duty" VALUES(119,3,42,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(120,3,43,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(121,3,44,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(122,3,45,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(123,3,47,5,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(125,3,53,10,1,'21:00');
INSERT INTO "event_definition_duty" VALUES(219,1,52,8,1,'21:00');
INSERT INTO "event_definition_duty" VALUES(220,1,52,8,1,'22:00');
INSERT INTO "event_definition_duty" VALUES(221,1,52,8,1,'23:00');
INSERT INTO "event_definition_duty" VALUES(227,3,52,10,1,'21:00');
INSERT INTO "event_definition_duty" VALUES(228,3,52,10,2,'22:00');
INSERT INTO "event_definition_duty" VALUES(229,3,52,10,2,'23:00');
INSERT INTO "event_definition_duty" VALUES(230,3,52,10,2,'00:00');
INSERT INTO "event_definition_duty" VALUES(259,1,46,5,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(260,2,46,5,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(261,2,57,8,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(262,3,46,5,1,'17:00');
INSERT INTO "event_definition_duty" VALUES(263,3,13,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(264,3,15,6,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(265,3,14,5,1,'20:00');
INSERT INTO "event_definition_duty" VALUES(266,2,53,10,3,'22:00');
INSERT INTO "event_definition_duty" VALUES(267,2,53,10,3,'23:00');
INSERT INTO "event_definition_duty" VALUES(268,2,53,10,3,'00:00');
INSERT INTO "event_definition_duty" VALUES(269,2,53,10,2,'01:00');
INSERT INTO "event_definition_duty" VALUES(270,3,53,10,2,'22:00');
INSERT INTO "event_definition_duty" VALUES(271,3,53,10,2,'23:00');
INSERT INTO "event_definition_duty" VALUES(272,3,53,10,2,'00:00');
INSERT INTO "event_definition_duty" VALUES(273,3,53,10,2,'01:00');
INSERT INTO "event_definition_duty" VALUES(274,2,52,10,1,'21:00');
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
INSERT INTO "event" VALUES(1,'Philighter Open',2,'2026-01-24','21:00','23:30',0);
INSERT INTO "event" VALUES(2,'BPK',1,'2026-01-29','21:00','23:30',0);
INSERT INTO "event" VALUES(3,'Case Race',7,'2026-01-31','20:00','22:00',0);
INSERT INTO "event" VALUES(4,'Die Day',7,'2026-02-03','20:00','22:00',0);
INSERT INTO "event" VALUES(5,'BPK',1,'2026-02-05','21:00','23:30',0);
INSERT INTO "event" VALUES(6,'Super Bowl Watch Party',1,'2026-02-08','18:00','21:00',0);
INSERT INTO "event" VALUES(7,'Champagne and Shackles',2,'2026-02-12','21:00','23:30',0);
INSERT INTO "event" VALUES(8,'Valentines Party',2,'2026-02-13','21:00','23:30',0);
INSERT INTO "event" VALUES(9,'PC Mixer',2,'2026-02-19','20:00','22:30',0);
INSERT INTO "event" VALUES(10,'AGD PC Mixer',2,'2026-02-26','20:00','22:30',0);
INSERT INTO "event" VALUES(11,'BPK',1,'2026-03-05','21:00','23:30',0);
INSERT INTO "event" VALUES(13,'St Patties Open',2,'2026-03-13','21:00','23:30',0);
INSERT INTO "event" VALUES(14,'Phi Mu Mixer',2,'2026-03-19','20:00','22:30',0);
INSERT INTO "event" VALUES(15,'BPK',1,'2026-04-02','21:00','23:30',0);
INSERT INTO "event" VALUES(16,'Closed Party',3,'2026-04-03','21:00','23:30',0);
INSERT INTO "event" VALUES(17,'Formal',7,'2026-04-17','19:00','23:00',0);
INSERT INTO "event" VALUES(18,'Formal',7,'2026-04-19','19:00','23:00',0);
INSERT INTO "event" VALUES(19,'BPK',1,'2026-04-23','21:00','23:30',0);
INSERT INTO "event" VALUES(20,'Ice Cream Social',7,'2026-04-28','19:00','21:00',0);
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
INSERT INTO "event_duty" VALUES(1,1,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(2,7,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(3,8,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(4,9,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(5,10,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(6,13,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(7,14,5,6,4,'20:00');
INSERT INTO "event_duty" VALUES(8,1,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(9,7,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(10,8,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(11,9,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(12,10,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(13,13,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(14,14,26,8,2,'23:30');
INSERT INTO "event_duty" VALUES(15,1,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(16,7,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(17,8,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(18,9,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(19,10,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(20,13,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(21,14,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(22,1,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(23,7,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(24,8,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(25,9,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(26,10,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(27,13,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(28,14,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(29,1,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(30,7,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(31,8,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(32,9,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(33,10,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(34,13,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(35,14,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(36,1,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(37,7,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(38,8,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(39,9,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(40,10,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(41,13,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(42,14,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(43,1,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(44,7,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(45,8,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(46,9,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(47,10,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(48,13,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(49,14,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(50,1,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(51,7,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(52,8,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(53,9,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(54,10,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(55,13,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(56,14,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(57,1,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(58,7,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(59,8,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(60,9,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(61,10,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(62,13,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(63,14,51,30,4,'21:00');
INSERT INTO "event_duty" VALUES(64,1,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(65,7,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(66,8,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(67,9,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(68,10,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(69,13,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(70,14,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(71,16,8,3,2,'20:00');
INSERT INTO "event_duty" VALUES(72,16,18,8,2,'20:00');
INSERT INTO "event_duty" VALUES(73,16,20,5,2,'20:00');
INSERT INTO "event_duty" VALUES(74,16,28,3,2,'23:30');
INSERT INTO "event_duty" VALUES(75,16,38,7,2,'23:30');
INSERT INTO "event_duty" VALUES(76,16,39,5,2,'23:30');
INSERT INTO "event_duty" VALUES(77,16,51,30,5,'21:00');
INSERT INTO "event_duty" VALUES(78,16,55,10,1,'21:00');
INSERT INTO "event_duty" VALUES(82,2,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(84,6,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(85,11,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(86,15,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(87,19,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(88,2,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(90,6,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(91,11,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(92,15,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(93,19,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(94,2,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(96,6,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(97,11,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(98,15,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(99,19,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(100,2,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(102,6,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(103,11,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(104,15,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(105,19,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(106,2,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(108,6,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(109,11,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(110,15,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(111,19,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(112,2,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(114,6,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(115,11,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(116,15,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(117,19,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(118,2,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(120,6,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(121,11,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(122,15,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(123,19,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(124,2,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(126,6,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(127,11,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(128,15,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(129,19,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(130,2,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(132,6,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(133,11,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(134,15,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(135,19,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(136,2,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(138,6,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(139,11,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(140,15,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(141,19,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(142,2,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(144,6,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(145,11,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(146,15,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(147,19,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(148,2,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(150,6,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(151,11,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(152,15,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(153,19,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(154,2,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(156,6,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(157,11,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(158,15,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(159,19,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(166,2,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(168,6,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(169,11,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(170,15,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(171,19,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(172,2,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(174,6,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(175,11,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(176,15,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(177,19,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(178,2,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(180,6,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(181,11,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(182,15,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(183,19,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(184,2,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(186,6,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(187,11,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(188,15,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(189,19,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(190,2,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(192,6,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(193,11,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(194,15,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(195,19,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(196,2,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(198,6,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(199,11,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(200,15,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(201,19,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(202,2,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(204,6,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(205,11,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(206,15,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(207,19,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(208,2,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(210,6,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(211,11,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(212,15,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(213,19,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(214,2,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(216,6,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(217,11,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(218,15,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(219,19,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(220,2,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(222,6,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(223,11,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(224,15,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(225,19,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(226,2,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(228,6,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(229,11,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(230,15,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(231,19,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(232,2,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(234,6,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(235,11,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(236,15,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(237,19,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(238,2,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(240,6,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(241,11,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(242,15,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(243,19,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(244,2,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(246,6,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(247,11,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(248,15,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(249,19,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(250,2,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(252,6,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(253,11,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(254,15,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(255,19,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(256,1,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(257,7,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(258,8,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(259,9,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(260,10,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(261,13,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(262,14,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(263,1,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(264,7,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(265,8,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(266,9,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(267,10,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(268,13,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(269,14,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(270,1,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(271,7,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(272,8,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(273,9,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(274,10,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(275,13,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(276,14,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(277,1,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(278,7,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(279,8,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(280,9,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(281,10,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(282,13,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(283,14,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(284,1,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(285,7,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(286,8,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(287,9,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(288,10,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(289,13,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(290,14,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(291,1,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(292,7,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(293,8,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(294,9,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(295,10,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(296,13,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(297,14,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(298,1,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(299,7,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(300,8,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(301,9,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(302,10,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(303,13,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(304,14,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(305,1,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(306,7,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(307,8,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(308,9,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(309,10,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(310,13,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(311,14,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(312,1,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(313,7,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(314,8,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(315,9,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(316,10,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(317,13,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(318,14,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(319,1,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(320,7,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(321,8,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(322,9,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(323,10,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(324,13,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(325,14,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(326,1,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(327,7,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(328,8,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(329,9,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(330,10,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(331,13,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(332,14,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(333,1,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(334,7,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(335,8,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(336,9,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(337,10,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(338,13,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(339,14,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(340,1,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(341,7,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(342,8,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(343,9,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(344,10,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(345,13,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(346,14,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(354,1,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(355,7,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(356,8,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(357,9,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(358,10,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(359,13,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(360,14,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(361,1,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(362,7,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(363,8,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(364,9,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(365,10,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(366,13,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(367,14,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(368,1,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(369,7,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(370,8,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(371,9,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(372,10,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(373,13,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(374,14,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(375,1,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(376,7,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(377,8,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(378,9,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(379,10,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(380,13,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(381,14,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(382,1,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(383,7,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(384,8,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(385,9,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(386,10,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(387,13,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(388,14,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(389,1,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(390,7,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(391,8,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(392,9,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(393,10,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(394,13,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(395,14,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(396,1,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(397,7,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(398,8,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(399,9,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(400,10,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(401,13,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(402,14,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(403,1,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(404,7,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(405,8,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(406,9,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(407,10,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(408,13,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(409,14,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(410,1,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(411,7,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(412,8,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(413,9,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(414,10,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(415,13,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(416,14,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(417,1,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(418,7,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(419,8,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(420,9,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(421,10,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(422,13,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(423,14,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(424,1,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(425,7,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(426,8,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(427,9,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(428,10,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(429,13,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(430,14,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(431,1,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(432,7,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(433,8,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(434,9,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(435,10,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(436,13,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(437,14,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(438,1,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(439,7,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(440,8,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(441,9,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(442,10,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(443,13,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(444,14,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(445,1,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(446,7,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(447,8,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(448,9,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(449,10,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(450,13,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(451,14,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(452,1,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(453,7,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(454,8,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(455,9,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(456,10,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(457,13,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(458,14,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(459,1,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(460,7,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(461,8,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(462,9,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(463,10,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(464,13,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(465,14,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(466,1,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(467,7,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(468,8,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(469,9,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(470,10,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(471,13,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(472,14,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(473,16,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(474,16,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(475,16,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(476,16,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(477,16,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(478,16,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(479,16,13,5,1,'20:00');
INSERT INTO "event_duty" VALUES(480,16,14,5,1,'20:00');
INSERT INTO "event_duty" VALUES(481,16,15,5,1,'20:00');
INSERT INTO "event_duty" VALUES(482,16,16,6,1,'20:00');
INSERT INTO "event_duty" VALUES(483,16,17,6,1,'20:00');
INSERT INTO "event_duty" VALUES(484,16,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(485,16,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(487,16,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(488,16,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(489,16,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(490,16,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(491,16,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(492,16,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(493,16,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(494,16,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(495,16,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(496,16,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(497,16,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(498,16,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(499,16,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(500,16,45,8,1,'17:00');
INSERT INTO "event_duty" VALUES(501,16,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(502,16,48,5,1,'17:00');
INSERT INTO "event_duty" VALUES(503,16,53,10,2,'21:00');
INSERT INTO "event_duty" VALUES(535,2,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(537,6,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(538,11,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(539,15,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(540,19,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(541,2,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(543,6,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(544,11,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(545,15,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(546,19,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(547,2,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(549,6,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(550,11,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(551,15,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(552,19,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(553,2,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(555,6,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(556,11,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(557,15,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(558,19,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(559,1,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(560,7,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(561,8,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(562,9,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(563,10,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(564,13,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(565,14,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(566,1,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(567,7,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(568,8,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(569,9,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(570,10,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(571,13,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(572,14,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(573,1,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(574,7,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(575,8,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(576,9,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(577,10,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(578,13,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(579,14,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(580,1,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(581,7,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(582,8,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(583,9,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(584,10,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(585,13,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(586,14,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(587,16,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(588,16,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(589,16,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(590,16,52,8,1,'00:00');
INSERT INTO "event_duty" VALUES(632,5,6,4,2,'20:00');
INSERT INTO "event_duty" VALUES(633,5,7,3,1,'20:00');
INSERT INTO "event_duty" VALUES(634,5,9,6,1,'20:00');
INSERT INTO "event_duty" VALUES(635,5,10,6,1,'20:00');
INSERT INTO "event_duty" VALUES(636,5,11,5,1,'20:00');
INSERT INTO "event_duty" VALUES(637,5,12,5,1,'20:00');
INSERT INTO "event_duty" VALUES(638,5,19,5,1,'20:00');
INSERT INTO "event_duty" VALUES(639,5,21,4,1,'20:00');
INSERT INTO "event_duty" VALUES(640,5,27,4,2,'23:30');
INSERT INTO "event_duty" VALUES(641,5,29,6,1,'23:30');
INSERT INTO "event_duty" VALUES(642,5,30,6,1,'23:30');
INSERT INTO "event_duty" VALUES(643,5,31,8,1,'23:30');
INSERT INTO "event_duty" VALUES(644,5,32,8,1,'23:30');
INSERT INTO "event_duty" VALUES(645,5,33,5,1,'23:30');
INSERT INTO "event_duty" VALUES(646,5,34,5,1,'23:30');
INSERT INTO "event_duty" VALUES(647,5,35,5,1,'23:30');
INSERT INTO "event_duty" VALUES(648,5,36,6,1,'23:30');
INSERT INTO "event_duty" VALUES(649,5,37,6,1,'23:30');
INSERT INTO "event_duty" VALUES(650,5,42,8,1,'17:00');
INSERT INTO "event_duty" VALUES(651,5,43,8,1,'17:00');
INSERT INTO "event_duty" VALUES(652,5,44,8,1,'17:00');
INSERT INTO "event_duty" VALUES(653,5,46,5,1,'17:00');
INSERT INTO "event_duty" VALUES(654,5,47,5,1,'17:00');
INSERT INTO "event_duty" VALUES(655,5,52,8,1,'21:00');
INSERT INTO "event_duty" VALUES(656,5,52,8,1,'22:00');
INSERT INTO "event_duty" VALUES(657,5,52,8,1,'23:00');
INSERT INTO "event_duty" VALUES(658,5,53,10,2,'21:00');
CREATE TABLE event_duty_assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_duty_id INTEGER NOT NULL,
    brother_id INTEGER NOT NULL,

    status_id INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (event_duty_id) REFERENCES event_duty(id),
    FOREIGN KEY (brother_id) REFERENCES brother(id),
    FOREIGN KEY (status_id) REFERENCES event_duty_assignment_status(id)
);
CREATE TABLE event_duty_assignment_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO "event_duty_assignment_status" VALUES(1,'signed_up');
INSERT INTO "event_duty_assignment_status" VALUES(2,'assigned');
INSERT INTO "event_duty_assignment_status" VALUES(3,'completed');
INSERT INTO "event_duty_assignment_status" VALUES(4,'late');
INSERT INTO "event_duty_assignment_status" VALUES(5,'rejected');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('event_duty_assignment_status',5);
INSERT INTO "sqlite_sequence" VALUES('role',4);
INSERT INTO "sqlite_sequence" VALUES('duty_type',4);
INSERT INTO "sqlite_sequence" VALUES('event_definition',8);
INSERT INTO "sqlite_sequence" VALUES('brother',53);
INSERT INTO "sqlite_sequence" VALUES('duty_definition',57);
INSERT INTO "sqlite_sequence" VALUES('event_definition_duty',274);
INSERT INTO "sqlite_sequence" VALUES('event',20);
INSERT INTO "sqlite_sequence" VALUES('event_duty',658);
CREATE INDEX idx_point_adjustment_brother_id ON point_adjustment (brother_id);
CREATE INDEX idx_point_adjustment_event_id ON point_adjustment (event_id);
CREATE INDEX idx_point_adjustment_created_at ON point_adjustment (created_at);