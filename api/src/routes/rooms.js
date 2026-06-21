import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM rooms ORDER BY name');
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
