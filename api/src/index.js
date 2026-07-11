import { pool } from './db.js';
import app from './app.js';

const PORT = process.env.PORT ?? 3000;

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
