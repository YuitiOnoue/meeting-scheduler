import { pool } from './db.js';
import app from './app.js';

const PORT = process.env.PORT ?? 3000;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

const connectWithRetry = async (attempt = 1) => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (err) {
    console.error(
      `Database connection attempt ${attempt}/${MAX_RETRIES} failed:`,
      err.message,
    );
    if (attempt >= MAX_RETRIES) throw err;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
};

connectWithRetry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed after retries:', err.message);
    process.exit(1);
  });
