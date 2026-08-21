import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import { createAttendeesRouter } from './routes/attendees.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database and start server
async function startServer() {
  try {
    const db = await initializeDatabase();

    // Create routes
    const attendeesRouter = createAttendeesRouter(db);
    app.use('/api/attendees', attendeesRouter);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
