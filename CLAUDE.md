# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KKUHubor is a course review platform for Khon Kaen University (KKU). Users can browse courses, read/write reviews, add comments, like reviews, report inappropriate content, and request new courses or tags. Supports Thai and English localization.

## Commands

```bash
# Development
bun dev              # Start development server at localhost:3000
bun build            # Production build
bun lint             # Run ESLint

# Database (Prisma)
bunx prisma generate       # Generate Prisma client (runs automatically on postinstall)
bunx prisma migrate dev    # Create and apply migrations
bunx prisma migrate deploy # Apply migrations in production
bunx prisma db seed        # Seed database (uses tsx prisma/seed.ts)
bunx prisma studio         # Open Prisma Studio GUI
```

No test framework is configured. There are no test commands.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19, standalone output for Docker)
- **Database**: PostgreSQL with Prisma 7 ORM (using @prisma/adapter-pg)
- **UI**: Tailwind CSS 4 + shadcn/ui (new-york style), Lucide icons
- **i18n**: next-intl with Thai (default) and English
- **State**: Zustand (user identity), React Context (bookmarks), localStorage (likes, session)
- **Forms**: React Hook Form + Zod 4 validation
- **Auth**: Cookie-based admin sessions with bcrypt password hashing

### Hybrid Database Access

The codebase uses **two database access patterns** against the same PostgreSQL instance:

1. **Prisma ORM** (`import { prisma } from "@/lib/database"`) — Used in server actions (`src/actions/`) for typed queries with relations
2. **Raw pg Pool** (`import db from "@/lib/db"`) — Used in most API routes (`src/app/api/`) for raw SQL with parameterized queries (`$1, $2`)

Both are singletons with global reuse in development. Prefer Prisma for new code.

### Authentication

Admin-only auth system — no general user login flow:
- Login via `POST /api/auth/login` validates username/password (bcrypt) against `users` table, requires `role: "admin"`
- Sets HTTP-only `admin_session` cookie (value `"true"`, 1-day expiry, `sameSite: strict`)
- Admin API routes guard with `requireAdminAuth()` from `@/lib/auth` which checks the cookie
- `verifyAdminSession()` returns boolean for conditional UI rendering

### API Route Conventions

- All input validated with Zod `safeParse()` — return 400 on failure
- Admin routes call `requireAdminAuth()` first — returns `NextResponse` (401) or `null` (authorized)
- Responses use `NextResponse.json()` with explicit status codes
- Error responses: `{ error: string }` with 400/401/500
- Most routes use raw SQL via `db.query()`, some newer ones use Prisma

### Internationalization

- Middleware (`src/middleware.ts`) handles locale routing via `createMiddleware(routing)`
- Routes prefixed with locale: `/th/courses`, `/en/courses`
- Default locale: Thai (`th`)
- **Always use locale-aware navigation** from `@/i18n/routing`: `Link`, `redirect`, `usePathname`, `useRouter`
- Translation keys in `src/messages/{en,th}.json`, organized by feature namespace
- Access translations in components with `useTranslations("Namespace")`

### Server Actions vs API Routes

- **Server actions** (`src/actions/`): Read-only data fetching with Prisma — `getCourses()`, `getCourseDistribution()`. Used by page components for initial data loading.
- **API routes** (`src/app/api/`): Mutations and CRUD operations with raw SQL — reviews, comments, likes, reports, admin actions. Called from client components via `fetch()`.

### Client-Side State

- **Zustand store** (`useUserIdentity`): Persists reviewer name to localStorage (`"user-identity"`)
- **BookmarkProvider context**: Course bookmarks in localStorage (`"kkuhubor_bookmarks"`)
- **Review likes**: Tracked per-session via localStorage (`"liked_reviews"`, `"session_id"`)
- **URL search params**: Filter state for course listing (sort, faculty, rating, category, etc.)

### Key Enums (from Prisma schema)

- `CourseCategory`: GENERAL, MAJOR, ELECTIVE, FREE_ELECTIVE
- `GradingType`: NORM, CRITERION
- Mirrored in `src/lib/enums.ts` for client-side use

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
