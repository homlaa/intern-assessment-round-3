require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getDb, save } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "null";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || "";
  const isSameOrigin = origin === "" || origin.startsWith(ALLOWED_ORIGIN);
  if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method) && !isSameOrigin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

function run(db, sql, params = []) {
  db.run(sql, params);
  save();
  return db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
}

function get(db, sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return null;
  const { columns, values } = result[0];
  return Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
}

function getAttendee(db, id) {
  return get(
    db,
    `SELECT p.first_name, p.last_name, c.currency_name, c.currency_code
     FROM personal_information p
     JOIN currency_information c ON c.attendee_id = p.id
     WHERE p.id = ?`,
    [id]
  );
}

app.post("/api/attendees", async (req, res) => {
  const { first_name, last_name, birthdate, currency_code, currency_name } = req.body;

  if (!first_name || !last_name || !birthdate || !currency_code || !currency_name) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const db = await getDb();

  const personId = run(
    db,
    "INSERT INTO personal_information (first_name, last_name, birthdate) VALUES (?, ?, ?)",
    [first_name, last_name, birthdate]
  );

  run(
    db,
    "INSERT INTO currency_information (attendee_id, currency_name, currency_code) VALUES (?, ?, ?)",
    [personId, currency_name, currency_code]
  );

  res.status(201).json(getAttendee(db, personId));
});

app.patch("/api/attendees/:id", async (req, res) => {
  const { currency_code, currency_name } = req.body;
  const id = Number(req.params.id);

  if (!currency_code || !currency_name) {
    return res.status(400).json({ error: "currency_code and currency_name are required." });
  }

  const db = await getDb();

  if (!get(db, "SELECT id FROM personal_information WHERE id = ?", [id])) {
    return res.status(404).json({ error: "Attendee not found." });
  }

  db.run(
    "UPDATE currency_information SET currency_code = ?, currency_name = ? WHERE attendee_id = ?",
    [currency_code, currency_name, id]
  );
  save();

  res.json(getAttendee(db, id));
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running.", endpoints: ["POST /api/attendees", "PATCH /api/attendees/:id"] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
