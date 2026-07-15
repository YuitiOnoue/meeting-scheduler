import { Router } from 'express';
import { pool } from '../db.js';
import { authenticate } from '../middleware/authenticate.js';
import camelcaseKeys from 'camelcase-keys';

const router = Router();

router.get('/', async (req, res) => {
  const { roomId, date } = req.query;
  const { rows } = await pool.query(
    `SELECT * FROM reservations
    WHERE room_id = $1 AND date = $2
    ORDER BY start_time`,
    [roomId, date],
  );
  res.json(camelcaseKeys(rows));
});

router.post('/', async (req, res) => {
  const { roomId, title, organizer, date, startTime, endTime } = req.body;

  const { rows: conflicts } = await pool.query(
    `SELECT id FROM reservations
    WHERE room_id = $1 AND date = $2
      AND start_time < $3 AND end_time > $4`,
    [roomId, date, endTime, startTime],
  );
  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Room already booked for that slot' });
  }

  const { rows } = await pool.query(
    `INSERT INTO reservations (room_id, user_id, title, organizer, date, start_time, end_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [roomId, req?.user?.id, title, organizer, date, startTime, endTime],
  );
  res.status(201).json(camelcaseKeys(rows[0]));
});

router.delete('/:id', authenticate, async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM reservations WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id],
  );
  if (rowCount == 0) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.status(204).send();
});

export default router;
