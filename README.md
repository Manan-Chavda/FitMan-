# FitMan

MVP-ready foundation for a fitness app with:

- `backend`: Node.js + Express + Prisma + PostgreSQL + JWT
- `mobile`: React Native with Expo
- `web`: Next.js

## Project Structure

```text
FitMan/
  backend/
  mobile/
  web/
```

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your PostgreSQL connection string and JWT secret.

Run Prisma migration:

```bash
npx prisma migrate dev --name init
```

Seed exercises:

```bash
npm run prisma:seed
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`.

## 2. Web Setup

```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

Web runs on `http://localhost:3000`.

## 3. Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env
npm run start
```

If testing on a physical device, set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your machine's LAN IP, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/sessions`
- `GET /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/logs`
- `PUT /api/sessions/:id/logs/:logId`
- `DELETE /api/sessions/:id/logs/:logId`
- `GET /api/exercises`

## Notes

- Passwords are hashed with `bcryptjs`
- JWT auth protects session routes
- Prisma schema is in `backend/prisma/schema.prisma`
