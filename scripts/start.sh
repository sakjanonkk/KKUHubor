#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Simple wait - the healthcheck in docker-compose handles the real waiting
sleep 2

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js
