require("dotenv").config();
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(__dirname, process.env.DB_PATH || "./attendees.db");

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS personal_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birthdate TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS currency_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendee_id INTEGER NOT NULL REFERENCES personal_information(id),
      currency_name TEXT NOT NULL,
      currency_code TEXT NOT NULL
    );
  `);

  save();
  return db;
}

function save() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

module.exports = { getDb, save };
