import { Router } from 'express';
import { pool } from '../db.js';
import QRCode from 'qrcode';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM rooms ORDER BY name');
  res.json(rows);
});

router.get('/available', async (req, res) => {
  const { date, startTime, endTime } = req.query;
  const { rows } = await pool.query(
    `SELECT * FROM rooms
    WHERE id NOT IN (
      SELECT room_id FROM reservations
      WHERE date = $1
        AND start_time < $2
        AND end_time > $3
    )
    ORDER BY name`,
    [date, endTime, startTime],
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [
    req.params.id,
  ]);
  if (rows.length === 0)
    return res.status(404).json({ error: 'Room not found' });
  res.json(rows[0]);
});

router.get('/:id/qrcode', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [
    req.params.id,
  ]);
  if (rows.length === 0)
    return res.status(404).json({ error: 'Room not found' });

  const bookingUrl = `${process.env.FRONTEND_URL}/rooms/${req.params.id}/book`;
  const buffer = await QRCode.toBuffer(bookingUrl);
  res.type('image/png').send(buffer);
});

router.post('/', async (req, res) => {
  const { name, capacity, location, description, amenities } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO rooms (name, capacity, location, description, amenities)
    VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, capacity, location, description, amenities ?? []],
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, capacity, location, description, amenities } = req.body;
  const { rows } = await pool.query(
    `UPDATE rooms
    SET name=$1, capacity=$2, location=$3, description=$4, amenities=$5
    WHERE id=$6 RETURNING *`,
    [name, capacity, location, description, amenities ?? [], req.params.id],
  );
  if (rows.length === 0)
    return res.status(404).json({ error: 'Room not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query(`DELETE FROM rooms WHERE id = $1`, [
    req.params.id,
  ]);
  if (rowCount === 0) return res.status(404).json({ error: 'Room not found' });
  res.status(204).send();
});

export default router;
