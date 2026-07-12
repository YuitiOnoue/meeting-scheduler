import 'dotenv/config';
import express from 'express';
import roomsRouter from './routes/rooms.js';
import authRouter from './routes/auth.js';
import reservationsRouter from './routes/reservations.js';

const app = express();

app.use(express.json());
app.use('/rooms', roomsRouter);
app.use('/auth', authRouter);
app.use('/reservations', reservationsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
