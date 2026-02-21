#!/bin/sh
set -e

# DB_RESET=true → full reset (drop all + re-seed)
# Set this env var in Dokploy for one-time reset, then remove it
if [ "$DB_RESET" = "true" ]; then
  echo "DB_RESET=true detected, resetting database..."
  npx prisma migrate reset --force
  echo "Database reset complete."
else
  echo "Running migrations..."
  npx prisma migrate deploy

  # Seed only if courses table is empty (first deploy)
  COURSE_COUNT=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*)::int as c FROM courses')
  .then(r => { console.log(r.rows[0].c); pool.end(); })
  .catch(() => { console.log('0'); pool.end(); });
")

  if [ "$COURSE_COUNT" = "0" ]; then
    echo "Empty database detected, running seed..."
    npx prisma db seed
  else
    echo "Database already has $COURSE_COUNT courses, skipping seed."
  fi
fi

echo "Starting server..."
exec node server.js
