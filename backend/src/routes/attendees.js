import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

const joinQuery = `
  SELECT
    pi.id,
    pi.first_name,
    pi.last_name,
    pi.birthdate,
    ci.currency_code,
    ci.currency_name
  FROM personal_information pi
  JOIN currency_information ci ON pi.currency_id = ci.id
`;

router.get('/', (req, res) => {
  const rows = db.prepare(joinQuery + ' ORDER BY pi.id DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(joinQuery + ' WHERE pi.id = ?').get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: 'Attendee not found' });
  }

  res.json(row);
});

router.post('/', (req, res) => {
  const { firstName, lastName, birthdate, currencyCode } = req.body;

  if (!firstName || !lastName || !birthdate || !currencyCode) {
    return res.status(400).json({ error: 'firstName, lastName, birthdate and currencyCode are all required' });
  }

  const code = currencyCode.toUpperCase();
  let currency = db.prepare('SELECT id FROM currency_information WHERE currency_code = ?').get(code);

  if (!currency) {
    const inserted = db
      .prepare('INSERT INTO currency_information (currency_code, currency_name) VALUES (?, ?)')
      .run(code, code);
    currency = { id: inserted.lastInsertRowid };
  }

  const result = db
    .prepare('INSERT INTO personal_information (first_name, last_name, birthdate, currency_id) VALUES (?, ?, ?, ?)')
    .run(firstName, lastName, birthdate, currency.id);

  const newAttendee = db.prepare(joinQuery + ' WHERE pi.id = ?').get(result.lastInsertRowid);
  res.status(201).json(newAttendee);
});

router.patch('/:id', (req, res) => {
  const { currencyCode } = req.body;

  if (!currencyCode) {
    return res.status(400).json({ error: 'currencyCode is required' });
  }

  const attendee = db.prepare('SELECT id FROM personal_information WHERE id = ?').get(req.params.id);
  if (!attendee) {
    return res.status(404).json({ error: 'Attendee not found' });
  }

  const code = currencyCode.toUpperCase();
  let currency = db.prepare('SELECT id FROM currency_information WHERE currency_code = ?').get(code);

  if (!currency) {
    const inserted = db
      .prepare('INSERT INTO currency_information (currency_code, currency_name) VALUES (?, ?)')
      .run(code, code);
    currency = { id: inserted.lastInsertRowid };
  }

  db.prepare('UPDATE personal_information SET currency_id = ? WHERE id = ?').run(currency.id, req.params.id);

  const updated = db.prepare(joinQuery + ' WHERE pi.id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
