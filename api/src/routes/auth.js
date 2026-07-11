import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name, email, passwordHash, role ?? 'user'],
  );
  res.status(201).json(rows[0]);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
  res.json({ token });
});

router.get('/me', authenticate, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id =$1',
    [req.user.id],
  );
  res.json(rows[0]);
});

export default router;
