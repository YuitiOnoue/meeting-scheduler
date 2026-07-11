import 'dotenv/config';
import express from 'express';
import roomsRouter from './routes/rooms.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(express.json());
app.use('/rooms', roomsRouter);
app.use('/auth', authRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
