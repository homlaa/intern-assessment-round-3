CREATE TABLE IF NOT EXISTS personal_information (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthdate TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS currency_information (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attendee_id INTEGER NOT NULL UNIQUE,
  currency_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  FOREIGN KEY (attendee_id) REFERENCES personal_information(id) ON DELETE CASCADE
);