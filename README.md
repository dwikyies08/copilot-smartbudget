# SmartBudget

SmartBudget is a personal finance dashboard built with Next.js App Router, Tailwind CSS, shadcn/ui, Turso, and Drizzle ORM.

## Tech stack
- Next.js 16.4
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Turso DB
- Drizzle ORM

## Architecture
- `app/` for routes and entry points
- `actions/` for server actions
- `services/` for business logic and database access
- `components/` for UI
- `db/` for schema and connection
- `lib/` for helpers and utilities

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment config:

```bash
cp .env.example .env.local
```

3. Fill the Turso credentials in `.env.local`.

4. Push the schema to Turso:

```bash
npm run db:push
```

5. Run the app:

```bash
npm run dev
```

## Development workflow

```bash
npm run agent:create-feature
npm run agent:check-arch
```

## Notes
The project is structured to keep UI, server actions, and business logic separated for easier scaling and maintenance.
