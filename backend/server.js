const express = require("express");
const cors = require("cors");
const { getDb, save } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

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

  const result = get(
    db,
    `SELECT p.first_name, p.last_name, c.currency_name, c.currency_code
     FROM personal_information p
     JOIN currency_information c ON c.attendee_id = p.id
     WHERE p.id = ?`,
    [personId]
  );

  res.status(201).json(result);
});

app.patch("/api/attendees/:id", async (req, res) => {
  const { currency_code, currency_name } = req.body;
  const id = Number(req.params.id);

  if (!currency_code || !currency_name) {
    return res.status(400).json({ error: "currency_code and currency_name are required." });
  }

  const db = await getDb();

  const person = get(db, "SELECT id FROM personal_information WHERE id = ?", [id]);
  if (!person) return res.status(404).json({ error: "Attendee not found." });

  db.run(
    "UPDATE currency_information SET currency_code = ?, currency_name = ? WHERE attendee_id = ?",
    [currency_code, currency_name, id]
  );
  save();

  const result = get(
    db,
    `SELECT p.first_name, p.last_name, c.currency_name, c.currency_code
     FROM personal_information p
     JOIN currency_information c ON c.attendee_id = p.id
     WHERE p.id = ?`,
    [id]
  );

  res.json(result);
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running.", endpoints: ["POST /api/attendees", "PATCH /api/attendees/:id"] });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
