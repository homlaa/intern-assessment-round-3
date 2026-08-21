# Intern Assessment — Round 3

## Progress
_Checkpoint: baseline verified by reviewer._
Started by Cynthia, Round 3.

---

## How to run

**Backend**

```bash
cd backend
npm install
cp .env.example .env
node server.js
```

Server starts at `http://localhost:3000`.

**Frontend**

Open `frontend/index.html` in your browser. No build needed.

**Tests**

```bash
cd backend
npx jest --testPathPattern="exchangeRate" --rootDir=".."
```
