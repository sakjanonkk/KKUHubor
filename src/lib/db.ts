import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

// Use a global variable to store the pool instance in development
// to avoid creating multiple connections during hot-reloading.
let db: Pool;

if (process.env.NODE_ENV === 'production') {
  db = pool;
} else {
  if (!(global as any).postgresPool) {
    (global as any).postgresPool = pool;
  }
  db = (global as any).postgresPool;
}

export default db;
