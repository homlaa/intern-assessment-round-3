const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const dataDirectory = path.join(__dirname, 'data');
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, 'attendees.db'));
database.pragma('foreign_keys = ON');
database.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const currencyNames = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  RWF: 'Rwandan Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc'
};

function currencyNameFor(code) {
  return currencyNames[code] || code;
}

function createAttendee({ firstName, lastName, birthdate, currencyCode }) {
  const insertPersonal = database.prepare(
    'INSERT INTO personal_information (first_name, last_name, birthdate) VALUES (?, ?, ?)'
  );
  const insertCurrency = database.prepare(
    'INSERT INTO currency_information (attendee_id, currency_name, currency_code) VALUES (?, ?, ?)'
  );

  const transaction = database.transaction(() => {
    const personal = insertPersonal.run(firstName, lastName, birthdate);
    insertCurrency.run(personal.lastInsertRowid, currencyNameFor(currencyCode), currencyCode);
    return Number(personal.lastInsertRowid);
  });

  return transaction();
}

function updateCurrency(id, currencyCode) {
  const result = database.prepare(
    'UPDATE currency_information SET currency_name = ?, currency_code = ? WHERE attendee_id = ?'
  ).run(currencyNameFor(currencyCode), currencyCode, id);
  return result.changes > 0;
}

function findAttendee(id) {
  return database.prepare(`
    SELECT p.id, p.first_name AS firstName, p.last_name AS lastName,
           p.birthdate, c.currency_name AS currencyName, c.currency_code AS currencyCode
    FROM personal_information p
    JOIN currency_information c ON c.attendee_id = p.id
    WHERE p.id = ?
  `).get(id);
}

module.exports = { createAttendee, updateCurrency, findAttendee };