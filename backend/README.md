# Lookbook Backend

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Generate Prisma client and migrate DB:
   ```sh
   npx prisma migrate dev --name init
   ```
3. Seed example data:
   ```sh
   npx ts-node prisma/seed.ts
   ```
4. Start backend server:
   ```sh
   npm run dev
   ```

- API runs at http://localhost:4000
- Default login: `admin@dottie.vn` / `bonjour123`
