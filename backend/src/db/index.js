import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS currency_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_code TEXT NOT NULL UNIQUE,
    currency_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS personal_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthdate TEXT NOT NULL,
    currency_id INTEGER NOT NULL,
    FOREIGN KEY (currency_id) REFERENCES currency_information(id)
  );
`);

const currencyCount = db.prepare('SELECT COUNT(*) AS count FROM currency_information').get().count;

if (currencyCount === 0) {
  const insertCurrency = db.prepare(
    'INSERT INTO currency_information (currency_code, currency_name) VALUES (?, ?)'
  );

  insertCurrency.run('USD', 'US Dollar');
  insertCurrency.run('EUR', 'Euro');
  insertCurrency.run('GBP', 'British Pound');
  insertCurrency.run('RWF', 'Rwandan Franc');
  insertCurrency.run('JPY', 'Japanese Yen');
  insertCurrency.run('CAD', 'Canadian Dollar');
  insertCurrency.run('AUD', 'Australian Dollar');
  insertCurrency.run('ZAR', 'South African Rand');
}

export default db;
