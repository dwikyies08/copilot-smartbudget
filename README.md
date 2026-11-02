# SmartBudget

SmartBudget is a personal finance dashboard built with Next.js, Tailwind CSS, shadcn/ui, Turso, and Drizzle ORM.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Turso DB
- Drizzle ORM

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure your Turso credentials in `.env.local`.

4. Run the app:

```bash
npm run dev
```

5. Push schema to Turso:

```bash
npm run db:push
```

## Features
- Dashboard overview
- Income and expense tracking
- Recent transactions list
- Add transaction form
- Ready for expansion with budgets, reports, and auth

## Notes
This project is intentionally scaffolded as a starting point for a full SmartBudget app and can be extended with authentication, budget planning, and analytics.
