import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function initializeDatabase() {
  const db = await open({
    filename: "./attendees.db",
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON");

  // Create personal_information table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS personal_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create currency_information table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS currency_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendeeId INTEGER NOT NULL,
      currencyCode TEXT NOT NULL,
      currencyName TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attendeeId) REFERENCES personal_information(id)
    )
  `);

  console.log("Database initialized successfully");
  return db;
}
