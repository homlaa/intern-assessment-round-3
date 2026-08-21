# Intern Assessment — Round 3

## Progress
Started by Senga Gloire Marguerite Marie.
_Checkpoint: baseline verified by reviewer._

Implemented the registration form, exchange-rate integration, backend API,
database schema, and unit tests described below.

## Project structure
- `frontend/` — React (Vite) registration form
- `backend/` — Node/Express API with a SQLite database

## Running locally

### Backend
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Set `VITE_API_BASE_URL` (see `.env.example`)
if the backend isn't on the default port.

### Tests
```bash
cd frontend
npm test
```

## Feature notes

### 2. Frontend form
`RegistrationForm` collects first name, last name, birthdate (native date
picker), and home currency (dropdown: USD, EUR, GBP, RWF, JPY, CAD, AUD,
ZAR). Save validates all fields client-side before submitting; Clear resets
the form. Selecting a currency calls the Frankfurter API
(`GET /v1/latest?base={currency}`) with `async`/`await` and `try`/`catch`,
and displays the first 3–4 returned exchange rates.

### 3. Troubleshooting
Alongside the real currency call, the form also calls the Frankfurter API
with a deliberately invalid code (`XXX`). One call succeeds, the other fails;
the failure is caught and the real HTTP status/message are read from the
response body (not hardcoded) and shown in the "Troubleshooting demo" panel.

### 4. Database + JOIN
Two SQLite tables:
- `currency_information (id, currency_code, currency_name)`
- `personal_information (id, first_name, last_name, birthdate, currency_id → currency_information.id)`

`POST /api/attendees` saves a registration into both tables and returns the
joined row. `PATCH /api/attendees/:id` updates the attendee's currency
choice. The JOIN query (in `backend/src/routes/attendees.js`) used to fetch a
name alongside currency name/code:

```sql
SELECT
  pi.id,
  pi.first_name,
  pi.last_name,
  pi.birthdate,
  ci.currency_code,
  ci.currency_name
FROM personal_information pi
JOIN currency_information ci ON pi.currency_id = ci.id
WHERE pi.id = ?;
```

### 5. Unit testing
`frontend/src/api/exchangeRates.test.js` uses Vitest to mock `fetch` and
verify `getExchangeRates` returns the parsed rates on a successful response,
and throws an error carrying the real HTTP status on a failed response.
