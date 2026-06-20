import 'dotenv/config';
import express from 'express';
import { pool } from './db.js';
import roomsRouter from './routes/rooms.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use('/rooms', roomsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

pool
  .query('SELECT 1')
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
