import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const initDb = async () => {
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS currency_information (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS personal_information (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT,
            lastName TEXT,
            birthdate TEXT,
            currencyId INTEGER,
            FOREIGN KEY (currencyId) REFERENCES currency_information(id)
        );
    `);

    console.log("Database initialized");
};

export const saveAttendee = async (attendee) => {
    const { firstName, lastName, birthdate, currency } = attendee;
    await db.run('INSERT OR IGNORE INTO currency_information (code, name) VALUES (?, ?)', [currency, currency + ' Name']);

    const currencyRow = await db.get('SELECT id FROM currency_information WHERE code = ?', [currency]);
    const currencyId = currencyRow.id;

    const result = await db.run(
        'INSERT INTO personal_information (firstName, lastName, birthdate, currencyId) VALUES (?, ?, ?, ?)',
        [firstName, lastName, birthdate, currencyId]
    );

    const row = await db.get(`
        SELECT p.firstName, p.lastName, c.name as currencyName, c.code as currencyCode
        FROM personal_information p
        JOIN currency_information c ON p.currencyId = c.id
        WHERE p.id = ?
    `, [result.lastID]);

    return { id: result.lastID, ...row };
};

export const updateAttendeeCurrency = async (id, currency) => {

    await db.run('INSERT OR IGNORE INTO currency_information (code, name) VALUES (?, ?)', [currency, currency + ' Name']);
    const currencyRow = await db.get('SELECT id FROM currency_information WHERE code = ?', [currency]);
    const currencyId = currencyRow.id;

    await db.run('UPDATE personal_information SET currencyId = ? WHERE id = ?', [currencyId, id]);

    return { success: true };
};