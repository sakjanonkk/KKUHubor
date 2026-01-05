import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let db: Pool;

if (process.env.NODE_ENV === "production") {
  db = pool;
} else {
  if (!(global as any).postgresPool) {
    (global as any).postgresPool = pool;
  }
  db = (global as any).postgresPool;
}

export default db;
