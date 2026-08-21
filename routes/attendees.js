import express from 'express';

export function createAttendeesRouter(db) {
  const router = express.Router();

  // POST /api/attendees - Create a new attendee with personal info and currency
  router.post('/', async (req, res) => {
    try {
      const { firstName, lastName, birthDate, currencyCode, currencyName } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !birthDate || !currencyCode || !currencyName) {
        return res.status(400).json({ 
          error: 'All fields are required' 
        });
      }

      // Insert personal information
      const personalResult = await db.run(
        `INSERT INTO personal_information (firstName, lastName, birthDate) 
         VALUES (?, ?, ?)`,
        [firstName, lastName, birthDate]
      );

      const attendeeId = personalResult.lastID;

      // Insert currency information
      await db.run(
        `INSERT INTO currency_information (attendeeId, currencyCode, currencyName) 
         VALUES (?, ?, ?)`,
        [attendeeId, currencyCode, currencyName]
      );

      // Return the created attendee with JOIN query
      const attendee = await db.get(
        `SELECT 
           p.id, 
           p.firstName, 
           p.lastName, 
           p.birthDate,
           c.currencyCode,
           c.currencyName
         FROM personal_information p
         LEFT JOIN currency_information c ON p.id = c.attendeeId
         WHERE p.id = ?`,
        [attendeeId]
      );

      res.status(201).json({
        message: 'Attendee created successfully',
        data: attendee
      });
    } catch (error) {
      console.error('Error creating attendee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PATCH /api/attendees/:id - Update attendee's currency choice
  router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { currencyCode, currencyName } = req.body;

      // Validate required fields
      if (!currencyCode || !currencyName) {
        return res.status(400).json({ 
          error: 'Currency code and name are required' 
        });
      }

      // Check if attendee exists
      const attendee = await db.get(
        `SELECT id FROM personal_information WHERE id = ?`,
        [id]
      );

      if (!attendee) {
        return res.status(404).json({ error: 'Attendee not found' });
      }

      // Update or insert currency information
      const existingCurrency = await db.get(
        `SELECT id FROM currency_information WHERE attendeeId = ?`,
        [id]
      );

      if (existingCurrency) {
        await db.run(
          `UPDATE currency_information 
           SET currencyCode = ?, currencyName = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE attendeeId = ?`,
          [currencyCode, currencyName, id]
        );
      } else {
        await db.run(
          `INSERT INTO currency_information (attendeeId, currencyCode, currencyName) 
           VALUES (?, ?, ?)`,
          [id, currencyCode, currencyName]
        );
      }

      // Return updated attendee with JOIN query
      const updatedAttendee = await db.get(
        `SELECT 
           p.id, 
           p.firstName, 
           p.lastName, 
           p.birthDate,
           c.currencyCode,
           c.currencyName
         FROM personal_information p
         LEFT JOIN currency_information c ON p.id = c.attendeeId
         WHERE p.id = ?`,
        [id]
      );

      res.status(200).json({
        message: 'Attendee updated successfully',
        data: updatedAttendee
      });
    } catch (error) {
      console.error('Error updating attendee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
