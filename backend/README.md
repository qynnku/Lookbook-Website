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

## Statistics data model

This backend seeds a realistic, cross-linked dataset for charts:

- `PlatformStat` (daily per platform): `views`, `likes`, `comments`, `shares`, `follows`, `engagement`, `reach` for the last 365 days across Facebook/Instagram/Threads/TikTok/YouTube.
- `FollowerSnapshot` (monthly per platform): follower counts for the last 12 months with realistic growth.

APIs aggregate these tables on-the-fly based on `platform`, `timeRange`, and `metric` query params.

If you changed the schema, run generate/migrate again:

```sh
npx prisma generate
npx prisma migrate dev --name add_stats_models
npx ts-node prisma/seed.ts
```
