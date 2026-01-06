# Docker Setup - KKU Hoobor

## Quick Start

### 1. Generate SSL Certificate (ถ้ายังไม่มี)

```powershell
docker run --rm -v "${PWD}/nginx/ssl:/ssl" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /ssl/server.key -out /ssl/server.crt -config /ssl/openssl.cnf
```

### 2. Start Containers

```bash
docker compose up -d --build
```

> ⏳ ครั้งแรกจะ build นาน รอสักครู่...

### 3. Access Application

- **Website**: https://localhost/
- **API**: https://localhost/api/\*

> ⚠️ Browser จะแจ้งเตือน self-signed certificate → กด "Advanced" → "Proceed to localhost"

---

## Architecture

```
Browser → :443 (Nginx) → :3000 (Next.js)
                            ↓
                    :5432 (PostgreSQL)
                            ↓
                    ./data/postgres
```

---

## Commands

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# View app logs only
docker compose logs -f app

# Stop containers
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

---

## Database

- **Host**: `db` (inside Docker network)
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `kkuhubor`
- **Data**: `./data/postgres/`

### Connect from host machine

```bash
psql -h localhost -p 5432 -U postgres -d kkuhubor
```

---

## Files

| File                 | Description              |
| -------------------- | ------------------------ |
| `docker-compose.yml` | Container orchestration  |
| `Dockerfile`         | Next.js build config     |
| `nginx/nginx.conf`   | Reverse proxy config     |
| `nginx/ssl/`         | SSL certificates         |
| `scripts/start.sh`   | App startup + migrations |
| `data/postgres/`     | Database storage         |
