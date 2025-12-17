# Lookbook & Social Commerce Monorepo

## Structure

- `/backend` – Node.js + Express + TypeScript + Prisma/SQLite API
- `/frontend` – Vite + React + TypeScript + Tailwind CSS

## Quick Start

### 1. Backend

```sh
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```
- API: http://localhost:4000
- Login: `admin@dottie.vn` / `bonjour123`

### 2. Frontend

```sh
cd ../frontend
npm install
npm run dev
```
- App: http://localhost:5173

### 3. Usage
- Login with the credentials above.
- The dashboard loads seeded data for the "Dottie" brand, matching the Figma UI.

## Notes
- All API endpoints are mock/stub for the Overview dashboard only.
- Extendable for more features as per SRS.
- All assets (images/icons) should be placed in `/frontend/public` as needed.
