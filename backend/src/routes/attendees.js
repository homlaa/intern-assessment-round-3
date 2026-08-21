import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// The JOIN query required by the assessment: attendee name alongside their
// currency name and code.
const JOIN_QUERY_BY_ID = `
  SELECT
    pi.id,
    pi.first_name,
    pi.last_name,
    pi.birthdate,
    ci.currency_code,
    ci.currency_name
  FROM personal_information pi
  JOIN currency_information ci ON pi.currency_id = ci.id
  WHERE pi.id = ?
`;

const JOIN_QUERY_ALL = `
  SELECT
    pi.id,
    pi.first_name,
    pi.last_name,
    pi.birthdate,
    ci.currency_code,
    ci.currency_name
  FROM personal_information pi
  JOIN currency_information ci ON pi.currency_id = ci.id
  ORDER BY pi.id DESC
`;

function findAttendeeWithCurrency(id) {
  return db.prepare(JOIN_QUERY_BY_ID).get(id);
}

function findOrCreateCurrency(currencyCode) {
  const code = String(currencyCode).trim().toUpperCase();
  const existing = db
    .prepare('SELECT id FROM currency_information WHERE currency_code = ?')
    .get(code);
  if (existing) return existing.id;

  const result = db
    .prepare('INSERT INTO currency_information (currency_code, currency_name) VALUES (?, ?)')
    .run(code, code);
  return Number(result.lastInsertRowid);
}

function validateRegistrationBody(body) {
  const errors = [];
  if (!body.firstName || !String(body.firstName).trim()) errors.push('firstName is required');
  if (!body.lastName || !String(body.lastName).trim()) errors.push('lastName is required');
  if (!body.birthdate || !String(body.birthdate).trim()) errors.push('birthdate is required');
  if (!body.currencyCode || !String(body.currencyCode).trim()) {
    errors.push('currencyCode is required');
  }
  return errors;
}

// GET /api/attendees - list all attendees joined with their currency info
router.get('/', (req, res) => {
  const attendees = db.prepare(JOIN_QUERY_ALL).all();
  res.json(attendees);
});

// GET /api/attendees/:id - fetch one attendee joined with their currency info
router.get('/:id', (req, res) => {
  const attendee = findAttendeeWithCurrency(req.params.id);
  if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
  res.json(attendee);
});

// POST /api/attendees - save a new registration
router.post('/', (req, res) => {
  const errors = validateRegistrationBody(req.body ?? {});
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { firstName, lastName, birthdate, currencyCode } = req.body;
  const currencyId = findOrCreateCurrency(currencyCode);

  const result = db
    .prepare(
      'INSERT INTO personal_information (first_name, last_name, birthdate, currency_id) VALUES (?, ?, ?, ?)'
    )
    .run(firstName.trim(), lastName.trim(), birthdate.trim(), currencyId);

  const attendee = findAttendeeWithCurrency(Number(result.lastInsertRowid));
  res.status(201).json(attendee);
});

// PATCH /api/attendees/:id - update the attendee's currency choice
router.patch('/:id', (req, res) => {
  const { currencyCode } = req.body ?? {};
  if (!currencyCode || !String(currencyCode).trim()) {
    return res.status(400).json({ error: 'currencyCode is required' });
  }

  const existing = db
    .prepare('SELECT id FROM personal_information WHERE id = ?')
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Attendee not found' });

  const currencyId = findOrCreateCurrency(currencyCode);
  db.prepare('UPDATE personal_information SET currency_id = ? WHERE id = ?').run(
    currencyId,
    req.params.id
  );

  const attendee = findAttendeeWithCurrency(req.params.id);
  res.json(attendee);
});

export default router;
