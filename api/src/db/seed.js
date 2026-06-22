import { pool } from '../db.js';
import bcrypt from 'bcryptjs';

const rooms = [
  {
    name: 'Sala Guepardo',
    capacity: 6,
    location: 'São Paulo - 10º andar',
    description: 'Sala de reuniões tamanho médio',
    amenities: ['tv', 'vídeo conferência'],
  },
  {
    name: 'Sala Vila Lobos',
    capacity: 4,
    location: 'São Paulo - 10º andar',
    description: 'Sala de reuniões pequena',
    amenities: ['tv', 'vídeo conferência'],
  },
  {
    name: 'Sala SAP',
    capacity: 12,
    location: 'São Paulo - 10º andar',
    description: 'Sala de reuniões grande',
    amenities: [
      'tv',
      'quadro branco',
      'vídeo conferência',
      'frigobar',
      'máquina de café',
    ],
  },
  {
    name: 'Cabine 01',
    capacity: 4,
    location: 'São Paulo - 10º andar',
    description: 'Cabine para reuniões rápidas',
    amenities: [],
  },
  {
    name: 'Cabine 02',
    capacity: 2,
    location: 'São Paulo - 10º andar',
    description: 'Cabine para reuniões rápidas',
    amenities: [],
  },
  {
    name: 'Sala teste',
    capacity: 2,
    location: 'São Paulo - 10º andar',
    description: 'Sala teste',
    amenities: ['teste'],
  },
];

const adminPassword = await bcrypt.hash('admin123', 10);

const client = await pool.connect();

try {
  await client.query('BEGIN');

  for (const room of rooms) {
    await client.query(
      `INSERT INTO rooms (name, capacity, location, description, amenities)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING`,
      [
        room.name,
        room.capacity,
        room.location,
        room.description,
        room.amenities,
      ],
    );
  }

  await client.query(
    `INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING`,
    ['Admin', 'admin@scheduler.dev', adminPassword, 'admin'],
  );

  await client.query('COMMIT');
  console.log('Seed complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
} finally {
  client.release();
  await pool.end();
}
